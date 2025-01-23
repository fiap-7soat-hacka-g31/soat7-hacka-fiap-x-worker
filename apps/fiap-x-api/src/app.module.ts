import { AmqpModule } from '@fiap-x/amqp';
import { CommonModule, ContextModule, HealthzModule } from '@fiap-x/setup';
import { AuthModule } from '@fiap-x/setup/auth';
import { AmqpTacticalDesignModule } from '@fiap-x/tactical-design/amqp';
import { TacticalDesignModule } from '@fiap-x/tactical-design/core';
import {
  MongooseTacticalDesignModule,
  MongooseTransactionalModule,
} from '@fiap-x/tactical-design/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AmqpConfig } from './config/amqp.config';
import { AppConfig } from './config/app.config';
import { MongooseConfig } from './config/mongoose.config';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ContextModule.forRoot({}),
    CommonModule.forRootAsync({ useClass: AppConfig }),
    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
    AmqpModule.forRootAsync({ useClass: AmqpConfig }),
    HealthzModule,
    TacticalDesignModule,
    MongooseTacticalDesignModule,
    AmqpTacticalDesignModule,
    MongooseTransactionalModule,
    AuthModule,
    VideoModule,
  ],
})
export class AppModule {}
