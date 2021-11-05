import { bscProvider } from "./../provider";
import {
  Fetcher,
  Trade,
  Route,
  BigintIsh,
  TokenAmount,
  TradeType,
} from "@pancakeswap-libs/sdk-v2";

class PriceImpact {
  async getPriceImpact(_token: string, value: number) {
    const token = await Fetcher.fetchTokenData(
      bscProvider.chainId,
      _token,
      bscProvider.provider
    );
    const pair = await Fetcher.fetchPairData(
      token,
      bscProvider.wbnb,
      bscProvider.provider
    );

    const route = new Route([pair], bscProvider.wbnb);
    const amount = (value * Math.pow(10, 18)) as unknown as BigintIsh;

    const trade = new Trade(
      route,
      new TokenAmount(bscProvider.wbnb, amount),
      TradeType.EXACT_INPUT
    );
    return {
      executionPrice: trade.executionPrice.toFixed(10),
      priceImpact: trade.priceImpact.toFixed(2),
      value,
      token: ` https://www.dextools.io/app/pancakeswap/pair-explorer/${pair.liquidityToken.address}`,
    };
  }
}

export const priceImpact = new PriceImpact();
