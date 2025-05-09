import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'viem/chains'
import { http } from 'viem'
import { createConfig } from 'wagmi'

export const config = createConfig(
  getDefaultConfig({
    appName: 'CCTP V2 Web App',
    projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // You'll need to get this from WalletConnect
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
  }),
) 