import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class WebhookDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(['instagram', 'page'])
  object: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
