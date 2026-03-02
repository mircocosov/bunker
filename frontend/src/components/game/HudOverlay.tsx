import { useMemo } from 'react';

type Props = {
  phase: 'REVEAL' | 'VOTE' | 'TIEBREAK';
  timerSec: number;
};

export function HudOverlay({ phase, timerSec }: Props) {
  const phaseRu = useMemo(() => (phase === 'REVEAL' ? 'Открытие характеристик' : phase === 'VOTE' ? 'Голосование' : 'Тай-брейк'), [phase]);
  const mm = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const ss = String(timerSec % 60).padStart(2, '0');

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-sm space-y-2">
      <div className="panel">
        <p className="text-xs text-[var(--text-muted)]">Фаза</p>
        <p className="text-lg font-semibold">{phaseRu}</p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-[var(--accent-cold)]">{mm}:{ss}</p>
      </div>
    </div>
  );
}
