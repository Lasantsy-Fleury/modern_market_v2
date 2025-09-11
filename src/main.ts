import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.setGlobalPrefix('serviceModernMarket');
  const config = new DocumentBuilder()
  .setTitle(' Modern Market')
  .setDescription('Documentation microservice du Modern Market du recette local ')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('serviceModernMarket/docs', app, document ,{
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Documentation API - Service Modern Market',
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();