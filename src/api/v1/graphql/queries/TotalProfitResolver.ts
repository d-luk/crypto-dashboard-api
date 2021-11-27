import { Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import QueryResolver from 'src/helpers/resolverTypes/QueryResolver';
import BitvavoUser, { User } from '../../authentication/BitvavoUser';
import GetTotalProfitService from '../../submodules/bitvavo/GetTotalProfitService';
import TotalProfitModel from './TotalProfitModel';

@Resolver()
export default class TotalProfitResolver
  implements QueryResolver<'totalProfit'>
{
  constructor(private readonly profitService: GetTotalProfitService) {}

  @Query()
  async totalProfit(@BitvavoUser() user: User): Promise<TotalProfitModel> {
    if (user === null) {
      throw new ForbiddenError('Please check your API key headers');
    }

    const { amount, percentage } = await this.profitService.getTotalProfit(
      'EUR',
      user,
    );

    return {
      amount,
      percentage,
    };
  }
}
