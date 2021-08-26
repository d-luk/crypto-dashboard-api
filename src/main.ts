import { NestFactory } from '@nestjs/core';
import AppModule from './api/v1/AppModule';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3001;

  await app.listen(port);

  console.log(`API running on http://localhost:${port}/graphql`);
}

bootstrap();
