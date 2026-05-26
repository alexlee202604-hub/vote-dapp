export const CONTRACT_ADDRESSES = {
  crowdfunding: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  daoTokens: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  zkVoting: '0x0000000000000000000000000000000000000000' as `0x${string}`,
} as const;

export const CROWDFUNDING_ABI = [
  {
    "inputs": [{"internalType": "address","name": "token","type": "address"},{"internalType": "uint256","name": "target","type": "uint256"},{"internalType": "uint256","name": "duration","type": "uint256"}],
    "name": "createCampaign",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "campaignId","type": "uint256"},{"internalType": "uint256","name": "amount","type": "uint256"}],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "campaignId","type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "campaignId","type": "uint256"}],
    "name": "refund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "campaignId","type": "uint256"}],
    "name": "getCampaign",
    "outputs": [{"components": [{"internalType": "uint256","name": "id","type": "uint256"},{"internalType": "address","name": "creator","type": "address"},{"internalType": "address","name": "token","type": "address"},{"internalType": "uint256","name": "target","type": "uint256"},{"internalType": "uint256","name": "deadline","type": "uint256"},{"internalType": "uint256","name": "raised","type": "uint256"},{"internalType": "uint8","name": "status","type": "uint8"}],"internalType": "struct Campaign","name": "","type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "campaignIdCounter",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const DAOTOKEN_ABI = [
  {
    "inputs": [{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "account","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "owner","type": "address"},{"internalType": "address","name": "spender","type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ZKVOTING_ABI = [
  {
    "inputs": [{"internalType": "string","name": "description","type": "string"},{"internalType": "uint256","name": "duration","type": "uint256"}],
    "name": "createProposal",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "proposalId","type": "uint256"},{"internalType": "uint256[2]","name": "pA","type": "uint256[2]"},{"internalType": "uint256[2][2]","name": "pB","type": "uint256[2][2]"},{"internalType": "uint256[2]","name": "pC","type": "uint256[2]"},{"internalType": "uint256[2]","name": "pubSignals","type": "uint256[2]"}],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "proposalId","type": "uint256"}],
    "name": "getProposal",
    "outputs": [{"components": [{"internalType": "uint256","name": "id","type": "uint256"},{"internalType": "string","name": "description","type": "string"},{"internalType": "uint256","name": "deadline","type": "uint256"},{"internalType": "uint256","name": "yesVotes","type": "uint256"},{"internalType": "uint256","name": "noVotes","type": "uint256"},{"internalType": "bool","name": "tallied","type": "bool"}],"internalType": "struct Proposal","name": "","type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
