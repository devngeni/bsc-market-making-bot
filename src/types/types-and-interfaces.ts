/**
 * Base Config types
 * This types define what are all the required information for use to define in inthe
 * config/prod.ts file
 * *******************************
 * ****PLEASE DON'T CHANGE THIS IF YOU DON'T KNOW WHAT YOU ARE DOING****
 * *******************************
 */
export interface Config {
  WALLETS: Array<{ PRIVATE_KEY: string; ADDRESS: string }>;
  PRICEIMPACT: [{ SELLING: number; BUYING: number }];
  EXECUTION_TIME: Array<number>;
  BLOXROUTE: {
    ENDPOINT: string;
  };
  BSC: {
    NODE_URL: string;
    WBNB_ADDRESS: string;
    PANCAKE_V2_ROUTE: string;
  };
  TOKENS_TO_MONITOR: Array<string>;
  EXECUATION_AMOUNT: Array<number>;
  DB: {
    MONGO_URL: string;
  };
}

export interface NextNotification {
  jsonrpc: string;
  id: null;
  method: string;
  params?: Params;
}

export interface Params {
  subscription: string;
  result: Result;
}

export interface Result {
  txHash: string;
  txContents: TxContents;
}

export interface TxContents {
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gas: string;
  input: string;
  nonce: string;
}
