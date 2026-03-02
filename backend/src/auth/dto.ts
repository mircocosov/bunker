import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RequestCodeDto {
  @ApiProperty()
  @IsString()
  @Length(1, 50)
  twitchNick!: string;
}

export class ConfirmAuthDto {
  @ApiProperty()
  @IsString()
  @Length(1, 50)
  twitchNick!: string;
}
