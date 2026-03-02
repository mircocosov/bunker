import { ReactNode, useEffect, useState } from 'react';

export function PcOnlyGuard({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="grid h-screen w-full place-items-center bg-[var(--bg-main)] p-6">
        <div className="panel max-w-md text-center">
          <h1 className="text-2xl font-semibold">Игра доступна только для пользователей ПК</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Откройте на компьютере</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
