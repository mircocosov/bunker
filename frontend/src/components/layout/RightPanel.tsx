import { ReactNode, useState } from 'react';

type Props = {
  chat: ReactNode;
  players: ReactNode;
};

export function RightPanel({ chat, players }: Props) {
  const [tab, setTab] = useState<'chat' | 'players'>('chat');

  return (
    <>
      <div className="hidden h-full min-h-0 grid-cols-2 gap-3 overflow-hidden p-3 lg:grid">
        <div className="h-full min-h-0 overflow-hidden">{chat}</div>
        <div className="h-full min-h-0 overflow-hidden">{players}</div>
      </div>

      <div className="hidden h-full min-h-0 flex-col gap-3 overflow-hidden p-3 md:flex lg:hidden">
        <div className="inline-flex rounded-xl border border-white/15 bg-black/40 p-1">
          <button onClick={() => setTab('chat')} className={`flex-1 rounded-lg px-3 py-1.5 text-sm ${tab === 'chat' ? 'bg-white/15 text-white' : 'text-slate-300'}`}>Чат</button>
          <button onClick={() => setTab('players')} className={`flex-1 rounded-lg px-3 py-1.5 text-sm ${tab === 'players' ? 'bg-white/15 text-white' : 'text-slate-300'}`}>Игроки</button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{tab === 'chat' ? chat : players}</div>
      </div>
    </>
  );
}
