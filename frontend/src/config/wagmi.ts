import { http, createConfig, fallback } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

const primaryRpc = process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia.publicnode.com';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'VoteDAO' }),
  ],
  ssr: true,
  transports: {
    [sepolia.id]: fallback([
      http(primaryRpc, { timeout: 30000 }),
      http('https://1rpc.io/sepolia', { timeout: 30000 }),
      http('https://rpc.sepolia.org', { timeout: 30000 }),
    ], { rank: false }),
  },
});
