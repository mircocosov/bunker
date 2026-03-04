import { Inject, Injectable, Optional } from '@nestjs/common';

export const ACTION_DEDUPE_TTL_MS = 'ACTION_DEDUPE_TTL_MS';
const DEFAULT_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class ActionDedupeService {
  private readonly seen = new Map<string, number>();
  private readonly ttlMs: number;

  constructor(@Optional() @Inject(ACTION_DEDUPE_TTL_MS) ttlMs?: number) {
    this.ttlMs = ttlMs ?? DEFAULT_TTL_MS;
  }

  private cleanup(now = Date.now()) {
    for (const [key, expiresAt] of this.seen.entries()) {
      if (expiresAt <= now) {
        this.seen.delete(key);
      }
    }
  }

  isDuplicate(key: string, now = Date.now()): boolean {
    this.cleanup(now);
    const expiresAt = this.seen.get(key);
    return typeof expiresAt === 'number' && expiresAt > now;
  }

  markSeen(key: string, now = Date.now()): void {
    this.cleanup(now);
    this.seen.set(key, now + this.ttlMs);
  }

  // TODO(iteration3): extract storage to interface and swap in Redis-backed dedupe store.
}
