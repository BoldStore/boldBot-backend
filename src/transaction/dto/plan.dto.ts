import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

interface RazorpayOptions {
  period: string;
  interval: string;
}

export class PlanDto {
  @IsOptional()
  @IsMongoId()
  planId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  currency?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  days?: number;

  @IsOptional()
  razorpayOptions?: RazorpayOptions;
}
