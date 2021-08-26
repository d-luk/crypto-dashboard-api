import { BaseError } from 'make-error-cause';

export default class UnhandledErrorCodeError extends BaseError {
  constructor(
    public readonly bitvavoErrorCode: number,
    public readonly bitvavoErrorMessage?: string,
  ) {
    super(
      `Unhandled Bitvavo error code ${bitvavoErrorCode}` +
        (bitvavoErrorMessage ? ` (${bitvavoErrorMessage})` : ''),
    );
  }
}
