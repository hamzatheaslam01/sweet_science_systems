import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FighterProfilePage from './pages/FighterProfilePage';
import AttendancePage from './pages/AttendancePage';
import PerformancePage from './pages/PerformancePage';
import AiCoachPage from './pages/AiCoachPage';
import ReportPage from './pages/ReportPage';
import { getToken } from './utils/api';

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/fighter-profile" element={<ProtectedRoute><FighterProfilePage /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
        <Route path="/ai-coach" element={<ProtectedRoute><AiCoachPage /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
