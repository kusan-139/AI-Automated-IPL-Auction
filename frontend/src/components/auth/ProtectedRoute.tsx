import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute: React.FC = () => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading Session...</div>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
