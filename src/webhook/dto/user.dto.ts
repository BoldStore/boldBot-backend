import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  profilePic?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsString()
  insta_id?: string;
}
