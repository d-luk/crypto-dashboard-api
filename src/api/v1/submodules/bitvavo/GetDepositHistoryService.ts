import { Injectable } from '@nestjs/common';
import getValue from 'src/helpers/getValue';
import hasProperty from 'src/helpers/hasProperty';
import isArray from 'src/helpers/isArray';
import parseFloat from 'src/helpers/parseFloat';
import parseTimestamp from 'src/helpers/parseTimestamp';
import CallApiService from './CallApiService';

@Injectable()
export default class GetDepositHistoryService {
  constructor(private readonly callApiService: CallApiService) {}

  async getDeposits(credentials: {
    apiKey: string;
    apiSecret: string;
  }): Promise<
    Array<{
      timestamp: Date;
      symbol: string;
      amount: number;
      fee: number;
    }>
  > {
    // Must be between 1 and 1000
    const limit = 1000;

    const response = await getValue(() =>
      this.callApiService.callApi({
        credentials,
        method: 'GET',
        path: '/depositHistory',
        query: {
          limit: limit.toString(),
        },
      }),
    );

    if (!isArray(response)) {
      throw new Error('Expected response to be an array');
    }

    if (response.length === limit) {
      // TODO: Keep requesting until all deposits are queried
      throw new Error(`${limit} deposits or more are not supported yet`);
    }

    return response.map((deposit) => {
      if (
        !hasProperty(deposit, 'timestamp') ||
        typeof deposit.timestamp !== 'number'
      ) {
        throw new Error('Expected deposit.timestamp to be a number');
      }

      if (
        !hasProperty(deposit, 'symbol') ||
        typeof deposit.symbol !== 'string'
      ) {
        throw new Error('Expected deposit.symbol to be a string');
      }

      if (
        !hasProperty(deposit, 'amount') ||
        typeof deposit.amount !== 'string'
      ) {
        throw new Error('Expected deposit.amount to be a string');
      }

      if (!hasProperty(deposit, 'fee') || typeof deposit.fee !== 'string') {
        throw new Error('Expected deposit.fee to be a string');
      }

      return {
        timestamp: parseTimestamp(deposit.timestamp),
        symbol: deposit.symbol,
        amount: parseFloat(deposit.amount),
        fee: parseFloat(deposit.fee),
      };
    });
  }
}
