import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration WebSocket améliorée
  const ioAdapter = new IoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);

  app.setGlobalPrefix('servicemodernmarket');

  // CORS étendu
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://127.0.0.1:8080', 
      'http://localhost:5173',
      'https://anjaranaka.tsirylab.com',
      'https://gateway.tsirylab.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // Swagger
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
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Serveur démarré sur le port ${port}`);
  console.log(`📡 WebSocket: ws://localhost:${port}/servicemodernmarket`);
  console.log(`🌐 API REST: http://localhost:${port}/servicemodernmarket`);
}

bootstrap();