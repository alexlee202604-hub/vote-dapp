const snarkjs = require('snarkjs');
const { createPublicClient, http, keccak256, toBytes } = require('viem');
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

  console.log("=== FULL PROOF ===");
  console.log("pi_a = " + JSON.stringify(proof.pi_a));
  console.log("pi_b = " + JSON.stringify(proof.pi_b));
  console.log("pi_c = " + JSON.stringify(proof.pi_c));
  console.log("protocol = " + proof.protocol);
  console.log("curve = " + proof.curve);
  console.log("");
  console.log("=== PUBLIC SIGNALS ===");
  console.log(publicSignals);
  console.log("");

  const pA = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
  const pB = [[BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])], [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])]];
  const pC = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
  const pub = publicSignals.map(s => BigInt(s));

  console.log("=== CAST CALL COMMAND ===");
  const cmd = [
    'cast call ' + VERIFIER + ' ',
    '"verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[3])"',
    "'[" + pA[0].toString() + "," + pA[1].toString() + "]'",
    "'[[" + pB[0][0].toString() + "," + pB[0][1].toString() + "],[" + pB[1][0].toString() + "," + pB[1][1].toString() + "]]'",
    "'[" + pC[0].toString() + "," + pC[1].toString() + "]'",
    "'[" + pub[0].toString() + "," + pub[1].toString() + "," + pub[2].toString() + "]'",
    "--rpc-url https://ethereum-sepolia.publicnode.com"
  ];
  console.log(cmd.join(" \\\n  "));

  // Local verification
  const vk = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../circuits/build/verification_key.json'), 'utf-8'));
  const localOk = await snarkjs.groth16.verify(vk, publicSignals, proof);
  console.log("");
  console.log("Local verification: " + (localOk ? "PASS" : "FAIL"));

  // Check for point at infinity
  console.log("");
  console.log("=== PROOF CHECK ===");
  console.log("pi_a[0] (x): " + proof.pi_a[0]);
  console.log("pi_a[1] (y): " + proof.pi_a[1]);
  console.log("pi_a[2] (z): " + proof.pi_a[2]);
  const isInfinity = proof.pi_a[0] === "0" && proof.pi_a[1] === "0";
  console.log("pi_a is identity (infinity): " + isInfinity);

  // Also verify against the solidity vk constants by checking if the proof passes
  // a direct on-chain cast call
  console.log("");
  console.log("Now run the cast call command above to test on-chain verification directly.");
}
main().catch(e => console.error("ERROR:", e.message));
