import { readFileSync } from "fs";
import { ethers } from "ethers";
import WebSocket from "ws";
import { NextNotification, Result } from "./../types";
import { priceImpact } from "./../price-impact";
import { config } from "./../config";
import { checkSum } from "../utils";
import { Trade } from "./../models/index";
import {
  approve,
  swapExactETHForTokens,
  swapExactTokensForTokens,
} from "../swapping";
// import { messaging } from "./../index";

//TO remove checkSum errors from token list
const TOKENSTOMONITOR = config.TOKENS_TO_MONITOR.map((item) => checkSum(item));

/**
 * Memopool monitoring Wrapper
 */
class MemoPoolWrapper {
  private _ws!: WebSocket;

  /// getters
  get ws() {
    if (this._ws) {
      throw Error("Your websocket listener is not setup");
    }
    return this._ws;
  }

  get pancakeSwapAbi() {
    return new ethers.utils.Interface(
      readFileSync(`${__dirname}/../abis/pancakeswap.json`, "utf8")
    );
  }
  ///setters

  connect(url: string) {
    return new Promise((resolve, reject) => {
      try {
        this._ws = new WebSocket(url, {
          cert: readFileSync(
            `${__dirname}/../config/keys/bloxroute/external_gateway_cert.pem`
          ),
          key: readFileSync(
            `${__dirname}/../config/keys/bloxroute/external_gateway_key.pem`
          ),
          rejectUnauthorized: false,
        });
        // call on connection opened
        this.onConnectionOpen(this._ws);
        // on message get stream data
        resolve(this.getStreamDataOnMessage(this._ws));
      } catch (error: any) {
        console.log("ERROR", error.message);
      }
    });
  }

  getStreamDataOnMessage(ws: WebSocket) {
    ws.on("message", async (notification: any) => {
      try {
        const realTimeData: NextNotification = await JSON.parse(notification);
        let result = realTimeData.params?.result;
        if (result && result.txContents.input !== "0x") {
          // process the stream results

          // process stream data
          this.processStreamedData(result);
        }

        return notification;
      } catch (error) {
        // console.log(error);
      }
    });
  }

  //  Process Streaming Data
  async processStreamedData(result: Result) {
    const toRouterAddress = result.txContents.to;
    const gasPrice = parseInt(result.txContents.gasPrice, 16); // Gas price in wei
    let gas = parseInt(result.txContents.gas, 16); // gas fees in wei
    const value = parseInt(result.txContents.value, 16); // eth amount on this transction in wei
    let nonce = parseInt(result.txContents.nonce, 16); // Nonce of a transction

    // decodedTransaction data
    const decodedTransaction = this.pancakeSwapAbi.parseTransaction({
      data: result.txContents.input,
    });

    // token under trade
    const token = checkSum(decodedTransaction.args[1][1]);

    // CHECK if the ROUTER Version is used

    if (toRouterAddress === config.BSC.PANCAKE_V2_ROUTE) {
      const impact = await priceImpact.getPriceImpact(token, value);

      const randomizedArgs = {
        wallet:
          config.WALLETS[Math.floor(Math.random() * config.WALLETS.length)],
        amount:
          config.EXECUATION_AMOUNT[
            Math.floor(Math.random() * config.EXECUATION_AMOUNT.length)
          ],
        priceImpact:
          config.PRICEIMPACT[
            Math.floor(Math.random() * config.PRICEIMPACT.length)
          ],
        executionTime:
          config.EXECUTION_TIME[
            Math.floor(Math.random() * config.EXECUTION_TIME.length)
          ],
      };

      //RANDOM VARIABLES

      // console.log(randomizedArgs);

      // END OF RANDOM VARS

      if (TOKENSTOMONITOR.includes(token)) {
        const method = this.formatMethodAction(decodedTransaction.name);
        console.log(
          `Method: ${method}, Which Action to Perform: ${this.whatActionToTake(
            method
          )}, ${decodedTransaction.name}`
        );

        if (this.whatActionToTake(method) === "SELL") {
          // check if we had already bought the token before
          const existTrades = await Trade.find({ token });
          if (existTrades.length > 0) {
            // IF we bought it sell some amount of it.
            const sellPath = [token, config.BSC.WBNB_ADDRESS];
            const tx: any = await swapExactTokensForTokens(
              randomizedArgs.wallet,
              1000,
              0,
              sellPath,
              "300000"
            );

            if (tx.status) {
              // SAVE TO DB
              this.saveToDb(
                decodedTransaction,
                token,
                impact.priceImpact.toString(),
                value
              );
            }
          }
        }

        // if (this.whatActionToTake(method) === "BUY") {
        // buy here
        const path = [config.BSC.WBNB_ADDRESS, token];
        const tx: any = await swapExactETHForTokens(
          randomizedArgs.wallet,
          0.001, // eth amount
          path,
          "300000",
          token
        );
        console.log(tx);

        if (tx.status) {
          // approve after buy.
          await approve(randomizedArgs.wallet, token);
          // SAVE TO DB
          this.saveToDb(
            decodedTransaction,
            token,
            impact.priceImpact.toString(),
            value
          );
        }

        // }

        // await messaging.sendMessage(
        //   `TOKEN FOund ${TOKENSTOMONITOR.includes(token)}`
        // );
        console.log("TOKEN", TOKENSTOMONITOR.includes(token), token);
      }
    }
  }

  /**
   *
   * @param ws Websocket
   * @returns On Connection
   */

  onConnectionOpen(ws: WebSocket) {
    return ws.on("open", () => {
      /**
       * SwapExactETHForToke Methods:  7ff36ab5,fb3bdb41,
       * Add liquidity Methods "f305d719 e8e33700"
       * SwapExactTokenForETH Methods: 791ac947, 18cbafe5, 4a25d94a
       */
      ws.send(
        `
            {
              "jsonrpc": "2.0",
              "id": 1,
              "method": "subscribe",
              "params": [
                "pendingTxs",
                {
                  "duplicates": false,
                  "include": [
                    "tx_hash",
                    "tx_contents.from",
                    "tx_contents.to",
                    "tx_contents.value",
                    "tx_contents.gas_price",
                    "tx_contents.gas",
                    "tx_contents.input",
                    "tx_contents.nonce"
                  ],
                  "filters": "method_id in [7ff36ab5, fb3bdb41, 791ac947, 18cbafe5, 4a25d94a ]"
                }
              ],
              "blockchain_network": "BSC-Mainnet"
            }
            `
      );
    });
  }

  async saveToDb(
    transaction: ethers.utils.TransactionDescription,
    token: string,
    impact: string,
    value: number
  ) {
    const trade = await Trade.build({
      method_name: transaction.name,
      method_sighash: transaction.sighash,
      signature: transaction.signature,
      token,
      price_impact: impact,
      action: this.formatMethodAction(transaction.name),
      value,
    }).save();

    console.log(trade);

    return trade;
  }

  // HELPER methods
  formatMethodAction(method_name: string) {
    let action = "NO";
    if (method_name.startsWith("swapExactETH")) {
      action = "BUY";
    } else if (method_name.startsWith("swapExactToken")) {
      action = "SELL";
    } else if (method_name.startsWith("addLiquidity")) {
      action = "ADDLIQUIDITY";
    }
    return action;
  }

  whatActionToTake(method: string) {
    let action = "NOACTION";
    if (method === "BUY") {
      action = "SELL";
    } else if (method === "SELL") {
      action = "BUY";
    }

    return action;
  }
}

export const memoPoolWrapper = new MemoPoolWrapper();
