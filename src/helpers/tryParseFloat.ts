export default function tryParseFloat(input: string): number | null {
  const result = parseFloat(input);

  if (isNaN(result)) {
    return null;
  }

  return result;
}
