import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Add global prefix 'api'
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Cookie parser
  app.use(cookieParser());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Hotel Suite API')
    .setDescription('Hotel management system API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔐 Auth endpoints: http://localhost:${port}/api/auth`);
}

bootstrap();

// import { ValidationPipe } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import cookieParser from 'cookie-parser';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Enable CORS
//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   });

//   // Global validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     })
//   );

//   // Cookie parser
//   app.use(cookieParser());

//   // Swagger setup
//   const config = new DocumentBuilder()
//     .setTitle('Hotel Suite API')
//     .setDescription('Hotel management system API documentation')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document);

//   const port = process.env.PORT || 4000;
//   await app.listen(port);

//   // Get the actual URL after the app starts
//   // const url = await app.getUrl();
//   // console.log(`Application is running on: ${url}`);
//   // console.log(`Swagger documentation available at: ${url}/api/docs`);
//   console.log(`🚀 Application is running on: http://localhost:${port}`);
//   console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
// }

// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Enable CORS
//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   });

//   // Global validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     })
//   );

//   // API prefix
//   app.setGlobalPrefix('api');

//   // Swagger documentation
//   const config = new DocumentBuilder()
//     .setTitle('Hotel Management API')
//     .setDescription('API for managing hotel operations')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document);

//   const port = process.env.PORT || 3001;
//   await app.listen(port);

//   console.log(`🚀 Application is running on: http://localhost:${port}`);
//   console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
// }

// bootstrap();
