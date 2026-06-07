import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { DiscoveryBoard } from './components/DiscoveryBoard';
import { InboxBoard } from './components/InboxBoard';
import { ReferralsBoard } from './components/ReferralsBoard';
import { AnalyticsBoard } from './components/AnalyticsBoard';
import { SettingsBoard } from './components/SettingsBoard';
import { ProfileBoard } from './components/ProfileBoard';
import { ATSCheckerBoard } from './components/ATSCheckerBoard';
import { AdminPanel } from './components/AdminPanel';
import { PricingBoard } from './components/PricingBoard';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { checkIsAdmin } from './lib/adminConfig';
import { fetchDirectJobs, fetchReferralOpportunities } from './lib/supabaseData';
import { fetchUserProfile } from './lib/profileService';
import { parseResumeSkillsString } from './lib/resumeMatcher';

import { ActiveTab, UserProfile, ReferralCandidate, EmailTemplate, DirectJob, ReferralOpportunity } from './types';
import { 
  PROFILES, 
  REFERRAL_STATUSES, 
  TOP_REFERRERS, 
  EMAIL_TEMPLATES 
} from './data';

type PublicPage = 'landing' | 'auth' | 'ats';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [publicPage, setPublicPage] = useState<PublicPage>('landing');

  // --- Auth Gate ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center font-serif text-white text-2xl font-bold shadow-lg">R</div>
            <div className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-neutral-200 animate-ping opacity-30" />
          </div>
          <div className="space-y-2 text-center">
            <h3 className="font-serif text-lg font-bold text-neutral-900 tracking-tight">Reflyt</h3>
            <p className="text-xs text-neutral-400 font-medium">Initializing your career portal...</p>
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
    if (publicPage === 'auth') {
      return <AuthPage onBack={() => setPublicPage('landing')} />;
    }
    if (publicPage === 'ats') {
      return (
        <div className="min-h-screen bg-[#faf9f6]">
          {/* Minimal header for standalone ATS page */}
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#ecebe6]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
              <button onClick={() => setPublicPage('landing')} className="flex items-center space-x-2 group">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center font-serif text-white text-sm font-bold">R</div>
                <span className="font-serif text-base font-bold text-neutral-900 tracking-tight group-hover:text-neutral-600 transition-colors">Reflyt</span>
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => setPublicPage('auth')} className="text-xs font-bold text-neutral-600 hover:text-neutral-900 px-3 py-1.5 transition-colors">Sign In</button>
                <button onClick={() => setPublicPage('auth')} className="text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-2 rounded-lg transition-all elite-button">Join Free</button>
              </div>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <ATSCheckerBoard />
          </main>
          <footer className="border-t border-[#ecebe6] py-6 text-center text-[10px] text-neutral-400">
            © {new Date().getFullYear()} Reflyt. Free ATS checker — no signup required.
          </footer>
        </div>
      );
    }
    return (
      <LandingPage
        onNavigateAuth={() => setPublicPage('auth')}
        onNavigateATS={() => setPublicPage('ats')}
      />
    );
  }

  return (
    <SubscriptionProvider userId={user.id}>
      <DashboardLayout onSignOut={signOut} userEmail={user.email || ''} userName={user.user_metadata?.full_name || ''} userId={user.id} />
    </SubscriptionProvider>
  );
}

const SIDEBAR_COLLAPSED_KEY = 'reflyt_sidebar_collapsed';

