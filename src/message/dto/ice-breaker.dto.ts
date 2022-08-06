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
  @IsString()
  pageId: string;

  @IsNotEmpty()
  ice_breakers: IceBreaker[];
}
