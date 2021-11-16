import {
  BigintIsh,
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
import { BigNumberish, ethers, utils } from "ethers";
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
  ethAmount: any,
  path: Array<string>,
  gasLimit: string,
  token: string
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

    // Get nonce
    const nonce = await bscProvider.provider.getTransactionCount(
      wallet.ADDRESS,
      "pending"
    );

    // Transaction Deadline
    const wbnb = WETH[ChainId.MAINNET];
    const searchToken = await Fetcher.fetchTokenData(
      ChainId.MAINNET,
      token,
      bscProvider.provider
    );

    const pair = await Fetcher.fetchPairData(
      searchToken,
      wbnb,
      bscProvider.provider
    );
    const route = new Route([pair], wbnb);

    ethAmount = ethAmount * Math.pow(10, 18);

    const slippageTolerance = new Percent("20", "10000");
    // console.log("Slippage => ", slippageTolerance);

    const trade = new Trade(
      route,
      new TokenAmount(wbnb, ethAmount),
      TradeType.EXACT_INPUT
    );

    const amountOutMin = toHex(trade.minimumAmountOut(slippageTolerance));
    // value
    const amountIn = toHex(trade.inputAmount);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    const tx = await swapContract.swapExactETHForTokens(
      amountOutMin,
      path,
      wallet.ADDRESS,
      deadline,
      {
        nonce: nonce,
        value: amountIn,
        gasLimit,
      }
    );

    console.log("\n\n\n ************** BUY ***************");
    console.log("BUY Transaction hash: ", `https://bscscan.com/tx/${tx.hash}`);
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
  gasLimit: string
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

    let value = utils.hexlify(ethAmount);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
    const nonce = await bscProvider.provider.getTransactionCount(
      wallet.ADDRESS,
      "pending"
    );

    const tx =
      await swapContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
        toHex(amountOutMin as unknown as CurrencyAmount),
        path,
        wallet.ADDRESS,
        deadline,
        {
          nonce: nonce,
          value: value.toString(),
          gasLimit,
        }
      );

    console.log("\n\n\n ************** BUY ***************");
    console.log("Transaction hash: ", `https://bscscan.com/tx/${tx.hash}`);
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
