import { useMemo, useState } from 'react';

type Props = {
  phase: 'REVEAL' | 'VOTE' | 'TIEBREAK';
  timerSec: number;
};

export function HudOverlay({ phase, timerSec }: Props) {
  const [openRules, setOpenRules] = useState(false);
  const phaseRu = useMemo(() => (phase === 'REVEAL' ? 'Открытие характеристик' : phase === 'VOTE' ? 'Голосование' : 'Тай-брейк'), [phase]);
  const mm = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const ss = String(timerSec % 60).padStart(2, '0');

  return (
    <>
      <div className="pointer-events-none absolute inset-0 p-3 md:p-4">
        <div className="pointer-events-auto max-w-sm space-y-2">
          <div className="panel">
            <p className="text-xs text-[var(--text-muted)]">Фаза</p>
            <p className="text-lg font-semibold">{phaseRu}</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-cyan-200">{mm}:{ss}</p>
          </div>
          <div className="panel text-sm">
            <p><span className="text-[var(--text-muted)]">Апокалипсис:</span> Ледяной шторм</p>
            <p><span className="text-[var(--text-muted)]">Локация:</span> Горный бункер</p>
            <p><span className="text-[var(--text-muted)]">Улучшения:</span> Фильтры воздуха II</p>
          </div>
        </div>

        <div className="pointer-events-auto absolute bottom-3 left-3 flex gap-2 md:bottom-4 md:left-4">
          <button className="btn-primary">Зарегистрироваться</button>
          <button className="btn-secondary">Открыть характеристику</button>
          <button className="btn-secondary" onClick={() => setOpenRules(true)}>Показать правила</button>
        </div>
      </div>

      {openRules && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/60 p-4">
          <div className="panel w-full max-w-lg">
            <h3 className="text-lg font-semibold">Правила</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Каждый раунд: открытие характеристик, затем голосование. Выжившие до финала попадают в бункер.</p>
            <button className="btn-primary mt-3" onClick={() => setOpenRules(false)}>Понятно</button>
          </div>
        </div>
      )}
    </>
  );
}
