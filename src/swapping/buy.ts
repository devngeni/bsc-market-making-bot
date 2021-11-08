import { BigintIsh, CurrencyAmount } from "@pancakeswap-libs/sdk-v2";
import { ethers } from "ethers";
import { bscProvider } from "../provider";
import { toHex } from "../utils";
import { config } from "./../config";

/**
 *
 * @param privateKey
 * @param amountOutMin
 * @param ethAmount
 * @param path
 * @param gasPrice
 * @param gasLimit
 * @param nonce
 */
export const swapExactETHForTokens = async (
  wallet: { ADDRESS: string; PRIVATE_KEY: string },
  amountOutMin: number,
  ethAmount: number,
  path: Array<string>,
  gasPrice: number,
  gasLimit: number,
  nonce: number
) => {
  console.log(
    "\n\n==================== swapExactETHForTokens ====================="
  );

  try {
    // Wallet Account
    const account = new ethers.Wallet(
      wallet.PRIVATE_KEY,
      bscProvider.provider
    ).connect(bscProvider.provider);

    // SWAPPING ABIs
    const swapContract = new ethers.Contract(
      config.BSC.PANCAKE_V2_ROUTE,
      [
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
      ],
      account
    );

    // Convert Amount to Hexadecimal

    let value = toHex(ethAmount as unknown as CurrencyAmount);

    // Transaction Deadline
    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
    const tx = await swapContract.swapExactETHForTokens(
      toHex(amountOutMin as unknown as CurrencyAmount),
      path,
      wallet.ADDRESS,
      deadline,
      {
        nonce: nonce,
        value,
        gasPrice,
        gasLimit,
      }
    );

    console.log("\n\n\n ************** BUY ***************");
    console.log("BUY Transaction hash: ", tx.hash);
    console.log("*****************************");

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log(
      `**** -----------swapExactETHForTokens ----------------- *********************`
    );
    return { success: false, data: `${error}` };
  }
};

export const swapExactETHForTokensSupportingFeeOnTransferTokens = async (
  wallet: { ADDRESS: string; PRIVATE_KEY: string },
  amountOutMin: number,
  ethAmount: number,
  path: Array<string>,
  gasPrice: number,
  gasLimit: number,
  nonce: number
) => {
  try {
    console.log(
      "\n\n==================== swapExactETHForTokensSupportingFeeOnTransferTokens ==============="
    );
    // Wallet Account
    const account = new ethers.Wallet(
      wallet.PRIVATE_KEY,
      bscProvider.provider
    ).connect(bscProvider.provider);

    // SWAPPING ABIs
    const swapContract = new ethers.Contract(
      config.BSC.PANCAKE_V2_ROUTE,
      [
        "function swapExactETHForTokensSupportingFeeOnTransferTokens( uint amountOutMin, address[] calldata path, address to, uint deadline ) external returns (uint[] memory amounts)",
      ],
      account
    );

    let value = toHex(ethAmount as unknown as CurrencyAmount);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    console.log(
      `\n \n amountOutMin: ${amountOutMin}, \nValue: ${value} \nto: ${wallet.ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline},`
    );

    const tx =
      await swapContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
        toHex(amountOutMin as unknown as CurrencyAmount),
        path,
        wallet.ADDRESS,
        deadline,
        {
          nonce: nonce,
          value,
          gasPrice,
          gasLimit,
        }
      );

    console.log("\n\n\n ************** BUY ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("*****************************************");

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log(
      "swapExactETHForTokensSupportingFeeOnTransferTokens:  ====> ",
      error
    );

    return { success: false, data: `${error}` };
  }
};
