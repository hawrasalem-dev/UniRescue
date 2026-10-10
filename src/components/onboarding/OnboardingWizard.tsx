import React, { useState } from 'react';
import { UserProfile, Gender, Language, AcademicLevel } from '../../types';
import { translations } from '../../i18n/translations';
import { AcademicTwin } from '../avatar/AcademicTwin';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  initialLang?: Language;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  initialLang = 'ar',
}) => {
  const [lang, setLang] = useState<Language>(initialLang);
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<Gender>('female');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(1);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(t.onboarding.requiredError);
      return;
    }

    const defaultTheme = gender === 'female' ? 'pink' : 'blue';
    const profile: UserProfile = {
      name: name.trim(),
      gender,
      academicLevel,
      language: lang,
      theme: defaultTheme,
      isDarkMode: false,
      preferences: {
        studyHoursPerDay: 4,
        availableDays: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        sessionLengthMinutes: 45,
        breakLengthMinutes: 10,
        preferredStudyTime: 'afternoon',
      },
      isOnboarded: true,
      createdAt: new Date().toISOString(),
    };

    onComplete(profile);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8 transition-colors duration-300"
      style={{
        background: gender === 'female'
          ? 'linear-gradient(135deg, #FFF8FC 0%, #F5ECFA 50%, #FFF0F6 100%)'
          : 'linear-gradient(135deg, #EDF6FF 0%, #E3EFFF 50%, #F0F7FF 100%)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/80 dark:border-gray-800 transition-all duration-300">
        
        {/* Header with Language Switch */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shadow-md text-white ${
                gender === 'female' ? 'bg-[#C9B6F2]' : 'bg-[#3678D8]'
              }`}
            >
              {gender === 'female' ? '🐱' : '🐺'}
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
                {t.appName}
              </h1>
              <p className="text-xs text-gray-400">{t.appTagline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
          >
            {lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t.onboarding.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t.onboarding.subtitle}
          </p>
        </div>

        {/* Character Illustration Preview */}
        <div className="flex justify-center mb-6">
          <AcademicTwin gender={gender} pose="welcome" size="lg" />
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-5">
          {/* 1. Student Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.onboarding.nameLabel} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
              placeholder={t.onboarding.namePlaceholder}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-medium"
              autoFocus
            />
          </div>

          {/* 2. Gender Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.onboarding.genderLabel} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                  gender === 'female'
                    ? 'border-[#F7B9D5] bg-[#FFF0F6] dark:bg-pink-950/30 text-gray-800 dark:text-gray-100 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-xl">👩‍🎓</span>
                <span className="text-xs font-extrabold">{t.onboarding.female}</span>
              </button>

              <button
                type="button"
                onClick={() => setGender('male')}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                  gender === 'male'
                    ? 'border-[#3678D8] bg-[#EEF5FF] dark:bg-blue-950/30 text-gray-800 dark:text-gray-100 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-xl">👨‍🎓</span>
                <span className="text-xs font-extrabold">{t.onboarding.male}</span>
              </button>
            </div>
          </div>

          {/* 3. Academic Level */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.onboarding.academicLevelLabel} *
            </label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(Number(e.target.value) as AcademicLevel)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs font-bold"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {t.onboarding.levelOption.replace('{n}', String(lvl))}
                </option>
              ))}
            </select>
          </div>

          {/* Prominent "انطلق" / "Let's Go" Button */}
          <div className="pt-4">
            <button
              type="submit"
              className={`clay-button w-full py-3.5 rounded-2xl text-white font-extrabold text-base shadow-lg flex items-center justify-center gap-2 transition-all ${
                gender === 'female'
                  ? 'bg-gradient-to-r from-[#F7B9D5] to-[#C9B6F2] text-[#263047]'
                  : 'bg-gradient-to-r from-[#3678D8] to-[#142D55] text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{t.onboarding.submitButton}</span>
              {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
