import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import VerifyBitvavoResolver from './graphql/mutations/VerifyBitvavoCredentialsResolver';
import BitvavoModule from './submodules/bitvavo/BitvavoModule';
import { ConfigModule } from '@nestjs/config';
import BalanceResolver from './graphql/queries/TotalProfitResolver';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
    }),
    BitvavoModule,
  ],
  providers: [VerifyBitvavoResolver, BalanceResolver],
})
export default class AppModule {}
