import mongoose, { mongo } from "mongoose";
import { config } from "./config";
import { memoPoolWrapper } from "./streaming";

const start = async () => {
  //DB configurations

  try {
    await mongoose.connect(config.DB.MONGO_URL);
    console.log("Successfully connected to DB:!!");

    // connect and start streaming data
    await memoPoolWrapper.connect(config.BLOXROUTE.ENDPOINT);
  } catch (error: any) {
    console.log("App Error.", error);
  }
};

start();
