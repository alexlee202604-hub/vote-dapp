const snarkjs = require('snarkjs');
const { keccak256, toBytes } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const path = require('path');
const fs = require('fs');

async function main() {
  const DEPLOYER_PK = '0xc85e389cd0bee3355355b31141953fd73e506c30e75245f10c8036da0fff61da';
  const DAO_TOKEN   = '0x068bf8e43d9a5a6477f9837e7bf0070a6ec2e9d6';
  const account = privateKeyToAccount(DEPLOYER_PK);
  const deployerAddr = account.address;
  const proposalId = parseInt(process.argv[2] || '1');
  const voteChoice = parseInt(process.argv[3] || '0');

  const resp = await fetch('https://ethereum-sepolia.publicnode.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'eth_call',
      params: [{ to: DAO_TOKEN, data: '0x70a08231' + deployerAddr.slice(2).padStart(64, '0') }, 'latest']
    })
  });
  const j = await resp.json();
  const balance = BigInt(j.result);
  const nullifier = BigInt(keccak256(toBytes(deployerAddr.toLowerCase() + '-' + proposalId.toString())));

  const inputs = { userAddress: BigInt(deployerAddr), tokenBalance: balance, voteChoice: BigInt(voteChoice), nullifier, proposalId: BigInt(proposalId) };
  const wasmPath = path.resolve(__dirname, '../public/circuits/anonymous_vote.wasm');
  const zkeyPath = path.resolve(__dirname, '../public/circuits/anonymous_vote_final.zkey');
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, wasmPath, zkeyPath);

  const calldataStr = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

  // Parse the nested JSON array format: [pA0,pA1],[[pB00,pB01],[pB10,pB11]],[pC0,pC1],[pub0,pub1,pub2]
  const parsed = JSON.parse('[' + calldataStr + ']');

  function h2d(s) { return BigInt(s).toString(); }
  const pA = parsed[0].map(h2d);
  const pB = [parsed[1][0].map(h2d), parsed[1][1].map(h2d)];
  const pC = parsed[2].map(h2d);
  const pub = parsed[3].map(h2d);

  const vkPath = path.resolve(__dirname, '../../circuits/build/verification_key.json');
  if (fs.existsSync(vkPath)) {
    const vk = JSON.parse(fs.readFileSync(vkPath, 'utf-8'));
    const ok = await snarkjs.groth16.verify(vk, publicSignals, proof);
    process.stderr.write("LOCAL_VERIFY:" + (ok ? "PASS" : "FAIL") + "\n");
  }

  const output = JSON.stringify({ pA, pB, pC, pub });
  process.stdout.write(output + "\n");
}

main().catch(e => { process.stderr.write("ERROR:" + e.message + "\n"); process.exit(1); });
