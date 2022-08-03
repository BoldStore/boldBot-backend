import { IsNotEmpty, IsString } from 'class-validator';

interface Text {
  key: string;
  value: string;
}

export class TextDto {
  @IsNotEmpty()
  texts: Text[];

  @IsString()
  pageId?: string;
}
