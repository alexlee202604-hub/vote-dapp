import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'VoteDAO' }),
  ],
  ssr: true,
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia.publicnode.com',
      { batch: true }
    ),
  },
});
