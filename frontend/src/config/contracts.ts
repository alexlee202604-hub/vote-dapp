export const CONTRACT_ADDRESSES = {
  crowdfunding: '0x61d3a8b465933eadaaed39f7f47cc56fbe179171' as `0x${string}`,
  daoTokens: '0x068bf8e43d9a5a6477f9837e7bf0070a6ec2e9d6' as `0x${string}`,
  zkVoting: '0xa54e2abf868bf66c2f7d13509e5f96ae3766c148' as `0x${string}`,
} as const;

export const CROWDFUNDING_ABI = [
  { "type": "function", "name": "campaignIdCounter", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "campaigns", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }, { "name": "creator", "type": "address", "internalType": "address" }, { "name": "token", "type": "address", "internalType": "address" }, { "name": "target", "type": "uint256", "internalType": "uint256" }, { "name": "deadline", "type": "uint256", "internalType": "uint256" }, { "name": "raised", "type": "uint256", "internalType": "uint256" }, { "name": "status", "type": "uint8", "internalType": "enum CampaignStatus" }], "stateMutability": "view" },
  { "type": "function", "name": "contribute", "inputs": [{ "name": "campaignId", "type": "uint256", "internalType": "uint256" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "payable" },
  { "type": "function", "name": "createCampaign", "inputs": [{ "name": "token", "type": "address", "internalType": "address" }, { "name": "target", "type": "uint256", "internalType": "uint256" }, { "name": "duration", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "nonpayable" },
  { "type": "function", "name": "getCampaign", "inputs": [{ "name": "campaignId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "tuple", "internalType": "struct Campaign", "components": [{ "name": "id", "type": "uint256", "internalType": "uint256" }, { "name": "creator", "type": "address", "internalType": "address" }, { "name": "token", "type": "address", "internalType": "address" }, { "name": "target", "type": "uint256", "internalType": "uint256" }, { "name": "deadline", "type": "uint256", "internalType": "uint256" }, { "name": "raised", "type": "uint256", "internalType": "uint256" }, { "name": "status", "type": "uint8", "internalType": "enum CampaignStatus" }] }], "stateMutability": "view" },
  { "type": "function", "name": "getUserContribution", "inputs": [{ "name": "campaignId", "type": "uint256", "internalType": "uint256" }, { "name": "user", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "refund", "inputs": [{ "name": "campaignId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "withdraw", "inputs": [{ "name": "campaignId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "event", "name": "CampaignCreated", "inputs": [{ "name": "id", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "creator", "type": "address", "indexed": true, "internalType": "address" }, { "name": "token", "type": "address", "indexed": false, "internalType": "address" }, { "name": "target", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "deadline", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false },
  { "type": "event", "name": "CampaignStatusUpdated", "inputs": [{ "name": "campaignId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "status", "type": "uint8", "indexed": false, "internalType": "enum CampaignStatus" }], "anonymous": false },
  { "type": "event", "name": "ContributionMade", "inputs": [{ "name": "campaignId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "contributor", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false },
  { "type": "event", "name": "FundsWithdrawn", "inputs": [{ "name": "campaignId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "creator", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false },
  { "type": "event", "name": "RefundIssued", "inputs": [{ "name": "campaignId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "contributor", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false },
  { "type": "error", "name": "AlreadyClaimed", "inputs": [] },
  { "type": "error", "name": "CampaignNotActive", "inputs": [] },
  { "type": "error", "name": "CampaignNotFailed", "inputs": [] },
  { "type": "error", "name": "CampaignNotFound", "inputs": [] },
  { "type": "error", "name": "CampaignNotSuccessful", "inputs": [] },
  { "type": "error", "name": "ContributionMustBePositive", "inputs": [] },
  { "type": "error", "name": "DeadlinePassed", "inputs": [] },
  { "type": "error", "name": "DeadlineTooShort", "inputs": [] },
  { "type": "error", "name": "NoContributionToRefund", "inputs": [] },
  { "type": "error", "name": "NotCampaignCreator", "inputs": [] },
  { "type": "error", "name": "TargetMustBePositive", "inputs": [] },
  { "type": "error", "name": "TransferFailed", "inputs": [] }
] as const;

export const DAOTOKEN_ABI = [
  { "type": "function", "name": "allowance", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "spender", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "approve", "inputs": [{ "name": "spender", "type": "address", "internalType": "address" }, { "name": "value", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "nonpayable" },
  { "type": "function", "name": "balanceOf", "inputs": [{ "name": "account", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "burn", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "decimals", "inputs": [], "outputs": [{ "name": "", "type": "uint8", "internalType": "uint8" }], "stateMutability": "view" },
  { "type": "function", "name": "mint", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "name", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" },
  { "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "symbol", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" },
  { "type": "function", "name": "totalSupply", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "transfer", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "value", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "nonpayable" },
  { "type": "function", "name": "transferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "value", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "nonpayable" },
  { "type": "function", "name": "transferOwnership", "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "event", "name": "Approval", "inputs": [{ "name": "owner", "type": "address", "indexed": true }, { "name": "spender", "type": "address", "indexed": true }, { "name": "value", "type": "uint256", "indexed": false }], "anonymous": false },
  { "type": "event", "name": "OwnershipTransferred", "inputs": [{ "name": "previousOwner", "type": "address", "indexed": true }, { "name": "newOwner", "type": "address", "indexed": true }], "anonymous": false },
  { "type": "event", "name": "Transfer", "inputs": [{ "name": "from", "type": "address", "indexed": true }, { "name": "to", "type": "address", "indexed": true }, { "name": "value", "type": "uint256", "indexed": false }], "anonymous": false }
] as const;

export const ZKVOTING_ABI = [
  { "type": "function", "name": "createProposal", "inputs": [{ "name": "description", "type": "string", "internalType": "string" }, { "name": "duration", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "nonpayable" },
  { "type": "function", "name": "getProposal", "inputs": [{ "name": "_proposalId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "tuple", "internalType": "struct Proposal", "components": [{ "name": "id", "type": "uint256", "internalType": "uint256" }, { "name": "description", "type": "string", "internalType": "string" }, { "name": "deadline", "type": "uint256", "internalType": "uint256" }, { "name": "yesVotes", "type": "uint256", "internalType": "uint256" }, { "name": "noVotes", "type": "uint256", "internalType": "uint256" }] }], "stateMutability": "view" },
  { "type": "function", "name": "isNullifierUsed", "inputs": [{ "name": "nullifier", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" },
  { "type": "function", "name": "proposalIdCounter", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "vote", "inputs": [{ "name": "pA", "type": "uint256[2]", "internalType": "uint256[2]" }, { "name": "pB", "type": "uint256[2][2]", "internalType": "uint256[2][2]" }, { "name": "pC", "type": "uint256[2]", "internalType": "uint256[2]" }, { "name": "pubSignals", "type": "uint256[4]", "internalType": "uint256[4]" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "event", "name": "ProposalCreated", "inputs": [{ "name": "id", "type": "uint256", "indexed": true }, { "name": "description", "type": "string", "indexed": false }, { "name": "deadline", "type": "uint256", "indexed": false }], "anonymous": false },
  { "type": "event", "name": "VoteCast", "inputs": [{ "name": "nullifier", "type": "uint256", "indexed": true }, { "name": "voteHash", "type": "uint256", "indexed": false }], "anonymous": false }
] as const;
