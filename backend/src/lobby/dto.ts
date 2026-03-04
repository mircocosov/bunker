import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateLobbyDto {
  @IsInt()
  @Min(2)
  @Max(20)
  playersLimit!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  voteTimerSec?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  revealTimerSec?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  initialRevealedCount?: number;

  @IsOptional()
  @IsString()
  apocalypseTypeId?: string;

  @IsOptional()
  @IsString()
  bunkerLocationTypeId?: string;
}
