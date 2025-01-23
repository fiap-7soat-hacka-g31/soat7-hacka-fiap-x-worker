import { createNestApp } from '@fiap-x/setup';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await createNestApp(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);
  const port = config.get('PORT', '3333');
  await app.listen(port);
}
bootstrap();
