import { IsNotEmpty, IsString } from 'class-validator';

export class BuyDto {
  @IsString()
  @IsNotEmpty()
  planId?: string;
}
