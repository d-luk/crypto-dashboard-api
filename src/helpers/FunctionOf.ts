/**
 * Selects all function names of an object.
 */
type FunctionOf<T> = NonNullable<
  {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T]
>;

export default FunctionOf;
