import type { Address } from "viem";
import { zeroAddress } from "viem";

const MOCK_CAMPAIGNS = [
  {
    id: 1n,
    creator: "0x1234...5678" as Address,
    name: "Community Garden DAO Fundraising",
    token: zeroAddress,
    target: 10000000000000000000n, // 10 ETH
    deadline: 1750000000n,
    raised: 6500000000000000000n, // 6.5 ETH
    status: 0, // Active
  },
  {
    id: 2n,
    creator: "0xabcd...ef01" as Address,
    name: "Open Source AI Training Platform",
    token: zeroAddress,
    target: 50000000000000000000n, // 50 ETH
    deadline: 1760000000n,
    raised: 50000000000000000000n, // 50 ETH
    status: 1, // Successful
  },
  {
    id: 3n,
    creator: "0x9876...5432" as Address,
    name: "Green Energy Research Fund",
    token: zeroAddress,
    target: 30000000000000000000n, // 30 ETH
    deadline: 1745000000n,
    raised: 12000000000000000000n, // 12 ETH
    status: 0, // Active
  },
  {
    id: 4n,
    creator: "0xfedc...ba09" as Address,
    name: "Web3 Education Scholarship",
    token: zeroAddress,
    target: 8000000000000000000n, // 8 ETH
    deadline: 1735000000n,
    raised: 3000000000000000000n, // 3 ETH
    status: 2, // Failed
  },
];

const MOCK_PROPOSALS = [
  {
    id: 1n,
    description: "Increase DAO Treasury Allocation to Developer Grants",
    deadline: 1755000000n,
    yesVotes: 4200000000000000000n, // 4.2 tokens
    noVotes: 1500000000000000000n, // 1.5 tokens
  },
  {
    id: 2n,
    description: "Deploy V2 Smart Contracts with Enhanced Security",
    deadline: 1760000000n,
    yesVotes: 3100000000000000000n,
    noVotes: 800000000000000000n,
  },
  {
    id: 3n,
    description: "Establish Community Multi-Sig Wallet with 5 Signers",
    deadline: 1740000000n,
    yesVotes: 2500000000000000000n,
    noVotes: 2500000000000000000n,
  },
  {
    id: 4n,
    description: "Integrate Layer 2 Scaling Solution for Lower Gas Fees",
    deadline: 1765000000n,
    yesVotes: 5000000000000000000n,
    noVotes: 1000000000000000000n,
  },
  {
    id: 5n,
    description: "Governance Parameter Adjustment: Voting Period Reduction",
    deadline: 1730000000n,
    yesVotes: 1000000000000000000n,
    noVotes: 4500000000000000000n,
  },
];

export function getMockCampaigns(limit?: number) {
  const items = limit ? MOCK_CAMPAIGNS.slice(0, limit) : MOCK_CAMPAIGNS;
  return {
    data: items,
    isLoading: false,
    error: null,
    count: items.length,
  };
}

export function getMockProposals(limit?: number) {
  const items = limit ? MOCK_PROPOSALS.slice(0, limit) : MOCK_PROPOSALS;
  return {
    data: items,
    isLoading: false,
    error: null,
    count: items.length,
  };
}

export const MOCK_VOTER_COUNT = "3";
export const MOCK_CAMPAIGN_COUNT = MOCK_CAMPAIGNS.length;
export const MOCK_PROPOSAL_COUNT = MOCK_PROPOSALS.length;
