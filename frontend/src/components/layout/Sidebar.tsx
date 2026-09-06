import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Gavel, Settings, Activity } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/players', label: 'Player Analysis', icon: Users },
  { path: '/team', label: 'Team Builder', icon: Shield },
  { path: '/auction', label: 'Live Auction', icon: Gavel },
  { path: '/simulations', label: 'Simulations', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="w-64 h-full glass-panel border-r border-white/5 rounded-none flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-bold text-white">AI</span>
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            AuctionMaster
          </span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
        <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">AI Status</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-sm text-white/90">Models Online</span>
        </div>
      </div>
    </div>
  );
}
