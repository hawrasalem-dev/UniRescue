import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, Gender, AcademicLevel, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { AcademicTwin } from '../avatar/AcademicTwin';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Globe,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  onResetDemoData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  isDemoMode,
  onToggleDemoMode,
  onResetDemoData,
}) => {
  const t = translations[profile.language];
  const isRTL = profile.language === 'ar';

  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(profile.academicLevel);
  const [studyHours, setStudyHours] = useState(profile.preferences.studyHoursPerDay);
  const [sessionLen, setSessionLen] = useState(profile.preferences.sessionLengthMinutes);
  const [breakLen, setBreakLen] = useState(profile.preferences.breakLengthMinutes);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    // Automatic theme assignment based on gender
    const autoTheme = newGender === 'female' ? 'pink' : 'blue';
    onUpdateProfile({
      gender: newGender,
      theme: autoTheme,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const autoTheme = gender === 'female' ? 'pink' : 'blue';
    onUpdateProfile({
      name: name.trim() || profile.name,
      gender,
      theme: autoTheme,
      academicLevel,
      preferences: {
        ...profile.preferences,
        studyHoursPerDay: studyHours,
        sessionLengthMinutes: sessionLen,
        breakLengthMinutes: breakLen,
      },
    });

    setSavedNotice(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="clay-card p-6 md:p-8 flex items-center justify-between bg-white dark:bg-[#1E172A]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-inner">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#263047] dark:text-[#F3EEF9]">
              {t.settings.title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRTL
                ? 'إدارة هويتك الأكاديمية والسمة واللغة'
                : 'Manage profile, academic level, and preferences'}
            </p>
          </div>
        </div>

        <AcademicTwin gender={profile.gender} pose="welcome" size="sm" />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="clay-card p-6 md:p-8 bg-white dark:bg-[#1E172A] space-y-5">
          <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9] border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-500" />
            {t.settings.profileInfo}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {t.settings.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {t.settings.levelLabel}
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(Number(e.target.value) as AcademicLevel)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {t.onboarding.levelOption.replace('{n}', String(lvl))}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender (Determines theme, mascot, character automatically!) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t.settings.genderLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`p-4 rounded-2xl border-2 text-start transition-all flex items-center justify-between ${
                  gender === 'female'
                    ? 'border-[#F7B9D5] bg-[#FFF0F6] dark:bg-pink-950/30 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👩‍🎓</span>
                  <div>
                    <span className="text-xs font-extrabold text-gray-800 dark:text-gray-100 block">
                      {t.settings.female}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Soft Pink & Lavender
                    </span>
                  </div>
                </div>
                {gender === 'female' && <Check className="w-5 h-5 text-pink-600" />}
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`p-4 rounded-2xl border-2 text-start transition-all flex items-center justify-between ${
                  gender === 'male'
                    ? 'border-[#3678D8] bg-[#EEF5FF] dark:bg-blue-950/30 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👨‍🎓</span>
                  <div>
                    <span className="text-xs font-extrabold text-gray-800 dark:text-gray-100 block">
                      {t.settings.male}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Royal Blue & Navy
                    </span>
                  </div>
                </div>
                {gender === 'male' && <Check className="w-5 h-5 text-blue-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Display & Study Rules */}
        <div className="clay-card p-6 md:p-8 bg-white dark:bg-[#1E172A] space-y-5">
          <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9] border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            {isRTL ? 'تفضيلات الواجهة والمذاكرة' : 'Display & Study Preferences'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {profile.isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {t.settings.darkMode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateProfile({ isDarkMode: !profile.isDarkMode })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  profile.isDarkMode ? 'bg-purple-600 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Language Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-purple-500" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {t.settings.language}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => onUpdateProfile({ language: 'ar' })}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    profile.language === 'ar' ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateProfile({ language: 'en' })}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    profile.language === 'en' ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {t.settings.savedSuccess}
            </span>
          ) : <div />}

          <button
            type="submit"
            className="clay-button px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md"
          >
            {t.settings.saveSettings}
          </button>
        </div>

      </form>
    </div>
  );
};
