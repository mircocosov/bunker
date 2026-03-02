import { useState } from 'react';

type Field = { key: string; label: string; value: string; opened: boolean };

const initialFields: Field[] = [
  { key: 'genderAge', label: 'Пол + Возраст', value: 'Женщина, 29', opened: true },
  { key: 'profession', label: 'Профессия', value: 'Инженер-системотехник', opened: false },
  { key: 'health', label: 'Здоровье', value: 'Отличное', opened: false },
  { key: 'hobby', label: 'Хобби', value: 'Ремонт раций', opened: false },
  { key: 'fact', label: 'Факт', value: 'Победитель соревнований по выживанию', opened: false }
];

export function LeftSidebarMyCard() {
  const [fields, setFields] = useState(initialFields);

  const reveal = (key: string) => setFields((prev) => prev.map((field) => (field.key === key ? { ...field, opened: true } : field)));

  return (
    <section className="panel flex h-full min-h-0 flex-col">
      <h3 className="text-lg font-semibold">Мой персонаж</h3>
      <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="mx-auto h-24 w-16 rounded-md border border-white/20 bg-gradient-to-b from-zinc-500 to-zinc-700" />
      </div>

      <h4 className="mt-3 font-semibold">Моя карточка</h4>
      <div className="mt-2 flex-1 space-y-2 overflow-y-auto pr-1">
        {fields.map((field) => (
          <div key={field.key} className="rounded-xl border border-white/10 bg-white/5 p-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-[var(--text-muted)]">{field.label}</p>
                <p className="text-sm">{field.opened ? field.value : 'Скрыто'}</p>
              </div>
              {!field.opened && (
                <button className="btn-secondary px-2 py-1 text-xs" onClick={() => reveal(field.key)}>
                  Открыть
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
