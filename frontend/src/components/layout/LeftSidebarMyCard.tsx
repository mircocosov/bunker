import { useState } from 'react';

type Field = { key: string; label: string; value: string; opened: boolean };

const initialFields: Field[] = [
  { key: 'genderAge', label: 'Пол + Возраст', value: 'Женщина, 29', opened: true },
  { key: 'profession', label: 'Профессия', value: 'Инженер-системотехник', opened: false },
  { key: 'health', label: 'Здоровье', value: 'Отличное', opened: false },
  { key: 'phobia', label: 'Фобия', value: 'Клаустрофобия', opened: false },
  { key: 'hobby', label: 'Хобби', value: 'Ремонт раций', opened: false },
  { key: 'fact', label: 'Факт', value: 'Победитель соревнований по выживанию', opened: false },
  { key: 'baggage', label: 'Багаж', value: 'Аптечка + мультитул', opened: false },
  { key: 'eventOne', label: 'Карточка события #1', value: 'Улучшение: +1 место в бункере', opened: false },
  { key: 'eventTwo', label: 'Карточка события #2', value: 'Улучшение: запас воды +20%', opened: false }
];

export function LeftSidebarMyCard() {
  const [fields, setFields] = useState(initialFields);

  const reveal = (key: string) => setFields((prev) => prev.map((field) => (field.key === key ? { ...field, opened: true } : field)));

  return (
    <section className="panel flex h-full min-h-0 flex-col p-2.5">
      <h3 className="text-sm font-semibold">Мой персонаж</h3>
      <div className="mt-1 rounded-lg border border-white/10 bg-black/30 p-1.5">
        <div className="mx-auto h-12 w-9 rounded border border-white/20 bg-gradient-to-b from-zinc-500 to-zinc-700" />
      </div>

      <h4 className="mt-2 text-sm font-semibold">Моя карточка</h4>
      <div className="custom-scrollbar mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {fields.map((field) => (
          <div key={field.key} className="rounded-lg border border-white/10 bg-white/5 p-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] text-[var(--text-muted)]">{field.label}</p>
                <p className="text-[11px] leading-tight">{field.opened ? field.value : 'Скрыто'}</p>
              </div>
              {!field.opened && (
                <button className="btn-secondary px-1.5 py-0.5 text-[10px]" onClick={() => reveal(field.key)}>
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
