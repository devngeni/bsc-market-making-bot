import {
  ChainId,
  CurrencyAmount,
  Fetcher,
  Percent,
  Route,
  TokenAmount,
  Trade,
  TradeType,
  WETH,
} from "@pancakeswap-libs/sdk-v2";
import { ethers, utils } from "ethers";
import { bscProvider } from "../provider";
import { toHex } from "../utils";
import { config } from "./../config";
import { getAllowance } from "./allowance";
import { approve, MAX_INT } from "./approve";

export const swapExactTokensForTokens = async (
  wallet: { ADDRESS: string; PRIVATE_KEY: string },
  amountIn: any,
  amountOutMin: number,
  path: Array<string>,
  gasLimit: string
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
    const deadline = Math.floor(Date.now() / 1000 + 60 * 2);

    // get transctions nounce / count
    let nonce = await bscProvider.provider.getTransactionCount(
      wallet.ADDRESS,
      "pending"
    );

    const searchToken = await Fetcher.fetchTokenData(
      ChainId.MAINNET,
      path[0],
      bscProvider.provider
    );
    const wbnb = WETH[ChainId.MAINNET];
    // //Create pair

    const pair = await Fetcher.fetchPairData(
      searchToken,
      wbnb,
      bscProvider.provider
    );
    //Get route
    const route = new Route([pair], searchToken);

    let tokenAmount: any = amountIn * Math.pow(10, 18);
    //Trade coins
    const trade = new Trade(
      route,
      new TokenAmount(searchToken, tokenAmount),
      TradeType.EXACT_INPUT
    );

    const slippageTolerance = new Percent(config.SLIPPAGE.SELLING, "10000");

    const amountOutMin = toHex(trade.minimumAmountOut(slippageTolerance));
    const value = toHex(trade.inputAmount);

    /**
     * Check if the token has enough allowance else approve
     * and increment nonce
     */

    const allowanceAmount = await getAllowance(wallet, path[0]);

    const allowance = parseInt(allowanceAmount._hex, 16);

    if (allowance < parseInt(MAX_INT)) {
      await approve(wallet, path[0]);
      nonce = nonce + 1;
    }

    /**End of Approve */

    const tx = await swapContract.swapExactTokensForTokens(
      value,
      0,
      path,
      wallet.ADDRESS,
      deadline,
      {
        nonce: nonce,
        gasLimit: gasLimit,
      }
    );

    console.log("\n\n\n ************** SELL ***************");
    console.log("Transaction hash: ", `https://bscscan.com/tx/${tx.hash}`);

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log("swapExactTokensForTokens did not happen:=======>", error);
    return { success: false, data: `${error}` };
  }
};
