/**
 * Works the same as the non-null assertion `value!`, but also works at runtime
 */
export default function nonNull<T>(value: T | null | undefined): T {
  if (value === null || typeof value === 'undefined') {
    throw new Error(`Value should be defined`);
  }

  return value;
}
