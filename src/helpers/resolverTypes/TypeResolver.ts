import ResolvedField from './ResolvedField';

/**
 * Make a resolver class extend this type to ensure that
 * it correctly implements schema type fields.
 *
 * @example
 * // Example of a sync field resolver
 * @Resolver('User')
 * class UserResolver implements TypeResolver<User> {
 *     @ResolveField()
 *     id(): ResolvedField<User['id']> {
 *         return '';
 *     }
 * }
 *
 * @example
 * // Example of an async field resolver
 * @Resolver('User')
 * class UserResolver implements TypeResolver<User> {
 *     @ResolveField()
 *     async id(): Promise<ResolvedField<User['id']>> {
 *         return '';
 *     }
 * }
 */
// eslint-disable-next-line @typescript-eslint/ban-types
type TypeResolver<T extends object> = {
  [K in keyof T]?: (
    ...args: any[]
  ) => ResolvedField<T[K]> | Promise<ResolvedField<T[K]>>;
};

export default TypeResolver;
