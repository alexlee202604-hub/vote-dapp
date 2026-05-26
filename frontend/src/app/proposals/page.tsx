'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Proposal {
  id: number;
  description: string;
  deadline: number;
  yesVotes: number;
  noVotes: number;
}

const mockProposals: Proposal[] = [
  { id: 1, description: 'Increase DAO Treasury Allocation to DeFi Protocols', deadline: Math.floor(Date.now() / 1000) + 86400 * 5, yesVotes: 42, noVotes: 7 },
  { id: 2, description: 'Approve Q3 Marketing Budget of 50,000 VOTE Tokens', deadline: Math.floor(Date.now() / 1000) + 86400 * 3, yesVotes: 28, noVotes: 15 },
  { id: 3, description: 'Add New Member to Multisig Committee', deadline: Math.floor(Date.now() / 1000) - 86400, yesVotes: 35, noVotes: 10 },
];

export default function ProposalsPage() {
  const [proposals] = useState<Proposal[]>(mockProposals);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">DAO Proposals</h1>
            <p className="text-gray-600 mt-2">Vote anonymously on DAO proposals using zero-knowledge proofs</p>
          </div>
          <Link
            href="/proposals/create"
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            + Create Proposal
          </Link>
        </div>

        <div className="grid gap-6">
          {proposals.map((prop) => {
            const isActive = prop.deadline > Math.floor(Date.now() / 1000);
            const total = prop.yesVotes + prop.noVotes;
            const yesPct = total > 0 ? (prop.yesVotes / total) * 100 : 0;
            
            return (
              <Link key={prop.id} href={`/proposals/${prop.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{prop.description}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isActive ? '● Active' : '● Ended'}
                        </span>
                        <span className="text-gray-400">
                          {isActive ? `${Math.ceil((prop.deadline - Math.floor(Date.now()/1000)) / 3600)}h remaining` : 'Voting ended'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-900">{total}</div>
                      <div className="text-xs text-gray-500">total votes</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">Yes: {prop.yesVotes}</span>
                      <span className="text-gray-400">{yesPct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${yesPct}%` }} />
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-red-500 font-medium">No: {prop.noVotes}</span>
                      <span className="text-gray-400">{(100 - yesPct).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
