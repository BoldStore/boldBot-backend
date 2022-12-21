import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

interface Text {
  key: string;
  value: string;
}

export class StoryMentionDto {
  @ApiProperty()
  @IsString()
  pageId: string;

  @ApiProperty()
  @IsNotEmpty()
  texts: Text[];
}
