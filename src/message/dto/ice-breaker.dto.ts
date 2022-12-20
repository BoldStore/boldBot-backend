import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

interface Text {
  key: string;
  value: string;
}

interface IceBreaker {
  texts: Text[];
  question: string;
}

export class IceBreakerDto {
  @ApiProperty()
  @IsString()
  pageId: string;

  @ApiProperty()
  @IsNotEmpty()
  ice_breakers: IceBreaker[];
}
