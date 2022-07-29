import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @IsNotEmpty()
  recipient: {
    [x: string]: string;
  };

  @IsNotEmpty()
  message: {
    text: string;
  };

  @IsNotEmpty()
  @IsString()
  tag: string;
}
