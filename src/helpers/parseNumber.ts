import tryParseNumber from './tryParseNumber';

export default function parseNumber(value: unknown): number {
  const parsed = tryParseNumber(value);

  if (parsed === null) {
    throw new Error('Value should be a number');
  }

  return parsed;
}
