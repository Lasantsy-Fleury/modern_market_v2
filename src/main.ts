import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('servicemodernmarket');

  // Configuration CORS étendue pour WebSocket
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Modern Market')
    .setDescription('Documentation microservice du Modern Market')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('servicemodernmarket/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Documentation API - Service Modern Market',
  });

  // 🔥 SUPPRIMÉ : app.useWebSocketAdapter(new IoAdapter(app));
  // NestJS gère automatiquement WebSocket via le gateway

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Serveur démarré sur le port ${port}`);
  console.log(`📡 WebSocket disponible sur ws://localhost:${port}/servicemodernmarket`);
  console.log(`🌐 API REST disponible sur http://localhost:${port}/servicemodernmarket`);
}

bootstrap();