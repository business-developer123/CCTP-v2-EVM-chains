import type { Hex } from "viem";

export enum SupportedChainId {
  // Testnets
  // ETH_SEPOLIA = 11155111,
  // AVAX_FUJI = 43113,
  // BASE_SEPOLIA = 84532,
  // Mainnets
  ETH_MAINNET = 1,
  AVAX_MAINNET = 43114,
  ARBITRUM_ONE = 42161,
  BASE_MAINNET = 8453,
  LINEA_MAINNET = 59144,

  OPTIMISM_MAINNET = 10,
  POLYGON_MAINNET = 137,
  UNICHAIN_MAINNET = 130/*1231*/,   // UniChain Mainnet
  //NOBLE_MAINNET = 7777777,   // noble-1

  //SOLANA_MAINNET = 1,        // Mainnet Beta - 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d
  //SUI_MAINNET = 1,           // 35834a8a
  //APTOS_MAINNET = 1,         // Aptos Mainnet
}

export const DEFAULT_MAX_FEE = 1000n;
export const DEFAULT_FINALITY_THRESHOLD = 2000;

export const CHAIN_TO_CHAIN_NAME_V1: Record<number, string> = {
  [SupportedChainId.ETH_MAINNET]: "Ethereum Mainnet",
  [SupportedChainId.AVAX_MAINNET]: "Avalanche Mainnet",
  [SupportedChainId.ARBITRUM_ONE]: "Arbitrum One",
  [SupportedChainId.BASE_MAINNET]: "Base Mainnet",
  // [SupportedChainId.LINEA_MAINNET]: "Linea Mainnet",
  [SupportedChainId.OPTIMISM_MAINNET]: "Optimism Mainnet",
  [SupportedChainId.POLYGON_MAINNET]: "Polygon Mainnet",
  [SupportedChainId.UNICHAIN_MAINNET]: "UniChain Mainnet",
}

export const CHAIN_TO_CHAIN_NAME_V2: Record<number, string> = {
  // Testnets
  // [SupportedChainId.ETH_SEPOLIA]: "Ethereum Sepolia",
  // [SupportedChainId.AVAX_FUJI]: "Avalanche Fuji",
  // [SupportedChainId.BASE_SEPOLIA]: "Base Sepolia",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: "Ethereum Mainnet",
  [SupportedChainId.AVAX_MAINNET]: "Avalanche Mainnet",
  [SupportedChainId.ARBITRUM_ONE]: "Arbitrum One",
  [SupportedChainId.BASE_MAINNET]: "Base Mainnet",
  [SupportedChainId.LINEA_MAINNET]: "Linea Mainnet",
};

export const CHAIN_TO_RPC_URL: Record<number, string> = {
  // Testnets
  // [SupportedChainId.ETH_SEPOLIA]:
  //   process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC || "https://0xrpc.io/sep",
  // [SupportedChainId.AVAX_FUJI]:
  //   process.env.NEXT_PUBLIC_AVAX_FUJI_RPC ||
  //   "https://api.avax-test.network/ext/bc/C/rpc",
  // [SupportedChainId.BASE_SEPOLIA]:
  //   process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]:
    process.env.NEXT_PUBLIC_ETH_MAINNET_RPC || "https://eth-mainnet.g.alchemy.com/v2/LO_vpHBhxxs_Jd_spOLpXK7ubLx2inyg",
  [SupportedChainId.AVAX_MAINNET]:
    process.env.NEXT_PUBLIC_AVAX_MAINNET_RPC ||
    "https://avax-mainnet.g.alchemy.com/v2/LO_vpHBhxxs_Jd_spOLpXK7ubLx2inyg",
  [SupportedChainId.ARBITRUM_ONE]:
    process.env.NEXT_PUBLIC_ARBITRUM_ONE_RPC || "https://arb-mainnet.g.alchemy.com/v2/LO_vpHBhxxs_Jd_spOLpXK7ubLx2inyg",
  [SupportedChainId.BASE_MAINNET]:
    process.env.NEXT_PUBLIC_BASE_MAINNET_RPC || "https://base-mainnet.g.alchemy.com/v2/LO_vpHBhxxs_Jd_spOLpXK7ubLx2inyg",
  [SupportedChainId.LINEA_MAINNET]:
    process.env.NEXT_PUBLIC_LINEA_MAINNET_RPC || "https://linea-mainnet.g.alchemy.com/v2/LO_vpHBhxxs_Jd_spOLpXK7ubLx2inyg",
  [SupportedChainId.OPTIMISM_MAINNET]:
    process.env.NEXT_PUBLIC_OPTIMISM_MAINNET_RPC || "https://opt-mainnet.g.alchemy.com/v2/LO_vpHBhxxs_Jd_spOLpXK7ubLx2inyg",
  [SupportedChainId.POLYGON_MAINNET]:
    process.env.NEXT_PUBLIC_POLYGON_MAINNET_RPC || "https://polygon-mainnet.g.alchemy.com/v2/LO_vpHBhxxs_Jd_spOLpXK7ubLx2inyg",
  [SupportedChainId.UNICHAIN_MAINNET]:
    process.env.NEXT_PUBLIC_UNICHAIN_MAINNET_RPC || "https://unichain-mainnet.g.alchemy.com/v2/LO_vpHBhxxs_Jd_spOLpXK7ubLx2inyg",
};

