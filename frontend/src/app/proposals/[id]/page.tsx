'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Proposal {
  id: number; description: string; deadline: number; yesVotes: number; noVotes: number;
}

const mockProposals: Record<number, Proposal> = {
  1: { id: 1, description: 'Increase DAO Treasury Allocation to DeFi Protocols', deadline: Math.floor(Date.now()/1000) + 86400*5, yesVotes: 42, noVotes: 7 },
  2: { id: 2, description: 'Approve Q3 Marketing Budget of 50,000 VOTE Tokens', deadline: Math.floor(Date.now()/1000) + 86400*3, yesVotes: 28, noVotes: 15 },
  3: { id: 3, description: 'Add New Member to Multisig Committee', deadline: Math.floor(Date.now()/1000) - 86400, yesVotes: 35, noVotes: 10 },
};

export default function ProposalDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const prop = mockProposals[id];
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null);

  if (!prop) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h2>
      <Link href="/proposals" className="text-purple-600 hover:text-purple-700">← Back to Proposals</Link></div>
    </div>;
  }

  const isActive = prop.deadline > Math.floor(Date.now() / 1000);
  const total = prop.yesVotes + prop.noVotes;
  const yesPct = total > 0 ? (prop.yesVotes / total) * 100 : 0;

  const handleVote = async (choice: 'yes' | 'no') => {
    setVoting(true); setSelectedVote(choice);
    await new Promise(r => setTimeout(r, 3000));
    setTxHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    setVoted(true); setVoting(false); setShowVoteModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/proposals" className="text-purple-600 hover:text-purple-700 mb-6 block">← Back to Proposals</Link>
        
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {isActive ? '● Active' : '● Ended'}
            </span>
            <span className="text-sm text-gray-400">{isActive ? `${Math.ceil((prop.deadline - Math.floor(Date.now()/1000)) / 3600)} hours remaining` : 'Voting has ended'}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{prop.description}</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-green-600">Yes: {prop.yesVotes} votes</span>
              <span className="text-gray-500">{yesPct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${yesPct}%` }} />
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-red-500">No: {prop.noVotes} votes</span>
              <span className="text-gray-500">{(100 - yesPct).toFixed(1)}%</span>
            </div>
            <div className="text-center text-gray-400 text-sm">Total: {total} votes cast</div>
          </div>

          {isActive && !voted && (
            <button onClick={() => setShowVoteModal(true)}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg">
              Cast Anonymous Vote
            </button>
          )}
          {voted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-medium text-lg">✓ Vote Cast Successfully!</p>
              <p className="text-green-600 text-sm mt-1">Your anonymous vote has been recorded</p>
              {txHash && <p className="text-xs text-green-500 mt-2 break-all">Tx: {txHash}</p>}
            </div>
          )}
        </div>
      </div>

      {showVoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cast Your Vote</h3>
            <p className="text-gray-600 text-sm mb-6">Your vote will be anonymized using a zero-knowledge proof.</p>
            <div className="flex gap-4 mb-6">
              <button onClick={() => handleVote('yes')} disabled={voting}
                className="flex-1 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50">
                {voting && selectedVote === 'yes' ? 'Generating Proof...' : 'Vote Yes'}
              </button>
              <button onClick={() => handleVote('no')} disabled={voting}
                className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50">
                {voting && selectedVote === 'no' ? 'Generating Proof...' : 'Vote No'}
              </button>
            </div>
            {voting && (
              <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-700 space-y-1">
                <p>1/3 Generating ZK proof in browser...</p>
                <p>2/3 Proof generated ✓</p>
                <p>3/3 Submitting to chain...</p>
              </div>
            )}
            <button onClick={() => setShowVoteModal(false)} className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition" disabled={voting}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
