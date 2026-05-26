import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:pb-28 sm:pt-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-900/20" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/20" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 shadow-lg shadow-purple-500/25">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 4l8 8h-5.333v8H11.333v-8H6l8-8z" fill="white" />
            </svg>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
            VoteDAO{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
              — Decentralized Crowdfunding & Anonymous Voting
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Launch fundraising campaigns, propose changes, and vote privately using
            zero-knowledge proofs — all on the Ethereum Sepolia testnet.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/campaigns"
              className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 active:bg-purple-700"
            >
              Browse Campaigns
            </Link>
            <Link
              href="/proposals"
              className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              View Proposals
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="border-t border-zinc-200 bg-zinc-50/50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Crowdfunding Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-100 transition group-hover:scale-150 dark:bg-purple-950/50" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Crowdfunding</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Create token-gated fundraising campaigns with target goals and deadlines.
                  Supporters contribute ERC-20 tokens and can withdraw or refund based on
                  campaign outcome.
                </p>
                <Link
                  href="/campaigns"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400"
                >
                  Explore Campaigns
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* ZK Voting Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-100 transition group-hover:scale-150 dark:bg-indigo-950/50" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">ZK Voting</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Vote on proposals anonymously using zero-knowledge proofs. Your ballot
                  remains private while the outcome is verifiably correct on-chain.
                </p>
                <Link
                  href="/proposals"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  View Proposals
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
