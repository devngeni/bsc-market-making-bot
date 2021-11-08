import { readFileSync } from "fs";
import { ethers, providers } from "ethers";
import { config } from "./../config";
import { ChainId, WETH } from "@pancakeswap-libs/sdk-v2";

/**
 * BSC PRovider
 */
class Provider {
  private _provider!: providers.JsonRpcProvider;
  private _wbnb = WETH[ChainId.MAINNET];
  private _chainId = ChainId.MAINNET;

  constructor() {
    this._provider = new providers.JsonRpcProvider(config.BSC.NODE_URL);
  }

  //GETTERS

  /**
   * Network JsonRPCProvider
   */

  get provider() {
    if (!this._provider) {
      throw Error(
        "Your provider has not been set correctly. Please contact the developer"
      );
    }
    return this._provider;
  }

  /**
   * Network chain ID
   */
  get chainId() {
    if (!this._chainId) {
      throw Error("Your chainId is incorrect");
    }
    return this._chainId;
  }

  get wbnb() {
    if (!this._wbnb) {
      throw Error("Your WBNB is not setup correctly");
    }
    return this._wbnb;
  }
  // SETTERS

  // HELPERS private methods
}

export const bscProvider = new Provider();
