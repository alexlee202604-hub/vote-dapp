'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Campaign {
  id: number; creator: string; token: string; target: number; raised: number; deadline: number; status: string; description: string;
}

const mockCampaigns: Campaign[] = [
  { id: 1, creator: '0x1234...abcd', token: 'ETH', target: 100, raised: 72, deadline: Math.floor(Date.now()/1000) + 86400*5, status: 'Active', description: 'Support our DeFi protocol - bringing institutional-grade lending to everyone.' },
  { id: 2, creator: '0x5678...ef01', token: 'USDC', target: 50000, raised: 50000, deadline: Math.floor(Date.now()/1000) + 86400*2, status: 'Success', description: 'Community-driven NFT marketplace development fund.' },
  { id: 3, creator: '0x9abc...2345', token: 'ETH', target: 50, raised: 12, deadline: Math.floor(Date.now()/1000) - 86400, status: 'Failed', description: 'Decentralized science research grant.' },
];

export default function CampaignsPage() {
  const [campaigns] = useState(mockCampaigns);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-4xl font-bold text-gray-900">Campaigns</h1><p className="text-gray-600 mt-2">Fund innovative projects through decentralized crowdfunding</p></div>
          <Link href="/campaigns/create" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg">+ Create Campaign</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const pct = Math.min(100, (c.raised / c.target) * 100);
            const isActive = c.status === 'Active';
            const colors = { Active: 'bg-green-100 text-green-700', Success: 'bg-blue-100 text-blue-700', Failed: 'bg-red-100 text-red-700' } as const;
            return (
              <Link key={c.id} href={`/campaigns/${c.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border border-gray-100 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[c.status as keyof typeof colors] || 'bg-gray-100 text-gray-500'}`}>● {c.status}</span>
                    <span className="text-xs text-gray-400">{c.token}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{c.description}</h3>
                  <p className="text-xs text-gray-400 mb-4">by {c.creator}</p>
                  <div className="mb-2"><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{c.raised.toLocaleString()} / {c.target.toLocaleString()} {c.token}</span><span className="font-medium">{pct.toFixed(0)}%</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${c.status === 'Success' ? 'bg-blue-500' : c.status === 'Failed' ? 'bg-red-400' : 'bg-purple-500'}`} style={{width:`${pct}%`}}/></div>
                  </div>
                  {isActive && <p className="text-xs text-gray-400">{Math.ceil((c.deadline - Date.now()/1000)/3600)}h remaining</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
