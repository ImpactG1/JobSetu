import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { DiscoveryBoard } from './components/DiscoveryBoard';
import { InboxBoard } from './components/InboxBoard';
import { ReferralsBoard } from './components/ReferralsBoard';
import { AnalyticsBoard } from './components/AnalyticsBoard';
import { SettingsBoard } from './components/SettingsBoard';
import { AdminPanel } from './components/AdminPanel';
import { AuthPage } from './components/AuthPage';
import { useAuth } from './context/AuthContext';
import { checkIsAdmin } from './lib/adminConfig';
import { fetchDirectJobs, fetchReferralOpportunities } from './lib/supabaseData';

import { ActiveTab, UserProfile, EmailThread, ReferralCandidate, EmailTemplate, DirectJob, ReferralOpportunity } from './types';
import { 
  PROFILES, 
  HOME_KPI_CARDS, 
  TIMELINE_ITEMS, 
  SAVED_JOBS, 
  FOLLOW_UP_REMINDERS, 
  TRENDING_OPPORTUNITIES, 
  DISCOVERY_JOBS, 
  EMAIL_THREADS, 
  REFERRAL_STATUSES, 
  TOP_REFERRERS, 
  EMAIL_TEMPLATES 
} from './data';

export default function App() {
  const { user, loading, signOut } = useAuth();

  // --- Auth Gate ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center font-serif text-white text-2xl font-bold shadow-lg">E</div>
            <div className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-neutral-200 animate-ping opacity-30" />
          </div>
          <div className="space-y-2 text-center">
            <h3 className="font-serif text-lg font-bold text-neutral-900 tracking-tight">Elite HR</h3>
            <p className="text-xs text-neutral-400 font-medium">Initializing executive portal...</p>
          </div>
          <div className="w-48 h-0.5 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-neutral-900 rounded-full" style={{ animation: 'loading-slide 1.5s ease-in-out infinite' }} />
          </div>
        </div>
        <style>{`
          @keyframes loading-slide {
            0% { transform: translateX(-100%); width: 40%; }
            50% { transform: translateX(100%); width: 60%; }
            100% { transform: translateX(-100%); width: 40%; }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <DashboardLayout onSignOut={signOut} userEmail={user.email || ''} userName={user.user_metadata?.full_name || ''} userId={user.id} />;
}

function DashboardLayout({ onSignOut, userEmail, userName, userId }: { onSignOut: () => Promise<void>; userEmail: string; userName: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  // ─── Supabase real data ──────────────────────────────────
  const [realJobs, setRealJobs] = useState<DirectJob[]>([]);
  const [realReferrals, setRealReferrals] = useState<ReferralOpportunity[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Check admin status
    checkIsAdmin(userId).then(setIsAdmin);

    // Fetch real data from Supabase
    Promise.all([fetchDirectJobs(), fetchReferralOpportunities()])
      .then(([jobs, refs]) => {
        setRealJobs(jobs);
        setRealReferrals(refs);
        setDataLoaded(true);
      })
      .catch(() => setDataLoaded(true));
  }, [userId]);

  const buildInitialProfile = (): UserProfile => {
    if (userName || userEmail) {
      return {
        name: userName || userEmail.split('@')[0] || 'User',
        role: isAdmin ? 'Administrator' : 'Executive Recruiter',
        avatar: PROFILES[0].avatar,
        email: userEmail || '',
      };
    }
    return PROFILES[0];
  };

  const [profiles, setProfiles] = useState<UserProfile[]>(PROFILES);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(buildInitialProfile());

  // Update profile role when admin status changes
  useEffect(() => {
    if (isAdmin) {
      setCurrentProfile(prev => ({ ...prev, role: 'Administrator' }));
    }
  }, [isAdmin]);

  // Core Data Collections (mock data for non-Supabase sections)
  const [kpiCards, setKpiCards] = useState(HOME_KPI_CARDS);
  const [timelineItems, setTimelineItems] = useState(TIMELINE_ITEMS);
  const [savedJobs, setSavedJobs] = useState(SAVED_JOBS);
  const [reminders, setReminders] = useState(FOLLOW_UP_REMINDERS);
  const [trendingOpportunities, setTrendingOpportunities] = useState(TRENDING_OPPORTUNITIES);
  const [discoveryJobs, setDiscoveryJobs] = useState(DISCOVERY_JOBS);
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>(EMAIL_THREADS);
  const [referrals, setReferrals] = useState<ReferralCandidate[]>(REFERRAL_STATUSES);
  const [topReferrers, setTopReferrers] = useState(TOP_REFERRERS);
  const [templates, setTemplates] = useState<EmailTemplate[]>(EMAIL_TEMPLATES);

  // Update KPIs with real data counts
  useEffect(() => {
    if (dataLoaded) {
      setKpiCards(prev => prev.map(k => {
        if (k.title === 'Applications Tracked') return { ...k, value: String(realJobs.length), change: 'Live Data', isPositive: true };
        if (k.title === 'Referrals Made') return { ...k, value: String(realReferrals.length), change: 'Live Data', isPositive: true };
        return k;
      }));
    }
  }, [dataLoaded, realJobs.length, realReferrals.length]);

  const handleToggleFavoriteTrend = (id: string) => {
    setTrendingOpportunities(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  const handleToggleFavoriteJob = (id: string) => {
    setDiscoveryJobs(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  const handleUpdateReferralStage = (id: string, newStage: 'referred' | 'screening' | 'interviewing' | 'hired') => {
    const stageStatusTextMap: Record<string, string> = {
      referred: 'Direct Referral', screening: 'HR Call Scheduled',
      interviewing: 'Final Round Interview',
      hired: `Closed - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    };
    setReferrals(prev => prev.map(cand => cand.id === id ? { ...cand, stage: newStage, statusText: stageStatusTextMap[newStage] } : cand));
    if (newStage === 'hired') {
      setTimelineItems(prev => [{ id: `timeline-hired-${Date.now()}`, title: 'Referral Pipeline Placed!', description: 'A referred candidate has been elevated to Hired status.', time: 'Just now', type: 'offer', isHighPriority: true }, ...prev]);
    }
  };

  const handleAddReferral = (candidateName: string, role: string, department: string, source: string) => {
    const newRef: ReferralCandidate = { id: `ref-dynamic-${Date.now()}`, name: candidateName, role, department: department as any, stage: 'referred', source: source as any, statusText: 'Direct Referral' };
    setReferrals(prev => [newRef, ...prev]);
    setTimelineItems(prev => [{ id: `timeline-add-${Date.now()}`, title: 'New Candidate Submitted', description: `Successfully referred ${candidateName} for the ${role} position.`, time: 'Just now', type: 'referral' }, ...prev]);
    setKpiCards(prev => prev.map(k => k.title === 'Referrals Made' ? { ...k, value: String(parseInt(k.value) + 1) } : k));
  };

  const handleSendReply = (threadId: string, replyBody: string) => {
    setEmailThreads(prev => prev.map(th => {
      if (th.id === threadId) {
        return { ...th, status: 'Sent', time: 'Just now', tags: ['Sent', 'Awaiting Action'], conversation: [...th.conversation, { senderName: currentProfile.name, senderEmail: currentProfile.email, avatarUrl: currentProfile.avatar, time: 'Just now', body: replyBody, isUser: true }] };
      }
      return th;
    }));
    setTimelineItems(prev => [{ id: `timeline-email-${Date.now()}`, title: 'Recruited Correspondence Sent', description: 'Sent strategic follow-up email response.', time: 'Just now', type: 'update' }, ...prev]);
    setKpiCards(prev => prev.map(k => k.title === 'Emails Sent' ? { ...k, value: String(parseInt(k.value.replace(/,/g, '')) + 1) } : k));
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setCurrentProfile(updatedProfile);
    setProfiles(prev => prev.map(p => p.email === updatedProfile.email ? updatedProfile : p));
  };

  const handleUpdateTemplate = (templateId: string, updatedFields: Partial<EmailTemplate>) => {
    setTemplates(prev => prev.map(tpl => tpl.id === templateId ? { ...tpl, ...updatedFields } : tpl));
  };

  const unreadInboxCount = emailThreads.filter(t => t.status === 'Opened').length;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard
            currentProfile={currentProfile} kpis={kpiCards} timeline={timelineItems}
            savedJobs={savedJobs} reminders={reminders} trending={trendingOpportunities}
            onToggleFavoriteTrend={handleToggleFavoriteTrend}
            onNavigateToTab={(tab) => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onReferCandidate={() => { setActiveTab('referrals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            searchQuery={searchQuery}
            realReferrals={realReferrals}
          />
        );
      case 'discovery':
        return (
          <DiscoveryBoard
            jobs={discoveryJobs} onToggleFavoriteJob={handleToggleFavoriteJob}
            onAddReferral={handleAddReferral} searchQuery={searchQuery}
            realJobs={realJobs}
          />
        );
      case 'inbox':
        return <InboxBoard threads={emailThreads} currentProfile={currentProfile} onSendReply={handleSendReply} searchQuery={searchQuery} />;
      case 'referrals':
        return <ReferralsBoard referrals={referrals} topReferrers={topReferrers} onUpdateStage={handleUpdateReferralStage} onAddReferral={handleAddReferral} />;
      case 'analytics':
        return <AnalyticsBoard />;
      case 'settings':
        return <SettingsBoard currentProfile={currentProfile} profiles={profiles} onUpdateProfile={handleUpdateProfile} templates={templates} onUpdateTemplate={handleUpdateTemplate} />;
      case 'admin':
        return isAdmin ? <AdminPanel /> : <div className="p-8 bg-white border border-[#ecebe6] rounded-xl text-center text-xs text-neutral-400">Access denied.</div>;
      default:
        return <div className="p-8 bg-white border border-[#ecebe6] rounded-xl text-center text-xs text-neutral-400 font-light">View nodes under maintenance.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex text-neutral-800">
      <Sidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        currentProfile={currentProfile} profiles={profiles}
        onProfileChange={(newProf) => {
          setCurrentProfile(newProf);
          if (newProf.name === 'Alex Mercer') setActiveTab('inbox');
          else if (newProf.name === 'Alex Sterling') setActiveTab('referrals');
          else if (newProf.name === 'Arthur Sterling') setActiveTab('analytics');
          else setActiveTab('home');
        }}
        unreadCount={unreadInboxCount} onSignOut={onSignOut} isAdmin={isAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentProfile={currentProfile} activeTab={activeTab} onSearch={(val) => setSearchQuery(val)} onSignOut={onSignOut} />
        <main className="flex-1 overflow-y-auto px-8 py-8 max-w-7xl w-full mx-auto space-y-4">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
