import { IQuery } from 'src/generated/graphqlNest';
import FunctionOf from '../FunctionOf';
import ResolvedField from './ResolvedField';

/**
 * Creates a ResolvedField type based on a root query field.
 */
type ResolverSubresult<T extends FunctionOf<IQuery>> = ReturnType<
  IQuery[T]
> extends Promise<infer O>
  ? ResolvedField<O>
  : ResolvedField<Exclude<ReturnType<IQuery[T]>, Promise<unknown>>>;

/**
 * Return type of a root query resolver.
 */
export type QueryResult<T extends FunctionOf<IQuery>> =
  | ResolverSubresult<T>
  | Promise<ResolverSubresult<T>>;

/**
 * Same as QueryResolverResult, but should be used for `async` functions.
 */
export type AsyncQueryResult<T extends FunctionOf<IQuery>> = Promise<
  ResolverSubresult<T>
>;

/**
 * Make a resolver class extend this type to ensure that it correctly implements a query.
 *
 * @example
 * // Example of a sync root query resolver
 * @Resolver('User')
 * class UserResolver implements QueryResolver<'user'> {
 *     @Query()
 *     user(id: string): QueryResult<'user'> {
 *         return {};
 *     }
 * }
 *
 * @example
 * // Example of an async root query resolver
 * @Resolver('User')
 * class UserResolver implements QueryResolver<'user'> {
 *     @Query()
 *     async user(id: string): AsyncQueryResult<'user'> {
 *         return {};
 *     }
 * }
 */
type QueryResolver<T extends FunctionOf<IQuery>> = {
  [K in T]: (...args: [...Parameters<IQuery[K]>, ...never[]]) => QueryResult<K>;
};

export default QueryResolver;
