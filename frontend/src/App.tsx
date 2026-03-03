import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { LobbyPage } from './pages/LobbyPage';
import { CharacterPage } from './pages/CharacterPage';

export function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/bunker" element={<LobbyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/character" element={<CharacterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
