import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('servicemodernmarket');

  // Configuration CORS étendue
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  });

  // 🔥 IMPORTANT : Configurer l'adaptateur WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));

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

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0'); // 🔥 Écouter sur toutes les interfaces
  
  console.log(`🚀 Serveur démarré sur le port ${port}`);
  console.log(`📡 WebSocket disponible sur ws://localhost:${port}/servicemodernmarket`);
  console.log(`🌐 API REST disponible sur http://localhost:${port}/servicemodernmarket`);
}

bootstrap();