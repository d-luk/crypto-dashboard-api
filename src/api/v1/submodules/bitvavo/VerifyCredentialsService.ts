import { Injectable } from '@nestjs/common';
import CallApiService from './CallApiService';
import InvalidApiKeyError from './errors/InvalidApiKeyError';
import InvalidApiKeyLengthError from './errors/InvalidApiKeyLengthError';
import InvalidApiSecretError from './errors/InvalidApiSecretError';
import IpNotAllowedError from './errors/IpNotAllowedError';

type Result =
  | {
      areValid: true;
    }
  | {
      areValid: false;
      reason:
        | 'INCORRECT_KEY_LENGTH'
        | 'INVALID_KEY'
        | 'INVALID_SECRET'
        | 'IP_NOT_ALLOWED';
    };

@Injectable()
export default class VerifyCredentialsService {
  constructor(private readonly callApiService: CallApiService) {}

  async verify(credentials: {
    apiKey: string;
    apiSecret: string;
  }): Promise<Result> {
    try {
      await this.callApiService.callApi({
        credentials,
        method: 'GET',
        path: '/account',
      });
    } catch (error) {
      if (error instanceof InvalidApiKeyLengthError) {
        return { areValid: false, reason: 'INCORRECT_KEY_LENGTH' };
      }

      if (error instanceof InvalidApiKeyError) {
        return { areValid: false, reason: 'INVALID_KEY' };
      }

      if (error instanceof IpNotAllowedError) {
        return { areValid: false, reason: 'IP_NOT_ALLOWED' };
      }

      if (error instanceof InvalidApiSecretError) {
        return { areValid: false, reason: 'INVALID_SECRET' };
      }

      throw error;
    }

    return { areValid: true };
  }
}
