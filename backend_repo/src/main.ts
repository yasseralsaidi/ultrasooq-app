import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';

import { randomUUID } from 'crypto';

// Patch for globalThis.crypto to support @nestjs/schedule
if (!globalThis.crypto) {
  (globalThis as any).crypto = {
    randomUUID,
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Apply global validation pipe
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties that are not defined in the DTO
      //   forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are sent
      //   transform: true,  // Automatically transforms request payloads into DTO instances
    }),
  );
  app.use(morgan('dev')); // 'dev' format logs concise request details
  await app.listen(3000);
  console.log(`USER App is Running on port ${await app.getUrl()}`);
}
bootstrap();
