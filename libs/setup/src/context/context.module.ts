import { Global, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContextManager } from './context.manager';
import { ConfigurableModuleClass } from './context.module-builder';
import { ContextService } from './context.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [ContextManager, ContextService],
  exports: [ContextService],
})
export class ContextModule
  extends ConfigurableModuleClass
  implements NestModule {}
