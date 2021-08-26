import tryParseFloat from './tryParseFloat';

export default function parseFloat(value: string): number {
  const parsed = tryParseFloat(value);

  if (parsed === null) {
    throw new Error('Value is not a valid float');
  }

  return parsed;
}
