import { Injectable } from '@nestjs/common';
import getValue from 'src/helpers/getValue';
import nonNull from 'src/helpers/nonNull';
import parseNumber from 'src/helpers/parseNumber';
import createCursor from '../../pagination/createCursor';
import parseCursor from '../../pagination/parseCursor';
import GetAssetInvestmentService from './GetAssetInvestmentService';
import GetBalancesService from './GetBalancesService';
import GetTickerPricesService from './GetTickerPricesService';
import InvalidCursorError from '../../pagination/InvalidCursorError';
import SupportedCurrency from './SupportedCurrency';

interface Asset {
  symbol: string;
  investment: number;
  worth: number;
  profit: number;
}

interface OwnedAssetEdge {
  cursor: string;
  node: Asset;
}

export interface OwnedAssetConnection {
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  edges: OwnedAssetEdge[];
  totalCount: number;
}

@Injectable()
export default class GetOwnedAssetsService {
  constructor(
    private readonly getBalancesService: GetBalancesService,
    private readonly getTickerPricesService: GetTickerPricesService,
    private readonly getInvestmentService: GetAssetInvestmentService,
  ) {}

  /**
   * @throws {@link InvalidCursorError}
   */
  async getAssets(input: {
    resultCurrency: SupportedCurrency;
    first: number;
    afterCursor: string | null;
    orderBy: {
      field: 'PROFIT';
      direction: 'ASC' | 'DESC';
    };
    credentials: {
      apiKey: string;
      apiSecret: string;
    };
  }): Promise<OwnedAssetConnection> {
    const [balances, prices] = await Promise.all([
      this.getBalancesService.getBalances(input.credentials),
      this.getTickerPricesService.getPrices(input.credentials),
    ]);

    const assetPromises = balances.map(async (balance): Promise<Asset> => {
      const marketName = balance.symbol + '-' + input.resultCurrency;

      const price =
        balance.symbol === input.resultCurrency
          ? 1
          : prices.find(({ market }) => market === marketName)?.price;

      if (!price) {
        throw new Error(`Cannot find price for market ${marketName}`);
      }

      const worth = balance.available * price + balance.inOrder * price;

      const investment = await getValue(async (): Promise<number> => {
        if (input.resultCurrency === balance.symbol) {
          return worth;
        }

        const { investment } = await this.getInvestmentService.getInvestment({
          currency: input.resultCurrency,
          assetSymbol: balance.symbol,
          credentials: input.credentials,
        });

        return investment;
      });

      const profit = worth - investment;

      return {
        symbol: balance.symbol,
        investment,
        worth,
        profit,
      };
    });

    const assets = await Promise.all(assetPromises);

    assets.sort((assetA, assetB) =>
      getValue((): number => {
        switch (input.orderBy.field) {
          case 'PROFIT':
            switch (input.orderBy.direction) {
              case 'ASC':
                return assetA.profit - assetB.profit;

              case 'DESC':
                return assetB.profit - assetA.profit;

              default:
                throw new Error(
                  `Unhandled order direction "${input.orderBy.direction}"`,
                );
            }

          default:
            throw new Error(`Unhandled order field "${input.orderBy.field}"`);
        }
      }),
    );

    const cursorIndentifier = input.orderBy.field;

    function createAssetCursor(asset: Asset): string {
      switch (input.orderBy.field) {
        case 'PROFIT':
          return createCursor(cursorIndentifier, asset.profit.toString());

        default:
          throw new Error(`Unhandled order by field`);
      }
    }

    const range = getValue(
      (): {
        fromIndex: number;
        toIndex: number;
      } | null => {
        const matchesCursor = (asset: Asset): boolean => {
          switch (input.orderBy.field) {
            case 'PROFIT':
              if (!input.afterCursor) {
                return true;
              }

              const parsedCursor = parseNumber(
                parseCursor(input.afterCursor, cursorIndentifier),
              );

              switch (input.orderBy.direction) {
                case 'ASC':
                  const minimumProfit = parsedCursor;

                  return asset.profit > minimumProfit;

                case 'DESC':
                  const maximumProfit = parsedCursor;

                  return asset.profit < maximumProfit;

                default:
                  throw new Error(
                    `Unhandled order direction "${input.orderBy.direction}"`,
                  );
              }
          }
        };

        // TODO: Check descending logic

        let startIndex: number | null = null;

        for (let index = 0; index < assets.length; index++) {
          const asset = nonNull(assets[index]);

          if (matchesCursor(asset)) {
            startIndex = index;
            break;
          }
        }

        if (startIndex === null) {
          return null;
        }

        return {
          fromIndex: startIndex,
          toIndex: startIndex + input.first,
        };
      },
    );

    const assetsOnPage = range
      ? assets.slice(range.fromIndex, range.toIndex)
      : [];

    return {
      totalCount: assets.length,
      edges: assetsOnPage.map(
        (asset): OwnedAssetEdge => ({
          cursor: createAssetCursor(asset),
          node: asset,
        }),
      ),
      pageInfo: {
        startCursor: getValue(() => {
          const firstAsset = assetsOnPage[0];

          return firstAsset ? createAssetCursor(firstAsset) : null;
        }),
        endCursor: getValue(() => {
          const lastAsset = assetsOnPage[assetsOnPage.length - 1];

          return lastAsset ? createAssetCursor(lastAsset) : null;
        }),
        hasPreviousPage: Boolean(range && range.fromIndex > 0),
        hasNextPage: Boolean(range && range.toIndex < assets.length - 1),
      },
    };
  }
}
