import { Injectable } from '@nestjs/common';
import getValue from 'src/helpers/getValue';
import hasProperty from 'src/helpers/hasProperty';
import isArray from 'src/helpers/isArray';
import isInteger from 'src/helpers/isInteger';
import parseFloat from 'src/helpers/parseFloat';
import CallApiService from './CallApiService';
import SupportedCurrency from './SupportedCurrency';

interface Trade {
  tradedAt: Date;
  type: 'BUY' | 'SELL';
  amount: number;
  pricePerAsset: number;
  fee: number;
}

/**
 * Note: Only returns trades with given currency.
 *
 * If there are trades with multiple currencies (e.g. both EUR and BTC),
 * then this service should be called for each currency to get everything.
 */
@Injectable()
export default class GetAssetTradesService {
  constructor(private readonly callApiService: CallApiService) {}

  async getTrades(input: {
    currency: SupportedCurrency;
    assetSymbol: string;
    credentials: {
      apiKey: string;
      apiSecret: string;
    };
  }): Promise<Trade[]> {
    const maxLimit = 1000;

    const response = await getValue(() =>
      this.callApiService.callApi({
        credentials: input.credentials,
        method: 'GET',
        path: '/trades',
        query: {
          market: `${input.assetSymbol}-${input.currency}`,
          limit: maxLimit.toString(),
        },
      }),
    );

    if (!isArray(response)) {
      throw new Error('Response should be an array');
    }

    if (response.length >= maxLimit) {
      // TODO: Keep paginating until all are queried
      throw new Error(`${input.assetSymbol} has over ${maxLimit - 1} trades`);
    }

    return response.map((apiTrade): Trade => {
      return {
        tradedAt: getValue(() => {
          if (
            !hasProperty(apiTrade, 'timestamp') ||
            !isInteger(apiTrade.timestamp)
          ) {
            throw new Error('Expected timestamp to be an integer');
          }

          return new Date(apiTrade.timestamp);
        }),
        type: getValue(() => {
          if (
            !hasProperty(apiTrade, 'side') ||
            typeof apiTrade.side !== 'string'
          ) {
            throw new Error('Expected trade side to be a string');
          }

          switch (apiTrade.side) {
            case 'buy':
              return 'BUY';
            case 'sell':
              return 'SELL';
            default:
              throw new Error(`Unexpected trade side "${apiTrade.side}"`);
          }
        }),
        amount: getValue(() => {
          if (
            !hasProperty(apiTrade, 'amount') ||
            typeof apiTrade.amount !== 'string'
          ) {
            throw new Error('Expected trade amount to be a string');
          }

          return parseFloat(apiTrade.amount);
        }),
        pricePerAsset: getValue(() => {
          if (
            !hasProperty(apiTrade, 'price') ||
            typeof apiTrade.price !== 'string'
          ) {
            throw new Error('Expected trade price to be a string');
          }

          return parseFloat(apiTrade.price);
        }),
        fee: getValue(() => {
          if (
            !hasProperty(apiTrade, 'fee') ||
            typeof apiTrade.fee !== 'string'
          ) {
            throw new Error('Expected trade fee to be a string');
          }

          if (
            !hasProperty(apiTrade, 'feeCurrency') ||
            apiTrade.feeCurrency !== input.currency
          ) {
            throw new Error(
              `Expected trade fee currency to be ${input.currency}`,
            );
          }

          return parseFloat(apiTrade.fee);
        }),
      };
    });
  }
}
