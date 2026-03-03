import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { AdminSection, AdminShell } from '../components/layout/AdminShell';

type CrudItem = Record<string, any> & { id: string };

type FieldConfig = {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'checkbox';
  options?: { value: string; label: string }[];
};

type PoolConfig = { key: string; label: string; fields: FieldConfig[] };

const statPools: PoolConfig[] = [
  { key: 'professions', label: 'Профессии', fields: [{ key: 'value', label: 'Значение' }] },
  { key: 'phobias', label: 'Фобии', fields: [{ key: 'value', label: 'Значение' }] },
  { key: 'hobbies', label: 'Хобби', fields: [{ key: 'value', label: 'Значение' }] },
  { key: 'luggage', label: 'Багаж', fields: [{ key: 'value', label: 'Значение' }] },
  { key: 'facts', label: 'Факты', fields: [{ key: 'value', label: 'Значение' }] },
  {
    key: 'health',
    label: 'Здоровье',
    fields: [
      { key: 'value', label: 'Описание' },
      { key: 'severity', label: 'Тяжёлое состояние', type: 'checkbox' }
    ]
  }
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
      cards: (
        <CrudSection
          title="Карты действий"
          endpoint="/admin/pools/actionCards"
          fields={[
            {
              key: 'type',
              label: 'Тип карты',
              type: 'select',
              options: [
                { value: 'replace', label: 'Заменить' },
                { value: 'upgrade', label: 'Улучшение' },
                { value: 'take', label: 'Забрать' }
              ]
            },
            {
              key: 'changeField',
              label: 'Что меняем',
              type: 'select',
              options: [
                { value: 'professions', label: 'Профессии' },
                { value: 'phobias', label: 'Фобии' },
                { value: 'hobbies', label: 'Хобби' },
                { value: 'luggage', label: 'Багаж' },
                { value: 'facts', label: 'Факты' },
                { value: 'health', label: 'Здоровье' }
              ]
            },
            {
              key: 'targetField',
              label: 'Область действия',
              type: 'select',
              options: [
                { value: 'all', label: 'Всем' },
                { value: 'revealed', label: 'Открытым' },
                { value: 'bunker', label: 'Бункер' }
              ]
            },
            { key: 'upgradeText', label: 'Описание карточки' }
          ]}
        />
      ),
      scenes: (
        <div className="space-y-4">
          <SceneSection title="Апокалипсис" endpoint="/admin/pools/apocalypseTypes" />
          <SceneSection title="Расположение бункера" endpoint="/admin/pools/bunkerLocations" />
        </div>
      ),
      filter: <CrudSection title="Фильтр чата" endpoint="/admin/chat-filter" fields={[{ key: 'word', label: 'Слово' }]} />,
      blacklist: <CrudSection title="Черный список" endpoint="/admin/bans" fields={[{ key: 'twitchNick', label: 'Ник' }]} deleteById onlyDelete />,
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

function SceneSection({ title, endpoint }: { title: string; endpoint: string }) {
  const [items, setItems] = useState<CrudItem[]>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [newName, setNewName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    const { data } = await api.get(endpoint);
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, [endpoint]);

  const addImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setError(null);
  };

  const submit = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedValue) {
      setError('Выберите сцену или пункт «добавить».');
      return;
    }

    if (selectedValue === '__add__' && !newName.trim()) {
      setError('Введите название новой сцены.');
      return;
    }

    if (!imageFile) {
      setError('Добавьте картинку для сцены.');
      return;
    }

    if (selectedValue === '__add__') {
      await api.post(endpoint, { name: newName.trim() });
      setNewName('');
      await load();
      setSelectedValue('');
    }

    setImageFile(null);
    setSuccess('Поля заполнены. Загрузка картинки будет подключена на следующем этапе.');
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-start">
        <div className="space-y-2">
          <select className="input" value={selectedValue} onChange={(e) => { setSelectedValue(e.target.value); setError(null); }}>
            <option value="">Выберите сцену</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name ?? item.value ?? item.id}</option>
            ))}
            <option value="__add__">Добавить</option>
          </select>

          {selectedValue === '__add__' && (
            <input className="input" placeholder="Введите название" value={newName} onChange={(e) => { setNewName(e.target.value); setError(null); }} />
          )}
        </div>

        <label className="btn-secondary inline-flex cursor-pointer items-center justify-center">
          Добавить картинку
          <input className="hidden" type="file" accept="image/*" onChange={addImage} />
        </label>
      </div>

      {imageFile && <p className="text-xs text-[var(--text-muted)]">Выбрано: {imageFile.name}</p>}
      {error && <p className="text-xs text-rose-300">{error}</p>}
      {success && <p className="text-xs text-emerald-300">{success}</p>}

      <button className="btn-primary" onClick={submit}>Сохранить</button>
    </div>
  );
}

function CrudSection({ title, endpoint, fields, deleteById = false, onlyDelete = false }: { title: string; endpoint: string; fields: FieldConfig[]; deleteById?: boolean; onlyDelete?: boolean }) {
  const [items, setItems] = useState<CrudItem[]>([]);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
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
              <label key={field.key} className="field">
                {field.label}
                {field.type === 'select' ? (
                  <select className="input" value={String(form[field.key] ?? '')} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}>
                    <option value="">Выберите значение</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <input type="checkbox" className="h-4 w-4 accent-[var(--accent-cold)]" checked={Boolean(form[field.key])} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.checked }))} />
                ) : (
                  <input className="input" placeholder={field.label} value={String(form[field.key] ?? '')} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} />
                )}
              </label>
            ))}
          </div>
          <button className="btn-primary mt-3" onClick={submit}>{editing ? 'Сохранить' : 'Добавить'}</button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
            <div className="flex-1 text-sm">{fields.map((f) => `${f.label}: ${String(item[f.key] ?? '-')}`).join(' · ')}</div>
            {!onlyDelete && <button className="btn-secondary" onClick={() => { setEditing(item); setForm(Object.fromEntries(fields.map((f) => [f.key, item[f.key] ?? (f.type === 'checkbox' ? false : '')]))); }}>Редактировать</button>}
            <button className="btn-secondary" onClick={() => remove(item.id)}>{deleteById ? 'Разбанить' : 'Удалить'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
