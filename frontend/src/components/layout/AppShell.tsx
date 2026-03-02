import { ReactNode } from 'react';

type LayoutMode = 'DESKTOP_SPLIT' | 'TABLET_TABS' | 'MOBILE_SHEET';

type Props = {
  visual: ReactNode;
  rightPanel: ReactNode;
  mobilePanel: ReactNode;
  mode: LayoutMode;
};

export function AppShell({ visual, rightPanel, mobilePanel, mode }: Props) {
  return (
    <div className="relative h-[calc(100vh-6rem)] min-h-[620px] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/30 shadow-2xl">
      {import.meta.env.DEV && (
        <span className="absolute right-3 top-3 z-30 rounded-full border border-cyan-300/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-100">
          {mode}
        </span>
      )}

      <div className="hidden h-full lg:grid lg:grid-cols-[minmax(0,1fr)_clamp(420px,28vw,460px)]">
        <div className="relative min-h-0">{visual}</div>
        <aside className="h-full min-h-0 border-l border-white/10">{rightPanel}</aside>
      </div>

      <div className="hidden h-full md:grid md:grid-cols-[minmax(0,1fr)_360px] lg:hidden">
        <div className="relative min-h-0">{visual}</div>
        <aside className="h-full min-h-0 border-l border-white/10">{rightPanel}</aside>
      </div>

      <div className="h-full md:hidden">
        <div className="h-full">{visual}</div>
        {mobilePanel}
      </div>
    </div>
  );
}
