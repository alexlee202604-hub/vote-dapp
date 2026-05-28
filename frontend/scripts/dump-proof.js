const snarkjs = require('snarkjs');
const { createPublicClient, http, keccak256, toBytes } = require('viem');
const { sepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const path = require('path');
const fs = require('fs');

async function main() {
  const DEPLOYER_PK = '0xc85e389cd0bee3355355b31141953fd73e506c30e75245f10c8036da0fff61da';
  const DAO_TOKEN   = '0x068bf8e43d9a5a6477f9837e7bf0070a6ec2e9d6';
  const VERIFIER    = '0xe5fBC3d42C90C9970e5C9fc1981bE65d5A22aDdb';
  const account = privateKeyToAccount(DEPLOYER_PK);
  const deployerAddr = account.address;

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://ethereum-sepolia.publicnode.com', { timeout: 180000 }),
  });

  // Test 5 different proofs
  for (let test = 0; test < 5; test++) {
    console.log(`\n=== Test ${test+1} ===`);
    const nullifier = BigInt(keccak256(toBytes(deployerAddr.toLowerCase()+'-1-'+test.toString())));
    const balance = await publicClient.readContract({
      address: DAO_TOKEN,
      abi: [{ type:'function', name:'balanceOf', inputs:[{name:'a',type:'address'}], outputs:[{name:'',type:'uint256'}], stateMutability:'view' }],
      functionName: 'balanceOf',
      args: [deployerAddr],
    });
    const inputs = { userAddress: BigInt(deployerAddr), tokenBalance: balance, voteChoice: BigInt(0), nullifier, proposalId: BigInt(1) };
    const wasmPath = path.resolve(__dirname, '../public/circuits/anonymous_vote.wasm');
    const zkeyPath = path.resolve(__dirname, '../public/circuits/anonymous_vote_final.zkey');
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, wasmPath, zkeyPath);

    const buildVkPath = path.resolve(__dirname, '../../circuits/build/verification_key.json');
    const vk = JSON.parse(fs.readFileSync(buildVkPath, 'utf-8'));
    const localOk = await snarkjs.groth16.verify(vk, publicSignals, proof);
    console.log(`  Local: ${localOk ? 'PASS' : 'FAIL'}`);

    const pA = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
    const pB = [[BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])], [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])]];
    const pC = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
    const pub = publicSignals.map(s => BigInt(s));
    const verifierAbi = [{
      type: 'function', name: 'verifyProof',
      inputs: [
        { name: 'a', type: 'uint256[2]' },
        { name: 'b', type: 'uint256[2][2]' },
        { name: 'c', type: 'uint256[2]' },
        { name: 'pub', type: 'uint256[3]' },
      ],
      outputs: [{ type: 'bool' }],
      stateMutability: 'view',
    }];
    const onchainResult = await publicClient.readContract({
      address: VERIFIER, abi: verifierAbi, functionName: 'verifyProof', args: [pA, pB, pC, pub],
    });
    console.log(`  On-chain: ${onchainResult ? 'PASS' : 'FAIL'}`);

    // Dump first proof for forge test
    if (test === 0) {
      const dump = {
        a: pA.map(b => '0x' + b.toString(16).padStart(64, '0')),
        b: pB.map(row => row.map(b => '0x' + b.toString(16).padStart(64, '0'))),
        c: pC.map(b => '0x' + b.toString(16).padStart(64, '0')),
        pub: pub.map(b => '0x' + b.toString(16).padStart(64, '0')),
      };
      fs.writeFileSync('/tmp/forge_proof.json', JSON.stringify(dump, null, 2));
      console.log('\nProof dumped to /tmp/forge_proof.json for forge test');
    }
  }
}

main().catch(e => { console.log('ERROR:' + e.message); process.exit(1); });
