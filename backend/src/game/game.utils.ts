export const requiredWinners = (n: number) => Math.ceil(n / 2);

export function assignUnique<T>(players: string[], pool: T[], allowRepeats = false): Record<string, T> {
  const result: Record<string, T> = {};
  const localPool = [...pool];
  for (const p of players) {
    if (!allowRepeats && localPool.length === 0) throw new Error('Pool exhausted');
    const idx = Math.floor(Math.random() * (allowRepeats ? pool.length : localPool.length));
    result[p] = allowRepeats ? pool[idx] : localPool.splice(idx, 1)[0];
  }
  return result;
}

export function tallyVotes(votes: Array<{ voterId: string; targetId: string }>) {
  const map = new Map<string, number>();
  for (const v of votes) map.set(v.targetId, (map.get(v.targetId) || 0) + 1);
  const max = Math.max(...map.values());
  const losers = [...map.entries()].filter(([, c]) => c === max).map(([id]) => id);
  return { losers, tie: losers.length > 1 };
}

export function resolveTiebreak(messages: Array<{ sender: string; value: string; at: number }>, candidates: string[], start: number, end: number) {
  const latest = new Map<string, string>();
  for (const msg of messages) {
    if (msg.at < start || msg.at > end) continue;
    if (!/^\d+$/.test(msg.value)) continue;
    latest.set(msg.sender, msg.value);
  }
  const counts = new Map<string, number>();
  for (const value of latest.values()) {
    const i = Number(value) - 1;
    const candidate = candidates[i];
    if (candidate) counts.set(candidate, (counts.get(candidate) || 0) + 1);
  }
  return counts;
}
