export enum SupportedChainId {
  // Testnets
  ETH_SEPOLIA = 11155111,
  AVAX_FUJI = 43113,
  BASE_SEPOLIA = 84532,
  MATIC_AMOY = 80002,
  // Mainnets
  ETH_MAINNET = 1,
  AVAX_MAINNET = 43114,
}

export const CHAIN_TO_CHAIN_NAME: Record<number, string> = {
  // Testnets
  [SupportedChainId.ETH_SEPOLIA]: "Ethereum Sepolia",
  [SupportedChainId.AVAX_FUJI]: "Avalanche Fuji",
  [SupportedChainId.BASE_SEPOLIA]: "Base Sepolia",
  [SupportedChainId.MATIC_AMOY]: "Polygon Amoy",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: "Ethereum Mainnet",
  [SupportedChainId.AVAX_MAINNET]: "Avalanche Mainnet",
};

export const CHAIN_TO_RPC_URL: Record<number, string> = {
  // Testnets
  [SupportedChainId.ETH_SEPOLIA]:
    process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC || "https://rpc.sepolia.org",
  [SupportedChainId.AVAX_FUJI]:
    process.env.NEXT_PUBLIC_AVAX_FUJI_RPC ||
    "https://api.avax-test.network/ext/bc/C/rpc",
  [SupportedChainId.BASE_SEPOLIA]:
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
  [SupportedChainId.MATIC_AMOY]:
    process.env.NEXT_PUBLIC_MATIC_AMOY_RPC ||
    "https://rpc-amoy.polygon.technology",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]:
    process.env.NEXT_PUBLIC_ETH_MAINNET_RPC || "https://eth.llamarpc.com",
  [SupportedChainId.AVAX_MAINNET]:
    process.env.NEXT_PUBLIC_AVAX_MAINNET_RPC ||
    "https://api.avax.network/ext/bc/C/rpc",
};

export const CHAIN_IDS_TO_USDC_ADDRESSES: Record<number, string> = {
  // Testnets
  [SupportedChainId.ETH_SEPOLIA]: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  [SupportedChainId.AVAX_FUJI]: "0x5425890298aed601595a70AB815c96711a31Bc65",
  [SupportedChainId.BASE_SEPOLIA]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  [SupportedChainId.MATIC_AMOY]: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [SupportedChainId.AVAX_MAINNET]: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
};

export const CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES: Record<number, string> = {
  // Testnets
  [SupportedChainId.ETH_SEPOLIA]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.AVAX_FUJI]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.BASE_SEPOLIA]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.MATIC_AMOY]: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",//"0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
  [SupportedChainId.AVAX_MAINNET]: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",//"0x6B25532E1060CE10cc3B0A99e5683b91CbfAF739",
};

export const CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES: Record<
  number,
  string
> = {
  // Testnets
  [SupportedChainId.ETH_SEPOLIA]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.AVAX_FUJI]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.BASE_SEPOLIA]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.MATIC_AMOY]: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",//"0x0a992d191DEeC32aFe36203Ad87D7d289a738F81",
  [SupportedChainId.AVAX_MAINNET]: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",//"0x8186359aF5F57FbB40c6b14A588d2A59C0C29880",
};

export const DESTINATION_DOMAINS: Record<number, number> = {
  // Testnets
  [SupportedChainId.ETH_SEPOLIA]: 0,
  [SupportedChainId.AVAX_FUJI]: 1,
  [SupportedChainId.BASE_SEPOLIA]: 6,
  [SupportedChainId.MATIC_AMOY]: 7,
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: 0,
  [SupportedChainId.AVAX_MAINNET]: 1,
};
