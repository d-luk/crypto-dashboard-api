/**
 * Syntactic sugar for an IIFE
 */
export default function getValue<T>(getter: () => T): T {
  return getter();
}
