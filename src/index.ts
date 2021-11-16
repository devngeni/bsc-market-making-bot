import mongoose, { mongo } from "mongoose";
import { config } from "./config";
import { randomPriceSupportForToken } from "./schedular/perform-trade-schedular";
// import { Messaging } from "./messaging/telegram";
import { memoPoolWrapper } from "./streaming";
import { checkSum } from "./utils";

// const messaging = new Messaging();

const start = async () => {
  //DB configurations

  try {
    if (config.IS_BOT_ON) {
      await mongoose.connect(config.DB.MONGO_URL);
      console.log("Successfully connected to DB:!!");
      // support random trades
      randomPriceSupportForToken(checkSum(config.TOKENS_TO_MONITOR[0]));
    } else {
      console.log(
        "The bot if off, please turn it on by editing IS_BOT_ON: in your prod.ts file"
      );
    }

    // connect and start streaming data
    // await memoPoolWrapper.connect(config.BLOXROUTE.ENDPOINT);
  } catch (error: any) {
    console.log("App Error.", error);
  }
};

start();

// export { messaging };
