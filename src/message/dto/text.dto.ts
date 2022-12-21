import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

interface Text {
  key: string;
  value: string;
}

export class TextDto {
  @ApiProperty()
  @IsNotEmpty()
  texts: Text[];

  @ApiProperty()
  @IsString()
  pageId?: string;
}
