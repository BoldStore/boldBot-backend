import { Global, Module } from '@nestjs/common';
import { RecieveHelpers } from './recieve.helpers';
import { RecieveService } from './recieve.service';

@Global()
@Module({
  providers: [RecieveService, RecieveHelpers],
  exports: [RecieveService],
})
export class RecieveModule {}
