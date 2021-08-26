/**
 * Return type of a resolver.
 *
 * E.g. a resolver of type {x: 1} allows these return types:
 * - {}
 * - {x: 1}
 * - () => {x: 1}
 * - () => {}
 * - () => {x: () => 1}
 */
type ResolvedField<T> =
  | T
  | (() => T)
  | {
      [K in keyof T]?: ResolvedField<T[K]>;
    }
  | (() => {
      [K in keyof T]?: ResolvedField<T[K]>;
    });

export default ResolvedField;
