import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { AdminSection, AdminShell } from '../components/layout/AdminShell';

type CrudItem = Record<string, any> & { id: string };

type PoolConfig = { key: string; label: string; fields: string[] };

const statPools: PoolConfig[] = [
  { key: 'professions', label: 'Профессии', fields: ['value'] },
  { key: 'phobias', label: 'Фобии', fields: ['value'] },
  { key: 'hobbies', label: 'Хобби', fields: ['value'] },
  { key: 'luggage', label: 'Багаж', fields: ['value'] },
  { key: 'facts', label: 'Факты', fields: ['value'] },
  { key: 'health', label: 'Здоровье', fields: ['value', 'severity'] }
];

export function AdminPage() {
  const [activePool, setActivePool] = useState(statPools[0]);

  const content = useMemo<Record<AdminSection, JSX.Element>>(
    () => ({
      stats: (
        <div className="space-y-3">
          <h1 className="text-xl font-semibold">Характеристики</h1>
          <div className="flex flex-wrap gap-2">
            {statPools.map((pool) => (
              <button key={pool.key} className={`btn-secondary ${activePool.key === pool.key ? '!border-[var(--accent-cold)]' : ''}`} onClick={() => setActivePool(pool)}>{pool.label}</button>
            ))}
          </div>
          <CrudSection title={activePool.label} endpoint={`/admin/pools/${activePool.key}`} fields={activePool.fields} />
        </div>
      ),
      cards: <CrudSection title="Карты действий" endpoint="/admin/pools/actionCards" fields={['type', 'targetField', 'upgradeText']} />,
      scenes: (
        <div className="space-y-4">
          <CrudSection title="Апокалипсис" endpoint="/admin/pools/apocalypseTypes" fields={['name']} />
          <CrudSection title="Расположение бункера" endpoint="/admin/pools/bunkerLocations" fields={['name']} />
        </div>
      ),
      filter: <CrudSection title="Фильтр-чата" endpoint="/admin/chat-filter" fields={['word']} />,
      blacklist: <CrudSection title="Черный список" endpoint="/admin/bans" fields={['twitchNick']} deleteById onlyDelete />,
      game: <GameAdminSection />
    }),
    [activePool]
  );

  return <AdminShell content={content} />;
}

function GameAdminSection() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Игра</h1>
      <p className="text-sm text-[var(--text-muted)]">Раздел для управления игрой. Создание лобби и старт матча доступны на главной странице в кнопке «Начать игру» для админа.</p>
    </div>
  );
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
      <h2 className="text-lg font-semibold">{title}</h2>
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

