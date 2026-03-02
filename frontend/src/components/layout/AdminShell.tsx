import { ReactNode, useState } from 'react';

export type AdminSection = 'stats' | 'cards' | 'scenes' | 'filter' | 'blacklist' | 'game';

const labels: Record<AdminSection, string> = {
  stats: 'Характеристики',
  cards: 'Карты действий',
  scenes: 'Сцены',
  filter: 'Фильтр-чата',
  blacklist: 'Черный список',
  game: 'Игра'
};

export function AdminShell({ content }: { content: Record<AdminSection, ReactNode> }) {
  const [active, setActive] = useState<AdminSection>('stats');

  return (
    <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-3 p-3 md:grid-cols-[280px_1fr] md:p-4">
      <aside className="panel p-2">
        <h2 className="mb-2 px-2 text-sm font-semibold text-[var(--text-muted)]">Админка</h2>
        <nav className="space-y-1">
          {(Object.keys(labels) as AdminSection[]).map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${active === key ? 'bg-cyan-500/20 text-cyan-100' : 'hover:bg-white/10'}`}
            >
              {labels[key]}
            </button>
          ))}
        </nav>
      </aside>
      <main className="panel animate-in">{content[active]}</main>
    </div>
  );
}
