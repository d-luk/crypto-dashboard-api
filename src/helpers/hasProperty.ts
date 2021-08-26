export default function hasProperty<T extends string>(
  object: unknown,
  property: T,
): object is { [property in T]: unknown } {
  return (
    typeof object === 'object' &&
    object !== null &&
    Object.prototype.hasOwnProperty.call(object, property)
  );
}
