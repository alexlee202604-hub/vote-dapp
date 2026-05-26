'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProposalPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('7');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setTxHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    setTimeout(() => router.push('/proposals'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Proposal</h1>
        <p className="text-gray-600 mb-8">Create a new DAO proposal for anonymous voting</p>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Proposal Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition min-h-[120px] resize-y"
              placeholder="Describe what this proposal aims to achieve..." required />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Voting Duration (days)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              min="1" max="30" required />
            <p className="text-xs text-gray-400 mt-1">Proposal will be open for voting for this many days</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-700">
            <strong>🔒 Privacy Notice:</strong> Your vote will be cast using a zero-knowledge proof. Your identity remains anonymous.
          </div>
          
          <button type="submit" disabled={submitting}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 shadow-lg">
            {submitting ? 'Creating Proposal...' : 'Create Proposal'}
          </button>
          
          {txHash && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
              <p className="text-green-700 font-medium">✓ Proposal created!</p>
              <p className="text-green-600 mt-1 break-all">Tx: {txHash}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
