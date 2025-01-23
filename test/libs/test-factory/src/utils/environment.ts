import { randomUUID } from 'crypto';

const rabbitmqHost = 'localhost';
const mongodbHost = 'localhost';
const identityServiceHost = 'localhost';

const basicBearer = `fiapx:fiapx`;
export const virtualEnvironment = randomUUID().split('-').at(0);
export const rabbitmqURL = `http://${basicBearer}@${rabbitmqHost}:15672`;

export const environment = {
  CI: 'true',
  NODE_ENV: 'testing',
  MONGO_URL: `mongodb://${basicBearer}@${mongodbHost}:27017/${virtualEnvironment}?authSource=admin`,
  AMQP_URL: `amqp://${basicBearer}@${rabbitmqHost}:5672/${virtualEnvironment}`,
  BASE_URL_IDENTITY_SERVICE: `http://${identityServiceHost}:3400`,
  AWS_ACCESS_KEY_ID: 'test',
  AWS_SECRET_ACCESS_KEY: 'test',
  AWS_SESSION_TOKEN: '',
  AWS_REGION: 'us-east-1',
  AWS_S3_BUCKET_NAME: 'fiap7soat-f5-hacka-tests',
  AWS_S3_LOCALSTACK_ENDPOINT: 'http://localhost:4566',
  AWS_S3_USE_LOCALSTACK: 'true',
};
