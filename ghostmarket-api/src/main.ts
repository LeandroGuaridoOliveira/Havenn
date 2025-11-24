import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // SECURITY: Static asset serving removed - files are now served only through secure download endpoints
  // This prevents direct URL access to uploads directory

  // SECURITY: Global validation pipe with strict whitelisting
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Strip properties that don't have decorators
    forbidNonWhitelisted: true,   // Throw error if non-whitelisted properties exist
    transform: true,              // Auto-transform payloads to DTO types
    transformOptions: {
      enableImplicitConversion: true, // Convert primitive types automatically
    },
  }));

  app.enableCors();

  // Run on port 3333
  await app.listen(3333);
}

bootstrap();