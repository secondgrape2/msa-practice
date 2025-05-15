import { NestFactory } from '@nestjs/core';
import { EventModule } from './event.module';

async function bootstrap() {
  const app = await NestFactory.create(EventModule);
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
