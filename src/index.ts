import { config } from "./config";
import { memoPoolWrapper } from "./streaming";

const start = async () => {
  //DB configurations

  // connect and start streaming data
  await memoPoolWrapper.connect(config.BLOXROUTE.ENDPOINT);
};

start();
