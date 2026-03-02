import { useMemo, useState } from 'react';
import { api } from '../api/client';
import { AdminShell } from '../components/layout/AdminShell';
import { SceneView } from '../components/game/SceneView';
import { SceneLayerUi } from '../types/ui';

export function AdminPage() {
  const [playersLimit, setPlayersLimit] = useState(8);
  const [voteTimerSec, setVoteTimerSec] = useState(45);
  const [revealTimerSec, setRevealTimerSec] = useState(25);
  const [initialRevealedCount, setInitialRevealedCount] = useState(1);

  const createLobby = async () => {
    await api.post('/lobby', { playersLimit, voteTimerSec, revealTimerSec, initialRevealedCount });
    alert('Лобби создано');
  };

  const content = useMemo(
    () => ({
      lobby: (
        <div className="space-y-3">
          <h1 className="text-xl font-semibold">Создание лобби</h1>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <label className="field">Лимит игроков <input className="input" type="number" value={playersLimit} onChange={(e) => setPlayersLimit(Number(e.target.value))} /></label>
            <label className="field">Таймер голосования <input className="input" type="number" value={voteTimerSec} onChange={(e) => setVoteTimerSec(Number(e.target.value))} /></label>
            <label className="field">Таймер открытия <input className="input" type="number" value={revealTimerSec} onChange={(e) => setRevealTimerSec(Number(e.target.value))} /></label>
            <label className="field">Открыто с начала <input className="input" type="number" min={1} max={3} value={initialRevealedCount} onChange={(e) => setInitialRevealedCount(Number(e.target.value))} /></label>
          </div>
          <button className="btn-primary" onClick={createLobby}>Создать лобби</button>
        </div>
      ),
      control: <Section title="Управление игрой" desc="Kick игроков, ручной переход фаз и синхронизация таймеров." />,
      pools: <Section title="Пулы характеристик" desc="Профессии, фобии, хобби, багаж, факты, здоровье." />,
      actions: <Section title="Карты действия" desc="Настройка карт: тип, цель, текст улучшения." />,
      scene: <SceneEditor />,
      filter: <Section title="Чат-фильтр" desc="Добавляйте и удаляйте запрещённые слова." />,
      bans: <Section title="Баны" desc="Поиск по нику, разбан, история блокировок." />
    }),
    [playersLimit, voteTimerSec, revealTimerSec, initialRevealedCount]
  );

  return <AdminShell content={content} />;
}

function Section({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-[var(--text-muted)]">{desc}</p>
    </div>
  );
}

function SceneEditor() {
  const [saving, setSaving] = useState(false);
  const [layers, setLayers] = useState<SceneLayerUi[]>([
    { id: 'sky', kind: 'SKY', assetKey: '/assets/scenes/sky.png', zIndex: 1 },
    { id: 'mid', kind: 'MID', assetKey: '/assets/scenes/sky.png', zIndex: 2, offsetY: 20 },
    { id: 'ground', kind: 'GROUND', assetKey: '/assets/scenes/ground.png', zIndex: 3 }
  ]);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...layers];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setLayers(next.map((layer, i) => ({ ...layer, zIndex: i + 1 })));
  };

  const updateLayer = (id: string, patch: Partial<SceneLayerUi>) => {
    setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
  };

  const save = async () => {
    try {
      setSaving(true);
      await api.post('/scene/presets', {
        apocalypseTypeId: 'demo-apocalypse',
        bunkerLocationTypeId: 'demo-location',
        groundYPercent: 74,
        layers: layers.map((layer) => ({
          kind: layer.kind,
          assetKey: layer.assetKey,
          zIndex: layer.zIndex,
          offsetX: layer.offsetX ?? 0,
          offsetY: layer.offsetY ?? 0,
          scale: layer.scale ?? 1,
          repeatX: layer.repeatX ?? false
        }))
      });
      alert('Сцена сохранена на бэкенд');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Редактор сцены</h1>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
        <p className="mb-2 text-sm text-[var(--text-muted)]">Предпросмотр реальной сцены</p>
        <div className="h-44 overflow-hidden rounded-xl border border-white/10">
          <SceneView players={[]} layers={layers} groundYPercent={74} />
        </div>
      </div>
      <div className="grid gap-2">
        {layers.map((layer, i) => (
          <div key={layer.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10">
            <span className="w-28 text-sm">{layer.kind} · z:{layer.zIndex}</span>
            <input className="input flex-1" value={layer.assetKey} onChange={(e) => updateLayer(layer.id, { assetKey: e.target.value })} placeholder="assetKey" />
            <button className="btn-secondary" onClick={() => move(i, -1)}>↑</button>
            <button className="btn-secondary" onClick={() => move(i, 1)}>↓</button>
          </div>
        ))}
      </div>
      <button className="btn-primary" disabled={saving} onClick={save}>{saving ? 'Сохранение...' : 'Сохранить порядок и z-index'}</button>
    </div>
  );
}
