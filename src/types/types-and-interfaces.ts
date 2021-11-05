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
  PRICEIMPACT: { SELLING: number; BUYING: number };
  EXECUTION_TIME: Array<number>;
  BLOXROUTE: {
    ENDPOINT: string;
  };
  BSC: {
    NODE_URL: string;
    WBNB_ADDRESS: string;
  };
}
