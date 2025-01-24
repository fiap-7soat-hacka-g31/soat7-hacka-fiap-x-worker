import { CommonModuleOptions, InjectCommonModuleOptions } from '@fiap-x/setup';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
  constructor(
    private readonly config: ConfigService,
    @InjectCommonModuleOptions()
    private readonly options: CommonModuleOptions,
  ) {}

  createMongooseOptions(): MongooseModuleOptions {
    const uri = this.config.getOrThrow('MONGO_URL');
    const appName = this.options.appName;
    return { uri, appName };
  }
}
