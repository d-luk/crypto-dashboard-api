export default function tryParseInteger(input: string): number | null {
  const parsedNumber = Number(input);

  if (isNaN(parsedNumber)) {
    return null;
  }

  const parsedInt = parseInt(input);

  // This checks for edge cases like input being a float or an empty string
  if (parsedNumber !== parsedInt) {
    return null;
  }

  return parsedInt;
}
