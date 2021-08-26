import { IMutation } from 'src/generated/graphqlNest';
import FunctionOf from '../FunctionOf';
import ResolvedField from './ResolvedField';

/**
 * Creates a ResolvedField type based on a root mutation field.
 */
type ResolverSubresult<T extends FunctionOf<IMutation>> = ReturnType<
  IMutation[T]
> extends Promise<infer O>
  ? ResolvedField<O>
  : ResolvedField<Exclude<ReturnType<IMutation[T]>, Promise<unknown>>>;

/**
 * Return type of a root mutation resolver.
 */
export type MutationResult<T extends FunctionOf<IMutation>> =
  | ResolverSubresult<T>
  | Promise<ResolverSubresult<T>>;

/**
 * Same as `MutationResult`, but should be used for `async` functions.
 */
export type AsyncMutationResult<T extends FunctionOf<IMutation>> = Promise<
  ResolverSubresult<T>
>;

/**
 * Make a resolver class extend this type to ensure that it correctly implements a mutation.
 *
 * Note: It is required to use the `input` argument before any other
 * arguments (like `@Parent`).
 *
 * @example
 * // Example of a sync root mutation resolver
 * class UserResolver implements MutationResolver<'user'> {
 *     @Mutation()
 *     user(id: string): MutationResult<'user'> {
 *         return {};
 *     }
 * }
 *
 * @example
 * // Example of an async root mutation resolver
 * class UserResolver implements MutationResolver<'user'> {
 *     @Mutation()
 *     async user(id: string): AsyncMutationResult<'user'> {
 *         return {};
 *     }
 * }
 */
type MutationResolver<T extends FunctionOf<IMutation>> = {
  [K in T]: (...args: any[]) => MutationResult<K>;
};

export default MutationResolver;
