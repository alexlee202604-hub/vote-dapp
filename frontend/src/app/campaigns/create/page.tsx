'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [token, setToken] = useState('ETH');
  const [duration, setDuration] = useState('7');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setTxHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join(''));
    setTimeout(() => router.push('/campaigns'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Campaign</h1>
        <p className="text-gray-600 mb-8">Launch your crowdfunding campaign on-chain</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition min-h-[100px] resize-y"
              placeholder="Describe your project..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Amount</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                min="0.01" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Token</label>
              <select value={token} onChange={e => setToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition bg-white">
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (days)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              min="1" max="90" required />
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-700">
            <strong>⚠️ Funds are locked:</strong> If target is reached by the deadline, you can withdraw. Otherwise contributors can refund.
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 shadow-lg">
            {submitting ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
          {txHash && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
              <p className="text-green-700 font-medium">✓ Campaign created!</p>
              <p className="text-green-600 mt-1 break-all">Tx: {txHash}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
