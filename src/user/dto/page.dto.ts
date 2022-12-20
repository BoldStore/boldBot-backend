import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  data_access_expiration_time: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  expires_in: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  long_lived_token?: string;
}
