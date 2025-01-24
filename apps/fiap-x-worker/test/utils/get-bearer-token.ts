import { environment } from '@fiap-x/test-factory/utils';
import { HttpService } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';

const baseURL = environment.BASE_URL_IDENTITY_SERVICE;

export const getBearerToken = async (
  app: INestApplication,
): Promise<string> => {
  const http = app.get(HttpService);
  const random = randomUUID().split('-').at(0);
  const payload = {
    name: `Jack Sparrow ${random}`,
    email: `${random}-jack@sparrow.com`,
    password: 'j@cK!123Yay',
  };

  const res = await http.axiosRef.post(`${baseURL}/v1/auth/sign-up`, payload);

  return `Bearer ${res.data.access_token}`;
};
