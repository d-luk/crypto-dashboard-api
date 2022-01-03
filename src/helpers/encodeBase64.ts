export default function encodeBase64(value: string): string {
  return Buffer.from(value).toString('base64');
}
