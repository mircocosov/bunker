import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UiPlayer } from '../../types/ui';

type Props = {
  players: UiPlayer[];
  votingEnabled?: boolean;
  isAdmin?: boolean;
};

const badgeColor: Record<string, string> = {
  health: 'bg-emerald-500/20 text-emerald-200',
  phobia: 'bg-red-500/20 text-red-200',
  profession: 'bg-blue-500/20 text-blue-200',
  hobby: 'bg-violet-500/20 text-violet-200',
  luggage: 'bg-amber-500/20 text-amber-200',
  fact: 'bg-slate-300/20 text-slate-100'
};

export function PlayersPanel({ players, votingEnabled = true, isAdmin = false }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const alive = players.filter((p) => p.status === 'ALIVE');
  const spectators = players.filter((p) => p.status === 'SPECTATOR');
  const selected = useMemo(() => players.find((x) => x.id === selectedId), [players, selectedId]);

  return (
    <section className="panel h-full min-h-0 animate-in">
      <header className="mb-2">
        <h3 className="text-base font-semibold">Игроки ({alive.length}/{players.length})</h3>
        {selected && <p className="text-xs text-cyan-200">Ваш голос: #{selected.number} {selected.nick}</p>}
      </header>

      <div className="h-[calc(100%-9.5rem)] space-y-2 overflow-y-auto pr-1">
        {players.map((player) => (
          <button
            key={player.id}
            disabled={!votingEnabled || player.status !== 'ALIVE'}
            onClick={() => setSelectedId(player.id)}
            className={`w-full rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:bg-white/10 disabled:cursor-not-allowed ${player.status !== 'ALIVE' ? 'opacity-50' : ''} ${selectedId === player.id ? 'border-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.35)]' : 'border-white/10 bg-white/5'}`}
          >
            <div className="flex items-center gap-2">
              <span className="rounded bg-black/40 px-1.5 text-xs">#{player.number}</span>
              <b>{player.nick}</b>
              <span className="ml-auto text-xs text-[var(--text-muted)]">{player.status === 'ALIVE' ? '🟢 Жив' : player.status === 'KICKED' ? '🔴 Выгнан' : '👁 Наблюдатель'}</span>
            </div>
            {player.status === 'KICKED' ? (
              <p className="mt-1 text-sm text-slate-300">Выгнан</p>
            ) : (
              <div className="mt-1 flex flex-wrap gap-1">
                {player.revealed.map((f, idx) => <span key={idx} className={`rounded-full px-2 py-0.5 text-xs ${badgeColor[f.type]}`}>{f.value}</span>)}
              </div>
            )}
          </button>
        ))}
      </div>

      <details className="mt-2 rounded-xl border border-white/10 bg-black/20 p-2">
        <summary className="cursor-pointer text-sm">Наблюдатели ({spectators.length})</summary>
        <ul className="mt-1 text-sm text-[var(--text-muted)]">{spectators.map((s) => <li key={s.id}>{s.nick}</li>)}</ul>
      </details>

      {isAdmin && (
        <button className="btn-secondary mt-2 w-full" onClick={() => navigate('/admin')}>
          Админ
        </button>
      )}
    </section>
  );
}
