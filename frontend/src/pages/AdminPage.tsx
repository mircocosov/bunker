import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { AdminShell } from '../components/layout/AdminShell';

type CrudItem = Record<string, any> & { id: string };

type PoolConfig = { key: string; label: string; fields: string[] };

const poolConfigs: PoolConfig[] = [
  { key: 'professions', label: 'Профессии', fields: ['value'] },
  { key: 'phobias', label: 'Фобии', fields: ['value'] },
  { key: 'hobbies', label: 'Хобби', fields: ['value'] },
  { key: 'luggage', label: 'Багаж', fields: ['value'] },
  { key: 'facts', label: 'Факты', fields: ['value'] },
  { key: 'health', label: 'Здоровье', fields: ['value', 'severity'] },
  { key: 'actionCards', label: 'Карты', fields: ['type', 'targetField', 'upgradeText'] },
  { key: 'apocalypseTypes', label: 'Сцены: апокалипсис', fields: ['name'] },
  { key: 'bunkerLocations', label: 'Сцены: локации', fields: ['name'] }
];

export function AdminPage() {
  const [activePool, setActivePool] = useState(poolConfigs[0]);

  const content = useMemo(
    () => ({
      lobby: <div><h1 className="text-xl font-semibold">Создание лобби</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Настройки лобби оставлены без изменений.</p></div>,
      control: <div><h1 className="text-xl font-semibold">Управление игрой</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Kick игроков и переход фаз доступны через API.</p></div>,
      pools: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {poolConfigs.map((pool) => (
              <button key={pool.key} className={`btn-secondary ${activePool.key === pool.key ? '!border-[var(--accent-cold)]' : ''}`} onClick={() => setActivePool(pool)}>{pool.label}</button>
            ))}
          </div>
          <CrudSection title={activePool.label} endpoint={`/admin/pools/${activePool.key}`} fields={activePool.fields} />
        </div>
      ),
      actions: <CrudSection title="Карты действия" endpoint="/admin/pools/actionCards" fields={['type', 'targetField', 'upgradeText']} />,
      scene: <CrudSection title="Сцены (типы апокалипсиса)" endpoint="/admin/pools/apocalypseTypes" fields={['name']} />,
      filter: <CrudSection title="Запретные слова" endpoint="/admin/chat-filter" fields={['word']} />,
      bans: <BansSection />
    }),
    [activePool]
  );

  return <AdminShell content={content as any} />;
}

function BansSection() {
  return <CrudSection title="Разбан игроков" endpoint="/admin/bans" fields={['twitchNick']} deleteById onlyDelete />;
}

function CrudSection({ title, endpoint, fields, deleteById = false, onlyDelete = false }: { title: string; endpoint: string; fields: string[]; deleteById?: boolean; onlyDelete?: boolean }) {
  const [items, setItems] = useState<CrudItem[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<CrudItem | null>(null);

  const load = async () => {
    const { data } = await api.get(endpoint);
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, [endpoint]);

  const submit = async () => {
    if (editing) {
      await api.patch(`${endpoint}/${editing.id}`, form);
      setEditing(null);
    } else {
      await api.post(endpoint, form);
    }
    setForm({});
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm('Удалить запись?')) return;
    await api.delete(`${endpoint}/${id}`);
    await load();
  };

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{title}</h1>
      {!onlyDelete && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="grid gap-2 md:grid-cols-3">
            {fields.map((field) => (
              <input key={field} className="input" placeholder={field} value={form[field] ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))} />
            ))}
          </div>
          <button className="btn-primary mt-3" onClick={submit}>{editing ? 'Сохранить' : 'Добавить'}</button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
            <div className="flex-1 text-sm">{fields.map((f) => `${f}: ${item[f] ?? '-'}`).join(' · ')}</div>
            {!onlyDelete && <button className="btn-secondary" onClick={() => { setEditing(item); setForm(Object.fromEntries(fields.map((f) => [f, item[f] ?? '']))); }}>Редактировать</button>}
            <button className="btn-secondary" onClick={() => remove(item.id)}>{deleteById ? 'Разбанить' : 'Удалить'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
