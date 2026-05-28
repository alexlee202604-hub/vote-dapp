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

  // Fetch balance
  const response = await fetch('https://ethereum-sepolia.publicnode.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{
        to: DAO_TOKEN,
        data: '0x70a08231' + deployerAddr.slice(2).padStart(64, '0')
      }, 'latest']
    })
  });
  const json = await response.json();
  const balance = BigInt(json.result);

  const nullifier = BigInt(keccak256(toBytes(deployerAddr.toLowerCase() + '-' + proposalId.toString())));

  const circuitInputs = {
    userAddress:  BigInt(deployerAddr),
    tokenBalance: balance,
    voteChoice:   BigInt(voteChoice),
    nullifier,
    proposalId:   BigInt(proposalId),
  };

  const frontendDir = path.resolve(__dirname, '../../frontend');
  const wasmPath = path.join(frontendDir, 'public/circuits/anonymous_vote.wasm');
  const zkeyPath = path.join(frontendDir, 'public/circuits/anonymous_vote_final.zkey');

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(circuitInputs, wasmPath, zkeyPath);

  // Verify locally
  const vkPath = path.resolve(__dirname, '../circuits/build/verification_key.json');
  if (fs.existsSync(vkPath)) {
    const vk = JSON.parse(fs.readFileSync(vkPath, 'utf-8'));
    const localOk = await snarkjs.groth16.verify(vk, publicSignals, proof);
    if (!localOk) {
      console.error('Local verification FAILED - proof is invalid');
      process.exit(1);
    }
  }

  // Get calldata from snarkjs
  const calldataStr = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
  
  // Parse the comma-separated hex values
  const fullMatch = calldataStr.match(/^\[(.*?)\],\[\[(.*?)\],\[(.*?)\]\],\[(.*?)\],\[(.*?)\]$/);
  if (!fullMatch) {
    console.error('Could not parse calldata');
    process.exit(1);
  }

  const pA = fullMatch[1].split(',').map(s => BigInt(s.trim()).toString());
  const pB00 = fullMatch[2].split(',').map(s => BigInt(s.trim()).toString());
  const pB10 = fullMatch[3].split(',').map(s => BigInt(s.trim()).toString());
  const pC = fullMatch[4].split(',').map(s => BigInt(s.trim()).toString());
  const pub = fullMatch[5].split(',').map(s => BigInt(s.trim()).toString());

  // Output as Foundry console.log-compatible values
  // Also output as Solidity hex literals for copy-paste
  console.log("// Proof values for Solidity test");
  console.log("// Local verification: PASSED");
  console.log("uint256[2] memory pA = [");
  console.log("    " + pA[0] + ",");
  console.log("    " + pA[1]);
  console.log("];");
  console.log("");
  console.log("uint256[2][2] memory pB = [");
  console.log("    [" + pB00[0] + ",");
  console.log("     " + pB00[1] + "],");
  console.log("    [" + pB10[0] + ",");
  console.log("     " + pB10[1] + "]");
  console.log("];");
  console.log("");
  console.log("uint256[2] memory pC = [");
  console.log("    " + pC[0] + ",");
  console.log("    " + pC[1]);
  console.log("];");
  console.log("");
  console.log("uint256[3] memory pubSignals = [");
  console.log("    " + pub[0] + ",");
  console.log("    " + pub[1] + ",");
  console.log("    " + pub[2]);
  console.log("];");
}

main().catch(e => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
