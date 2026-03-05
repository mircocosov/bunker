import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CharacterService, CosmeticCategory } from './character.service';

class CharacterPhraseDto {
  nickname?: string;
  phrase!: string;
}

class EquipCosmeticDto {
  nickname!: string;
  category!: CosmeticCategory;
  cosmeticId!: number;
}

@Controller('character')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Post('phrase')
  savePhrase(@Body() body: CharacterPhraseDto) {
    const profile = this.characterService.savePhrase(body.nickname ?? 'guest', body.phrase);

    return {
      saved: true,
      nickname: profile.nickname,
      phrase: profile.phrase,
    };
  }

  @Patch('equip')
  equipCosmetic(@Body() body: EquipCosmeticDto) {
    return this.characterService.equipCosmetic(body.nickname, body.category, body.cosmeticId);
  }

  @Get('profile/:nickname')
  getProfile(@Param('nickname') nickname: string) {
    return this.characterService.getProfile(nickname);
  }
}
