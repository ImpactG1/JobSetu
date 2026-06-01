import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MapPin, 
  DollarSign, 
  Clock, 
  Mail, 
  Users, 
  Layers, 
  TrendingUp, 
  Star,
  ChevronRight,
  AlertCircle,
  Award
} from 'lucide-react';
import { 
  UserProfile, 
  MetricCard, 
  TimelineItem, 
  SavedJob, 
  FollowUpReminder, 
  TrendingOpportunity,
  ReferralOpportunity 
} from '../types';

interface HomeDashboardProps {
  currentProfile: UserProfile;
  kpis: MetricCard[];
  timeline: TimelineItem[];
  savedJobs: SavedJob[];
  reminders: FollowUpReminder[];
  trending: TrendingOpportunity[];
  onToggleFavoriteTrend: (id: string) => void;
  onNavigateToTab: (tab: 'discovery' | 'inbox' | 'referrals') => void;
  onReferCandidate: (title: string, company: string) => void;
  searchQuery: string;
  realReferrals?: ReferralOpportunity[];
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentProfile,
  kpis,
  timeline,
  savedJobs,
  reminders,
  trending,
  onToggleFavoriteTrend,
  onNavigateToTab,
  onReferCandidate,
  searchQuery,
  realReferrals = []
}) => {

  // Search filter
  const filteredTrending = trending.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getKPIIcon = (iconName: string) => {
    switch (iconName) {
      case 'forward_to_inbox': return Mail;
      case 'group_add': return Users;
      case 'analytics': return Layers;
      default: return TrendingUp;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141414] text-white rounded-2xl p-8 relative overflow-hidden elite-card-shadow">
        {/* Absolute design accent overlay */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="space-y-2 relative z-10 max-w-2xl">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold bg-white/10 px-2.5 py-1 rounded">
            PORTAL OVERVIEW
          </span>
          <h2 className="font-serif-display text-4xl font-bold tracking-tight">
            Elevating Human Capital Strategy
          </h2>
          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            Welcome back, {currentProfile.name.split(' ')[0]}. Manage high-profile mandates, evaluate referrals, and refine candidate communications with local Gemini AI intelligence.
          </p>
        </div>
        <div className="flex items-center space-x-4 relative z-10 bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border-2 border-white/25"
          />
          <div>
            <h4 className="text-sm font-semibold truncate text-white">{currentProfile.name}</h4>
            <span className="text-xs text-neutral-400 block font-mono">{currentProfile.role}</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const IconComponent = getKPIIcon(kpi.icon);
          return (
            <div 
              key={idx} 
              className="bg-white p-5 rounded-xl border border-[#ecebe6] elite-card-shadow hover:border-neutral-300 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                  {kpi.title}
                </p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-serif-display font-medium text-neutral-900">
                    {kpi.value}
                  </h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${
                    kpi.isPositive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : kpi.change === 'Stable' 
                      ? 'bg-neutral-50 text-neutral-500' 
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {kpi.isPositive ? (
                      <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                    ) : kpi.change !== 'Stable' ? (
                      <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                    ) : null}
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-neutral-50 text-neutral-800 rounded-lg border border-[#faf9f6]">
                <IconComponent className="w-5 h-5 text-neutral-700" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activities (Span 2) */}
        <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#faf9f6]">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-neutral-900">
                Recent Activities
              </h3>
              <p className="text-xs text-neutral-400 font-medium">Real-time status updates and priority timeline events</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('inbox')}
              className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Manage Conversations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-5">
            {timeline.map((item) => (
              <div key={item.id} className="flex gap-4 items-start group relative">
                {/* Visual Timeline connector marker */}
                <div className="flex flex-col items-center shrink-0 mt-1">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                    item.isHighPriority 
                      ? 'bg-rose-500 border-rose-100 ring-2 ring-rose-50' 
                      : 'bg-neutral-800 border-neutral-300'
                  }`}>
                    {item.isHighPriority && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="w-0.5 h-14 bg-[#ecebe6] mt-2 group-last:bg-transparent"></div>
                </div>

                {/* Timeline content details card */}
                <div className="flex-1 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-xl p-4 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-neutral-900">{item.title}</h4>
                    <div className="flex items-center space-x-2">
                      {item.isHighPriority && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 uppercase rounded">
                          HIGH PRIORITY
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-neutral-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Mini Cards Deck */}
        <div className="space-y-6">
          {/* Saved Jobs Mandates with Corporate Office Graphics */}
          <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-6 space-y-4">
            <div className="pb-3 border-b border-[#faf9f6]">
              <h3 className="font-serif-display text-base font-bold text-neutral-900">
                Saved Job Mandates
              </h3>
              <p className="text-[11px] text-neutral-400">Current high-profile partner engagements</p>
            </div>

            <div className="space-y-4">
              {savedJobs.map((job) => (
                <div key={job.id} className="group relative rounded-xl overflow-hidden border border-[#ecebe6] elite-card-shadow bg-white hover:border-neutral-300 transition-colors">
                  {/* Premium Hotlinked Image Container */}
                  <div className="h-28 overflow-hidden relative">
                    <img
                      src={job.imageUrl}
                      alt={job.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[10px] uppercase tracking-widest text-[#ecebe6] font-mono font-bold">
                        {job.company}
                      </span>
                      <h4 className="font-serif-display text-sm font-semibold tracking-tight uppercase">
                        {job.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3 flex items-center justify-between text-[11px] text-neutral-600 font-medium bg-neutral-50/50">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-900 font-semibold font-mono">
                      <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-Up Reminders */}
          <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#faf9f6]">
              <div>
                <h3 className="font-serif-display text-base font-bold text-neutral-900">
                  Follow-Up Reminders
                </h3>
                <p className="text-[11px] text-neutral-400 font-medium">Critical executive recruitment tasks</p>
              </div>
              <AlertCircle className="w-4 h-4 text-neutral-300" />
            </div>

            <div className="space-y-3.5">
              {reminders.map((rem) => (
                <div 
                  key={rem.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                    rem.isUrgent 
                      ? 'bg-rose-50/40 border-rose-100 text-rose-950' 
                      : 'bg-neutral-50/30 border-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-neutral-900">{rem.title}</h5>
                    <p className="text-[11px] text-neutral-400 font-mono font-medium lowercase uppercase-first">
                      {rem.action}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    rem.isUrgent ? 'bg-rose-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {rem.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Grid: Trending Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-display text-xl font-bold text-neutral-900">
              Trending Opportunities
            </h3>
            <p className="text-xs text-neutral-400 font-medium">Top executive vacancies open for client alignment</p>
          </div>
          <button 
            onClick={() => onNavigateToTab('discovery')}
            className="text-xs text-neutral-700 hover:text-black font-semibold flex items-center gap-1 hover:underline group"
          >
            <span>Scan Discovery Map</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {filteredTrending.length === 0 ? (
          <div className="text-center py-8 bg-white border border-[#ecebe6] rounded-xl text-neutral-400 text-xs">
            No matching opportunities found for your search inquiry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {filteredTrending.map((opp) => (
              <div 
                key={opp.id} 
                className="bg-white border border-[#ecebe6] rounded-xl p-4 elite-card-shadow flex flex-col justify-between hover:border-neutral-400 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded ${opp.logoBg} flex items-center justify-center font-bold text-white text-xs`}>
                        {opp.logoLetter}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 truncate max-w-[100px]" title={opp.company}>
                          {opp.company}
                        </h4>
                        <span className="text-[10px] text-neutral-400 block font-mono">{opp.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleFavoriteTrend(opp.id)}
                      className={`p-1 rounded-full hover:bg-neutral-50 transition-colors ${
                        opp.isFavorite ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-serif-display text-xs font-bold text-neutral-900 group-hover:text-black leading-tight uppercase">
                      {opp.title}
                    </h5>
                    <span className="text-[10px] font-mono text-neutral-500 font-semibold">{opp.salary}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-neutral-50 flex items-center justify-between">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    opp.type === 'NEWLY ADDED' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                      : opp.type === 'HIGH MATCH' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                      : opp.type === 'ACTIVE HIRING'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {opp.type}
                  </span>

                  <button
                    onClick={() => onReferCandidate(opp.title, opp.company)}
                    className="text-[10px] font-bold text-neutral-900 hover:text-[#5e5a42] flex items-center gap-0.5 uppercase tracking-wider"
                  >
                    <span>Refer</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Live Referral Opportunities ─── */}
      {realReferrals.length > 0 && (
        <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#faf9f6]">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-serif-display text-sm font-bold text-neutral-900 uppercase tracking-wider">Live Referral Opportunities</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{realReferrals.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realReferrals.slice(0, 6).map(ref => (
              <div key={ref.id} className="border border-[#ecebe6] rounded-xl p-4 hover:border-neutral-400 transition-all group">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{(ref.company || '?').charAt(0)}</div>
                  <h4 className="text-xs font-bold text-neutral-900 truncate">{ref.company || 'Multiple Companies'}</h4>
                </div>
                <p className="text-[11px] text-neutral-600 line-clamp-2 mb-2 leading-relaxed">{ref.job_titles}</p>
                {(ref.salary || ref.stipend) && <p className="text-[10px] font-mono font-semibold text-neutral-500 mb-2">{ref.salary || ref.stipend}</p>}
                {ref.eligibility && <p className="text-[10px] text-neutral-400 mb-2">Eligibility: {ref.eligibility}</p>}
                <div className="pt-2 border-t border-neutral-50">
                  {ref.referral_form_link ? (
                    <a href={ref.referral_form_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-neutral-900 hover:text-blue-700 flex items-center gap-0.5 uppercase tracking-wider">
                      <span>Apply via Referral</span><ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : ref.career_page_link ? (
                    <a href={ref.career_page_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-neutral-900 hover:text-blue-700 flex items-center gap-0.5 uppercase tracking-wider">
                      <span>Career Page</span><ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
