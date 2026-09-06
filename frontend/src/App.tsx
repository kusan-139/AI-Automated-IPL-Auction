import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import PlayerAnalysis from './pages/PlayerAnalysis';
import TeamBuilder from './pages/TeamBuilder';
import AuctionRoom from './pages/AuctionRoom';
import Home from './pages/Home';
import Features from './pages/Features';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Simulations from './pages/Simulations';
import History from './pages/History';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/players" element={<PlayerAnalysis />} />
            <Route path="/team" element={<TeamBuilder />} />
            <Route path="/auction" element={<AuctionRoom />} />
            <Route path="/simulations" element={<Simulations />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
