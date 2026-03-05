import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatFilterService } from '../chat-filter/chat-filter.service';

export type CosmeticCategory = 'hair' | 'face' | 'hat' | 'top' | 'bottom' | 'shoes' | 'pet';

export interface CosmeticRecord {
  id: number;
  category: CosmeticCategory;
  name: string;
  imageUrl?: string;
  unlockWins: number;
}

export interface CharacterProfile {
  nickname: string;
  phrase: string;
  wins: number;
  equipped: Partial<Record<CosmeticCategory, number>>;
}

@Injectable()
export class CharacterService {
  private readonly cosmetics = new Map<number, CosmeticRecord>();
  private readonly profiles = new Map<string, CharacterProfile>();
  private nextCosmeticId = 1;

  constructor(private readonly chatFilterService: ChatFilterService) {}

  listCosmetics(category?: CosmeticCategory): CosmeticRecord[] {
    const all = Array.from(this.cosmetics.values());
    return category ? all.filter((item) => item.category === category) : all;
  }

  createCosmetic(input: Omit<CosmeticRecord, 'id'>): CosmeticRecord {
    const record: CosmeticRecord = { id: this.nextCosmeticId++, ...input };
    this.cosmetics.set(record.id, record);
    return record;
  }

  updateCosmetic(id: number, input: Partial<Omit<CosmeticRecord, 'id'>>): CosmeticRecord {
    const current = this.cosmetics.get(id);
    if (!current) {
      throw new NotFoundException('Cosmetic not found');
    }
    const updated: CosmeticRecord = {
      ...current,
      ...input,
    };
    this.cosmetics.set(id, updated);
    return updated;
  }

  removeCosmetic(id: number): void {
    if (!this.cosmetics.has(id)) {
      throw new NotFoundException('Cosmetic not found');
    }
    this.cosmetics.delete(id);
  }

  savePhrase(nickname: string, phrase: string): CharacterProfile {
    if (phrase.length > 20) {
      throw new BadRequestException('Phrase must be <= 20 characters');
    }
    if (this.chatFilterService.containsForbidden(phrase)) {
      throw new BadRequestException('Phrase contains forbidden words');
    }

    const profile = this.getOrCreateProfile(nickname);
    profile.phrase = phrase;
    this.profiles.set(nickname, profile);
    return profile;
  }

  equipCosmetic(nickname: string, category: CosmeticCategory, cosmeticId: number): CharacterProfile {
    const cosmetic = this.cosmetics.get(cosmeticId);
    if (!cosmetic || cosmetic.category !== category) {
      throw new NotFoundException('Cosmetic not found for category');
    }

    const profile = this.getOrCreateProfile(nickname);
    if (profile.wins < cosmetic.unlockWins) {
      throw new BadRequestException('Cosmetic is locked for player progress');
    }

    profile.equipped[category] = cosmeticId;
    this.profiles.set(nickname, profile);
    return profile;
  }

  addBunkerWin(nickname: string): CharacterProfile {
    const profile = this.getOrCreateProfile(nickname);
    profile.wins += 1;
    this.profiles.set(nickname, profile);
    return profile;
  }

  getProfile(nickname: string) {
    const profile = this.getOrCreateProfile(nickname);
    const unlockedCosmetics = this.listCosmetics().filter((item) => item.unlockWins <= profile.wins);

    return {
      ...profile,
      unlockedCosmetics,
    };
  }

  private getOrCreateProfile(nickname: string): CharacterProfile {
    const existing = this.profiles.get(nickname);
    if (existing) {
      return existing;
    }

    const profile: CharacterProfile = {
      nickname,
      phrase: '',
      wins: 0,
      equipped: {},
    };

    this.profiles.set(nickname, profile);
    return profile;
  }
}
