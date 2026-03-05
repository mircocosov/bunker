import { Injectable, NotFoundException } from '@nestjs/common';

export interface BlacklistRecord {
  id: number;
  nickname: string;
  reason?: string;
}

interface UpsertBlacklistInput {
  nickname: string;
  reason?: string;
}

@Injectable()
export class BlacklistService {
  private readonly records = new Map<number, BlacklistRecord>();
  private nextId = 1;

  list(): BlacklistRecord[] {
    return Array.from(this.records.values());
  }

  create(input: UpsertBlacklistInput): BlacklistRecord {
    const record: BlacklistRecord = {
      id: this.nextId++,
      nickname: input.nickname,
      reason: input.reason,
    };

    this.records.set(record.id, record);
    return record;
  }

  update(id: number, input: UpsertBlacklistInput): BlacklistRecord {
    const current = this.records.get(id);
    if (!current) {
      throw new NotFoundException('Blacklist record not found');
    }

    const updated: BlacklistRecord = {
      ...current,
      nickname: input.nickname,
      reason: input.reason,
    };

    this.records.set(id, updated);
    return updated;
  }

  remove(id: number): void {
    if (!this.records.has(id)) {
      throw new NotFoundException('Blacklist record not found');
    }

    this.records.delete(id);
  }

  isBanned(nickname: string): boolean {
    return this.list().some((record) => record.nickname.toLowerCase() === nickname.toLowerCase());
  }
}
