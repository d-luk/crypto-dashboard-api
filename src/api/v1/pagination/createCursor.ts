import encodeBase64 from 'src/helpers/encodeBase64';

export default function createCursor(
  identifier: string,
  value: string,
): string {
  return encodeBase64(`${identifier}:${value}`);
}
