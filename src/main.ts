import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Turns on validator for request types, and only allows properties that are defined in the DTO to pass
  // This is a security feature to prevent unwanted properties from being passed to the database
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(4000);
}

bootstrap();
