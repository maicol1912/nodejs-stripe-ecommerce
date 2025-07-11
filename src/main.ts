import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config';
import cookieParser from 'cookie-parser';
import { raw } from 'express';
import { TransformationInterceptor } from "./common/response.interceptor";
import { INestApplication } from '@nestjs/common';
import path from 'path';
import fs from "fs"

const enum NestEnum {
  PORT_PRODUCTION = 444,
  PORT_DEVELOPMENT = 3331
}

const isProduction = () => {
  return (config.get('HAS_SSL')) === true
}

const nestHttpApplication = async<T>(
  moduleClass: T
): Promise<INestApplication> => {
  return await NestFactory.create(moduleClass, {
    snapshot: true
  })
}

const nestHttpsApplication = async<T>(
  moduleClass: T
): Promise<INestApplication> => {
  const keyPath = path.join(__dirname, 'certs', 'key.pem');
  const certPath = path.join(__dirname, 'certs', 'cert.pem');

  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }
  return await NestFactory.create(moduleClass, {
    httpsOptions,
    snapshot: true
  })
}


const nestEnviromentApplication = async<T>(moduleClass: T): Promise<INestApplication> => {
  return isProduction()
    ? await nestHttpsApplication(moduleClass)
    : await nestHttpApplication(moduleClass)
}

export const nestApplication = async<T>(moduleClass: T): Promise<INestApplication> => {
  const app = await nestEnviromentApplication(moduleClass)
  app.use(cookieParser());

  app.use('/digizone/api/ecommerce/orders/webhook', raw({ type: '*/*' }));
  app.enableCors();

  app.setGlobalPrefix(config.get('appPrefix'));
  app.useGlobalInterceptors(new TransformationInterceptor());
  await app.listen(
    isProduction() ? NestEnum.PORT_PRODUCTION : NestEnum.PORT_DEVELOPMENT,
    () => {
      console.log(`Server is running on port ${isProduction() ? NestEnum.PORT_PRODUCTION : NestEnum.PORT_DEVELOPMENT}`);
    }
  )
  return app;
}
async function bootstrap() {
  await nestApplication(AppModule)
}
bootstrap();