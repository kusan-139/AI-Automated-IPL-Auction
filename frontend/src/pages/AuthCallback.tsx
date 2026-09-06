import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This will handle the Supabase session token from the URL in Phase 2.
    // For now, redirect to dashboard.
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-slate-400">Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
