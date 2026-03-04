import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
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

type ScenePreset = {
  id: string;
  apocalypseTypeId: string;
  bunkerLocationTypeId: string;
  groundYPercent: number;
  layers: SceneLayerUi[];
};

const normalizeAssetKey = (assetKey: string): string => {
  if (!assetKey) return assetKey;
  if (assetKey.startsWith('http://') || assetKey.startsWith('https://') || assetKey.startsWith('data:')) return assetKey;
  return assetKey.startsWith('/') ? assetKey : `/${assetKey}`;
};

const toUiMessage = (m: any, fallbackId: string): UiMessage => ({
  id: String(m.id ?? fallbackId),
  nick: m.user?.twitchNick ?? 'Игрок',
  text: m.message,
  time: new Date(m.createdAt ?? Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
});

const decodeRoleFromToken = (token: string | null): string | null => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
    const decoded = JSON.parse(window.atob(normalized));
    return typeof decoded.role === 'string' ? decoded.role : null;
  } catch {
    return null;
  }
};

export function LobbyPage() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [cooldownSeconds, setCooldownSeconds] = useState(2);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<UiPlayer[]>([]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [apocalypseTypes, setApocalypseTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [bunkerLocations, setBunkerLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [scenePresets, setScenePresets] = useState<ScenePreset[]>([]);
  const [startForm, setStartForm] = useState({
    playersLimit: '8',
    apocalypseTypeId: 'random',
    bunkerLocationTypeId: 'random',
    environment: 'random'
  });

  const isAdmin = useMemo(() => decodeRoleFromToken(token) === 'ADMIN', [token]);

  const refreshLobby = async () => {
    try {
      const { data } = await api.get('/lobby');
      const lobbyPlayers = Array.isArray(data?.players) ? data.players : [];
      setRegistrationOpen(Boolean(data?.isActive));
      setPlayers(
        lobbyPlayers.map((player: any, index: number) => ({
          id: String(player.id),
          number: index + 1,
          nick: player.user?.twitchNick ?? `Игрок ${index + 1}`,
          status: player.status,
          revealed: []
        }))
      );
    } catch {
      setRegistrationOpen(false);
      setPlayers([]);
    }
  };

  useEffect(() => {
    refreshLobby();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    Promise.all([
      api.get('/admin/pools/apocalypseTypes').then((res) => setApocalypseTypes(Array.isArray(res.data) ? res.data : [])).catch(() => setApocalypseTypes([])),
      api.get('/admin/pools/bunkerLocations').then((res) => setBunkerLocations(Array.isArray(res.data) ? res.data : [])).catch(() => setBunkerLocations([]))
    ]);
  }, [isAdmin]);

  useEffect(() => {
    api.get('/scene/presets')
      .then((res) => {
        const presets = Array.isArray(res.data) ? res.data : [];
        setScenePresets(
          presets.map((preset: any) => ({
            id: String(preset.id),
            apocalypseTypeId: String(preset.apocalypseTypeId ?? ''),
            bunkerLocationTypeId: String(preset.bunkerLocationTypeId ?? ''),
            groundYPercent: Number(preset.groundYPercent ?? 74),
            layers: Array.isArray(preset.layers)
              ? preset.layers.map((layer: any) => ({
                id: String(layer.id),
                kind: layer.kind,
                assetKey: normalizeAssetKey(String(layer.assetKey ?? '')),
                zIndex: Number(layer.zIndex ?? 0),
                offsetX: Number(layer.offsetX ?? 0),
                offsetY: Number(layer.offsetY ?? 0),
                scale: Number(layer.scale ?? 1),
                repeatX: Boolean(layer.repeatX)
              }))
              : []
          }))
        );
      })
      .catch(() => setScenePresets([]));
  }, []);

  const activeScenePreset = useMemo(() => {
    if (!scenePresets.length) return null;

    const apocalypseId = startForm.apocalypseTypeId;
    const locationId = startForm.bunkerLocationTypeId;

    const match = scenePresets.find((preset) => {
      const apocalypseMatches = apocalypseId === 'random' || preset.apocalypseTypeId === apocalypseId;
      const locationMatches = locationId === 'random' || preset.bunkerLocationTypeId === locationId;
      return apocalypseMatches && locationMatches;
    });

    return match ?? scenePresets[0];
  }, [scenePresets, startForm.apocalypseTypeId, startForm.bunkerLocationTypeId]);

  useEffect(() => {
    if (!token) {
      setConnectionError('Чат недоступен: войдите через Twitch');
      setSendError(null);
      return;
    }

    const nextSocket = io('/', { path: '/bunker/socket.io', auth: { token } });
    setSocket(nextSocket);

    nextSocket.on('connect', () => {
      setConnectionError(null);
      setSendError(null);
    });
    nextSocket.on('disconnect', () => setConnectionError('Чат недоступен: нет соединения'));
    nextSocket.on('connect_error', () => setConnectionError('Чат недоступен: нет соединения'));

    nextSocket.on('chat:config', (cfg: { cooldownSeconds: number }) => {
      setCooldownSeconds(cfg.cooldownSeconds || 2);
    });

    nextSocket.on('chat:error', (error: { message?: string; retryAfterSeconds?: number; cooldownSeconds?: number }) => {
      if (error.cooldownSeconds) setCooldownSeconds(error.cooldownSeconds);
      if (typeof error.retryAfterSeconds === 'number') {
        setCooldownUntil(Date.now() + error.retryAfterSeconds * 1000);
        setSendError(error.message ?? 'Подождите перед следующим сообщением');
        return;
      }
      if (error.message?.includes('соединения')) {
        setConnectionError(error.message);
        return;
      }
      setSendError(error.message ?? 'Не удалось отправить сообщение');
    });

    nextSocket.on('chat:history', (history: any[]) => {
      setMessages(history.map((m, i) => toUiMessage(m, `history-${i}`)));
    });

    nextSocket.on('chat:newMessage', (m: any) => {
      setMessages((prev) => [...prev, toUiMessage(m, `new-${Date.now()}`)]);
      setConnectionError(null);
      setSendError(null);
    });

    return () => {
      nextSocket.disconnect();
    };
  }, [token]);

  const sendMessage = (text: string) => {
    if (!socket || !socket.connected) {
      setConnectionError('Чат недоступен: нет соединения');
      return;
    }
    socket.emit('chat:send', { message: text });
    setSendError(null);
    setCooldownUntil(Date.now() + cooldownSeconds * 1000);
  };

  const register = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/lobby/register');
      setIsRegistered(true);
      await refreshLobby();
    } catch {
      navigate('/login');
    }
  };

  const createLobby = async () => {
    if (!token || !isAdmin) return;

    try {
      setStartError(null);
      await api.post('/lobby', {
        playersLimit: Number(startForm.playersLimit) || 8,
        apocalypseTypeId: startForm.apocalypseTypeId === 'random' ? undefined : startForm.apocalypseTypeId,
        bunkerLocationTypeId: startForm.bunkerLocationTypeId === 'random' ? undefined : startForm.bunkerLocationTypeId
      });

      setShowStartModal(false);
      await refreshLobby();
    } catch (error: any) {
      setStartError(error?.response?.data?.message ?? 'Не удалось создать лобби');
    }
  };

  return (
    <PcOnlyGuard>
      <GameLayoutDesktop
        leftTop={<LeftSidebarMyCard />}
        leftBottom={<LeftSidebarChat messages={messages} onSend={sendMessage} cooldownMs={cooldownSeconds * 1000} cooldownUntil={cooldownUntil} connectionError={connectionError} sendError={sendError} />}
        center={
          <CenterScene>
            <SceneView
              players={players}
              layers={activeScenePreset?.layers ?? []}
              groundYPercent={activeScenePreset?.groundYPercent ?? 74}
            />
            <HudOverlay phase="VOTE" timerSec={86} />
            {(isAdmin || registrationOpen) && !isRegistered && (
              <div className="absolute inset-0 z-20 grid place-items-center">
                <button className="btn-primary px-10 py-4 text-xl" onClick={isAdmin ? () => setShowStartModal(true) : register}>{isAdmin ? 'Начать игру' : 'Зарегистрироваться'}</button>
              </div>
            )}
            {isRegistered && <p className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-4 py-2 text-sm">Вы зарегистрированы</p>}
            {showStartModal && (
              <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 p-4">
                <div className="panel w-full max-w-xl space-y-3">
                  <h3 className="text-lg font-semibold">Параметры старта игры</h3>
                  <label className="field">
                    Количество игроков для старта
                    <input className="input" type="number" min={2} max={20} value={startForm.playersLimit} onChange={(e) => setStartForm((prev) => ({ ...prev, playersLimit: e.target.value }))} />
                  </label>
                  <label className="field">
                    Апокалипсис
                    <select className="input" value={startForm.apocalypseTypeId} onChange={(e) => setStartForm((prev) => ({ ...prev, apocalypseTypeId: e.target.value }))}>
                      <option value="random">Рандом</option>
                      {apocalypseTypes.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Расположение бункера
                    <select className="input" value={startForm.bunkerLocationTypeId} onChange={(e) => setStartForm((prev) => ({ ...prev, bunkerLocationTypeId: e.target.value }))}>
                      <option value="random">Рандом</option>
                      {bunkerLocations.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Окружение
                    <select className="input" value={startForm.environment} onChange={(e) => setStartForm((prev) => ({ ...prev, environment: e.target.value }))}>
                      <option value="random">Рандом</option>
                      <option value="acid-rain">Кислотные дожди</option>
                      <option value="extreme-cold">Экстремальный холод</option>
                    </select>
                  </label>
                  {startError && <p className="text-sm text-rose-300">{startError}</p>}
                  <div className="flex justify-end gap-2">
                    <button className="btn-secondary" onClick={() => setShowStartModal(false)}>Отмена</button>
                    <button className="btn-primary" onClick={createLobby}>Запустить</button>
                  </div>
                </div>
              </div>
            )}
          </CenterScene>
        }
        right={<RightSidebarPlayers players={players} isAdmin={isAdmin} />}
      />
    </PcOnlyGuard>
  );
}
