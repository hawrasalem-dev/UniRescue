import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TaskItem, StudyPreferences, RescuePlan, Language, Gender } from '../../types';
import { translations } from '../../i18n/translations';
import { generateRescueAssessment } from '../../utils/scheduler';
import { AcademicTwin } from '../avatar/AcademicTwin';
import { ShieldAlert, Sparkles, Check, Clock, AlertTriangle } from 'lucide-react';

interface RescueModeViewProps {
  tasks: TaskItem[];
  preferences: StudyPreferences;
  gender: Gender;
  onApplyRescuePlan: (plan: RescuePlan) => void;
  language?: Language;
}

export const RescueModeView: React.FC<RescueModeViewProps> = ({
  tasks,
  preferences,
  gender,
  onApplyRescuePlan,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<RescuePlan>(() => generateRescueAssessment(tasks, preferences));
  const [twinAiAdvice, setTwinAiAdvice] = useState<string>('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const presets = [
    { id: 'missed_today', text: t.rescueMode.preset1 },
    { id: 'surprise_exam', text: t.rescueMode.preset2 },
    { id: 'two_hours_left', text: t.rescueMode.preset3 },
    { id: 'early_finish', text: t.rescueMode.preset4 },
  ];

  const handleRunRescue = async (scenarioText: string) => {
    setIsLoading(true);
    setAppliedSuccess(false);

    const newPlan = generateRescueAssessment(tasks, preferences, scenarioText);
    setPlan(newPlan);

    try {
      const res = await fetch('/api/rescue-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: scenarioText,
          tasks: tasks.filter((t) => !t.completed).map((t) => ({
            title: t.title,
            course: t.course,
            deadline: t.deadline,
            duration: t.durationMinutes,
            priority: t.priority,
          })),
          availableHoursToday: preferences.studyHoursPerDay,
          language,
        }),
      });
      const data = await res.json();
      if (data.advice) {
        setTwinAiAdvice(data.advice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApplyRescuePlan(plan);
    setAppliedSuccess(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Character and Clear Alert Badge (No overlap!) */}
      <div className="clay-card p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent border-amber-200/50 dark:border-amber-900/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left Title and Subtitle */}
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-[#263047] dark:text-[#F3EEF9]">
                  {t.rescueMode.title}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    plan.status === 'critical'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : plan.status === 'heavy'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                  }`}
                >
                  {plan.status === 'critical' ? t.rescueMode.overloadBadge : t.rescueMode.balancedBadge}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1 max-w-xl">
                {t.rescueMode.subtitle}
              </p>
            </div>
          </div>

          {/* Academic Character in separate clean badge */}
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 pe-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
            <AcademicTwin gender={gender} pose="welcome" size="sm" />
            <div className="text-xs">
              <span className="font-extrabold text-[#263047] dark:text-gray-200 block">
                {isRTL ? 'نصيحة توأمك الأكاديمي:' : 'Companion Advice:'}
              </span>
              <p className="text-[#6B7280] dark:text-gray-400 text-[11px] max-w-xs truncate">
                {twinAiAdvice || (isRTL ? plan.twinAdviceAr : plan.twinAdviceEn)}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 1-Click Quick Rescue Presets */}
      <div className="clay-card p-6 bg-white dark:bg-[#1E172A] space-y-4">
        <h3 className="text-xs font-bold text-[#6B7280] dark:text-gray-400">
          {t.rescueMode.presetsTitle}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setActivePreset(preset.id);
                handleRunRescue(preset.text);
              }}
              className={`p-3.5 rounded-2xl border text-xs font-bold text-start transition-all flex items-center justify-between gap-2 ${
                activePreset === preset.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800 text-[#374151] dark:text-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{preset.text}</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder={isRTL ? 'اكتب ظرفك الطارئ وسنقوم بإنقاذ جدولك فوراً...' : 'Describe your academic emergency...'}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-[#263047] dark:text-gray-100 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customQuery.trim()) {
                handleRunRescue(customQuery);
              }
            }}
          />
          <button
            type="button"
            onClick={() => customQuery.trim() && handleRunRescue(customQuery)}
            disabled={isLoading || !customQuery.trim()}
            className="clay-button px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-sm hover:bg-purple-700 disabled:opacity-50"
          >
            {isRTL ? 'تحليل الإنقاذ' : 'Analyze Rescue'}
          </button>
        </div>
      </div>

      {/* Numerical Capacity Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="clay-card p-5 bg-white dark:bg-[#1E172A]">
          <div className="text-xs font-bold text-[#6B7280] dark:text-gray-400 mb-1">{t.rescueMode.hoursNeeded}</div>
          <div className="text-2xl font-extrabold text-[#263047] dark:text-gray-100 font-mono">
            {plan.hoursNeeded} <span className="text-xs font-normal text-[#6B7280] dark:text-gray-400">{isRTL ? 'ساعات' : 'hrs'}</span>
          </div>
        </div>

        <div className="clay-card p-5 bg-white dark:bg-[#1E172A]">
          <div className="text-xs font-bold text-[#6B7280] dark:text-gray-400 mb-1">{t.rescueMode.hoursAvailable}</div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {plan.hoursAvailable} <span className="text-xs font-normal text-[#6B7280] dark:text-gray-400">{isRTL ? 'ساعات' : 'hrs'}</span>
          </div>
        </div>

        <div className="clay-card p-5 bg-white dark:bg-[#1E172A]">
          <div className="text-xs font-bold text-[#6B7280] dark:text-gray-400 mb-1">
            {isRTL ? 'العجز الزمني التقديري' : 'Workload Deficit'}
          </div>
          <div className={`text-2xl font-extrabold font-mono ${plan.deficitHours > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {plan.deficitHours > 0 ? `-${plan.deficitHours}` : '0'}{' '}
            <span className="text-xs font-normal text-[#6B7280] dark:text-gray-400">{isRTL ? 'ساعات' : 'hrs'}</span>
          </div>
        </div>
      </div>

      {/* Suggested Action Triage */}
      <div className="clay-card p-6 md:p-8 space-y-4 bg-white dark:bg-[#1E172A]">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9]">
            {isRTL ? 'خطة الأولويات المقترحة بدون إرهاق' : 'Recommended Recovery Actions'}
          </h3>
          <span className="text-xs text-[#6B7280] dark:text-gray-400">
            {plan.actions.length} {isRTL ? 'مهام قيد التحليل' : 'tasks analyzed'}
          </span>
        </div>

        {plan.actions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B7280] dark:text-gray-400">
            {t.rescueMode.emptyRescue}
          </div>
        ) : (
          <div className="space-y-3">
            {plan.actions.map((act, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        act.action === 'prioritize_today'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : act.action === 'postpone'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : act.action === 'break_down'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {act.action === 'prioritize_today' && (isRTL ? 'أولوية قصوى اليوم' : 'Prioritize Today')}
                      {act.action === 'postpone' && (isRTL ? 'تأجيل آمن' : 'Postpone Safely')}
                      {act.action === 'break_down' && (isRTL ? 'تجزئة إلى فترات' : 'Break Down')}
                      {act.action === 'lighten' && (isRTL ? 'تركيز على الأساسيات' : 'Core Focus')}
                    </span>
                    <h4 className="font-bold text-sm text-[#263047] dark:text-gray-100">
                      {act.taskTitle}
                    </h4>
                  </div>
                  <p className="text-xs text-[#4B5563] dark:text-gray-400 mt-1">
                    {isRTL ? act.reasonAr : act.reasonEn}
                  </p>
                </div>

                {act.suggestedDate && (
                  <div className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl self-start md:self-auto shrink-0">
                    {isRTL ? `الموعد المقترح: ${act.suggestedDate}` : `Suggested: ${act.suggestedDate}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {plan.actions.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#4B5563] dark:text-gray-400">
              {isRTL
                ? 'لن يتم حذف أي مهمة حتمية؛ سيتم فقط إعادة جدولة جلسات المذاكرة في التقويم.'
                : 'No tasks are deleted; calendar study blocks will be rescheduled.'}
            </p>

            <button
              type="button"
              onClick={handleApply}
              className="clay-button w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.rescueMode.applyRescuePlan}</span>
            </button>
          </div>
        )}

        {appliedSuccess && (
          <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{t.rescueMode.planAppliedSuccess}</span>
          </div>
        )}
      </div>

    </div>
  );
};
