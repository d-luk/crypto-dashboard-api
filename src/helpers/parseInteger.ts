import tryParseInteger from './tryParseInteger';

export default function parseInteger(value: string): number {
  const parsed = tryParseInteger(value);

  if (parsed === null) {
    throw new Error('Value is not a valid integer');
  }

  return parsed;
}
