import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [HttpModule.register({ global: true })],
})
export class AuthModule {}
