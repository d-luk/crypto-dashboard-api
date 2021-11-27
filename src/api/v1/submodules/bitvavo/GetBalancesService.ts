import { Injectable } from '@nestjs/common';
import getValue from 'src/helpers/getValue';
import hasProperty from 'src/helpers/hasProperty';
import isArray from 'src/helpers/isArray';
import CallApiService from './CallApiService';

/**
 * Balance is the amount of assets currently being held.
 */
@Injectable()
export default class GetBalancesService {
  constructor(private readonly callApiService: CallApiService) {}

  async getBalances(credentials: {
    apiKey: string;
    apiSecret: string;
  }): Promise<
    Array<{
      symbol: string;
      available: number;
      inOrder: number;
    }>
  > {
    const response = await getValue(() =>
      this.callApiService.callApi({
        credentials,
        method: 'GET',
        path: '/balance',
      }),
    );

    if (!isArray(response)) {
      throw new Error('Expected response to be an array');
    }

    return response.map((currency) => {
      if (
        !hasProperty(currency, 'symbol') ||
        typeof currency.symbol !== 'string'
      ) {
        throw new Error('Expected currency.symbol to be a string');
      }

      if (
        !hasProperty(currency, 'available') ||
        typeof currency.available !== 'string'
      ) {
        throw new Error('Expected currency.available to be a string');
      }

      if (
        !hasProperty(currency, 'inOrder') ||
        typeof currency.inOrder !== 'string'
      ) {
        throw new Error('Expected currency.inOrder to be a string');
      }

      return {
        symbol: currency.symbol,
        available: parseFloat(currency.available),
        inOrder: parseFloat(currency.inOrder),
      };
    });
  }
}
