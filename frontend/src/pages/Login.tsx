import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, mfaStatus } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Redirect away if fully logged in and verified
    if (session && (mfaStatus === 'verified' || mfaStatus === 'unverified')) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [session, mfaStatus, navigate, location]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      }
      // If success, AuthProvider will trigger and handle MFA state
    }
    setLoading(false);
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const factors = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.data?.totp[0];
      
      if (!totpFactor) {
        throw new Error('No TOTP factor found.');
      }
      
      const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challenge.error) throw challenge.error;
      
      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: totpCode,
      });
      
      if (verify.error) throw verify.error;
      
      // On success, AuthProvider will re-evaluate mfaStatus and redirect
    } catch (err: any) {
      setError(err.message || 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (session && mfaStatus === 'pending') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">Two-Factor Authentication</h2>
          <p className="text-slate-400 text-sm mb-4 text-center">Enter the code from your authenticator app.</p>
          
          {error && (
            <div className="bg-coral-900/50 border border-coral-500 text-coral-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleMfaVerify} className="space-y-4">
            <div>
              <input 
                type="text" 
                required 
                value={totpCode}
                onChange={e => setTotpCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-center tracking-widest text-lg" 
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || totpCode.length < 6}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-900 font-bold py-2 px-4 rounded-md transition-colors mt-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">
          {isSignUp ? 'Create Executive Account' : 'Executive Login'}
        </h2>
        
        {error && (
          <div className="bg-coral-900/50 border border-coral-500 text-coral-300 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" 
              placeholder="executive@franchise.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" 
              placeholder="••••••••" 
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-900 font-bold py-2 px-4 rounded-md transition-colors mt-4 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center border-t border-slate-700 pt-4">
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            className="text-sm text-amber-500 hover:text-amber-400 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-400">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
