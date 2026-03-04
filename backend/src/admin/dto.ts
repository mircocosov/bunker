import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class BanUserDto {
  @IsString()
  @IsNotEmpty()
  twitchNick!: string;
}

export class FilterWordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  word!: string;
}

export class PoolItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  value?: string;

  @IsOptional()
  @IsBoolean()
  severity?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['replace', 'upgrade', 'take'])
  type?: string;


  @IsOptional()
  @IsString()
  @IsIn(['professions', 'phobias', 'hobbies', 'luggage', 'facts', 'health'])
  changeField?: string;

  @IsOptional()
  @IsString()
  @IsIn(['all', 'revealed', 'bunker'])
  targetField?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  upgradeText?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
