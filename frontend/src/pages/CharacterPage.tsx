import { useNavigate } from 'react-router-dom';

export function CharacterPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-4">
      <section className="panel w-full max-w-2xl space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Персонаж</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Здесь будет страница стилизации вашего игрока. Реализацию добавим на следующем этапе.
        </p>
        <div className="flex justify-center">
          <button className="btn-secondary" onClick={() => navigate('/bunker')}>
            Назад в игру
          </button>
        </div>
      </section>
    </div>
  );
}
