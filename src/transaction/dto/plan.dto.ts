import { IsNotEmpty, IsString } from 'class-validator';

export class PlanDto {
  @IsString()
  @IsNotEmpty()
  planId?: string;
}
