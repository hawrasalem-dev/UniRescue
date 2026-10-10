import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AvatarConfig, AvatarExpression, Gender } from '../../types';
import { translations } from '../../i18n/translations';
import { AcademicTwin } from './AcademicTwin';
import {
  SKIN_TONES,
  HAIR_COLORS,
  FEMALE_HAIRSTYLES,
  MALE_HAIRSTYLES,
  EYE_COLORS,
  OUTFIT_STYLES,
  OUTFIT_COLORS,
  EYEWEAR_OPTIONS,
  ACCESSORIES,
  FACIAL_HAIR_OPTIONS,
  generateRandomAvatar,
} from '../../utils/avatarGenerator';
import { Sparkles, Check, Smile, Eye, Glasses, Shirt, Award } from 'lucide-react';

interface TwinStudioProps {
  avatar: AvatarConfig;
  onUpdateAvatar: (newAvatar: AvatarConfig) => void;
  language?: 'ar' | 'en';
}

export const TwinStudio: React.FC<TwinStudioProps> = ({
  avatar,
  onUpdateAvatar,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState<'hair' | 'face' | 'clothes' | 'accessories' | 'emotion'>('hair');

  const updateField = <K extends keyof AvatarConfig>(field: K, value: AvatarConfig[K]) => {
    const updated = { ...avatar, [field]: value };
    onUpdateAvatar(updated);
  };

  const handleRandomize = () => {
    const fresh = generateRandomAvatar(avatar.gender);
    fresh.use3DPhotoModel = avatar.use3DPhotoModel;
    onUpdateAvatar(fresh);
  };

  const handleEmotionClick = (expression: AvatarExpression) => {
    updateField('state', expression);
    if (expression === 'celebrating') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const hairstyles = avatar.gender === 'female' ? FEMALE_HAIRSTYLES : MALE_HAIRSTYLES;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="clay-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            {t.twinStudio.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 max-w-xl">
            {t.twinStudio.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          className="clay-button px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:opacity-95"
        >
          <Sparkles className="w-4 h-4" />
          {t.twinStudio.randomize}
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar Display & State Badge */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="clay-card p-8 w-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background ambient radial circle */}
            <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-purple-200/40 to-pink-200/30 blur-2xl -z-0" />
            
            <div className="relative z-10 my-4">
              <AcademicTwin avatar={avatar} size="xl" showBadge />
            </div>

            {/* Render Model Selector */}
            <div className="w-full mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400 text-center">
                نموذج العرض المفضل / Preferred Visual Engine:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateField('use3DPhotoModel', true)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                    avatar.use3DPhotoModel
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  3D Clay Master
                </button>
                <button
                  type="button"
                  onClick={() => updateField('use3DPhotoModel', false)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                    !avatar.use3DPhotoModel
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Composable Vector
                </button>
              </div>
            </div>

            {/* Emotional Expressions Bar */}
            <div className="w-full mt-5">
              <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                {t.twinStudio.emotionsTitle}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['welcome', 'planning', 'focus', 'celebrating', 'encouraging', 'rescue'] as AvatarExpression[]).map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => handleEmotionClick(exp)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      avatar.state === exp
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600'
                        : 'bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span>
                      {exp === 'welcome' && '👋'}
                      {exp === 'planning' && '📝'}
                      {exp === 'focus' && '⚡'}
                      {exp === 'celebrating' && '🎉'}
                      {exp === 'encouraging' && '💖'}
                      {exp === 'rescue' && '🚨'}
                    </span>
                    <span className="truncate">
                      {exp === 'welcome' && t.twinStudio.emotionWelcome}
                      {exp === 'planning' && t.twinStudio.emotionPlanning}
                      {exp === 'focus' && t.twinStudio.emotionFocus}
                      {exp === 'celebrating' && t.twinStudio.emotionCelebrating}
                      {exp === 'encouraging' && t.twinStudio.emotionEncouraging}
                      {exp === 'rescue' && t.twinStudio.emotionRescue}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-7">
          <div className="clay-card p-6 md:p-8">
            {/* Customization Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('hair')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'hair'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {t.twinStudio.hairStyle} & {t.twinStudio.hairColor}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('face')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'face'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {t.twinStudio.skinTone} & {t.twinStudio.eyeColor}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('clothes')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'clothes'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {t.twinStudio.outfitStyle}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('accessories')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'accessories'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {t.twinStudio.glasses} & {t.twinStudio.accessory}
              </button>
            </div>

            {/* Hair Tab */}
            {activeTab === 'hair' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.twinStudio.hairColor}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {HAIR_COLORS.map((hc) => (
                      <button
                        key={hc.id}
                        type="button"
                        onClick={() => updateField('hairColor', hc.color)}
                        className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                          avatar.hairColor === hc.color ? 'border-purple-600 scale-110 shadow-md' : 'border-white dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: hc.color }}
                        title={hc.label}
                      >
                        {avatar.hairColor === hc.color && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.twinStudio.hairStyle} ({hairstyles.length} options)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {hairstyles.map((hs) => (
                      <button
                        key={hs.id}
                        type="button"
                        onClick={() => updateField('hairStyle', hs.id)}
                        className={`p-3 rounded-2xl border text-xs font-semibold text-start transition-all ${
                          avatar.hairStyle === hs.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isRTL ? hs.labelAr : hs.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {avatar.gender === 'male' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {t.twinStudio.facialHair}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FACIAL_HAIR_OPTIONS.map((fh) => (
                        <button
                          key={fh.id}
                          type="button"
                          onClick={() => updateField('facialHair', fh.id)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-start transition-all ${
                            avatar.facialHair === fh.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {isRTL ? fh.labelAr : fh.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Face & Skin Tab */}
            {activeTab === 'face' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.twinStudio.skinTone}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {SKIN_TONES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateField('skinTone', st.color)}
                        className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          avatar.skinTone === st.color ? 'border-purple-600 scale-110 shadow-md' : 'border-white dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: st.color }}
                        title={st.label}
                      >
                        {avatar.skinTone === st.color && <Check className="w-4 h-4 text-gray-700" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.twinStudio.eyeColor}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {EYE_COLORS.map((ec) => (
                      <button
                        key={ec.id}
                        type="button"
                        onClick={() => updateField('eyeColor', ec.color)}
                        className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          avatar.eyeColor === ec.color ? 'border-purple-600 scale-110 shadow-md' : 'border-white dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: ec.color }}
                        title={ec.label}
                      >
                        {avatar.eyeColor === ec.color && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Clothes Tab */}
            {activeTab === 'clothes' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.twinStudio.outfitColor}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {OUTFIT_COLORS.map((oc) => (
                      <button
                        key={oc.id}
                        type="button"
                        onClick={() => updateField('outfitColor', oc.color)}
                        className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          avatar.outfitColor === oc.color ? 'border-purple-600 scale-110 shadow-md' : 'border-white dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: oc.color }}
                        title={oc.label}
                      >
                        {avatar.outfitColor === oc.color && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.twinStudio.outfitStyle}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {OUTFIT_STYLES.map((os) => (
                      <button
                        key={os.id}
                        type="button"
                        onClick={() => updateField('outfitStyle', os.id)}
                        className={`p-3 rounded-2xl border text-xs font-semibold text-start transition-all ${
                          avatar.outfitStyle === os.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isRTL ? os.labelAr : os.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Accessories Tab */}
            {activeTab === 'accessories' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.twinStudio.glasses}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {EYEWEAR_OPTIONS.map((ey) => (
                      <button
                        key={ey.id}
                        type="button"
                        onClick={() => updateField('glasses', ey.id)}
                        className={`p-3 rounded-2xl border text-xs font-semibold text-start transition-all ${
                          avatar.glasses === ey.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isRTL ? ey.labelAr : ey.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.twinStudio.accessory}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ACCESSORIES.map((ac) => (
                      <button
                        key={ac.id}
                        type="button"
                        onClick={() => updateField('accessory', ac.id)}
                        className={`p-3 rounded-2xl border text-xs font-semibold text-start transition-all ${
                          avatar.accessory === ac.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isRTL ? ac.labelAr : ac.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
