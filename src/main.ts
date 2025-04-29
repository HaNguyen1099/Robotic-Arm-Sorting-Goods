import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import {ValidationPipe, VersioningType} from '@nestjs/common';
import { AppModule } from '@/app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import { config } from "@/config";
import {LoggingService} from "@base/logging";

async function bootstrap() {
    initializeTransactionalContext();
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {});
    const loggingService = app.get(LoggingService);
    const logger = loggingService.getLogger();

    app.enableCors();
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(rateLimit(config.RATE_LIMIT));

    app.useGlobalPipes(
        new ValidationPipe({
        whitelist: true,
        stopAtFirstError: true,
        }),
    );

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('API for embedded system project')
        .setVersion('1.0')
        .addTag('Robot Arm')
        .addServer('http://localhost:' + config.PORT, 'Localhost')
        .addServer(`http://${config.PUBLIC_IP}:${config.PORT}`, 'Current server')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    app.use(helmet());

    await app.listen(config.PORT);
    const hostname = config.HOST;
    logger.info('Server time: ' + new Date().toString());
    logger.info(`Local/public ip: ${String(config.LOCAL_IP)} - ${String(config.PUBLIC_IP)}`);
    logger.info(`Running app on: http://localhost:3001`);
    logger.info(`  Api Document: http://localhost:3001/apidoc`);
    logger.info(`   Api gateway: http://localhost:3001/api`);
}

void bootstrap();