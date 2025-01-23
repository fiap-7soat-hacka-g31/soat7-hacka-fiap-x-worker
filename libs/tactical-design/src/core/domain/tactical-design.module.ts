import { Global, Module } from '@nestjs/common';
import { AggregateMergeContext } from './aggregate-root';

@Global()
@Module({
  providers: [AggregateMergeContext],
  exports: [AggregateMergeContext],
})
export class TacticalDesignModule {}
