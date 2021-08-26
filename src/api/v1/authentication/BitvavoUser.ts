import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export type User = null | {
  apiKey: string;
  apiSecret: string;
};

const BitvavoUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context);
    const request: Request = ctx.getContext().req;

    const bitvavoApiKey = request.headers['bitvavo-api-key'];
    const bitvavoApiSecret = request.headers['bitvavo-api-secret'];

    if (
      bitvavoApiKey &&
      typeof bitvavoApiKey === 'string' &&
      bitvavoApiSecret &&
      typeof bitvavoApiSecret === 'string'
    ) {
      return {
        apiKey: bitvavoApiKey,
        apiSecret: bitvavoApiSecret,
      };
    }

    return null;
  },
);

export default BitvavoUser;
