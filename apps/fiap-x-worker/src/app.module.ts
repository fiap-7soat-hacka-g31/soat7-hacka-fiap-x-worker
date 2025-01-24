import { AmqpModule } from '@fiap-x/amqp';
import { CommonModule, ContextModule, HealthzModule } from '@fiap-x/setup';
import { AmqpTacticalDesignModule } from '@fiap-x/tactical-design/amqp';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmqpConfig } from './config/amqp.config';
import { AppConfig } from './config/app.config';
import { VideoModule } from './snapshot/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ContextModule.forRoot({}),
    CommonModule.forRootAsync({ useClass: AppConfig }),
    AmqpModule.forRootAsync({ useClass: AmqpConfig }),
    HealthzModule,
    AmqpTacticalDesignModule,
    VideoModule,
  ],
})
export class AppModule {}
