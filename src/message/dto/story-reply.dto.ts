import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @IsString()
  pageId: string;

  @ApiProperty()
  @IsNotEmpty()
  replies: Reply[];
}
