import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty()
  @IsNotEmpty()
  recipient: {
    [x: string]: string;
  };

  @ApiProperty()
  @IsNotEmpty()
  message: {
    text: string;
  };

  @ApiProperty()
  @IsString()
  tag?: string;
}
