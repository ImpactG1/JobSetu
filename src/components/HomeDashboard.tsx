import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  MapPin, 
  Clock, 
  Mail, 
  Users, 
  TrendingUp, 
  ChevronRight,
  Briefcase,
  Building2,
  Send,
  Loader2
} from 'lucide-react';
import { UserProfile, ReferralOpportunity, EmailActivity } from '../types';
import { fetchUserEmailActivity } from '../lib/emailTracker';

interface HomeDashboardProps {
  currentProfile: UserProfile;
  userId: string;
  totalJobs: number;
  totalReferrals: number;
  onNavigateToTab: (tab: 'discovery' | 'inbox' | 'referrals' | 'analytics') => void;
  searchQuery: string;
  realReferrals?: ReferralOpportunity[];
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentProfile,
  userId,
  totalJobs,
  totalReferrals,
  onNavigateToTab,
  searchQuery,
  realReferrals = []
}) => {
  const [emailActivity, setEmailActivity] = useState<EmailActivity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoadingActivity(true);
    fetchUserEmailActivity(userId)
      .then(setEmailActivity)
      .finally(() => setLoadingActivity(false));
  }, [userId]);

  // Compute real KPIs
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const emailsThisWeek = emailActivity.filter(a => new Date(a.sent_at) >= weekAgo).length;
  const uniqueCompanies = new Set(emailActivity.map(a => a.company).filter(Boolean)).size;

  const kpis = [
    { title: 'Emails Sent', value: String(emailActivity.length), change: `${emailsThisWeek} this week`, icon: Mail },
    { title: 'Companies Contacted', value: String(uniqueCompanies), change: emailActivity.length > 0 ? 'Active' : 'Get started', icon: Building2 },
    { title: 'Jobs Available', value: String(totalJobs), change: 'Live Data', icon: Briefcase },
    { title: 'Referrals Available', value: String(totalReferrals), change: 'Live Data', icon: Users },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141414] text-white rounded-2xl p-8 relative overflow-hidden elite-card-shadow">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="space-y-2 relative z-10 max-w-2xl">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold bg-white/10 px-2.5 py-1 rounded">
            PORTAL OVERVIEW
          </span>
          <h2 className="font-serif-display text-4xl font-bold tracking-tight">
            Your Job Search Hub
          </h2>
          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            Welcome back, {currentProfile.name.split(' ')[0]}. Browse {totalJobs} live job listings, apply via referrals, and track your outreach progress — all in one place.
          </p>
        </div>
        <div className="flex items-center space-x-4 relative z-10 bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold font-serif">
            {currentProfile.name.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-semibold truncate text-white">{currentProfile.name}</h4>
            <span className="text-xs text-neutral-400 block font-mono">{currentProfile.email}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#ecebe6] elite-card-shadow hover:border-neutral-300 transition-colors duration-200 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">{kpi.title}</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-serif-display font-medium text-neutral-900">{kpi.value}</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center bg-emerald-50 text-emerald-700">
                  <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />{kpi.change}
                </span>
              </div>
            </div>
            <div className="p-3 bg-neutral-50 text-neutral-800 rounded-lg border border-[#faf9f6]">
              <kpi.icon className="w-5 h-5 text-neutral-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Email Activity */}
        <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#faf9f6]">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-neutral-900">Recent Email Activity</h3>
              <p className="text-xs text-neutral-400 font-medium">Emails sent through JobSetu platform</p>
            </div>
            <button onClick={() => onNavigateToTab('analytics')}
              className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1 hover:underline">
              <span>View Analytics</span><ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingActivity ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
            </div>
          ) : emailActivity.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Send className="w-10 h-10 text-neutral-300 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-neutral-800">No emails sent yet</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Go to Discovery, find a job, and click "Email HR" to send your first application email.
                </p>
              </div>
              <button onClick={() => onNavigateToTab('discovery')}
                className="text-xs font-bold text-neutral-900 underline uppercase">Browse Jobs</button>
            </div>
          ) : (
            <div className="space-y-3">
              {emailActivity.slice(0, 8).map(activity => (
                <div key={activity.id} className="flex gap-4 items-start group">
                  <div className="flex flex-col items-center shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-neutral-800 border-2 border-neutral-300" />
                    <div className="w-0.5 h-10 bg-[#ecebe6] mt-1 group-last:bg-transparent" />
                  </div>
                  <div className="flex-1 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-xl p-3.5 transition-colors min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        Emailed {activity.company || 'Company'}
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">
                      Re: {activity.job_title || activity.subject} → {activity.recipient_email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Actions + Referrals */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-6 space-y-4">
            <h3 className="font-serif-display text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-[#faf9f6]">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => onNavigateToTab('discovery')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors group">
                <div className="flex items-center space-x-2.5">
                  <Briefcase className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-700">Browse Direct Jobs</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
              </button>
              <button onClick={() => onNavigateToTab('inbox')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors group">
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-700">Check Gmail Inbox</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
              </button>
              <button onClick={() => onNavigateToTab('analytics')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors group">
                <div className="flex items-center space-x-2.5">
                  <TrendingUp className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-700">View Analytics</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
              </button>
            </div>
          </div>

          {/* Live Referrals Preview */}
          {realReferrals.length > 0 && (
            <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#faf9f6]">
                <h3 className="font-serif-display text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Top Referrals
                </h3>
                <button onClick={() => onNavigateToTab('discovery')} className="text-[10px] font-bold text-neutral-500 hover:text-neutral-700 uppercase">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {realReferrals.slice(0, 4).map(ref => (
                  <div key={ref.id} className="flex items-center space-x-3 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                      {(ref.company || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-neutral-900 truncate">{ref.company || 'Multiple'}</h5>
                      <p className="text-[10px] text-neutral-400 truncate">{ref.job_titles}</p>
                    </div>
                    {ref.referral_form_link && (
                      <a href={ref.referral_form_link} target="_blank" rel="noopener noreferrer"
                        className="text-[9px] font-bold text-blue-700 uppercase shrink-0">Apply</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
