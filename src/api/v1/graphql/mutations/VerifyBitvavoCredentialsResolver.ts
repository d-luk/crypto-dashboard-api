import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  BitvavoCredentialsValidationResult as ValidationResult,
  VerifyBitvavoCredentialsInput as Input,
  VerifyBitvavoCredentialsOutput as Output,
} from 'src/generated/graphqlNest';
import getValue from 'src/helpers/getValue';
import MutationResolver from 'src/helpers/resolverTypes/MutationResolver';
import VerifyCredentialsService from '../../submodules/bitvavo/VerifyCredentialsService';

@Resolver()
export default class VerifyBitvavoResolver
  implements MutationResolver<'verifyBitvavoCredentials'>
{
  constructor(
    private readonly verifyCredentialsService: VerifyCredentialsService,
  ) {}

  @Mutation()
  async verifyBitvavoCredentials(@Args('input') input: Input): Promise<Output> {
    const validationResult = await this.verifyCredentialsService.verify({
      apiKey: input.apiKey,
      apiSecret: input.apiSecret,
    });

    return {
      result: getValue((): ValidationResult => {
        if (validationResult.areValid === true) {
          return ValidationResult.VALID;
        }

        switch (validationResult.reason) {
          case 'INCORRECT_KEY_LENGTH':
            return ValidationResult.INCORRECT_KEY_LENGTH;

          case 'INVALID_KEY':
            return ValidationResult.INVALID_KEY;

          case 'INVALID_SECRET':
            return ValidationResult.INVALID_SECRET;

          case 'IP_NOT_ALLOWED':
            return ValidationResult.IP_NOT_ALLOWED;

          default:
            throw new Error(
              `Unhandled validation result reason "${validationResult.reason}"`,
            );
        }
      }),
    };
  }
}
