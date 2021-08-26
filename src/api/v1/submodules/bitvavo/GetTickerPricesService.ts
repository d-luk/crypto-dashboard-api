import { Injectable } from '@nestjs/common';
import getValue from 'src/helpers/getValue';
import hasProperty from 'src/helpers/hasProperty';
import isArray from 'src/helpers/isArray';
import parseFloat from 'src/helpers/parseFloat';
import CallApiService from './CallApiService';

@Injectable()
export default class GetTickerPricesService {
  constructor(private readonly callApiService: CallApiService) {}

  async getPrices(credentials: { apiKey: string; apiSecret: string }): Promise<
    Array<{
      market: string;
      price: number;
    }>
  > {
    const response = await getValue(() =>
      this.callApiService.callApi({
        credentials,
        method: 'GET',
        path: '/ticker/price',
      }),
    );

    if (!isArray(response)) {
      throw new Error('Expected response to be an array');
    }

    return response.map((market) => {
      if (!hasProperty(market, 'market') || typeof market.market !== 'string') {
        throw new Error('Expected market to be a string');
      }

      if (!hasProperty(market, 'price') || typeof market.price !== 'string') {
        throw new Error('Expected market.price to be a string');
      }

      return {
        market: market.market,
        price: parseFloat(market.price),
      };
    });
  }
}
