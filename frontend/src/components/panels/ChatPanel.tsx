import { useEffect, useMemo, useRef, useState } from 'react';
import { UiMessage } from '../../types/ui';

type Props = {
  messages: UiMessage[];
  onSend: (text: string) => void;
};

const initials = (nick: string) => nick.slice(0, 2).toUpperCase();

export function ChatPanel({ messages, onSend }: Props) {
  const [text, setText] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [showDown, setShowDown] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const cooldownLeft = Math.max(0, cooldownUntil - Date.now());
  const cooldownSec = (cooldownLeft / 1000).toFixed(1);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight });
      setShowDown(false);
    } else {
      setShowDown(true);
    }
  }, [messages]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    setShowDown(!nearBottom);
  };

  const canSend = useMemo(() => text.trim().length > 0 && cooldownLeft <= 0, [text, cooldownLeft]);

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    setCooldownUntil(Date.now() + 2000);
  };

  return (
    <section className="panel h-full min-h-0 animate-in">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">Чат бункера</h3>
        <span className="text-xs text-[var(--text-muted)]">Антиспам: 2с</span>
      </header>

      <div ref={listRef} onScroll={handleScroll} className="relative h-[calc(100%-8rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2">
        <div className="space-y-1.5">
          {messages.map((m, idx) => (
            <article key={m.id} className={`rounded-lg p-2 ${idx >= messages.length - 2 ? 'bg-emerald-500/10 ring-1 ring-emerald-400/20' : 'bg-white/5'}`}>
              <div className="mb-0.5 flex items-center gap-2 text-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">{initials(m.nick)}</span>
                <b>{m.nick}</b>
                <span className="ml-auto text-xs text-[var(--text-muted)]">{m.time}</span>
              </div>
              <p className="break-words text-sm text-[var(--text-main)]">{m.text}</p>
            </article>
          ))}
        </div>
        {showDown && (
          <button className="absolute bottom-2 right-2 rounded-full bg-white/20 px-2 py-1 text-xs" onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })}>
            Вниз
          </button>
        )}
      </div>

      <footer className="mt-2 space-y-1">
        <div className="flex gap-2">
          <input disabled={cooldownLeft > 0} className="input flex-1 disabled:opacity-60" value={text} onChange={(e) => setText(e.target.value)} placeholder={cooldownLeft > 0 ? 'Кулдаун активен...' : 'Сообщение...'} />
          <button className="btn-primary disabled:opacity-50" disabled={!canSend} onClick={submit}>Отправить</button>
        </div>
        {cooldownLeft > 0 && <p className="text-xs text-amber-200">Подождите {cooldownSec}с перед следующим сообщением.</p>}
      </footer>
    </section>
  );
}
