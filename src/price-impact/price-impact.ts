import { bscProvider } from "./../provider";
import {
  Fetcher,
  Trade,
  Route,
  BigintIsh,
  TokenAmount,
  TradeType,
  Token,
  ChainId,
} from "@pancakeswap-libs/sdk-v2";
import { config } from "./../config/index";

class PriceImpact {
  async getPriceImpact(_token: string, value: number) {
    const token = await Fetcher.fetchTokenData(
      bscProvider.chainId,
      _token,
      bscProvider.provider
    );
    const WBNBToken = new Token(ChainId.MAINNET, config.BSC.WBNB_ADDRESS, 18);
    const pair = await Fetcher.fetchPairData(
      token,
      WBNBToken,
      bscProvider.provider
    );

    const route = new Route([pair], WBNBToken);
    const amount = value as unknown as BigintIsh;

    const trade = new Trade(
      route,
      new TokenAmount(WBNBToken, amount),
      TradeType.EXACT_INPUT
    );
    return {
      tokenPrice: trade.executionPrice.toFixed(10),
      pooledAmount: parseFloat(
        pair.reserveOf(token).quotient.toString()
      ).toFixed(2),
      priceImpact: trade.priceImpact.toFixed(2),
      value,
      token: ` https://www.dextools.io/app/pancakeswap/pair-explorer/${pair.liquidityToken.address}`,
    };
  }
}

export const priceImpact = new PriceImpact();
