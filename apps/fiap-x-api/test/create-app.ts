import { createTestApp as baseCreateTestApp } from '@fiap-x/test-factory/utils';
import { AppModule } from '../src/app.module';

export const env = {
  APP_NAME: 'fiap-x-api',
  APP_DESCRIPTION: 'Payments Component for Fiap Burger',
  APP_VERSION: '1.0.0',
};

export const createTestApp = (silentLogger: boolean = true) =>
  baseCreateTestApp(AppModule, { env, silentLogger });
