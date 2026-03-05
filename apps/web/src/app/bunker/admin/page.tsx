import Link from 'next/link';

const tabs = [
  'Характеристики',
  'Карты действий',
  'Сцены',
  'Фильтр чата',
  'Черный список',
  'Настройки',
  'Игра',
];

export default function BunkerAdminPage() {
  return (
    <main>
      <header>
        <h1>Bunker Admin</h1>
        <p>Универсальная админ-панель управления контентом и параметрами игры.</p>
        <Link href="/bunker">Играть</Link>
      </header>

      <nav aria-label="Admin tabs">
        <ul>
          {tabs.map((tab) => (
            <li key={tab}>{tab}</li>
          ))}
        </ul>
      </nav>

      <section>
        <h2>Быстрые действия</h2>
        <p>Создайте комнату в разделе «Игра», задайте сцену и дождитесь регистрации N игроков.</p>
      </section>
    </main>
  );
}
