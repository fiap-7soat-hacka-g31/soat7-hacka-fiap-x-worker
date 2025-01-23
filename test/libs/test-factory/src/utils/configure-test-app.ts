import {
  configureCORS,
  configureCompression,
  configureContextWrappers,
  configureExceptionHandler,
  configureHelmet,
  configureHttpInspectorInbound,
  configureLogger,
  configureOpenAPI,
  configureRoutePrefix,
  configureValidation,
  configureVersioning,
} from '@fiap-x/setup';
import { INestApplication, Type } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { Connection as MongooseConnection } from 'mongoose';
import { setTimeout } from 'timers/promises';
import { environment, rabbitmqURL, virtualEnvironment } from './environment';

export type TestOptions = {
  env?: Record<string, any>;
  silentLogger?: boolean;
};

export async function createTestApp(
  AppModule: Type<any>,
  options?: TestOptions,
) {
  const { env = {}, silentLogger = true } = options ?? {};
  if (silentLogger) {
    env['LOG_SILENT'] = 'true';
  }
  Object.entries({ ...env, ...environment }).forEach(
    ([key, value]) => (process.env[key] = value),
  );
  await axios.put(`${rabbitmqURL}/api/vhosts/${virtualEnvironment}`);
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleFixture.createNestApplication();
  configureContextWrappers(app);
  configureLogger(app);
  configureExceptionHandler(app);
  configureHttpInspectorInbound(app);
  configureCORS(app);
  configureHelmet(app);
  configureCompression(app);
  configureValidation(app);
  configureVersioning(app);
  configureRoutePrefix(app);
  configureOpenAPI(app);

  await app.init();
  await gracefulShutdownPeriod(500);
  return app;
}

const gracefulShutdownPeriod = (ms = 250) => setTimeout(ms);

export async function destroyTestApp(app: INestApplication) {
  const mongooseConnection = await app
    .resolve<MongooseConnection>(getConnectionToken())
    .catch(() => null);
  await mongooseConnection?.dropDatabase();
  await app.close();
  await gracefulShutdownPeriod();
  await axios.delete(`${rabbitmqURL}/api/vhosts/${virtualEnvironment}`);
}
