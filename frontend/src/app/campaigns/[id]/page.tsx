'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: number; creator: string; token: string; target: number; raised: number; deadline: number; status: string; description: string;
}

const mockCampaigns: Record<number, Campaign> = {
  1: { id: 1, creator: '0x1234...abcd', token: 'ETH', target: 100, raised: 72, deadline: Math.floor(Date.now()/1000) + 86400*5, status: 'Active', description: 'Support our DeFi protocol - bringing institutional-grade lending to everyone.' },
  2: { id: 2, creator: '0x5678...ef01', token: 'USDC', target: 50000, raised: 50000, deadline: Math.floor(Date.now()/1000) + 86400*2, status: 'Success', description: 'Community-driven NFT marketplace development fund.' },
  3: { id: 3, creator: '0x9abc...2345', token: 'ETH', target: 50, raised: 12, deadline: Math.floor(Date.now()/1000) - 86400, status: 'Failed', description: 'Decentralized science research grant.' },
};

export default function CampaignDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const camp = mockCampaigns[id];
  const [amount, setAmount] = useState('');
  const [contributing, setContributing] = useState(false);
  const [contributed, setContributed] = useState(false);

  if (!camp) return <div className="min-h-screen flex items-center justify-center"><h2 className="text-2xl font-bold text-gray-900">Campaign Not Found</h2></div>;

  const pct = Math.min(100, (camp.raised / camp.target) * 100);
  const isActive = camp.status === 'Active';

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setContributing(true);
    await new Promise(r => setTimeout(r, 2000));
    setContributed(true);
    setContributing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/campaigns" className="text-purple-600 hover:text-purple-700 mb-6 block">← Back to Campaigns</Link>
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${camp.status === 'Active' ? 'bg-green-100 text-green-700' : camp.status === 'Success' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>● {camp.status}</span>
            <span className="text-sm text-gray-400">by {camp.creator} · {camp.token}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{camp.description}</h1>
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Raised: {camp.raised.toLocaleString()} {camp.token}</span><span className="font-bold">{pct.toFixed(1)}% of {camp.target.toLocaleString()}</span></div>
            <div className="w-full bg-gray-100 rounded-full h-4"><div className={`h-4 rounded-full ${camp.status === 'Success' ? 'bg-blue-500' : camp.status === 'Failed' ? 'bg-red-400' : 'bg-purple-500'}`} style={{width:`${pct}%`}}/></div>
          </div>
          <div className="text-sm text-gray-400 mb-6">
            {isActive ? `${Math.ceil((camp.deadline - Date.now()/1000)/3600)} hours remaining` : 'Campaign has ended'}
          </div>
          {isActive && !contributed && (
            <form onSubmit={handleContribute} className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contribute to this Campaign</h3>
              <div className="flex gap-4">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  placeholder={`Amount in ${camp.token}`} step="0.01" min="0.01" required />
                <button type="submit" disabled={contributing}
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50">
                  {contributing ? 'Contributing...' : 'Contribute'}
                </button>
              </div>
            </form>
          )}
          {contributed && <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"><p className="text-green-700 font-medium">✓ Contribution successful!</p></div>}
        </div>
      </div>
    </div>
  );
}
