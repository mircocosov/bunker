import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { LobbyPage } from './pages/LobbyPage';

export function App() {
  const location = useLocation();
  const items = [
    { to: '/', label: 'Игра' },
    { to: '/login', label: 'Логин' },
    { to: '/admin', label: 'Админка' }
  ];

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] space-y-3 p-3 md:p-4">
      <header className="panel flex items-center justify-between">
        <h1 className="text-xl font-semibold">bunker</h1>
        <nav className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
          {items.map((item) => (
            <Link key={item.to} to={item.to} className={`rounded-lg px-3 py-1.5 text-sm ${location.pathname === item.to ? 'bg-white/20 text-white' : 'text-slate-300 hover:bg-white/10'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
