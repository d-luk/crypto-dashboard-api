import tryParseTimestamp from './tryParseTimestamp';

export default function parseTimestamp(millis: number): Date {
  const parsed = tryParseTimestamp(millis);

  if (parsed === null) {
    throw new Error(`"${millis}" is not a valid UNIX timestamp`);
  }

  return parsed;
}
