import { ReactNode } from 'react';

export function GameLayoutDesktop({ leftTop, leftBottom, center, right }: { leftTop: ReactNode; leftBottom: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <div className="grid h-screen w-full grid-cols-[350px_minmax(0,1fr)_420px] gap-3 overflow-hidden p-3">
      <aside className="grid min-h-0 grid-rows-[minmax(380px,60%)_minmax(220px,40%)] gap-3">
        <div className="min-h-0">{leftTop}</div>
        <div className="min-h-0">{leftBottom}</div>
      </aside>
      <main className="min-h-0">{center}</main>
      <aside className="min-h-0">{right}</aside>
    </div>
  );
}
