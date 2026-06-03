import React, { useState } from 'react';
import {
  Bell,
  Search,
  Calendar,
  X,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { UserProfile, ActiveTab } from '../types';

interface HeaderProps {
  currentProfile: UserProfile;
  activeTab: ActiveTab;
  onSearch: (query: string) => void;
  onSignOut?: () => void;
  onOpenMobileMenu: () => void;
  onToggleSidebarCollapse: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  activeTab,
  onSearch,
  onSignOut,
  onOpenMobileMenu,
  onToggleSidebarCollapse,
  isSidebarCollapsed,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Julianne Vane replied to your design lead offer", time: '2m ago', unread: true },
    { id: 2, text: "System generated matching report for 'Linear Product VP'", time: '1h ago', unread: true },
    { id: 3, text: 'David Vance submitted 2 cloud engineer referrals', time: 'Yesterday', unread: false },
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch(e.target.value);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'home':
        return 'Dashboard';
      case 'profile':
        return 'Profile';
      case 'ats-checker':
        return 'ATS Checker';
      case 'discovery':
        return 'Discovery';
      case 'inbox':
        return 'Inbox';
      case 'referrals':
        return 'Referrals';
      case 'analytics':
        return 'Analytics';
      case 'settings':
        return 'Settings';
      case 'admin':
        return 'Admin';
      default:
        return 'Portal';
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    let timeGreeting = 'Welcome back';
    if (hours < 12) timeGreeting = 'Good morning';
    else if (hours < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    return `${timeGreeting}, ${currentProfile.name.split(' ')[0]}`;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="border-b border-[#ecebe6] bg-white sticky top-0 z-20 shrink-0">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-neutral-100 text-neutral-600 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onToggleSidebarCollapse}
              className="hidden lg:flex p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 shrink-0"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">
                {getBreadcrumb()}
              </p>
              <h2 className="text-sm sm:text-base font-semibold text-neutral-900 truncate">{getGreeting()}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-neutral-500">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40 sm:hidden"
                    onClick={() => setShowNotifications(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                      <span className="text-xs font-bold text-neutral-950">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-[10px] text-neutral-500 hover:text-neutral-900 font-semibold uppercase"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <div className="py-2 divide-y divide-neutral-50 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="py-2.5 flex items-start space-x-2.5 text-xs">
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              n.unread ? 'bg-indigo-500' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-neutral-700 leading-normal ${
                                n.unread ? 'font-semibold' : 'font-normal'
                              }`}
                            >
                              {n.text}
                            </p>
                            <span className="text-[10px] text-neutral-400">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <img
              src={currentProfile.avatar}
              alt={currentProfile.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-[#ecebe6] hidden sm:block"
            />

            {onSignOut && (
              <button
                id="header-sign-out-btn"
                type="button"
                onClick={onSignOut}
                className="p-2 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search row */}
        <div className="relative w-full max-w-xl">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </span>
          <input
            type="search"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search jobs, companies, skills..."
            className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white text-xs rounded-lg pl-9 pr-9 py-2.5 text-neutral-800 placeholder-neutral-400 outline-none transition-all"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal('');
                onSearch('');
              }}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
