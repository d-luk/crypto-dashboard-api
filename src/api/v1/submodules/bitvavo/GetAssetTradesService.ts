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
          const side = getStringProperty(apiTrade, 'side');

          switch (side) {
            case 'buy':
              return 'BUY';
            case 'sell':
              return 'SELL';
            default:
              throw new Error(`Unexpected trade side "${side}"`);
          }
        }),
        amount: parseFloat(getStringProperty(apiTrade, 'amount')),
        pricePerAsset: parseFloat(getStringProperty(apiTrade, 'price')),
        fee: getValue(() => {
          if (
            !hasProperty(apiTrade, 'feeCurrency') ||
            apiTrade.feeCurrency !== input.currency
          ) {
            throw new Error(
              `Expected trade fee currency to be ${input.currency}`,
            );
          }

          return parseFloat(getStringProperty(apiTrade, 'fee'));
        }),
      };
    });
  }
}

function getStringProperty(object: unknown, property: string): string {
  if (!hasProperty(object, property)) {
    throw new Error(`Expected object to have a property called "${property}"`);
  }

  const value = object[property];

  if (typeof value !== 'string') {
    throw new Error(`Expected property "${property}" to be a string`);
  }

  return value;
}
