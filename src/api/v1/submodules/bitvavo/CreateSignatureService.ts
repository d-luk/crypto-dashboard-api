import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export default class CreateSignatureService {
  createSignature(
    timestamp: number,
    method: 'GET',
    url: string,
    body: Record<string, unknown>,
    apiSecret: string,
  ) {
    let string = timestamp + method + '/v2' + url;

    if (Object.keys(body).length !== 0) {
      string += JSON.stringify(body);
    }

    return createHmac('sha256', apiSecret).update(string).digest('hex');
  }
}
