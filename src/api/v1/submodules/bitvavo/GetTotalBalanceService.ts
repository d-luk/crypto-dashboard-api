import { Injectable } from '@nestjs/common';
import GetBalancesService from './GetBalancesService';
import GetTickerPricesService from './GetTickerPricesService';
import SupportedCurrency from './SupportedCurrency';

@Injectable()
export default class GetTotalBalanceService {
  constructor(
    private readonly getBalancesService: GetBalancesService,
    private readonly getTickerPricesService: GetTickerPricesService,
  ) {}

  async getBalance(
    options: {
      resultCurrency: SupportedCurrency;
    },
    credentials: {
      apiKey: string;
      apiSecret: string;
    },
  ): Promise<{
    amount: number;
  }> {
    const [balances, prices] = await Promise.all([
      this.getBalancesService.getBalances(credentials),
      this.getTickerPricesService.getPrices(credentials),
    ]);

    const amount = balances.reduce((result, balance) => {
      if (balance.symbol === options.resultCurrency) {
        return result + balance.available + balance.inOrder;
      }

      const marketName = balance.symbol + '-' + options.resultCurrency;
      const price = prices.find(({ market }) => market === marketName);

      if (typeof price === 'undefined') {
        throw new Error(`Cannot find price for market ${marketName}`);
      }

      return (
        result + balance.available * price.price + balance.inOrder * price.price
      );
    }, 0);

    return { amount };
  }
}
