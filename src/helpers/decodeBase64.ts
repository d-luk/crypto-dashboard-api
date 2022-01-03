export default function decodeBase64(value: string): string {
  return Buffer.from(value, 'base64').toString('utf8');
}
