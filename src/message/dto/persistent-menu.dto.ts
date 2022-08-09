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
  @IsString()
  pageId: string;

  @IsNotEmpty()
  menu: PersistentMenu[];

  @IsOptional()
  web_data: WebData;
}
