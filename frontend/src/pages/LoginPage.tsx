import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

export function LoginPage() {
  const [nick, setNick] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const refreshTimerRef = useRef<number | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const request = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.post('/auth/request-code', { twitchNick: nick });
      setCode(data.code);
      clearRefreshTimer();
      refreshTimerRef.current = window.setTimeout(() => {
        void request();
      }, data.ttlMs ?? 15000);
    } catch {
      setError('Не удалось получить код. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => clearRefreshTimer(), []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e293b,#020617)] opacity-90" />
      <div className="relative mx-auto max-w-md panel space-y-3">
        <h1 className="text-2xl font-bold">Вход в bunker</h1>
        <p className="text-sm text-[var(--text-muted)]">Введите Twitch-ник и получите 6-значный код подтверждения.</p>
        <label className="field">
          Twitch Nick
          <input className="input" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="например, Survivor77" />
        </label>
        <button className="btn-primary w-full" onClick={request} disabled={loading || !nick}>{loading ? 'Загрузка...' : code ? 'Сгенерировать новый' : 'Получить код'}</button>
        {error && <p className="text-sm text-red-300">{error}</p>}
        {code && (
          <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3 text-center">
            <p className="text-xs text-[var(--text-muted)]">Ваш код</p>
            <p className="font-mono text-4xl font-bold tracking-[0.3em] text-cyan-200">{code}</p>
            <p className="mt-2 text-sm">Напишите код в чат Twitch канала из настроек сервера.</p>
          </div>
        )}
      </div>
    </div>
  );
}
