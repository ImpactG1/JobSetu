import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  HelpCircle, 
  Sparkles, 
  Calendar,
  X,
  CheckCircle,
  Briefcase,
  LogOut
} from 'lucide-react';
import { UserProfile, ActiveTab } from '../types';

interface HeaderProps {
  currentProfile: UserProfile;
  activeTab: ActiveTab;
  onSearch: (query: string) => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  activeTab,
  onSearch,
  onSignOut
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Julianne Vane replied to your design lead offer", time: "2m ago", unread: true },
    { id: 2, text: "System generated matching report for 'Linear Product VP'", time: "1h ago", unread: true },
    { id: 3, text: "David Vance submitted 2 cloud engineer referrals", time: "Yesterday", unread: false }
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
      case 'home': return 'Dashboard Overview';
      case 'discovery': return 'Recruitment Discovery Engine';
      case 'inbox': return 'Inbox & AI Writing Assistant';
      case 'referrals': return 'Employee Referral Hub';
      case 'analytics': return 'Performance & conversion Metrics';
      case 'settings': return 'Portal Settings';
      default: return 'Elite HR Portal';
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    let timeGreeting = "Welcome back";
    if (hours < 12) timeGreeting = "Good morning";
    else if (hours < 18) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";

    return `${timeGreeting}, ${currentProfile.name.split(' ')[0]}`;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-18 border-b border-[#ecebe6] bg-white px-8 flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Search Input Section */}
      <div className="flex items-center space-x-4 w-96">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search candidates, coordinates, positions..."
            className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white text-xs rounded-lg pl-9 pr-4 py-2 text-neutral-800 placeholder-neutral-400 outline-none transition-all duration-150"
          />
          {searchVal && (
            <button 
              onClick={() => { setSearchVal(''); onSearch(''); }}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right Column Indicators */}
      <div className="flex items-center space-x-6">
        {/* Dynamic status helper */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-neutral-500">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3.5 w-80 bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-950">System Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 font-semibold uppercase tracking-wider"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="py-2 divide-y divide-neutral-50 max-h-60 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="py-2.5 flex items-start space-x-2.5 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-indigo-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-neutral-700 leading-normal ${n.unread ? 'font-semibold' : 'font-normal'}`}>
                        {n.text}
                      </p>
                      <span className="text-[10px] text-neutral-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar Greeting */}
        <div className="flex items-center space-x-3 border-l border-neutral-200/60 pl-6">
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-[#ecebe6]"
          />
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-semibold text-neutral-800 leading-none">
              {currentProfile.name}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium font-mono uppercase mt-1 inline-block bg-neutral-100 rounded px-1.5 py-0.5">
              {currentProfile.role.toUpperCase()}
            </span>
          </div>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              id="header-sign-out-btn"
              onClick={onSignOut}
              className="p-1.5 rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
