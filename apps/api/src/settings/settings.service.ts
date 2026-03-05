import { Injectable } from '@nestjs/common';

export interface GameSettings {
  voteDurationSec: number;
  revealDurationSec: number;
  chatCooldownSec: number;
  minPlayersToStart: number;
  bunkerSlots: number;
  phraseIntervalMinSec?: number;
  phraseIntervalMaxSec?: number;
}

@Injectable()
export class SettingsService {
  private settings: GameSettings = {
    voteDurationSec: 60,
    revealDurationSec: 60,
    chatCooldownSec: 3,
    minPlayersToStart: 6,
    bunkerSlots: 3,
    phraseIntervalMinSec: 15,
    phraseIntervalMaxSec: 45,
  };

  get(): GameSettings {
    return this.settings;
  }

  update(partial: Partial<GameSettings>): GameSettings {
    this.settings = {
      ...this.settings,
      ...partial,
    };

    return this.settings;
  }
}
