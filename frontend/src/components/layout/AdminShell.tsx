import { ReactNode, useState } from 'react';

type Section = 'lobby' | 'control' | 'pools' | 'actions' | 'scene' | 'filter' | 'bans';

const labels: Record<Section, string> = {
  lobby: 'Лобби',
  control: 'Управление игрой',
  pools: 'Пулы характеристик',
  actions: 'Карты действия',
  scene: 'Сцены',
  filter: 'Чат-фильтр',
  bans: 'Баны'
};

export function AdminShell({ content }: { content: Record<Section, ReactNode> }) {
  const [active, setActive] = useState<Section>('lobby');

  return (
    <div className="grid min-h-[70vh] grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
      <aside className="panel p-2">
        <h2 className="mb-2 px-2 text-sm font-semibold text-[var(--text-muted)]">Консоль</h2>
        <nav className="space-y-1">
          {(Object.keys(labels) as Section[]).map((key) => (
            <button key={key} onClick={() => setActive(key)} className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${active === key ? 'bg-cyan-500/20 text-cyan-100' : 'hover:bg-white/10'}`}>
              {labels[key]}
            </button>
          ))}
        </nav>
      </aside>
      <main className="panel animate-in">{content[active]}</main>
    </div>
  );
}
