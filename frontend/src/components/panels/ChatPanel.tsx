import { useEffect, useMemo, useRef, useState } from 'react';
import { UiMessage } from '../../types/ui';

type Props = {
  messages: UiMessage[];
  onSend: (text: string) => void;
  cooldownMs: number;
  cooldownUntil: number;
  connectionError: string | null;
  sendError: string | null;
};

const initials = (nick: string) => nick.slice(0, 2).toUpperCase();

export function ChatPanel({ messages, onSend, cooldownMs, cooldownUntil, connectionError, sendError }: Props) {
  const [text, setText] = useState('');
  const [now, setNow] = useState(Date.now());
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const cooldownLeft = Math.max(0, cooldownUntil - now);
  const cooldownSec = (cooldownLeft / 1000).toFixed(1);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const canSend = useMemo(() => text.trim().length > 0 && cooldownLeft <= 0 && !connectionError, [text, cooldownLeft, connectionError]);

  return (
    <section className="panel flex h-full min-h-0 flex-col animate-in">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">Чат бункера</h3>
        <span className="text-xs text-[var(--text-muted)]">Антиспам: {Math.round(cooldownMs / 1000)}с</span>
      </header>

      <div ref={listRef} className="relative flex-1 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2">
        <div className="space-y-1.5">
          {messages.map((m) => (
            <article key={m.id} className="rounded-lg bg-white/5 p-2">
              <div className="mb-0.5 flex items-center gap-2 text-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold">{initials(m.nick)}</span>
                <b>{m.nick}</b>
                <span className="ml-auto text-xs text-[var(--text-muted)]">{m.time}</span>
              </div>
              <p className="break-words text-sm text-[var(--text-main)]">{m.text}</p>
            </article>
          ))}
        </div>
      </div>

      <footer className="mt-2 space-y-1">
        <div className="flex gap-2">
          <input disabled={cooldownLeft > 0 || !!connectionError} className="input flex-1 disabled:opacity-60" value={text} onChange={(e) => setText(e.target.value)} placeholder={connectionError ?? (cooldownLeft > 0 ? 'Кулдаун активен...' : 'Сообщение...')} />
          <button className="btn-primary disabled:opacity-50" disabled={!canSend} onClick={() => { onSend(text.trim()); setText(''); }}>Отправить</button>
        </div>
        {connectionError && <p className="text-xs text-rose-300">{connectionError}</p>}
        {!connectionError && sendError && <p className="text-xs text-rose-300">{sendError}</p>}
        {cooldownLeft > 0 && <p className="text-xs text-[var(--accent-hazard)]">Подождите {cooldownSec}с</p>}
      </footer>
    </section>
  );
}
