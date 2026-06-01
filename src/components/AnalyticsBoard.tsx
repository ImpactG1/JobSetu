import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie
} from 'recharts';
import { BarChart3, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Layers, Target } from 'lucide-react';

export const AnalyticsBoard: React.FC = () => {
  // Mock analytics datasets
  const pipelineTrends = [
    { name: 'Jan', Candidates: 32, Interviews: 18, Offers: 4 },
    { name: 'Feb', Candidates: 45, Interviews: 22, Offers: 6 },
    { name: 'Mar', Candidates: 58, Interviews: 31, Offers: 9 },
    { name: 'Apr', Candidates: 75, Interviews: 42, Offers: 12 },
    { name: 'May', Candidates: 94, Interviews: 56, Offers: 18 },
  ];

  const categoryDistribution = [
    { name: 'Engineering', count: 48, fill: '#1f2937' },
    { name: 'Product', count: 32, fill: '#4b5563' },
    { name: 'Design', count: 25, fill: '#6b7280' },
    { name: 'Marketing', count: 18, fill: '#9ca3af' },
    { name: 'Finance', count: 12, fill: '#d1d5db' },
  ];

  // Pipeline funnel stages count
  const funnelStages = [
    { stage: 'Referred', headcount: 52, pct: '100%', detail: 'Global coordinates referrals' },
    { stage: 'Screening', headcount: 38, pct: '73%', detail: 'Qualified HR consultations' },
    { stage: 'Interviewing', headcount: 18, pct: '34%', detail: 'Board and strategic panels' },
    { stage: 'Hired', headcount: 8, pct: '15%', detail: 'Corporate placement issues' }
  ];

  const stats = [
    { title: 'Source Velocity', value: '14.2 Days', change: '-4.6 Days', isPositive: true, desc: 'Average days to place' },
    { title: 'Interviews Scheduled', value: '118 Total', change: '+24%', isPositive: true, desc: 'Total sessions run this month' },
    { title: 'Acceptance Rate', value: '88.5%', change: 'Stable', isPositive: true, desc: 'Sent-to-signed ratio rate' },
    { title: 'Sourcing Savings', value: '$84,000', change: '+$14.2k Saved', isPositive: true, desc: 'Ref-engine calculated yield' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow hover:border-neutral-300 transition-colors">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-50">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{stat.title}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                stat.change === 'Stable' 
                  ? 'bg-neutral-100 text-neutral-500' 
                  : stat.isPositive 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-rose-50 text-rose-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="space-y-0.5">
              <h3 className="font-serif-display text-xl font-bold text-neutral-900">{stat.value}</h3>
              <p className="text-[11px] text-neutral-400 font-sans">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Stats Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trend Area Chart (Span 8) */}
        <div className="lg:col-span-8 bg-white border border-[#ecebe6] rounded-2xl p-6 elite-card-shadow space-y-4">
          <div>
            <h3 className="font-serif-display text-base font-bold text-neutral-900 uppercase">Sourcing Velocity Trend</h3>
            <p className="text-xs text-neutral-400 font-medium">Pipeline execution activity velocity over five business periods</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="Candidates" stroke="#1a1a1a" strokeWidth={2} fillOpacity={1} fill="url(#colorCandidates)" />
                <Area type="monotone" dataKey="Interviews" stroke="#4f46e5" strokeWidth={1.5} fillOpacity={1} fill="url(#colorInterviews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution chart (Span 4) */}
        <div className="lg:col-span-4 bg-white border border-[#ecebe6] rounded-2xl p-6 elite-card-shadow space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif-display text-base font-bold text-neutral-900 uppercase">Specialty Distribution</h3>
            <p className="text-xs text-neutral-400 font-medium">Active referred candidate counts sorted by operational track</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#1a1a1a" fontSize={10} tickLine={false} width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-neutral-400 text-center uppercase tracking-wider font-mono">
            Engineering retains primary coordination volumes.
          </div>
        </div>
      </div>

      {/* Conversion Funnel Section */}
      <div className="bg-white border border-[#ecebe6] rounded-2xl p-6 elite-card-shadow space-y-6">
        <div>
          <h3 className="font-serif-display text-lg font-bold text-neutral-900 uppercase">Executive Recruitment Funnel</h3>
          <p className="text-xs text-neutral-400 font-medium">Placement conversion efficiency mapping referred coordinates down to closed hired placements.</p>
        </div>

        {/* Funnel Layout Block */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {funnelStages.map((stage, idx) => (
              <div 
                key={idx} 
                className="bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-xl p-4 space-y-2 relative transition group"
              >
                {/* Decorative numeric indicator */}
                <span className="absolute top-4 right-4 text-xs font-mono font-bold text-neutral-300 group-hover:text-neutral-500 transition">
                  0{idx + 1}
                </span>

                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                  {stage.stage}
                </span>

                <div className="flex items-baseline space-x-2">
                  <h4 className="text-2xl font-serif-display font-medium text-neutral-950">
                    {stage.headcount}
                  </h4>
                  <span className="text-xs text-indigo-600 font-mono font-bold">({stage.pct})</span>
                </div>

                <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
                  {stage.detail}
                </p>

                {/* Horizontal funnel-line progress display helper */}
                <div className="h-1 bg-neutral-200 rounded-full overflow-hidden mt-2 w-full">
                  <div 
                    className="h-full bg-neutral-900 rounded-full" 
                    style={{ width: stage.pct }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/40 p-4 border border-amber-100/50 rounded-xl text-xs text-amber-900/90 flex gap-2 items-start mt-2">
            <Target className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Target Conversion Benchmark Matrix</span>
              <p className="leading-relaxed font-light">
                Elite HR averages a **15.3% referral-to-hire ratio**, outperforming typical SaaS industry benchmarks by +6.2%. Optimize coordinates settings in settings parameters to scale funnel thresholds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
