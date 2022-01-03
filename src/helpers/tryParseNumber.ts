export default function tryParseNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    if (isNaN(value)) {
      return null;
    }

    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);

    if (isNaN(parsed)) {
      return null;
    }

    return parsed;
  }

  return null;
}
