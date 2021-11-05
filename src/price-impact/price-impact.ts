import { bscProvider } from "./../provider";
import { Fetcher, Token, Trade, JSBI } from "@pancakeswap-libs/sdk-v2";

class PriceImpact {
  async getPriceImpact(_token: string, amount: number) {
    const token = await Fetcher.fetchTokenData(
      bscProvider.chainId,
      _token,
      bscProvider.provider
    );
    const pair = await Fetcher.fetchPairData(
      bscProvider.wbnb,
      token,
      bscProvider.provider
    );

    const calculateReserve0 =
      JSBI.toNumber(pair.reserve0.numerator) /
      JSBI.toNumber(pair.reserve0.denominator);

    const poolOfTokenTotal =
      JSBI.toNumber(pair.reserve1.numerator) /
      JSBI.toNumber(pair.reserve1.denominator);
    let tokenPerBNB = poolOfTokenTotal / calculateReserve0;
    const percentImpact = (tokenPerBNB * amount) / poolOfTokenTotal;
    return {
      numberOfTokensPerBNB: tokenPerBNB,
      tokenToBeAcquired: tokenPerBNB * amount,
      totalPoolSupply: poolOfTokenTotal,
      priceImpactPercent: percentImpact,
      impact: percentImpact * 100,
    };
  }
}

export const priceImpact = new PriceImpact();
