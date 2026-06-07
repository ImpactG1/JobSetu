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
  ClipboardCheck,
  PanelLeftClose,
  PanelLeft,
  X,
  Crown,
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
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentProfile,
  unreadCount,
  onSignOut,
  isAdmin,
  isMobileOpen,
  isCollapsed,
  onMobileClose,
  onToggleCollapse,
}) => {
  const menuItems = [
    { id: 'home' as ActiveTab, label: 'Dashboard', icon: Home },
    { id: 'ats-checker' as ActiveTab, label: 'ATS Checker', icon: ClipboardCheck },
    { id: 'discovery' as ActiveTab, label: 'Discovery', icon: Search },
    { id: 'inbox' as ActiveTab, label: 'Inbox', icon: Mail, badge: unreadCount },
    { id: 'referrals' as ActiveTab, label: 'Referrals', icon: Users },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
    { id: 'pricing' as ActiveTab, label: 'Plans', icon: Crown },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ id: 'admin' as ActiveTab, label: 'Admin Panel', icon: ShieldCheck }] : []),
  ];

  const navigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    onMobileClose();
  };

  const showLabels = !isCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden={!isMobileOpen}
      />

      <aside
        className={`
          fixed lg:sticky top-0 z-50 lg:z-30
          flex flex-col h-screen shrink-0
          bg-white border-r border-[#ecebe6]
          transition-[width,transform] duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-[4.5rem]' : 'w-[min(280px,88vw)] lg:w-[17rem]'}
        `}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div
          className={`border-b border-[#faf9f6] flex items-center shrink-0 ${
            showLabels ? 'p-4 lg:p-5 justify-between gap-2' : 'p-3 justify-center'
          }`}
        >
          <div className={`flex items-center ${showLabels ? 'space-x-2.5 min-w-0' : ''}`}>
            <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center font-serif-display text-white text-base font-bold shrink-0">
              R
            </div>
            {showLabels && (
              <div className="min-w-0">
                <h1 className="font-serif-display text-lg font-bold tracking-tight text-neutral-900 leading-tight truncate">
                  Reflyt
                </h1>
                <p className="font-sans text-[10px] tracking-widest text-neutral-400 font-medium">
                  CAREER PORTAL
                </p>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-1 shrink-0 ${!showLabels ? 'flex-col' : ''}`}>
            {showLabels && (
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:block" title="System Online" />
            )}
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-0.5 ${showLabels ? 'px-3' : 'px-2'}`}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                type="button"
                onClick={() => navigate(item.id)}
                title={!showLabels ? item.label : undefined}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 group ${
                  showLabels ? 'justify-between px-3 py-2.5' : 'justify-center p-2.5'
                } ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <div className={`flex items-center ${showLabels ? 'space-x-3 min-w-0' : ''}`}>
                  <IconComponent
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'
                    }`}
                  />
                  {showLabels && <span className="truncate">{item.label}</span>}
                </div>

                {showLabels && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive ? 'bg-white/25 text-white' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI badge */}
        {showLabels ? (
          <div className="mx-3 mb-2 p-3 rounded-xl bg-amber-50/70 border border-amber-100/50 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>PORTAL INTELLIGENCE</span>
            </div>
            <p className="text-[11px] text-amber-900/75 leading-relaxed">
              Gemini AI features are auto-configured. Refine drafts in Inbox with real-time feedback.
            </p>
          </div>
        ) : (
          <div className="mx-2 mb-2 flex justify-center shrink-0" title="Portal Intelligence">
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-100/50">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        )}

        {/* Profile footer */}
        <div className={`border-t border-[#ecebe6] bg-neutral-50/50 shrink-0 ${showLabels ? 'p-4' : 'p-2'}`}>
          {showLabels && (
            <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 px-1">
              Viewing Session As
            </label>
          )}
          <button
            type="button"
            onClick={() => navigate('profile')}
            title={!showLabels ? 'Profile' : 'View and Edit Profile'}
            className={`w-full flex items-center rounded-lg bg-white border border-[#ecebe6] hover:border-neutral-300 transition-colors ${
              showLabels ? 'justify-between p-2' : 'justify-center p-2'
            }`}
          >
            <div className={`flex items-center min-w-0 ${showLabels ? 'space-x-2.5' : ''}`}>
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-[#ecebe6] shrink-0"
              />
              {showLabels && (
                <div className="text-left min-w-0">
                  <h4 className="text-xs font-semibold text-neutral-800 truncate leading-snug">
                    {currentProfile.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-medium truncate">{currentProfile.role}</p>
                </div>
              )}
            </div>
            {showLabels && (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            )}
          </button>

          {onSignOut && (
            <button
              id="sidebar-sign-out-btn"
              type="button"
              onClick={onSignOut}
              title={!showLabels ? 'Sign Out' : undefined}
              className={`w-full mt-2 flex items-center rounded-lg text-xs font-semibold text-neutral-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all ${
                showLabels ? 'justify-center space-x-2 px-3 py-2.5' : 'justify-center p-2.5'
              }`}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {showLabels && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
