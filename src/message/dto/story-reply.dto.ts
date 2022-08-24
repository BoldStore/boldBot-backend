import { IsNotEmpty, IsString } from 'class-validator';

interface Text {
  key: string;
  value: string;
}

interface Reply {
  texts: Text[];
  question: string;
}

export class StoryReplyDto {
  @IsString()
  pageId: string;

  @IsNotEmpty()
  replies: Reply[];
}
