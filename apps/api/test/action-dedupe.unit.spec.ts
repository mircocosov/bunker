import { ActionDedupeService } from '../src/realtime/action-dedupe.service';

describe('ActionDedupeService', () => {
  it('detects duplicate after markSeen', () => {
    const dedupe = new ActionDedupeService(1000);
    const key = 'u1:a1';

    expect(dedupe.isDuplicate(key, 0)).toBe(false);
    dedupe.markSeen(key, 0);
    expect(dedupe.isDuplicate(key, 100)).toBe(true);
  });

  it('expires duplicate record after TTL and cleans up', () => {
    const dedupe = new ActionDedupeService(1000);
    const key = 'u1:a1';

    dedupe.markSeen(key, 0);
    expect(dedupe.isDuplicate(key, 999)).toBe(true);
    expect(dedupe.isDuplicate(key, 1001)).toBe(false);
  });
});
