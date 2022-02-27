import { Injectable } from '@nestjs/common';
import axios from 'axios';
import hasProperty from 'src/helpers/hasProperty';
import parseInteger from 'src/helpers/parseInteger';
import CreateSignatureService from './CreateSignatureService';
import InvalidApiKeyError from './errors/InvalidApiKeyError';
import InvalidApiKeyLengthError from './errors/InvalidApiKeyLengthError';
import InvalidApiSecretError from './errors/InvalidApiSecretError';
import IpNotAllowedError from './errors/IpNotAllowedError';
import RateLimitError from './errors/RateLimitError';
import UnhandledErrorCodeError from './errors/UnhandledErrorCodeError';
import { URLSearchParams } from 'url';

// TODO: Exception filter

@Injectable()
export default class CallApiService {
  constructor(
    private readonly signatureService: CreateSignatureService,
    private readonly config: {
      apiUrl: string;
      accessWindowMillis: number;
      weightMargin: number;
      requiredApiKeyLength: number;
    },
  ) {}

  async callApi(options: {
    method: 'GET';
    path: string;
    credentials: {
      apiKey: string;
      apiSecret: string;
    };
    query?: Record<string, string>;
    body?: Record<string, unknown>;
  }): Promise<unknown> {
    if (
      options.credentials.apiKey.length !== this.config.requiredApiKeyLength
    ) {
      // Prevent calling the API when we already know that the API key has the wrong length
      throw new InvalidApiKeyLengthError(
        `API key must have ${this.config.requiredApiKeyLength} characters`,
      );
    }

    const querySuffix =
      Object.keys(options.query ?? {}).length > 1
        ? '?' + new URLSearchParams(options.query).toString()
        : '';

    const timestamp = Date.now();

    const signature = this.signatureService.createSignature(
      timestamp,
      options.method,
      options.path + querySuffix,
      options.body ?? {},
      options.credentials.apiSecret,
    );

    try {
      const response = await axios.request<unknown>({
        url: this.config.apiUrl + options.path + querySuffix,
        timeout: 10_000,
        data:
          options.body && Object.keys(options.body).length > 0
            ? JSON.stringify(options.body)
            : undefined,
        headers: {
          'Content-Type': 'application/json',
          'Bitvavo-Access-Key': options.credentials.apiKey,
          'Bitvavo-Access-Signature': signature,
          'Bitvavo-Access-Timestamp': timestamp,
          'Bitvavo-Access-Window': this.config.accessWindowMillis,
        },
      });

      const secondsRemaining = Math.floor(
        (parseInteger(response.headers['bitvavo-ratelimit-resetat']) -
          new Date().getTime()) /
          1000,
      );

      const limitRemaining = parseInteger(
        response.headers['bitvavo-ratelimit-remaining'],
      );

      // TODO: Keep track of weight and check remaining before calling API
      // TODO: Automatically delay call until rate limit is reset

      console.log(
        `Remaining rate limit for the next` +
          ` ${secondsRemaining} seconds:` +
          ` ${limitRemaining}`,
      );

      if (limitRemaining < this.config.weightMargin) {
        throw new RateLimitError(
          `Only ${limitRemaining} of rate limit remaining. Do not make any more API calls for the next ${secondsRemaining} seconds to prevent an IP/key ban!`,
        );
      }

      return response.data;
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      const responseBody = error.response?.data;

      const errorMessage =
        hasProperty(responseBody, 'error') &&
        typeof responseBody.error === 'string'
          ? responseBody.error
          : null;

      if (hasProperty(responseBody, 'errorCode')) {
        const { errorCode } = responseBody;

        switch (errorCode) {
          case 301:
            // API key must be of length 64
            throw new InvalidApiKeyLengthError(errorMessage ?? undefined);

          case 305:
            // No active API key found
            throw new InvalidApiKeyError(errorMessage ?? undefined);

          case 307:
            // This key does not allow access from this IP
            throw new IpNotAllowedError(errorMessage ?? undefined);

          case 309:
            // Invalid signature
            throw new InvalidApiSecretError(errorMessage ?? undefined);

          default:
            if (typeof errorCode !== 'number') {
              break;
            }

            throw new UnhandledErrorCodeError(
              errorCode,
              errorMessage ?? undefined,
            );
        }
      }

      throw error;
    }
  }
}
