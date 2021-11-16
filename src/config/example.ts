import { checkSum } from "../utils";
import { Config } from "./../types";

// create prod.ts

const config: Config = {
  WALLETS: [
    {
      PRIVATE_KEY: "",
      ADDRESS: "",
    },
  ],
  PRICEIMPACT: [{ SELLING: 0.3, BUYING: 1 }],
  EXECUTION_TIME: [2, 4, 1, 5, 6, 7], // minutes
  BLOXROUTE: {
    ENDPOINT: "wss://bsc.feed.blxrbdn.com:28333",
  },
  BSC: {
    NODE_URL: "https://bsc-dataseed1.binance.org/",
    WBNB_ADDRESS: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    PANCAKE_V2_ROUTE: "0x10ed43c718714eb63d5aa57b78b54704e256024e",
  },
  TOKENS_TO_MONITOR: [
    "0xf9fbe825bfb2bf3e387af0dc18cac8d87f29dea8", // BOT OCEAN
  ],
  EXECUATION_AMOUNT: [0.0005, 0.0003, 0.001],
  DB: {
    MONGO_URL: "mongodb://localhost:27017/market-making-dev",
  },
  MESSAGING: {
    BOT_TOKEN: "",
  },
  SLIPPAGE: {
    BUYING: "20", // %
    SELLING: "20", // %
  },
  IS_BOT_ON: true, // true ->  for bot to be on and false bot to be off
};

export { config };
