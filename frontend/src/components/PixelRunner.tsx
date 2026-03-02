import { useEffect, useState } from 'react';

export function PixelRunner({ name, i }: { name: string; i: number }) {
  const [x, setX] = useState(12 + i * 9);
  useEffect(() => {
    const id = setInterval(() => setX(8 + Math.random() * 84), 25000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute transition-all duration-[2200ms] ease-out" style={{ left: `${x}%`, bottom: `${(i % 3) * 2}px` }}>
      <div className="rounded-md bg-black/25 px-1 text-xs">🧍</div>
      <p className="-mt-1 text-[10px] text-slate-200">{name}</p>
    </div>
  );
}
