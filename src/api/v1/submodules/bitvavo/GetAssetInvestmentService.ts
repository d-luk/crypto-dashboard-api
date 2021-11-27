import { Injectable } from '@nestjs/common';
import GetAssetTradesService from './GetAssetTradesService';
import SupportedCurrency from './SupportedCurrency';

/**
 * Provides the amount spent minus the amount received for an asset.
 * Includes fees.
 */
@Injectable()
export default class GetAssetInvestmentService {
  constructor(private tradesService: GetAssetTradesService) {}

  async getInvestment(input: {
    currency: SupportedCurrency;
    assetSymbol: string;
    credentials: {
      apiKey: string;
      apiSecret: string;
    };
  }): Promise<{
    investment: number;
  }> {
    const trades = await this.tradesService.getTrades(input);

    console.log(trades);

    const { spent, received } = trades.reduce(
      (result, trade) => {
        switch (trade.type) {
          case 'BUY':
            result.spent += trade.pricePerAsset * trade.amount + trade.fee;
            break;

          case 'SELL':
            result.received += trade.pricePerAsset * trade.amount;
            result.spent += trade.fee;
            break;

          default:
            throw new Error(`Unhandled trade type "${trade.type}"`);
        }

        return result;
      },
      {
        spent: 0,
        received: 0,
      },
    );

    return {
      investment: spent - received,
    };
  }
}
