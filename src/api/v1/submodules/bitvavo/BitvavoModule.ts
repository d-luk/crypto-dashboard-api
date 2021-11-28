import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import CallApiService from './CallApiService';
import config, { Config } from './config';
import CreateSignatureService from './CreateSignatureService';
import GetAssetInvestmentService from './GetAssetInvestmentService';
import GetOwnedAssetsService from './GetOwnedAssetsService';
import GetAssetTradesService from './GetAssetTradesService';
import GetBalancesService from './GetBalancesService';
import GetDepositHistoryService from './GetDepositHistoryService';
import GetTickerPricesService from './GetTickerPricesService';
import GetTotalBalanceService from './GetTotalBalanceService';
import GetTotalProfitService from './GetTotalProfitService';
import GetTotalSpentService from './GetTotalSpentService';
import GetWithdrawalHistoryService from './GetWithdrawalHistoryService';
import VerifyCredentialsService from './VerifyCredentialsService';

@Module({
  imports: [ConfigModule.forFeature(config)],
  providers: [
    {
      provide: CallApiService,
      useFactory: (
        configService: ConfigService,
        signatureService: CreateSignatureService,
      ): CallApiService => {
        const loadedConfig = configService.get<Config>('bitvavoApi');

        if (!loadedConfig) {
          throw new Error('Config unavailable');
        }

        return new CallApiService(signatureService, loadedConfig);
      },
      inject: [ConfigService, CreateSignatureService],
    },
    CreateSignatureService,
    VerifyCredentialsService,
    GetTotalBalanceService,
    GetBalancesService,
    GetTotalBalanceService,
    GetDepositHistoryService,
    GetTickerPricesService,
    GetTotalProfitService,
    GetTotalSpentService,
    GetWithdrawalHistoryService,
    GetOwnedAssetsService,
    GetAssetTradesService,
    GetAssetInvestmentService,
  ],
  exports: [
    VerifyCredentialsService,
    GetTotalProfitService,
    GetOwnedAssetsService,
  ],
})
export default class BitvavoModule {}
