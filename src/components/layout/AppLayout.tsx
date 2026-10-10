import React, { useState } from 'react';
import { UserProfile, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { AcademicTwin } from '../avatar/AcademicTwin';
import {
  LayoutDashboard,
  BarChart2,
  FolderKanban,
  Sparkles,
  Calendar,
  ShieldAlert,
  GraduationCap,
  Timer,
  Award,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

const FEMALE_SIGN_IMG = '/src/assets/images/female_holding_sign_1791662437175.jpg';
const MALE_SIGN_IMG = '/src/assets/images/male_holding_sign_1791662448013.jpg';

interface AppLayoutProps {
  profile: UserProfile;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onToggleDarkMode: () => void;
  onToggleLanguage: () => void;
  onToggleTheme?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  profile,
  currentTab,
  onTabChange,
  onToggleDarkMode,
  onToggleLanguage,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[profile.language];
  const isRTL = profile.language === 'ar';

  const navItems = [
    { id: 'overview', label: t.nav.overview, icon: LayoutDashboard },
    { id: 'progress', label: t.nav.progress, icon: BarChart2 },
    { id: 'tasks', label: t.nav.tasks, icon: FolderKanban },
    { id: 'smartTalk', label: t.nav.smartTalk, icon: Sparkles },
    { id: 'calendar', label: t.nav.calendar, icon: Calendar },
    { id: 'rescueMode', label: t.nav.rescueMode, icon: ShieldAlert },
    { id: 'exams', label: t.nav.exams, icon: GraduationCap },
    { id: 'studySession', label: t.nav.studySession, icon: Timer },
    { id: 'evaluations', label: t.nav.evaluations, icon: Award },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const sidebarSignImg = profile.gender === 'female' ? FEMALE_SIGN_IMG : MALE_SIGN_IMG;

  return (
    <div
      className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center transition-colors duration-300"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Master 3D Grand Board Canvas */}
      <div className="clay-board w-full max-w-[1540px] min-h-[94vh] p-3 sm:p-5 md:p-7 flex flex-col md:flex-row gap-5 lg:gap-7 relative overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <aside
          className={`w-full md:w-64 lg:w-72 shrink-0 rounded-[2.5rem] p-5 lg:p-6 flex flex-col justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18),inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-3px_5px_rgba(0,0,0,0.08)] transition-all duration-300 relative z-20 ${
            profile.theme === 'pink'
              ? 'bg-[#C9B6F2] dark:bg-[#2A1D3D] text-white'
              : 'bg-[#142D55] dark:bg-[#0E1A30] text-white'
          } ${mobileMenuOpen ? 'fixed inset-4 z-50 overflow-y-auto block' : 'hidden md:flex'}`}
        >
          {/* Top Animal Emblem Mascot Badge */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div
                onClick={() => onTabChange('overview')}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-[#FFF2EE] to-[#FFDDD5] dark:from-[#3D293B] dark:to-[#2A1B29] shadow-[0_10px_20px_-2px_rgba(0,0,0,0.16),inset_0_2.5px_3px_rgba(255,255,255,1),inset_0_-2px_3px_rgba(0,0,0,0.06)] border-2 border-white/90 dark:border-white/20 flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-200"
                title={profile.gender === 'female' ? 'Cat Mascot 🐱' : 'Wolf Mascot 🐺'}
              >
                <span className="text-2xl select-none filter drop-shadow-xs">
                  {profile.gender === 'female' ? '🐱' : '🐺'}
                </span>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1.5 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#263047] dark:bg-[#1E142B] dark:text-[#E8DEF8] shadow-[0_12px_24px_-4px_rgba(35,20,50,0.18),inset_0_2px_2.5px_rgba(255,255,255,1),inset_0_-2px_2px_rgba(0,0,0,0.02)] font-extrabold translate-x-1.5 rtl:-translate-x-1.5'
                        : 'text-white/85 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        isActive
                          ? profile.theme === 'pink'
                            ? 'bg-[#F2EDFD] text-[#9A7FD6] shadow-xs'
                            : 'bg-[#EBF3FD] text-[#3678D8] shadow-xs'
                          : 'text-white/80'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom: Student Holding "YOU CAN DO IT!" Sign on 3D Pedestal */}
          <div className="hidden md:flex flex-col items-center pt-4 mt-4 border-t border-white/20 relative">
            <div className="w-full rounded-[2rem] p-3 bg-white/20 dark:bg-black/25 backdrop-blur-xs border-2 border-white/40 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.18),inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.06)] flex flex-col items-center transform hover:scale-[1.02] transition-transform">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border-2 border-white/60 bg-white/30">
                <img
                  src={sidebarSignImg}
                  alt="Student Holding YOU CAN DO IT! Sign"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[11px] font-black text-white mt-2 tracking-wider drop-shadow-sm select-none">
                YOU CAN DO IT! 🌟
              </span>
            </div>
          </div>
        </aside>

        {/* Right Main Dashboard Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Bar: Clean, spacious, dimensional controls */}
          <header className="pb-5 pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/70 mb-6">
            
            {/* Left Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-2xl bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-200 border border-white/60"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-xl lg:text-2xl font-black tracking-tight text-[#263047] dark:text-[#F3EEF9] flex items-center gap-2">
                  <span>{navItems.find((n) => n.id === currentTab)?.label}</span>
                  <span className="text-lg">✨</span>
                </h2>
              </div>
            </div>

            {/* Middle Search Bar with 3D Recessed Clay Pill Styling */}
            <div className="w-full sm:w-72 lg:w-96 relative">
              <Search className="w-4 h-4 text-gray-400 absolute start-4 top-3.5" />
              <input
                type="text"
                placeholder={t.header.searchPlaceholder}
                className="w-full ps-11 pe-4 py-2.5 rounded-full bg-[#FBF9F7] dark:bg-[#161F2E] border border-gray-200/80 dark:border-gray-700/80 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] transition-all"
              />
            </div>

            {/* Right Controls: Notification, Dark Mode, Language, Profile Avatar */}
            <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto shrink-0">
              
              {/* Notification Pill with Badge */}
              <button
                type="button"
                onClick={() => onTabChange('rescueMode')}
                className="w-11 h-11 rounded-full bg-white dark:bg-gray-800 shadow-[0_6px_14px_-2px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] border border-gray-200/70 dark:border-gray-700/70 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all relative cursor-pointer"
                title={t.header.notifications}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -end-1 w-4.5 h-4.5 bg-[#FF6584] text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                  3
                </span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="w-11 h-11 rounded-full bg-white dark:bg-gray-800 shadow-[0_6px_14px_-2px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] border border-gray-200/70 dark:border-gray-700/70 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Toggle Dark Mode"
              >
                {profile.isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-500" />}
              </button>

              {/* Language Switch */}
              <button
                type="button"
                onClick={onToggleLanguage}
                className="px-3.5 h-11 rounded-full bg-white dark:bg-gray-800 shadow-[0_6px_14px_-2px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] border border-gray-200/70 dark:border-gray-700/70 text-xs font-black text-gray-700 dark:text-gray-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {profile.language === 'ar' ? 'EN' : 'عربي'}
              </button>

              {/* Profile Avatar: Clicking opens Settings! */}
              <div
                onClick={() => onTabChange('settings')}
                className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#F7B9D5] to-[#C9B6F2] shadow-[0_8px_16px_-2px_rgba(124,85,200,0.25)] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title={`${profile.name || 'Student'} — ${t.nav.settings}`}
              >
                <AcademicTwin gender={profile.gender} pose="welcome" size="sm" />
              </div>

            </div>
          </header>

          {/* Main Content View */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
