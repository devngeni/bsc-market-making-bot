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
    amount:
      config.EXECUATION_AMOUNT[
        Math.floor(Math.random() * config.EXECUATION_AMOUNT.length)
      ],
  };

  const allTokenTrades = await Trade.find({ token });

  const lastTrade = allTokenTrades[allTokenTrades.length - 1];

  schedule(`*/${nextTime} * * * *`, async () => {
    if (lastTrade && lastTrade.action === "BUY") {
      // sell
      const sellPath = [token, config.BSC.WBNB_ADDRESS];
      await swapExactTokensForTokens(
        randomizedArgs.wallet,
        1000,
        0,
        sellPath,
        "300000"
      );
      console.log("SELL");
    } else if (lastTrade && lastTrade.action === "SELL") {
      // Buy
      const path = [config.BSC.WBNB_ADDRESS, token];
      const tx: any = await swapExactETHForTokens(
        randomizedArgs.wallet,
        0.001,
        path,
        "300000",
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
        0.001,
        path,
        "300000",
        token
      );
      console.log(tx);

      // approve after buy.
      if (tx.status) {
        // approve after buy.
        await approve(randomizedArgs.wallet, token);
        console.log("BOUGHT");
      }

      // set next random cron time
      nextTime =
        config.EXECUTION_TIME[
          Math.floor(Math.random() * config.EXECUTION_TIME.length)
        ];

      console.log("NextTime:", nextTime);
      // saveToDb(lastTrade, token, "0.00", 0.001, "BUY");
    }
  });
};
