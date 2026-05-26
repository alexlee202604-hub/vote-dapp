export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center text-sm text-zinc-500 sm:flex-row sm:justify-between dark:text-zinc-400">
        <span>&copy; {new Date().getFullYear()} VoteDAO. All rights reserved.</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Built on Sepolia &middot; Powered by zero-knowledge proofs
        </span>
      </div>
    </footer>
  );
}
