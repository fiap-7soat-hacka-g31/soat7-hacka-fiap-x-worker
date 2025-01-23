import { IWorldOptions, World } from '@cucumber/cucumber';
import { ModuleRef } from '@nestjs/core';
import { getApp } from './app';

export class NestWorld extends World {
  private static globalContextId = 0;
  public readonly contextId = { id: ++NestWorld.globalContextId };

  constructor(params: IWorldOptions) {
    super(params);
    this.registerScenario().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error registering scenario with NestJS');
      // eslint-disable-next-line no-console
      console.error(error);
      process.exit(1);
    });
  }

  private async registerScenario() {
    const appModule = await getApp();
    const moduleRef = appModule.get(ModuleRef);
    moduleRef.registerRequestByContextId(this, this.contextId);
  }
}
