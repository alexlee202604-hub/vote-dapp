const snarkjs = require('snarkjs');
const { createPublicClient, http, keccak256, toBytes, encodeAbiParameters, parseAbiParameters } = require('viem');
const { sepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const path = require('path');
const fs = require('fs');

async function main() {
  const DEPLOYER_PK = '0xc85e389cd0bee3355355b31141953fd73e506c30e75245f10c8036da0fff61da';
  const VERIFIER    = '0xe5fBC3d42C90C9970e5C9fc1981bE65d5A22aDdb';
  const DAO_TOKEN   = '0x068bf8e43d9a5a6477f9837e7bf0070a6ec2e9d6';
  const account = privateKeyToAccount(DEPLOYER_PK);
  const deployerAddr = account.address;

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://ethereum-sepolia.publicnode.com', { timeout: 60000 }),
  });

  const balance = await publicClient.readContract({
    address: DAO_TOKEN,
    abi: [{ type:'function', name:'balanceOf', inputs:[{name:'account',type:'address'}], outputs:[{name:'',type:'uint256'}], stateMutability:'view' }],
    functionName: 'balanceOf',
    args: [deployerAddr],
  });

  const proposalId = 1;
  const voteChoice = 0;
  const nullifier = BigInt(keccak256(toBytes(deployerAddr.toLowerCase()+'-'+proposalId.toString())));

  const circuitInputs = {
    userAddress:  BigInt(deployerAddr),
    tokenBalance: balance,
    voteChoice:   BigInt(voteChoice),
    nullifier,
    proposalId:   BigInt(proposalId),
  };

  const wasmPath = path.resolve(__dirname, '../public/circuits/anonymous_vote.wasm');
  const zkeyPath = path.resolve(__dirname, '../public/circuits/anonymous_vote_final.zkey');
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(circuitInputs, wasmPath, zkeyPath);

  // Get snarkjs's standard calldata format
  const calldataStr = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
  console.log("Raw calldata string:", calldataStr.substring(0, 200) + "...");

  // Parse the calldata properly
  // Format: "[pA0,pA1],[[pB00,pB01],[pB10,pB11]],[pC0,pC1],[pub0,pub1,pub2]"
  const fullMatch = calldataStr.match(/^\[(.*?)\],\[\[(.*?)\],\[(.*?)\]\],\[(.*?)\],\[(.*?)\]$/);
  if (!fullMatch) {
    console.log("Could not parse calldata string");
    // Try manual parse
    const parts = calldataStr.split('],[');
    console.log("Parts count:", parts.length);
    for (let i = 0; i < parts.length; i++) console.log(`Part ${i}:`, parts[i].substring(0, 100));
  } else {
    const pA = fullMatch[1].split(',').map(s => BigInt(s.trim()));
    const pB00 = fullMatch[2].split(',').map(s => BigInt(s.trim()));
    const pB10 = fullMatch[3].split(',').map(s => BigInt(s.trim()));
    const pC = fullMatch[4].split(',').map(s => BigInt(s.trim()));
    const pub = fullMatch[5].split(',').map(s => BigInt(s.trim()));

    console.log("\n=== Parsed calldata ===");
    console.log("pA:", pA.map(b => b.toString()));
    console.log("pB:", [[pB00[0].toString(), pB00[1].toString()], [pB10[0].toString(), pB10[1].toString()]]);
    console.log("pC:", pC.map(b => b.toString()));
    console.log("pub:", pub.map(b => b.toString()));

    // Encode properly for ABI
    const encoded = encodeAbiParameters(
      parseAbiParameters('uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[3] pub'),
      [[pA[0], pA[1]], [[pB00[0], pB00[1]], [pB10[0], pB10[1]]], [pC[0], pC[1]], [pub[0], pub[1], pub[2]]]
    );
    const selector = '0xb6cac4ec'; // keccak256("verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[3])") first 4 bytes
    const fullCalldata = selector + encoded.slice(2);
    
    console.log("\n=== ABI-encoded calldata ===");
    console.log("Full calldata length:", fullCalldata.length / 2 - 4, "bytes (excl selector)");
    console.log("Calldata:", fullCalldata.substring(0, 100) + "...");

    console.log("\n=== Verifier constants check ===");
    console.log("Public signal[2] (proposalId) ==", pub[2].toString());
    console.log("Is proposalId == 1?", pub[2] === BigInt(1));
  }

  // Verify vk.json again
  const vkPath = path.resolve(__dirname, '../circuits/build/verification_key.json');
  if (fs.existsSync(vkPath)) {
    const vk = JSON.parse(fs.readFileSync(vkPath, 'utf-8'));
    const localOk = await snarkjs.groth16.verify(vk, publicSignals, proof);
    console.log("\nLocal verification:", localOk ? "PASS" : "FAIL");
  }

  console.log("\n=== NEXT: Test on-chain with cast ===");
}
main().catch(e => console.error("ERROR:", e.message));
