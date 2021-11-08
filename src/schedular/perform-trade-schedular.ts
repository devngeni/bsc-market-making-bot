import { schedule } from "node-cron";

/**
 *
 * @param tradeType Trade type, for instance SwapExactEthFor**(BUY) or SwapExactTokenFor**
 * @param randomizedTime Random time in minutes
 * @param randomizedAmount  Random amount from a configuration in prod.ts file
 * @param randomWallet  Random wallet having private key and address
 */
export const performTradeSchedular = async (
  tradeType: string,
  randomizedTime: number,
  randomizedAmount: number,
  randomWallet: { ADDRESS: string; PRIVATE_KEY: string }
) => {
  schedule(`${randomizedTime} * * * *`, async () => {
    console.log(tradeType, randomizedTime, randomizedAmount, randomWallet);
  });
};
