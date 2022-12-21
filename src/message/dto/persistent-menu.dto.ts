import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

interface Text {
  key: string;
  value: string;
}

interface PersistentMenu {
  texts: Text[];
  question: string;
}

export interface WebData {
  url: string;
  title: string;
}

export class PersistentMenuDto {
  @ApiProperty()
  @IsString()
  pageId: string;

  @ApiProperty()
  @IsNotEmpty()
  menu: PersistentMenu[];

  @ApiProperty()
  @IsOptional()
  web_data: WebData;
}
