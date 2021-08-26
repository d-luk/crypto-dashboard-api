import { Injectable } from '@nestjs/common';
import calculatePercentage from 'src/helpers/calculatePercentage';
import GetTotalBalanceService from './GetTotalBalanceService';
import GetTotalSpentService from './GetTotalSpentService';

@Injectable()
export default class GetTotalProfitService {
  constructor(
    private readonly getTotalBalanceService: GetTotalBalanceService,
    private readonly getTotalSpentService: GetTotalSpentService,
  ) {}

  async getTotalProfit(
    resultCurrency: 'EUR' | 'BTC',
    credentials: {
      apiKey: string;
      apiSecret: string;
    },
  ): Promise<{
    amount: number;
    percentage: number;
  }> {
    const [totalBalance, totalSpent] = await Promise.all([
      this.getTotalBalanceService.getBalance({ resultCurrency }, credentials),
      this.getTotalSpentService.getTotalSpent(credentials),
    ]);

    const amount = totalBalance.amount - totalSpent.amount;

    const percentage = calculatePercentage(
      totalSpent.amount,
      totalBalance.amount,
    );

    return { amount, percentage };
  }
}
