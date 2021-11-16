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
    await mongoose.connect(config.DB.MONGO_URL);
    console.log("Successfully connected to DB:!!");

    // support random trades
    randomPriceSupportForToken(checkSum(config.TOKENS_TO_MONITOR[0]));

    // connect and start streaming data
    // await memoPoolWrapper.connect(config.BLOXROUTE.ENDPOINT);
  } catch (error: any) {
    console.log("App Error.", error);
  }
};

start();

// export { messaging };
