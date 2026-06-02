import React from 'react';
import { 
  Home, 
  Search, 
  Mail, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronRight,
  Sparkles,
  LogOut,
  ShieldCheck,
  ClipboardCheck
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onProfileChange: (profile: UserProfile) => void;
  unreadCount: number;
  onSignOut?: () => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentProfile,
  profiles,
  onProfileChange,
  unreadCount,
  onSignOut,
  isAdmin
}) => {
  const menuItems = [
    { id: 'home' as ActiveTab, label: 'Dashboard', icon: Home },
    { id: 'ats-checker' as ActiveTab, label: 'ATS Checker', icon: ClipboardCheck },
    { id: 'discovery' as ActiveTab, label: 'Discovery', icon: Search },
    { id: 'inbox' as ActiveTab, label: 'Inbox', icon: Mail, badge: unreadCount },
    { id: 'referrals' as ActiveTab, label: 'Referrals', icon: Users },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ id: 'admin' as ActiveTab, label: 'Admin Panel', icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="w-68 border-r border-[#ecebe6] bg-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#faf9f6] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center font-serif-display text-white text-base font-bold">
            E
          </div>
          <div>
            <h1 className="font-serif-display text-lg font-bold tracking-tight text-neutral-900 leading-tight">
              Elite HR
            </h1>
            <p className="font-sans text-[10px] tracking-widest text-neutral-400 font-medium">
              EXECUTIVE PORTAL
            </p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent 
                  className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'
                  }`} 
                />
                <span>{item.label}</span>
              </div>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-rose-50 text-rose-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Badge */}
      <div className="mx-4 my-2 p-3.5 rounded-xl bg-amber-50/70 border border-amber-100/50 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
          <span>PORTAL INTELLIGENCE</span>
        </div>
        <p className="text-[11px] text-amber-900/75 leading-relaxed">
          Gemini AI features are auto-configured. Refine drafts in Inbox with real-time feedback.
        </p>
      </div>

      {/* Connected Profile Swapper */}
      <div className="p-4 border-t border-[#ecebe6] bg-neutral-50/50">
        <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 px-1">
          Viewing Session As
        </label>
        <div className="relative group">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-[#ecebe6] hover:border-neutral-300 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-neutral-900/10"
            title="View and Edit Profile"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-[#ecebe6] shrink-0"
              />
              <div className="text-left min-w-0">
                <h4 className="text-xs font-semibold text-neutral-800 truncate leading-snug">
                  {currentProfile.name}
                </h4>
                <p className="text-[10px] text-neutral-400 font-medium truncate">
                  {currentProfile.role}
                </p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
          </button>
        </div>

        {/* Sign Out Button */}
        {onSignOut && (
          <button
            id="sidebar-sign-out-btn"
            onClick={onSignOut}
            className="w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-neutral-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-200 group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:text-rose-500 transition-colors" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
