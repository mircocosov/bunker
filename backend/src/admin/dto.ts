import { IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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

export class GameRulesDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(1)
  bunkerCapacity!: number;

  @IsInt()
  @Min(1)
  discussionDurationSec!: number;

  @IsInt()
  @Min(1)
  votingDurationSec!: number;

  @IsInt()
  @Min(1)
  openCharacteristicDurationSec!: number;

  @IsInt()
  @Min(1)
  initialRevealedCount!: number;

  @IsArray()
  revealOrder!: string[];

  @IsBoolean()
  actionCardsEnabled!: boolean;

  @IsBoolean()
  canUseActionCardAfterReveal!: boolean;

  @IsString()
  @IsNotEmpty()
  winCondition!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  finalRoundLimit?: number;
}
