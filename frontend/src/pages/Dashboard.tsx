import { Activity, Shield, Users, Gavel, TrendingUp, Zap } from 'lucide-react';
import { useAuctionStore } from '../store/auctionStore';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts';

const timelineData = [
  { round: 'Set 1', bid: 15.5, maxEstimate: 16.2 },
  { round: 'Set 2', bid: 18.0, maxEstimate: 19.5 },
  { round: 'Set 3', bid: 12.5, maxEstimate: 14.0 },
  { round: 'Set 4', bid: 24.75, maxEstimate: 26.0 },
  { round: 'Set 5', bid: 8.2, maxEstimate: 9.5 },
  { round: 'Set 6', bid: 11.0, maxEstimate: 12.0 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { currentBudget, initialBudget, squad } = useAuctionStore();

  const spentCr = (initialBudget - currentBudget) / 10000000;
  const remainingCr = currentBudget / 10000000;
  const squadCount = squad.length;

  const batsmenCount = squad.filter(p => p.role === 'Batsman').length;
  const bowlersCount = squad.filter(p => p.role === 'Bowler').length;
  const allRoundersCount = squad.filter(p => p.role === 'All-Rounder').length;
  const keepersCount = squad.filter(p => p.role === 'Wicket-Keeper').length;

  const radarData = [
    { subject: 'Batting Depth', A: Math.min(100, batsmenCount * 25 + 20), fullMark: 100 },
    { subject: 'Pace Attack', A: Math.min(100, bowlersCount * 30 + 15), fullMark: 100 },
    { subject: 'Spin Depth', A: Math.min(100, bowlersCount * 20 + 25), fullMark: 100 },
    { subject: 'Finishers', A: Math.min(100, allRoundersCount * 35 + 10), fullMark: 100 },
    { subject: 'Keepers', A: Math.min(100, keepersCount * 50), fullMark: 100 },
    { subject: 'Experience', A: squadCount > 0 ? 82 : 40, fullMark: 100 },
  ];

  const pieData = [
    { name: 'Remaining Budget', value: parseFloat(remainingCr.toFixed(2)) },
    { name: 'Spent Budget', value: parseFloat(spentCr.toFixed(2)) }
  ];

  const teamStrengthScore = squadCount > 0 ? Math.min(98, 50 + squadCount * 4) : 0;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Remaining Budget" value={`₹${remainingCr.toFixed(2)} Cr`} icon={Activity} trend={`Spent: ₹${spentCr.toFixed(2)} Cr`} />
        <StatCard title="Squad Size" value={`${squadCount} / 25`} icon={Users} trend={squadCount >= 18 ? "Compliant (18+)" : `Need ${18 - squadCount} more`} />
        <StatCard title="AI Team Strength" value={teamStrengthScore > 0 ? `${teamStrengthScore} / 100` : "-- / 100"} icon={Shield} trend={teamStrengthScore > 75 ? "High Competitiveness" : "Building Squad"} />
        <StatCard title="Auction Status" value="LIVE" icon={Gavel} trend="Set 1 • Marquee Players" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 min-h-[400px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Live Bidding & AI Valuation Trajectory
              </h2>
              <p className="text-xs text-muted">Winning bids vs AI recommended maximum ceilings across sets</p>
            </div>
            <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full font-mono font-bold">Real-time Stream</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bidColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="maxColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="round" stroke="#6B7280" />
                <YAxis stroke="#6B7280" unit=" Cr" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#FFF' }} />
                <Area type="monotone" dataKey="bid" name="Winning Bid (₹ Cr)" stroke="#3B82F6" fillOpacity={1} fill="url(#bidColor)" />
                <Area type="monotone" dataKey="maxEstimate" name="AI Ceiling (₹ Cr)" stroke="#10B981" fillOpacity={1} fill="url(#maxColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-panel p-6 min-h-[400px] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-secondary" />
              Squad Role Strength Radar
            </h2>
            <p className="text-xs text-muted mb-4">Multi-dimensional balance analysis</p>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4B5563" />
                <Radar name="Role Balance" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h3 className="font-semibold mb-3">Budget Utilization</h3>
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono">₹{remainingCr.toFixed(0)}Cr</span>
              <span className="text-xs text-muted">Left</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 md:col-span-2">
          <h3 className="font-semibold mb-3">Role Composition Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <RoleCounter label="Batsmen" count={batsmenCount} min={5} color="bg-blue-500" />
            <RoleCounter label="Bowlers" count={bowlersCount} min={6} color="bg-emerald-500" />
            <RoleCounter label="All-Rounders" count={allRoundersCount} min={3} color="bg-amber-500" />
            <RoleCounter label="Keepers" count={keepersCount} min={2} color="bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <div className="glass-panel p-6 relative overflow-hidden group hover:border-primary/40 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="text-3xl font-bold mt-2 text-white font-mono">{value}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded text-xs font-medium">{trend}</span>
      </div>
    </div>
  );
}

function RoleCounter({ label, count, min, color }: { label: string, count: number, min: number, color: string }) {
  return (
    <div className="p-4 rounded-xl border border-white/5 bg-black/20 text-center">
      <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
      <div className="text-2xl font-bold font-mono">{count}</div>
      <div className="text-xs text-muted">{label}</div>
      <div className="text-[10px] text-white/50 mt-1">Min required: {min}</div>
    </div>
  );
}
