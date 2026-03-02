import { ReactNode, useState } from 'react';

type Tab = 'chat' | 'players' | 'profile';

export function MobileBottomSheet({ chat, players, profile }: { chat: ReactNode; players: ReactNode; profile: ReactNode }) {
  const [tab, setTab] = useState<Tab>('chat');
  const [mode, setMode] = useState<'half' | 'full'>('half');

  return (
    <>
      <div className={`absolute inset-0 z-10 bg-black/35 transition-opacity ${mode === 'full' ? 'opacity-100' : 'opacity-70'}`} />
      <div
        className={`absolute inset-x-0 bottom-0 z-20 rounded-t-2xl border border-white/10 bg-black/70 p-2 backdrop-blur transition-[height] duration-200 ${mode === 'half' ? 'h-[48vh]' : 'h-[62vh]'}`}
      >
        <button className="mx-auto mb-2 block h-1.5 w-12 rounded-full bg-white/30" onClick={() => setMode((v) => (v === 'half' ? 'full' : 'half'))} />
        <div className="mb-2 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/30 p-1 text-sm">
          <button className={tab === 'chat' ? 'rounded-lg bg-white/15 py-1' : 'py-1'} onClick={() => setTab('chat')}>Чат</button>
          <button className={tab === 'players' ? 'rounded-lg bg-white/15 py-1' : 'py-1'} onClick={() => setTab('players')}>Игроки</button>
          <button className={tab === 'profile' ? 'rounded-lg bg-white/15 py-1' : 'py-1'} onClick={() => setTab('profile')}>Профиль</button>
        </div>
        <div className="h-[calc(100%-4rem)] min-h-0 overflow-hidden">{tab === 'chat' ? chat : tab === 'players' ? players : profile}</div>
      </div>
    </>
  );
}
