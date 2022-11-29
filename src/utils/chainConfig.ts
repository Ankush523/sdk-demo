export const ChainId = {
  MAINNET: 1, // Ethereum
  GOERLI: 5,
  POLYGON_MUMBAI: 80001,
  POLYGON_MAINNET: 137,
  BNB_TESTNET: 97 
};

export let activeChainId = ChainId.BNB_TESTNET;
export const supportedChains = [
  ChainId.GOERLI,
  ChainId.POLYGON_MAINNET,
  ChainId.POLYGON_MUMBAI,
  ChainId.BNB_TESTNET
];

export const getRPCProvider = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "https://eth-mainnet.g.alchemy.com/v2/YMRFBPG1iyBwiRQIHThSWZanZj0NXUjv";
    case 5:
      return "https://eth-goerli.alchemyapi.io/v2/lmW2og_aq-OXWKYRoRu-X6Yl6wDQYt_2";
    case 80001:
      return "https://polygon-mumbai.g.alchemy.com/v2/Q4WqQVxhEEmBYREX22xfsS2-s5EXWD31";
    case 137:
      return "https://polygon-mainnet.g.alchemy.com/v2/6Tn--QDkp1vRBXzRV3Cc8fLXayr5Yoij";
    case 97:
      return "https://data-seed-prebsc-1-s1.binance.org:8545/";
    default:
      return "https://eth-mainnet.g.alchemy.com/v2/YMRFBPG1iyBwiRQIHThSWZanZj0NXUjv";
  }
};

export const getSupportedChains = () => {};
