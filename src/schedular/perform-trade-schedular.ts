import { schedule } from "node-cron";
import { config } from "../config";
import { Trade } from "../models";
import { swapExactETHForTokens, swapExactTokensForTokens } from "../swapping";

export const randomPriceSupportForToken = async (token: string) => {
  // SETTING UP SCHEDULAR START TRANSACTION  TIME
  let nextTime =
    config.EXECUTION_TIME[
      Math.floor(Math.random() * config.EXECUTION_TIME.length)
    ];

  console.log("RANDOM SCHEDULAR START TIME:", nextTime);

  const randomizedArgs = {
    wallet: config.WALLETS[Math.floor(Math.random() * config.WALLETS.length)],
  };

  const allTokenTrades = await Trade.find({
    token: token.toLowerCase(),
    is_sold_out: false,
  });

  const lastTrade = allTokenTrades[allTokenTrades.length - 1];

  schedule(`*/${nextTime} * * * *`, async () => {
    // Get random amount of trade from the list

    const randomBNBAmount =
      config.EXECUATION_AMOUNT[
        Math.floor(Math.random() * config.EXECUATION_AMOUNT.length)
      ];

    if (lastTrade && lastTrade.action === "BUY") {
      console.log("SELLING");
      const tokenBalance =
        lastTrade?.amount_balance! > 0
          ? lastTrade.amount_balance
          : lastTrade.value / 2;

      const sellPath = [token, config.BSC.WBNB_ADDRESS];

      await swapExactTokensForTokens(
        randomizedArgs.wallet,
        tokenBalance,
        0,
        sellPath,
        config.GAS_PRISE
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
      console.log("BUYING");
      // Buy
      const path = [config.BSC.WBNB_ADDRESS, token];

      // selling
      await swapExactETHForTokens(
        randomizedArgs.wallet,
        randomBNBAmount,
        path,
        config.GAS_PRISE,
        token
      );

      if (lastTrade) {
        let value: any = lastTrade.value;
        // update
        await Trade.findByIdAndUpdate(lastTrade.id, {
          value: randomBNBAmount + parseFloat(value),
        });
      } else {
      }
    } else {
      if (!lastTrade) {
        // SAVE After BUY
        console.log("BUYING **");
        const path = [config.BSC.WBNB_ADDRESS, token];
        await swapExactETHForTokens(
          randomizedArgs.wallet,
          randomBNBAmount,
          path,
          config.GAS_PRISE,
          token
        );

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

      // SETTING UP NEXT TRANSACTION  TIME
      nextTime =
        config.EXECUTION_TIME[
          Math.floor(Math.random() * config.EXECUTION_TIME.length)
        ];
      console.log("SCHEDULAR START TIME:", nextTime);
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
