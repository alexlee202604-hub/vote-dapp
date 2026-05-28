/**
 * Direct vote script - bypasses MetaMask by sending tx directly with private key
 * Usage: node scripts/direct-vote.js <proposalId> <voteChoice>
 *   voteChoice: 0 = For, 1 = Against
 */

const { createWalletClient, createPublicClient, http, keccak256, toBytes } = require('viem');
const { sepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const path = require('path');
const fs = require('fs');
const snarkjs = require('snarkjs');

// ── Configuration ──────────────────────────────────────────────
const DEPLOYER_PK    = '0xc85e389cd0bee3355355b31141953fd73e506c30e75245f10c8036da0fff61da';
const ZK_VOTING      = '0xD531E01f6BfeeBa07Ea6BA7668622f57c9A0BC93';
const VERIFIER       = '0xe5fBC3d42C90C9970e5C9fc1981bE65d5A22aDdb';
const DAO_TOKEN      = '0x068bf8e43d9a5a6477f9837e7bf0070a6ec2e9d6';
const RPC_URL        = process.env.RPC_URL || 'https://ethereum-sepolia.publicnode.com';

// Exact ABI from contracts.ts – the frontend uses this exact format
const VOTE_ABI = [{
  type: 'function',
  name: 'vote',
  inputs: [
    { name: 'pA',         type: 'uint256[2]',    internalType: 'uint256[2]' },
    { name: 'pB',         type: 'uint256[2][2]',  internalType: 'uint256[2][2]' },
    { name: 'pC',         type: 'uint256[2]',     internalType: 'uint256[2]' },
    { name: 'pubSignals', type: 'uint256[3]',     internalType: 'uint256[3]' },
  ],
  outputs: [],
  stateMutability: 'nonpayable',
}];

const BALANCE_OF_ABI = [{
  type: 'function',
  name: 'balanceOf',
  inputs:  [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
  stateMutability: 'view',
}];

const NULLIFIER_USED_ABI = [{
  type: 'function',
  name: 'isNullifierUsed',
  inputs:  [{ name: 'nullifier', type: 'uint256' }],
  outputs: [{ name: '', type: 'bool' }],
  stateMutability: 'view',
}];

const args = process.argv.slice(2);
const proposalId = parseInt(args[0]) || 1;
const voteChoice = parseInt(args[1]) || 0; // 0 = For, 1 = Against

async function main() {
  console.log(`=== Direct Vote Script ===`);
  console.log(`Proposal: #${proposalId}, Choice: ${voteChoice === 0 ? 'For' : 'Against'}`);
  console.log(`RPC: ${RPC_URL}\n`);

  const account = privateKeyToAccount(DEPLOYER_PK);
  const deployerAddr = account.address;
  console.log(`Deployer: ${deployerAddr}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL, { timeout: 60000 }),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(RPC_URL, { timeout: 60000 }),
  });

  // ── Step 1: Check token balance ──────────────────────────────
  console.log('\nStep 1: Checking VOTE token balance...');
  const balance = await publicClient.readContract({
    address: DAO_TOKEN,
    abi: BALANCE_OF_ABI,
    functionName: 'balanceOf',
    args: [deployerAddr],
  });
  console.log(`  Balance: ${balance}`);
  if (balance < 1n) {
    console.error('  ERROR: Need >= 1 VOTE to vote');
    process.exit(1);
  }

  // ── Step 2: Check proposal ──────────────────────────────────
  console.log('\nStep 2: Checking proposal...');
  const proposalAbi = [{
    type: 'function',
    name: 'getProposal',
    inputs:  [{ name: '_proposalId', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'id',          type: 'uint256' },
        { name: 'description', type: 'string' },
        { name: 'deadline',    type: 'uint256' },
        { name: 'yesVotes',    type: 'uint256' },
        { name: 'noVotes',     type: 'uint256' },
      ],
    }],
    stateMutability: 'view',
  }];
  const proposal = await publicClient.readContract({
    address: ZK_VOTING,
    abi: proposalAbi,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
  });
  console.log(`  "${proposal.description}"`);
  console.log(`  Deadline: ${new Date(Number(proposal.deadline) * 1000).toISOString()}`);
  console.log(`  Yes: ${proposal.yesVotes}, No: ${proposal.noVotes}`);

  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now > proposal.deadline) {
    console.error('  ERROR: Voting has ended!');
    process.exit(1);
  }

  // ── Step 3: Compute nullifier (exact same as frontend) ──────
  console.log('\nStep 3: Computing nullifier...');
  const nullifier = BigInt(keccak256(toBytes(`${deployerAddr.toLowerCase()}-${proposal.id.toString()}`)));
  console.log(`  nullifier: ${nullifier}`);

  const used = await publicClient.readContract({
    address: ZK_VOTING,
    abi: NULLIFIER_USED_ABI,
    functionName: 'isNullifierUsed',
    args: [nullifier],
  });
  if (used) {
    console.error('  ERROR: Already voted (nullifier used)');
    process.exit(1);
  }
  console.log('  nullifier unused ✅');

  // ── Step 4: Generate ZK proof ───────────────────────────────
  console.log('\nStep 4: Generating ZK proof...');
  const circuitInputs = {
    userAddress:  BigInt(deployerAddr),
    tokenBalance: balance,
    voteChoice:   BigInt(voteChoice),
    nullifier,
    proposalId:   proposal.id,
  };

  const wasmPath = path.resolve(__dirname, '../public/circuits/anonymous_vote.wasm');
  const zkeyPath = path.resolve(__dirname, '../public/circuits/anonymous_vote_final.zkey');
  const vkPath   = path.resolve(__dirname, '../public/circuits/verification_key.json');

  if (!fs.existsSync(wasmPath)) throw new Error(`WASM not found: ${wasmPath}`);
  if (!fs.existsSync(zkeyPath)) throw new Error(`ZKEY not found: ${zkeyPath}`);

  const t0 = Date.now();
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    circuitInputs,
    wasmPath,
    zkeyPath
  );
  console.log(`  Generated in ${((Date.now() - t0) / 1000).toFixed(1)}s ✅`);
  console.log(`  publicSignals: ${publicSignals.join(', ')}`);

  // ── Step 4b: Verify proof locally ───────────────────────────
  console.log('\nStep 4b: Verifying proof locally (snarkjs)...');
  const buildVkPath = path.resolve(__dirname, '../../circuits/build/verification_key.json');
  if (fs.existsSync(buildVkPath)) {
    const vk = JSON.parse(fs.readFileSync(buildVkPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vk, publicSignals, proof);
    if (!valid) {
      console.error('  ❌ Local verification FAILED – proof is invalid');
      process.exit(1);
    }
    console.log('  ✅ Local verification passed (build vk)');
  } else {
    console.warn('  WARN: build verification_key.json not found, skipping local verify');
  }

  // ── Step 5: Check proof against Verifier DIRECTLY ────────────
  console.log('\nStep 5: Checking proof directly against on-chain Verifier...');
  const pA = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
  const pB = [
    [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])],
    [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])],
  ];
  const pC = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
  const pubSignalsArray = publicSignals.map(s => BigInt(s));

  try {
    const verifierAbi = [{
      type: 'function',
      name: 'verifyProof',
      inputs: [
        { name: '_pA', type: 'uint256[2]' },
        { name: '_pB', type: 'uint256[2][2]' },
        { name: '_pC', type: 'uint256[2]' },
        { name: '_pubSignals', type: 'uint256[3]' },
      ],
      outputs: [{ type: 'bool' }],
      stateMutability: 'view',
    }];
    const directResult = await publicClient.readContract({
      address: VERIFIER,
      abi: verifierAbi,
      functionName: 'verifyProof',
      args: [pA, pB, pC, pubSignalsArray],
    });
    console.log(`  Direct Verifier result: ${directResult ? '✅ PASS' : '❌ FAIL'}`);
  } catch (e) {
    console.log(`  Direct Verifier call error: ${e.shortMessage || e.message}`);
  }

  // Estimate gas
  let gasEstimate;
  try {
    gasEstimate = await publicClient.estimateContractGas({
      address: ZK_VOTING,
      abi: VOTE_ABI,
      functionName: 'vote',
      args: [pA, pB, pC, pubSignalsArray],
      account: deployerAddr,
    });
    console.log(`  Estimated gas: ${gasEstimate}`);
  } catch (e) {
    // Note: if estimation fails due to revert, that's a real problem
    const msg = e.shortMessage || e.message || String(e);
    console.log(`  Gas estimation result: ${msg.slice(0, 150)}`);
    gasEstimate = 2000000n;
  }

  // Get current gas price
  const gasPrice = await publicClient.getGasPrice();
  console.log(`  Gas price: ${(Number(gasPrice) / 1e9).toFixed(2)} gwei`);

  // Send
  const t1 = Date.now();
  const txHash = await walletClient.writeContract({
    address: ZK_VOTING,
    abi: VOTE_ABI,
    functionName: 'vote',
    args: [pA, pB, pC, pubSignalsArray],
    gas: gasEstimate,
    gasPrice,
  });
  console.log(`  Sent in ${((Date.now() - t1) / 1000).toFixed(1)}s`);
  console.log(`  Tx hash: ${txHash}`);
  console.log(`  https://sepolia.etherscan.io/tx/${txHash}`);

  // ── Step 6: Wait for confirmation ───────────────────────────
  console.log('\nStep 6: Waiting for confirmation...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120000 });
  console.log(`  Status: ${receipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`  Gas used: ${receipt.gasUsed}`);
  console.log(`  Block: ${receipt.blockNumber}`);

  if (receipt.status === 'success') {
    console.log('\n🎉 Vote cast successfully!');
  } else {
    console.log('\n❌ Vote transaction reverted.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nScript failed:', err.message || err);
  process.exit(1);
});