function DashboardLayout({ onSignOut, userEmail, userName, userId }: { onSignOut: () => Promise<void>; userEmail: string; userName: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleSetActiveTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSidebarMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (sidebarMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarMobileOpen]);

  // ─── Supabase real data ──────────────────────────────────
  const [realJobs, setRealJobs] = useState<DirectJob[]>([]);
  const [realReferrals, setRealReferrals] = useState<ReferralOpportunity[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<'junior' | 'mid' | 'senior' | 'lead' | undefined>();

  useEffect(() => {
    checkIsAdmin(userId).then(setIsAdmin);

    Promise.all([fetchDirectJobs(), fetchReferralOpportunities(), fetchUserProfile(userId)])
      .then(([jobs, refs, profile]) => {
        setRealJobs(jobs);
        setRealReferrals(refs);
        if (profile?.resume_skills) {
          setResumeSkills(parseResumeSkillsString(profile.resume_skills));
        }
        const ats = profile?.ats_analysis as { experience_level?: string } | undefined;
        if (ats?.experience_level && ['junior', 'mid', 'senior', 'lead'].includes(ats.experience_level)) {
          setExperienceLevel(ats.experience_level as 'junior' | 'mid' | 'senior' | 'lead');
        }
        setDataLoaded(true);
      })
      .catch(() => setDataLoaded(true));
  }, [userId]);

  const handleResumeAnalysisUpdate = (skills: string[], level?: 'junior' | 'mid' | 'senior' | 'lead') => {
    setResumeSkills(skills);
    if (level) setExperienceLevel(level);
  };

  const buildInitialProfile = (): UserProfile => {
    if (userName || userEmail) {
      return {
        name: userName || userEmail.split('@')[0] || 'User',
        role: isAdmin ? 'Administrator' : 'Job Seeker',
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

  // Data Collections (only what's still needed)
  const [referrals, setReferrals] = useState<ReferralCandidate[]>(REFERRAL_STATUSES);
  const [topReferrers, setTopReferrers] = useState(TOP_REFERRERS);
  const [templates, setTemplates] = useState<EmailTemplate[]>(EMAIL_TEMPLATES);

  const handleUpdateReferralStage = (id: string, newStage: 'referred' | 'screening' | 'interviewing' | 'hired') => {
    const stageStatusTextMap: Record<string, string> = {
      referred: 'Direct Referral', screening: 'HR Call Scheduled',
      interviewing: 'Final Round Interview',
      hired: `Closed - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    };
    setReferrals(prev => prev.map(cand => cand.id === id ? { ...cand, stage: newStage, statusText: stageStatusTextMap[newStage] } : cand));
  };

  const handleAddReferral = (candidateName: string, role: string, department: string, source: string) => {
    const newRef: ReferralCandidate = { id: `ref-dynamic-${Date.now()}`, name: candidateName, role, department: department as any, stage: 'referred', source: source as any, statusText: 'Direct Referral' };
    setReferrals(prev => [newRef, ...prev]);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setCurrentProfile(updatedProfile);
    setProfiles(prev => prev.map(p => p.email === updatedProfile.email ? updatedProfile : p));
  };

  const handleUpdateTemplate = (templateId: string, updatedFields: Partial<EmailTemplate>) => {
    setTemplates(prev => prev.map(tpl => tpl.id === templateId ? { ...tpl, ...updatedFields } : tpl));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard
            currentProfile={currentProfile}
            userId={userId}
            totalJobs={realJobs.length}
            totalReferrals={realReferrals.length}
            onNavigateToTab={handleSetActiveTab}
            searchQuery={searchQuery}
            realReferrals={realReferrals}
          />
        );
      case 'profile':
        return (
          <ProfileBoard
            userId={userId}
            realJobs={realJobs}
            realReferrals={realReferrals}
            onResumeAnalysisUpdate={handleResumeAnalysisUpdate}
          />
        );
      case 'ats-checker':
        return <ATSCheckerBoard />;
      case 'discovery':
        return (
          <DiscoveryBoard
            searchQuery={searchQuery}
            realJobs={realJobs}
            realReferrals={realReferrals}
            templates={templates}
            userId={userId}
            userEmail={userEmail}
            userName={userName || currentProfile.name}
            resumeSkills={resumeSkills}
            experienceLevel={experienceLevel}
            onNavigatePricing={() => handleSetActiveTab('pricing')}
          />
        );
      case 'inbox':
        return <InboxBoard searchQuery={searchQuery} />;
      case 'referrals':
        return <ReferralsBoard referrals={referrals} topReferrers={topReferrers} onUpdateStage={handleUpdateReferralStage} onAddReferral={handleAddReferral} />;
      case 'analytics':
        return <AnalyticsBoard userId={userId} totalJobs={realJobs.length} totalReferrals={realReferrals.length} />;
      case 'settings':
        return <SettingsBoard currentProfile={currentProfile} profiles={profiles} onUpdateProfile={handleUpdateProfile} templates={templates} onUpdateTemplate={handleUpdateTemplate} />;
      case 'admin':
        return isAdmin ? <AdminPanel /> : <div className="p-8 bg-white border border-[#ecebe6] rounded-xl text-center text-xs text-neutral-400">Access denied.</div>;
      case 'pricing':
        return <PricingBoard />;
      default:
        return <div className="p-8 bg-white border border-[#ecebe6] rounded-xl text-center text-xs text-neutral-400 font-light">View nodes under maintenance.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex text-neutral-800">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        currentProfile={currentProfile}
        profiles={profiles}
        onProfileChange={(newProf) => {
          setCurrentProfile(newProf);
          handleSetActiveTab('home');
        }}
        unreadCount={0}
        onSignOut={onSignOut}
        isAdmin={isAdmin}
        isMobileOpen={sidebarMobileOpen}
        isCollapsed={sidebarCollapsed}
        onMobileClose={() => setSidebarMobileOpen(false)}
        onToggleCollapse={toggleSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0 w-full lg:min-h-screen">
        <Header
          currentProfile={currentProfile}
          activeTab={activeTab}
          onSearch={(val) => setSearchQuery(val)}
          onSignOut={onSignOut}
          onOpenMobileMenu={() => setSidebarMobileOpen(true)}
          onToggleSidebarCollapse={toggleSidebarCollapsed}
          isSidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl w-full mx-auto space-y-4">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
