import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../auth/AuthProvider';
import { useAuctionStore } from '../../store/auctionStore';

export default function DashboardLayout() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const fetchInitialData = useAuctionStore(state => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 glass-panel border-b border-white/5 border-l-0 rounded-none flex items-center px-6 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-white">IPL AI Mastermind</h1>
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-muted">Budget: <span className="text-secondary font-mono">₹100 Cr</span></div>
            
            <div className="relative group">
              <button className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-bold hover:bg-primary/30 transition-colors">
                {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-sm text-white font-medium truncate">{session?.user?.email}</p>
                </div>
                <Link to="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  My Profile
                </Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  Settings
                </Link>
                <button 
                  onClick={async () => { await signOut(); navigate('/login'); }}
                  className="w-full text-left px-4 py-2 text-sm text-coral-400 hover:bg-slate-700 hover:text-coral-300 transition-colors border-t border-slate-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
