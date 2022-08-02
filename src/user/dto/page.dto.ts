import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PageDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsNotEmpty()
  @IsNumber()
  data_access_expiration_time: number;

  @IsNotEmpty()
  @IsNumber()
  expires_in: number;

  @IsNotEmpty()
  @IsString()
  long_lived_token: string;
}
