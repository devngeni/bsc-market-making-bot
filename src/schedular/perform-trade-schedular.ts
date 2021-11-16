import { schedule } from "node-cron";
import { config } from "../config";
import { Trade } from "../models";
import {
  swapExactETHForTokens,
  approve,
  swapExactTokensForTokens,
} from "../swapping";

export const randomPriceSupportForToken = async (token: string) => {
  let nextTime =
    config.EXECUTION_TIME[
      Math.floor(Math.random() * config.EXECUTION_TIME.length)
    ];

  console.log("Starting CronTime Interval:", nextTime);

  const randomizedArgs = {
    wallet: config.WALLETS[Math.floor(Math.random() * config.WALLETS.length)],
  };

  const allTokenTrades = await Trade.find({ token: token.toLowerCase() });

  const lastTrade = allTokenTrades[allTokenTrades.length - 1];
  console.log(lastTrade && lastTrade.action === "BUY");

  schedule(`*/${nextTime} * * * *`, async () => {
    // Get random amount of trade from the list

    const randomBNBAmount =
      config.EXECUATION_AMOUNT[
        Math.floor(Math.random() * config.EXECUATION_AMOUNT.length)
      ];

    if (lastTrade && !lastTrade.is_sold_out && lastTrade.action === "BUY") {
      const tokenBalance =
        lastTrade?.amount_balance! > 0
          ? lastTrade.amount_balance
          : lastTrade.value / 2;
      // Approve Token
      await approve(randomizedArgs.wallet, token);
      // Approve token
      const sellPath = [token, config.BSC.WBNB_ADDRESS];

      await swapExactTokensForTokens(
        randomizedArgs.wallet,
        tokenBalance,
        0,
        sellPath,
        "1000000"
      );

      // CHECK the token amount balance & update the token accordingly
      if (lastTrade?.amount_balance! > 0) {
        await Trade.findByIdAndUpdate(lastTrade.id, {
          is_sold_out: true,
          action: "SELL",
        });
      } else {
        // update
        await Trade.findByIdAndUpdate(lastTrade.id, {
          amount_balance: lastTrade.value / 2,
        });
      }
    } else if (lastTrade && lastTrade.action === "SELL") {
      // Buy
      const path = [config.BSC.WBNB_ADDRESS, token];
      const tx: any = await swapExactETHForTokens(
        randomizedArgs.wallet,
        randomBNBAmount,
        path,
        "1000000",
        token
      );
      console.log(tx);
      if (tx.status) {
        // approve after buy.
        await approve(randomizedArgs.wallet, token);
      }
    } else {
      const path = [config.BSC.WBNB_ADDRESS, token];
      const tx: any = await swapExactETHForTokens(
        randomizedArgs.wallet,
        randomBNBAmount,
        path,
        "1000000",
        token
      );

      // approve after buy.
      if (tx.status) {
        // approve after buy.
        await approve(randomizedArgs.wallet, token);
        // SAVE After BUY
        saveToDb(
          {
            method: "0x121212",
            sighash: "SOME",
            signature: "as0as",
          },
          token.toLowerCase(),
          "3.0",
          randomBNBAmount
        );
      }

      // set next random cron time
      nextTime =
        config.EXECUTION_TIME[
          Math.floor(Math.random() * config.EXECUTION_TIME.length)
        ];
    }
  });
};

const saveToDb = async (
  transaction: any,
  token: string,
  impact: string,
  value: number
) => {
  const trade = await Trade.build({
    method_name: transaction.method,
    method_sighash: transaction.sighash,
    signature: transaction.signature,
    token,
    price_impact: impact,
    action: "BUY",
    value,
  }).save();

  return trade;
};
