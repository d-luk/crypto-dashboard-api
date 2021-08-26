import { Injectable } from '@nestjs/common';
import GetDepositHistoryService from './GetDepositHistoryService';
import GetWithdrawalHistoryService from './GetWithdrawalHistoryService';

@Injectable()
export default class GetTotalSpentService {
  constructor(
    private readonly getDepositHistoryService: GetDepositHistoryService,
    private readonly getWithdrawalHistoryService: GetWithdrawalHistoryService,
  ) {}

  async getTotalSpent(credentials: {
    apiKey: string;
    apiSecret: string;
  }): Promise<{
    amount: number;
  }> {
    const [depositHistory, withdrawalsHistory] = await Promise.all([
      this.getDepositHistoryService.getDeposits(credentials),
      this.getWithdrawalHistoryService.getWithdrawals(credentials),
    ]);

    const amount =
      depositHistory.reduce(
        (result, deposit) => result + deposit.amount + deposit.fee,
        0,
      ) -
      withdrawalsHistory.reduce(
        (result, withdrawal) => result + withdrawal.amount + withdrawal.fee,
        0,
      );

    return { amount };
  }
}
