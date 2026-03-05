import { Body, Controller, Get, Patch } from '@nestjs/common';
import { GameSettings, SettingsService } from './settings.service';

class UpdateSettingsDto implements Partial<GameSettings> {
  voteDurationSec?: number;
  revealDurationSec?: number;
  chatCooldownSec?: number;
  minPlayersToStart?: number;
  bunkerSlots?: number;
  phraseIntervalMinSec?: number;
  phraseIntervalMaxSec?: number;
}

@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.get();
  }

  @Patch()
  updateSettings(@Body() body: UpdateSettingsDto) {
    return this.settingsService.update(body);
  }
}
