import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../api/client';
import { useAuthStore } from '../store/auth';
import { SceneLayerUi, UiMessage, UiPlayer } from '../types/ui';
import { GameLayoutDesktop } from '../components/layout/GameLayoutDesktop';
import { LeftSidebarMyCard } from '../components/layout/LeftSidebarMyCard';
import { LeftSidebarChat } from '../components/layout/LeftSidebarChat';
import { CenterScene } from '../components/layout/CenterScene';
import { RightSidebarPlayers } from '../components/layout/RightSidebarPlayers';
import { PcOnlyGuard } from '../components/layout/PcOnlyGuard';
import { SceneView } from '../components/game/SceneView';
import { HudOverlay } from '../components/game/HudOverlay';

const demoPlayers: UiPlayer[] = [
  { id: '1', number: 1, nick: 'Kira', status: 'ALIVE', revealed: [{ type: 'profession', value: 'Инженер' }, { type: 'health', value: 'Здоров' }] },
  { id: '2', number: 2, nick: 'Maks', status: 'ALIVE', revealed: [{ type: 'phobia', value: 'Темнота' }, { type: 'hobby', value: 'Рыбалка' }] },
  { id: '3', number: 3, nick: 'Lina', status: 'KICKED', revealed: [] },
  { id: '4', number: 4, nick: 'Dima', status: 'SPECTATOR', revealed: [] }
];

const demoLayers: SceneLayerUi[] = [
  { id: 'sky', kind: 'SKY', assetKey: '/assets/scenes/sky.png', zIndex: 1 },
  { id: 'mid', kind: 'MID', assetKey: '/assets/scenes/sky.png', zIndex: 2, offsetY: 14, scale: 1.05 },
  { id: 'ground', kind: 'GROUND', assetKey: '/assets/scenes/ground.png', zIndex: 3, offsetY: 0 }
];

const toUiMessage = (m: any, fallbackId: string): UiMessage => ({
  id: String(m.id ?? fallbackId),
  nick: m.user?.twitchNick ?? 'Игрок',
  text: m.message,
  time: new Date(m.createdAt ?? Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
});

export function LobbyPage() {
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [cooldownMs, setCooldownMs] = useState(2000);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    api.get('/lobby').then((res) => setRegistrationOpen(Boolean(res.data?.isActive))).catch(() => setRegistrationOpen(false));
  }, []);

  useEffect(() => {
    if (!token) {
      setConnectionError('Чат недоступен: нет соединения');
      return;
    }

    const nextSocket = io('/', { path: '/bunker/socket.io', auth: { token } });
    setSocket(nextSocket);

    nextSocket.on('connect', () => setConnectionError(null));
    nextSocket.on('disconnect', () => setConnectionError('Чат недоступен: нет соединения'));
    nextSocket.on('connect_error', () => setConnectionError('Чат недоступен: нет соединения'));

    nextSocket.on('chat:config', (cfg: { cooldownMs: number }) => {
      setCooldownMs(cfg.cooldownMs || 2000);
    });

    nextSocket.on('chat:error', (error: { message?: string; retryAfterMs?: number; cooldownMs?: number }) => {
      if (error.cooldownMs) setCooldownMs(error.cooldownMs);
      if (typeof error.retryAfterMs === 'number') setCooldownUntil(Date.now() + error.retryAfterMs);
      setConnectionError(error.message ?? null);
    });

    nextSocket.on('chat:history', (history: any[]) => {
      setMessages(history.map((m, i) => toUiMessage(m, `history-${i}`)));
    });

    nextSocket.on('chat:newMessage', (m: any) => {
      setMessages((prev) => [...prev, toUiMessage(m, `new-${Date.now()}`)]);
      setConnectionError(null);
    });

    return () => nextSocket.disconnect();
  }, [token]);

  const sendMessage = (text: string) => {
    if (!socket || !socket.connected) {
      setConnectionError('Чат недоступен: нет соединения');
      return;
    }
    socket.emit('chat:send', { message: text });
    setCooldownUntil(Date.now() + cooldownMs);
  };

  const register = async () => {
    await api.post('/lobby/register');
    setIsRegistered(true);
  };

  return (
    <PcOnlyGuard>
      <GameLayoutDesktop
        leftTop={<LeftSidebarMyCard />}
        leftBottom={<LeftSidebarChat messages={messages} onSend={sendMessage} cooldownMs={cooldownMs} cooldownUntil={cooldownUntil} connectionError={connectionError} />}
        center={
          <CenterScene>
            <SceneView players={demoPlayers} layers={demoLayers} groundYPercent={74} />
            <HudOverlay phase="VOTE" timerSec={86} />
            {registrationOpen && !isRegistered && (
              <div className="absolute inset-0 z-20 grid place-items-center">
                <button className="btn-primary px-10 py-4 text-xl" onClick={register}>Зарегистрироваться</button>
              </div>
            )}
            {isRegistered && <p className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-4 py-2 text-sm">Вы зарегистрированы</p>}
          </CenterScene>
        }
        right={<RightSidebarPlayers players={demoPlayers} />}
      />
    </PcOnlyGuard>
  );
}
