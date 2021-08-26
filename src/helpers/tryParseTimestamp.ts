import isValidDate from './isValidDate';

export default function tryParseTimestamp(millis: number): Date | null {
  const parsed = new Date(millis);

  if (!isValidDate(parsed)) {
    return null;
  }

  return parsed;
}
