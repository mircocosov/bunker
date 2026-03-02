import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';
import { AppShell } from '../components/layout/AppShell';
import { RightPanel } from '../components/layout/RightPanel';
import { MobileBottomSheet } from '../components/layout/MobileBottomSheet';
import { ChatPanel } from '../components/panels/ChatPanel';
import { PlayersPanel } from '../components/panels/PlayersPanel';
import { SceneView } from '../components/game/SceneView';
import { HudOverlay } from '../components/game/HudOverlay';
import { SceneLayerUi, UiMessage, UiPlayer } from '../types/ui';

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

function getMode(width: number): 'DESKTOP_SPLIT' | 'TABLET_TABS' | 'MOBILE_SHEET' {
  if (width >= 1024) return 'DESKTOP_SPLIT';
  if (width >= 768) return 'TABLET_TABS';
  return 'MOBILE_SHEET';
}

export function LobbyPage() {
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [mode, setMode] = useState(getMode(window.innerWidth));
  const [showGroundLine, setShowGroundLine] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const onResize = () => setMode(getMode(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!token) return;
    const socket = io('/', { path: '/bunker/socket.io', auth: { token } });
    socketRef.current = socket;

    socket.on('chat:history', (history: any[]) => {
      setMessages(history.map((m, i) => ({ id: String(m.id ?? i), nick: m.user?.twitchNick ?? 'Игрок', text: m.message, time: new Date(m.createdAt ?? Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) })));
    });

    socket.on('chat:newMessage', (m: any) => {
      setMessages((prev) => [...prev, { id: String(m.id ?? Date.now()), nick: m.user?.twitchNick ?? 'Игрок', text: m.message, time: new Date(m.createdAt ?? Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }]);
    });

    return () => socket.disconnect();
  }, [token]);

  const sendMessage = (text: string) => {
    socketRef.current?.emit('chat:send', { message: text });
    if (!token) {
      setMessages((prev) => [...prev, { id: String(Date.now()), nick: 'Вы', text, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  const chat = <ChatPanel messages={messages} onSend={sendMessage} />;
  const players = <PlayersPanel players={demoPlayers} votingEnabled />;
  const profile = useMemo(() => <div className="panel h-full"><h3 className="font-semibold">Мой профиль</h3><p className="mt-2 text-sm text-[var(--text-muted)]">Кастомизация персонажа и статистика появятся здесь.</p></div>, []);

  return (
    <AppShell
      mode={mode}
      visual={
        <>
          {import.meta.env.DEV && (
            <button className="absolute left-3 top-3 z-20 rounded-lg border border-lime-300/30 bg-lime-500/10 px-2 py-1 text-xs text-lime-100" onClick={() => setShowGroundLine((v) => !v)}>
              {showGroundLine ? 'Hide ground line' : 'Show ground line'}
            </button>
          )}
          <SceneView players={demoPlayers} layers={demoLayers} groundYPercent={74} showGroundLine={showGroundLine} />
          <HudOverlay phase="VOTE" timerSec={86} />
        </>
      }
      rightPanel={<RightPanel chat={chat} players={players} />}
      mobilePanel={<MobileBottomSheet chat={chat} players={players} profile={profile} />}
    />
  );
}
