import { assignUnique, requiredWinners, resolveTiebreak, tallyVotes } from './game.utils';

describe('game utils', () => {
  it('calculates ceil(n/2)', () => {
    expect(requiredWinners(5)).toBe(3);
  });

  it('assigns unique values without repeats', () => {
    const out = assignUnique(['a', 'b', 'c'], ['x', 'y', 'z']);
    expect(new Set(Object.values(out)).size).toBe(3);
  });

  it('detects tie', () => {
    const result = tallyVotes([
      { voterId: '1', targetId: 'a' },
      { voterId: '2', targetId: 'b' }
    ]);
    expect(result.tie).toBe(true);
  });

  it('counts latest twitch vote during tiebreak window', () => {
    const counts = resolveTiebreak(
      [
        { sender: 'u1', value: '1', at: 10 },
        { sender: 'u1', value: '2', at: 11 },
        { sender: 'u2', value: '2', at: 12 }
      ],
      ['a', 'b'],
      9,
      13
    );
    expect(counts.get('b')).toBe(2);
  });
});
