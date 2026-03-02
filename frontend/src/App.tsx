import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { LobbyPage } from './pages/LobbyPage';

export function App() {
  const location = useLocation();

  if (location.pathname === '/') {
    return <LobbyPage />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] space-y-3 p-3 md:p-4">
      <header className="panel flex items-center justify-between">
        <h1 className="text-xl font-semibold">bunker</h1>
        <nav className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
          <Link to="/" className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10">Игра</Link>
          <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10">Логин</Link>
          <Link to="/admin" className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10">Админка</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
