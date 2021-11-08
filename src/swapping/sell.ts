import { CurrencyAmount } from "@pancakeswap-libs/sdk-v2";
import { ethers } from "ethers";
import { bscProvider } from "../provider";
import { toHex } from "../utils";
import { config } from "./../config";

export const swapExactTokensForTokens = async (
  wallet: { ADDRESS: string; PRIVATE_KEY: string },
  amountIn: any,
  amountOutMin: number,
  path: Array<string>,
  gasPrice: number,
  gasLimit: number,
  nonce: number
) => {
  try {
    console.log(
      "\n\n==================== swapExactTokensForTokens ==============="
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
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      ],
      account
    );
    // Convert amount toHex
    let value = toHex(amountOutMin as unknown as CurrencyAmount);

    let calcAmountIn = ethers.utils.parseUnits(amountIn, "ether");
    const deadline = Math.floor(Date.now() / 1000 + 60 * 2);

    console.log(
      `\n\n amountOut: ${calcAmountIn}, \n Value: ${value} \nto: ${wallet.ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline},`
    );
    const tx = await swapContract.swapExactTokensForTokens(
      toHex(calcAmountIn as unknown as CurrencyAmount),
      0,
      path,
      wallet.ADDRESS,
      deadline,
      {
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
      }
    );

    console.log("\n\n\n ************** BUY ***************");
    console.log("Transaction hash: ", tx.hash);

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log("swapExactTokensForTokens did not happen:=======>", error);
    return { success: false, data: `${error}` };
  }
};
