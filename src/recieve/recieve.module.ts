import { Global, Module } from '@nestjs/common';
import { RecieveService } from './recieve.service';

@Global()
@Module({
  providers: [RecieveService],
  exports: [RecieveService],
})
export class RecieveModule {}
