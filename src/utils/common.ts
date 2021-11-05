import { utils } from "ethers";
import { CurrencyAmount } from "@pancakeswap-libs/sdk-v2";

/**
 *
 * @param amount Currency Amount
 * @returns Hexadecimal Amount
 */
export const toHex = (amount: CurrencyAmount) => {
  return `0x${amount.raw.toString(16)}`;
};

/**
 * This ensures the error of checksumed on addresses is avoided
 * @param address Address of the token
 * @returns address string
 */
export const checkSum = (address: string) => {
  return utils.getAddress(address);
};

/**
 *
 * @param amount Amount in Gwei
 * @returns amount in eth
 */
const gweiToEth = (amount: number) => {
  return amount / Math.pow(10, 18);
};
