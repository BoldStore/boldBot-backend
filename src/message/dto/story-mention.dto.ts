import { IsNotEmpty, IsString } from 'class-validator';

interface Text {
  key: string;
  value: string;
}

export class StoryMentionDto {
  @IsString()
  pageId: string;

  @IsNotEmpty()
  texts: Text[];
}
