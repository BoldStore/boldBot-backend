import { IsNotEmpty, IsString } from 'class-validator';

export class ContactDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  insta_username: string;
}
