import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.setGlobalPrefix('servicemarche');
  const config = new DocumentBuilder()
  .setTitle('Recette local')
  .setDescription('Documentation du Recette local ')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('servicemarche/docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();