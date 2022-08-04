import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PageDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsNotEmpty()
  @IsString()
  data_access_expiration_time: string;

  @IsNotEmpty()
  @IsString()
  expires_in: string;

  @IsOptional()
  @IsString()
  long_lived_token?: string;
}
