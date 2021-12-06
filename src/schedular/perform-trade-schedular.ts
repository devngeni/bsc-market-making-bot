import { schedule } from "node-cron";
import { config } from "../config";
import { Trade } from "../models";
import { decrypt, encrypt } from "./../utils";
import { swapExactETHForTokens, swapExactTokensForTokens } from "../swapping";

export const randomPriceSupportForToken = async (token: string) => {
  //TODO:  RANDOM  STARTING TIME FOR SCHEDULAR *TIME*  FOR THE BOT
  let nextTime =
    config.EXECUTION_TIME[
      Math.floor(Math.random() * config.EXECUTION_TIME.length)
    ];

  console.log("RANDOM SCHEDULAR START TIME:", nextTime);

  const randomizedArgs = {
    wallet: config.WALLETS[Math.floor(Math.random() * config.WALLETS.length)],
  };

  // Get Saved Token
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
        {
          ADDRESS: lastTrade.wallet.ADDRESS,
          PRIVATE_KEY: await decrypt(lastTrade.wallet.PRIVATE_KEY),
        },
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
          token.toLowerCase(),
          randomBNBAmount,
          {
            PRIVATE_KEY: await encrypt(randomizedArgs.wallet.PRIVATE_KEY),
            ADDRESS: randomizedArgs.wallet.ADDRESS,
          },
          ""
        );
      }

      // NEXT TRADE EXECUTION SCHEDULAR SET TIME
      nextTime =
        config.EXECUTION_TIME[
          Math.floor(Math.random() * config.EXECUTION_TIME.length)
        ];
      console.log("RANDOM TRADE START TIME:", nextTime);
    }
  });
};

const saveToDb = async (
  token: string,
  value: number,
  wallet: { ADDRESS: string; PRIVATE_KEY: string },
  impact?: string
) => {
  const trade = await Trade.build({
    token,
    wallet,
    price_impact: impact,
    action: "BUY",
    value,
  }).save();

  return trade;
};
