import { Args, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import {
  OrderDirection,
  OwnedAssetOrder,
  OwnedAssetOrderField,
} from 'src/generated/graphqlNest';
import getValue from 'src/helpers/getValue';
import QueryResolver from 'src/helpers/resolverTypes/QueryResolver';
import BitvavoUser, { User } from '../../authentication/BitvavoUser';
import GetOwnedAssetsService from '../../submodules/bitvavo/GetOwnedAssetsService';
import OwnedAssetConnectionModel from './OwnedAssetConnectionModel';

@Resolver()
export default class OwnedAssetsResolver
  implements QueryResolver<'ownedAssets'>
{
  constructor(private readonly assetsService: GetOwnedAssetsService) {}

  @Query()
  async ownedAssets(
    @Args('first') first: number,
    @Args('orderBy') orderBy: OwnedAssetOrder,
    @Args('after') after: string | null | undefined,
    @BitvavoUser() user: User,
  ): Promise<OwnedAssetConnectionModel> {
    if (user === null) {
      throw new ForbiddenError('Please check your API key headers');
    }

    const connection = await this.assetsService.getAssets({
      resultCurrency: 'EUR',
      first,
      afterCursor: after ?? null,
      orderBy: {
        field: getValue(() => {
          switch (orderBy.field) {
            case OwnedAssetOrderField.PROFIT:
              return 'PROFIT';

            default:
              throw new Error(`Unhandled order field ${orderBy.field}`);
          }
        }),
        direction: getValue(() => {
          switch (orderBy.direction) {
            case OrderDirection.ASC:
              return 'ASC';

            case OrderDirection.DESC:
              return 'DESC';

            default:
              throw new Error(`Unhandled order direction ${orderBy.direction}`);
          }
        }),
      },
      credentials: {
        apiKey: user.apiKey,
        apiSecret: user.apiSecret,
      },
    });

    return {
      nodes: connection.edges.map((edge) => edge.node),
      edges: connection.edges,
      pageInfo: connection.pageInfo,
      totalCount: connection.totalCount,
    };
  }
}