export const CHAIN_IDS_TO_USDC_ADDRESSES: Record<number, Hex> = {
  // Testnets
  // [SupportedChainId.ETH_SEPOLIA]: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  // [SupportedChainId.AVAX_FUJI]: "0x5425890298aed601595a70AB815c96711a31Bc65",
  // [SupportedChainId.BASE_SEPOLIA]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [SupportedChainId.AVAX_MAINNET]: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  [SupportedChainId.ARBITRUM_ONE]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",//0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
  [SupportedChainId.BASE_MAINNET]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [SupportedChainId.LINEA_MAINNET]: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",

  [SupportedChainId.OPTIMISM_MAINNET]: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  [SupportedChainId.POLYGON_MAINNET]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  [SupportedChainId.UNICHAIN_MAINNET]: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
};

export const CHAIN_IDS_TO_TOKEN_MESSENGER_V2: Record<number, Hex> = {
  // Testnets
  // [SupportedChainId.ETH_SEPOLIA]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  // [SupportedChainId.AVAX_FUJI]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  // [SupportedChainId.BASE_SEPOLIA]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",//"0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
  [SupportedChainId.AVAX_MAINNET]: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",//"0x6B25532E1060CE10cc3B0A99e5683b91CbfAF739",
  [SupportedChainId.ARBITRUM_ONE]: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  [SupportedChainId.BASE_MAINNET]: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  [SupportedChainId.LINEA_MAINNET]: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
};

export const CHAIN_IDS_TO_TOKEN_MESSENGER_V1: Record<number, Hex> = {
  [SupportedChainId.ETH_MAINNET]: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
  [SupportedChainId.AVAX_MAINNET]: "0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982",
  [SupportedChainId.ARBITRUM_ONE]: "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
  [SupportedChainId.BASE_MAINNET]: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962",
  [SupportedChainId.OPTIMISM_MAINNET]: "0x2B4069517957735bE00ceE0fadAE88a26365528f",
  [SupportedChainId.POLYGON_MAINNET]: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE",
  [SupportedChainId.UNICHAIN_MAINNET]: "0x4e744b28E787c3aD0e810eD65A24461D4ac5a762",
};

export const CHAIN_IDS_TO_MESSAGE_TRANSMITTER_V2: Record<number, Hex> = {
  // Testnets
  // [SupportedChainId.ETH_SEPOLIA]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  // [SupportedChainId.AVAX_FUJI]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  // [SupportedChainId.BASE_SEPOLIA]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",//"0x0a992d191DEeC32aFe36203Ad87D7d289a738F81",
  [SupportedChainId.AVAX_MAINNET]: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",// "0x8186359aF5F57FbB40c6b14A588d2A59C0C29880",
  [SupportedChainId.ARBITRUM_ONE]: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  [SupportedChainId.BASE_MAINNET]: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  [SupportedChainId.LINEA_MAINNET]: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
};

export const CHAIN_IDS_TO_MESSAGE_TRANSMITTER_V1: Record<number, Hex> = {
  [SupportedChainId.ETH_MAINNET]: "0x0a992d191DEeC32aFe36203Ad87D7d289a738F81",
  [SupportedChainId.AVAX_MAINNET]: "0x8186359aF5F57FbB40c6b14A588d2A59C0C29880",
  [SupportedChainId.ARBITRUM_ONE]: "0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca",
  [SupportedChainId.BASE_MAINNET]: "0xAD09780d193884d503182aD4588450C416D6F9D4",
  [SupportedChainId.OPTIMISM_MAINNET]: "0x4D41f22c5a0e5c74090899E5a8Fb597a8842b3e8",
  [SupportedChainId.POLYGON_MAINNET]: "0xF3be9355363857F3e001be68856A2f96b4C39Ba9",
  [SupportedChainId.UNICHAIN_MAINNET]: "0x353bE9E2E38AB1D19104534e4edC21c643Df86f4",
};

export const DESTINATION_DOMAINS_V2: Record<number, number> = {
  // Testnets
  // [SupportedChainId.ETH_SEPOLIA]: 0,
  // [SupportedChainId.AVAX_FUJI]: 1,
  // [SupportedChainId.BASE_SEPOLIA]: 6,
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: 0,
  [SupportedChainId.AVAX_MAINNET]: 1,
  [SupportedChainId.ARBITRUM_ONE]: 3,
  [SupportedChainId.BASE_MAINNET]: 6,
  [SupportedChainId.LINEA_MAINNET]: 11,
};

export const DESTINATION_DOMAINS_V1: Record<number, number> = {
  [SupportedChainId.ETH_MAINNET]: 0,
  [SupportedChainId.AVAX_MAINNET]: 1,
  [SupportedChainId.OPTIMISM_MAINNET]: 2,
  [SupportedChainId.ARBITRUM_ONE]: 3,
  [SupportedChainId.BASE_MAINNET]: 6,
  [SupportedChainId.POLYGON_MAINNET]: 7,
  [SupportedChainId.UNICHAIN_MAINNET]: 10,
};

export const SUPPORTED_CHAINS_V1 = [
  SupportedChainId.ETH_MAINNET,
  SupportedChainId.AVAX_MAINNET,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.BASE_MAINNET,
  // SupportedChainId.LINEA_MAINNET,
  SupportedChainId.OPTIMISM_MAINNET,
  SupportedChainId.POLYGON_MAINNET,
  SupportedChainId.UNICHAIN_MAINNET,
];

export const SUPPORTED_CHAINS_V2 = [
  // Testnets
  // SupportedChainId.ETH_SEPOLIA,
  // SupportedChainId.AVAX_FUJI,
  // SupportedChainId.BASE_SEPOLIA,
  // Mainnets
  SupportedChainId.ETH_MAINNET,
  SupportedChainId.AVAX_MAINNET,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.BASE_MAINNET,
  SupportedChainId.LINEA_MAINNET,
];
