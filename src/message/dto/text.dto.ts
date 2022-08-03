import { IsNotEmpty, IsString } from 'class-validator';

export class TextDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsString()
  pageId?: string;
}
