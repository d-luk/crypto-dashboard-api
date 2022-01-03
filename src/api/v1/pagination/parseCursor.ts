import decodeBase64 from 'src/helpers/decodeBase64';
import InvalidCursorError from './InvalidCursorError';

/**
 * @throws {@link InvalidCursorError}
 * Given cursor could not be parsed or does not match identifier.
 */
export default function parseCursor(
  cursor: string,
  identifier: string,
): string {
  const decoded = decodeBase64(cursor);

  if (!decoded.startsWith(`${identifier}:`)) {
    throw new InvalidCursorError(
      `Expected cursor "${decoded}" to start with ${identifier}`,
    );
  }

  return decoded.slice(cursor.length + 1);
}
