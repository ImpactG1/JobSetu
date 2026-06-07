import React, { useState, useEffect } from 'react';
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
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Mail, Building2, Briefcase, Calendar, Loader2, Target } from 'lucide-react';
import { fetchUserEmailStats, fetchUserEmailActivity } from '../lib/emailTracker';
import type { EmailActivity } from '../types';

interface AnalyticsBoardProps {
  userId: string;
  totalJobs: number;
  totalReferrals: number;
}

export const AnalyticsBoard: React.FC<AnalyticsBoardProps> = ({ userId, totalJobs, totalReferrals }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalSent: number;
    uniqueCompanies: number;
    uniqueJobs: number;
    thisWeek: number;
    thisMonth: number;
    byCompany: { company: string; count: number }[];
    byDay: { date: string; count: number }[];
  } | null>(null);
  const [activities, setActivities] = useState<EmailActivity[]>([]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      fetchUserEmailStats(userId),
      fetchUserEmailActivity(userId)
    ]).then(([s, a]) => {
      setStats(s);
      setActivities(a);
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-in fade-in duration-300">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          <span className="text-xs text-neutral-400">Loading your analytics...</span>
        </div>
      </div>
    );
  }

  const metricCards = [
    { title: 'Emails Sent', value: String(stats?.totalSent || 0), change: `${stats?.thisWeek || 0} this week`, isPositive: true, icon: Mail, desc: 'Total HR emails sent via platform' },
    { title: 'Companies Contacted', value: String(stats?.uniqueCompanies || 0), change: `${stats?.thisMonth || 0} this month`, isPositive: true, icon: Building2, desc: 'Unique companies you reached out to' },
    { title: 'Jobs Available', value: String(totalJobs), change: 'Live Data', isPositive: true, icon: Briefcase, desc: 'Active direct job listings' },
    { title: 'Referrals Available', value: String(totalReferrals), change: 'Live Data', isPositive: true, icon: TrendingUp, desc: 'Active referral opportunities' },
  ];

  // Color palette for company bars
  const barColors = ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb', '#fafafa'];

  // Format day chart data
  const dayChartData = (stats?.byDay || []).map(d => ({
    name: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Emails: d.count,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((stat, idx) => (
          <div key={idx} className="bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow hover:border-neutral-300 transition-colors">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-50">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{stat.title}</span>
              <stat.icon className="w-4 h-4 text-neutral-300" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-serif-display text-xl font-bold text-neutral-900">{stat.value}</h3>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-neutral-400">{stat.desc}</p>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Email Activity Trend */}
        <div className="lg:col-span-8 bg-white border border-[#ecebe6] rounded-2xl p-6 elite-card-shadow space-y-4">
          <div>
            <h3 className="font-serif-display text-base font-bold text-neutral-900 uppercase">Email Activity Trend</h3>
            <p className="text-xs text-neutral-400 font-medium">Emails sent per day over the last 14 days</p>
          </div>
          {dayChartData.length > 0 && dayChartData.some(d => d.Emails > 0) ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="Emails" stroke="#1a1a1a" strokeWidth={2} fillOpacity={1} fill="url(#colorEmails)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-center text-neutral-400">
              <div className="space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-neutral-300" />
                <p className="text-xs">No email activity yet. Send your first email via Discovery → Email HR.</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Companies Contacted */}
        <div className="lg:col-span-4 bg-white border border-[#ecebe6] rounded-2xl p-6 elite-card-shadow space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif-display text-base font-bold text-neutral-900 uppercase">Top Companies</h3>
            <p className="text-xs text-neutral-400 font-medium">Companies you've contacted the most</p>
          </div>
          {(stats?.byCompany || []).length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats!.byCompany.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="company" type="category" stroke="#1a1a1a" fontSize={10} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {(stats?.byCompany || []).slice(0, 7).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-neutral-400">
              <p>No companies contacted yet</p>
            </div>
          )}
          <div className="text-[10px] text-neutral-400 text-center uppercase tracking-wider font-mono">
            Based on your email activity
          </div>
        </div>
      </div>

      {/* Recent Email Activity Table */}
      <div className="bg-white border border-[#ecebe6] rounded-2xl p-6 elite-card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-display text-base font-bold text-neutral-900 uppercase">Email Activity Log</h3>
            <p className="text-xs text-neutral-400 font-medium">Your recent emails sent through Reflyt</p>
          </div>
          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">{activities.length} total</span>
        </div>

        {activities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Company</th>
                  <th className="text-left py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Job Title</th>
                  <th className="text-left py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Recipient</th>
                  <th className="text-left py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Subject</th>
                  <th className="text-left py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sent At</th>
                  <th className="text-left py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {activities.slice(0, 20).map(a => (
                  <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-2.5 font-semibold text-neutral-800">{a.company || '-'}</td>
                    <td className="py-2.5 text-neutral-600 max-w-[150px] truncate">{a.job_title || '-'}</td>
                    <td className="py-2.5 text-neutral-500 font-mono">{a.recipient_email}</td>
                    <td className="py-2.5 text-neutral-600 max-w-[200px] truncate">{a.subject}</td>
                    <td className="py-2.5 text-neutral-400 font-mono">{new Date(a.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${a.status === 'sent' ? 'bg-blue-50 text-blue-700' : a.status === 'replied' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400 space-y-2">
            <Target className="w-8 h-8 mx-auto text-neutral-300" />
            <p className="text-xs">No emails sent yet. Go to Discovery → Email HR to start contacting companies.</p>
          </div>
        )}
      </div>
    </div>
  );
};
