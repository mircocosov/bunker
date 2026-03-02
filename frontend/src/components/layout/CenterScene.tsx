import { ReactNode } from 'react';

export function CenterScene({ children }: { children: ReactNode }) {
  return <section className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30">{children}</section>;
}
