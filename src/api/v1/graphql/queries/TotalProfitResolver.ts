import { Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import { TotalProfit } from 'src/generated/graphqlNest';
import QueryResolver from 'src/helpers/resolverTypes/QueryResolver';
import ResolvedField from 'src/helpers/resolverTypes/ResolvedField';
import BitvavoUser, { User } from '../../authentication/BitvavoUser';
import GetTotalProfitService from '../../submodules/bitvavo/GetTotalProfitService';

@Resolver()
export default class TotalProfitResolver
  implements QueryResolver<'totalProfit'>
{
  constructor(private readonly profitResolver: GetTotalProfitService) {}

  @Query()
  async totalProfit(
    @BitvavoUser() user: User,
  ): Promise<ResolvedField<TotalProfit>> {
    if (user === null) {
      throw new ForbiddenError('Please check your API key headers');
    }

    const { amount, percentage } = await this.profitResolver.getTotalProfit(
      'EUR',
      user,
    );

    return {
      amount,
      percentage,
    };
  }
}
