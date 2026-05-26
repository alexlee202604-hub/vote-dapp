import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'VoteDAO' }),
  ],
  transports: {
    [sepolia.id]: http('https://rpc.sepolia.org'),
  },
});
