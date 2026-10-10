import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, TaskItem, StudySession, Exam, CompletedStudyRecord, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { AcademicTwin } from '../avatar/AcademicTwin';
import {
  Clock,
  Briefcase,
  Check,
  Calendar,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

import succulentImg from '../../assets/images/clay_succulent_plant_1791657339931.jpg';
import cloudImg from '../../assets/images/clay_happy_cloud_1791657349756.jpg';

const SUCCULENT_IMG = succulentImg;
const CLOUD_IMG = cloudImg;

interface OverviewDashboardProps {
  profile: UserProfile;
  tasks: TaskItem[];
  sessions: StudySession[];
  exams?: Exam[];
  studyHistory?: CompletedStudyRecord[];
  onToggleTask: (taskId: string) => void;
  onNavigateTab: (tab: string) => void;
  language?: Language;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  profile,
  tasks,
  sessions,
  exams = [],
  studyHistory = [],
  onToggleTask,
  onNavigateTab,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const now = new Date();
  const tasksDueSoon = pendingTasks.filter((t) => {
    const diffHours = (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 3600);
    return diffHours > 0 && diffHours <= 48;
  });

  const totalCourses = new Set([
    ...tasks.map((t) => t.course),
    ...exams.map((e) => e.course),
  ]).size;

  // Real logged session hours from completedStudyRecord and completed scheduled sessions
  const historyMinutes = studyHistory.reduce((acc, h) => acc + (h.durationMinutes || 0), 0);
  const completedSessionMinutes = sessions
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalCompletedMinutes = historyMinutes + completedSessionMinutes;
  const studyHours = Math.round((totalCompletedMinutes / 60) * 10) / 10;

  // Calculate real week days activity from user records
  const dayNamesAr = [
    { key: 'sat', label: 'السبت', short: 'سبت', dayIndex: 6 },
    { key: 'sun', label: 'الأحد', short: 'أحد', dayIndex: 0 },
    { key: 'mon', label: 'الاثنين', short: 'اثنين', dayIndex: 1 },
    { key: 'tue', label: 'الثلاثاء', short: 'ثلاثاء', dayIndex: 2 },
    { key: 'wed', label: 'الأربعاء', short: 'أربعاء', dayIndex: 3 },
    { key: 'thu', label: 'الخميس', short: 'خميس', dayIndex: 4 },
    { key: 'fri', label: 'الجمعة', short: 'جمعة', dayIndex: 5 },
  ];

  const dayNamesEn = [
    { key: 'mon', label: 'Monday', short: 'Mon', dayIndex: 1 },
    { key: 'tue', label: 'Tuesday', short: 'Tue', dayIndex: 2 },
    { key: 'wed', label: 'Wednesday', short: 'Wed', dayIndex: 3 },
    { key: 'thu', label: 'Thursday', short: 'Thu', dayIndex: 4 },
    { key: 'fri', label: 'Friday', short: 'Fri', dayIndex: 5 },
    { key: 'sat', label: 'Saturday', short: 'Sat', dayIndex: 6 },
    { key: 'sun', label: 'Sunday', short: 'Sun', dayIndex: 0 },
  ];

  const dayTemplates = isRTL ? dayNamesAr : dayNamesEn;

  // Aggregate real study hours & tasks done per day from studyHistory and sessions
  const weekDays = dayTemplates.map((d) => {
    let dayMins = 0;
    let dayTasksCount = 0;

    // From completed study history
    studyHistory.forEach((rec) => {
      const recDate = new Date(rec.completedDate || rec.timestamp);
      if (recDate.getDay() === d.dayIndex) {
        dayMins += rec.durationMinutes || 0;
        dayTasksCount += 1;
      }
    });

    // From scheduled sessions completed
    sessions.forEach((sess) => {
      if (sess.completed && sess.date) {
        const sessDate = new Date(sess.date);
        if (sessDate.getDay() === d.dayIndex) {
          dayMins += sess.durationMinutes || 0;
          dayTasksCount += 1;
        }
      }
    });

    return {
      key: d.key,
      label: d.label,
      short: d.short,
      hours: Math.round((dayMins / 60) * 10) / 10,
      tasks: dayTasksCount,
    };
  });

  const totalWeeklyFocusHours = Math.round(weekDays.reduce((acc, d) => acc + d.hours, 0) * 10) / 10;
  const maxHours = Math.max(...weekDays.map((d) => d.hours), 4);

  const handleTaskClick = (taskId: string, wasCompleted: boolean) => {
    onToggleTask(taskId);
    if (!wasCompleted) {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.65 },
      });
    }
  };

  const readyQuestion =
    profile.gender === 'female'
      ? t.header.femaleReady
      : t.header.maleReady;

  return (
    <div className="space-y-6">
      
      {/* ROW 1: Hero Welcome Banner + 3 Stat KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Welcome Banner Card with Large 3D Avatar */}
        <div
          className={`lg:col-span-5 clay-card p-6 md:p-8 flex items-center justify-between relative overflow-hidden border border-white/95 dark:border-white/10 ${
            profile.theme === 'pink'
              ? 'bg-gradient-to-br from-[#FFF4ED] via-[#FCF1FA] to-[#F5ECFB] dark:from-[#2E1C3A] dark:via-[#241731] dark:to-[#1B1125]'
              : 'bg-gradient-to-br from-[#EEF6FF] via-[#E5F1FC] to-[#DCEBFE] dark:from-[#13243F] dark:via-[#0F1C33] dark:to-[#0A1426]'
          }`}
        >
          {/* Ambient Lighting Circle */}
          <div className="absolute -top-12 -start-12 w-48 h-48 rounded-full bg-purple-200/35 dark:bg-purple-900/20 blur-3xl pointer-events-none" />

          {/* Avatar Section: Large, Prominent, Dimensional */}
          <div className="shrink-0 z-10 -ms-1 relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.25rem] p-1.5 bg-gradient-to-b from-white/95 to-white/40 dark:from-white/20 dark:to-white/5 border-2 border-white/90 dark:border-white/20 shadow-[0_16px_32px_-6px_rgba(45,30,60,0.18),inset_0_2px_3px_rgba(255,255,255,1)] transform group-hover:scale-105 transition-all duration-300">
              <AcademicTwin gender={profile.gender} pose="welcome" size="lg" className="w-full h-full" />
            </div>
          </div>

          {/* Text Section */}
          <div className="space-y-2.5 z-10 text-start ms-5 flex-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#263047] dark:text-[#F3EEF9]">
              {profile.name
                ? t.header.welcomeBanner.replace('{name}', profile.name)
                : (isRTL ? 'أهلاً بك في UniRescue!' : 'Welcome to UniRescue!')}
            </h2>
            <p className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 max-w-[220px] leading-relaxed">
              {readyQuestion}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('rescueMode')}
                className="clay-button px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800 text-[#7C55C8] dark:text-purple-300 text-xs font-black shadow-[0_8px_16px_-3px_rgba(124,85,200,0.18)] hover:bg-purple-50 flex items-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
                <span>{t.rescueMode.title}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Stat KPI Cards (Calculated strictly from real user records!) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Stat 1: Active Courses */}
          <div className="clay-card p-6 flex flex-col justify-between bg-white dark:bg-[#1E172A] relative overflow-hidden">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400">
                {t.stats.totalCourses}
              </span>
              <div className="w-14 h-14 rounded-2xl bg-[#D6C4F7] dark:bg-[#433168] clay-squircle flex items-center justify-center text-[#553896] dark:text-[#D6C4F7] shadow-md">
                <Briefcase className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl lg:text-4xl font-black text-[#263047] dark:text-white font-mono">
                {totalCourses}
              </div>
              <span className="text-[11px] text-[#6B7280] dark:text-gray-400 font-bold mt-1 block">
                {isRTL ? 'مقررات مسجلة' : 'Registered Courses'}
              </span>
            </div>
          </div>

          {/* Stat 2: Tasks Completed */}
          <div className="clay-card p-6 flex flex-col justify-between bg-white dark:bg-[#1E172A] relative overflow-hidden">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400">
                {t.stats.tasksCompleted}
              </span>
              <div className="w-14 h-14 rounded-2xl bg-[#FFC5B2] dark:bg-[#5C3026] clay-squircle flex items-center justify-center text-[#993A24] dark:text-[#FFC5B2] shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl lg:text-4xl font-black text-[#263047] dark:text-white font-mono">
                {completedCount}
              </div>
              <span className="text-[11px] text-[#6B7280] dark:text-gray-400 font-bold mt-1 block">
                {isRTL ? `من إجمالي ${tasks.length} مهام` : `of ${tasks.length} total tasks`}
              </span>
            </div>
          </div>

          {/* Stat 3: Study Hours Logged */}
          <div className="clay-card p-6 flex flex-col justify-between bg-white dark:bg-[#1E172A] relative overflow-hidden">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400">
                {t.stats.studyHours}
              </span>
              <div className="w-14 h-14 rounded-2xl bg-[#C1ECD1] dark:bg-[#204932] clay-squircle flex items-center justify-center text-[#215E36] dark:text-[#C1ECD1] shadow-md">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl lg:text-4xl font-black text-[#263047] dark:text-white font-mono">
                {studyHours}h
              </div>
              <span className="text-[11px] text-[#6B7280] dark:text-gray-400 font-bold mt-1 block">
                {isRTL ? 'مذاكرة موثقة' : 'Logged Sessions'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ROW 2: Activity Overview Weekly Bar Chart + Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Activity Weekly Chart (Inspired by reference dashboard) */}
        <div className="lg:col-span-7 clay-card p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-[#1E172A]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-black text-[#263047] dark:text-[#F3EEF9] flex items-center gap-2">
                <span>{t.sections.activityOverview}</span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 font-medium">
                {isRTL ? 'توزيع ساعات المذاكرة وجلسات التركيز هذا الأسبوع' : 'Weekly focus hours and study workload'}
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300 rounded-xl shadow-xs">
              {t.sections.thisWeek}
            </span>
          </div>

          {/* Interactive 3D Clay Pill Bar Chart */}
          <div className="py-4 my-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {weekDays.map((day, idx) => {
                const heightPct = Math.max(15, Math.round((day.hours / maxHours) * 100));
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={day.key}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                  >
                    {/* Floating Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-10 px-2.5 py-1 rounded-xl bg-[#263047] text-white text-[10px] font-black shadow-lg z-20 whitespace-nowrap animate-in fade-in zoom-in-95">
                        {day.hours}h · {day.tasks} {isRTL ? 'مهام' : 'tasks'}
                      </div>
                    )}

                    {/* 3D Clay Pill Bar */}
                    <div className="w-full max-w-[42px] bg-purple-50 dark:bg-purple-950/20 rounded-full p-1 flex flex-col justify-end h-full">
                      <div
                        className={`w-full rounded-full transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(124,85,200,0.25),inset_0_2px_2px_rgba(255,255,255,0.85)] ${
                          isHovered
                            ? 'bg-gradient-to-t from-[#B299E8] to-[#F7B9D5] scale-[1.03]'
                            : 'bg-gradient-to-t from-[#C9B6F2] to-[#E5D7FA]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>

                    {/* Day Label */}
                    <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400 group-hover:text-purple-600 transition-colors">
                      {day.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${totalWeeklyFocusHours > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-[#4B5563] dark:text-gray-300 font-semibold">
                {isRTL
                  ? `إجمالي المذاكرة الأسبوعية: ${totalWeeklyFocusHours} ساعة`
                  : `Total weekly focus: ${totalWeeklyFocusHours} hours`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('exams')}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
            >
              {isRTL ? 'استعراض الاختبارات' : 'View Exams'} →
            </button>
          </div>
        </div>

        {/* Today's Tasks List */}
        <div className="lg:col-span-5 clay-card p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-[#1E172A]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-[#263047] dark:text-[#F3EEF9]">
              {t.sections.myTasks}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
            >
              {t.sections.viewAll}
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[#6B7280] dark:text-gray-400 space-y-2">
                <span className="text-2xl">📝</span>
                <p>{t.sections.emptyDashboard}</p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('tasks')}
                  className="text-xs font-bold text-purple-600 underline cursor-pointer"
                >
                  {t.sections.addFirstTask}
                </button>
              </div>
            ) : (
              tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.id, task.completed)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-100 opacity-60'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-xs hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      {task.type === 'assignment' ? '✏️' : task.type === 'project' ? '💻' : '📖'}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold text-[#263047] dark:text-gray-200 line-clamp-1 ${task.completed ? 'line-through text-[#6B7280] dark:text-gray-500' : ''}`}>
                        {task.title}
                      </h4>
                      <span className="text-[11px] text-[#6B7280] dark:text-gray-400 font-medium">
                        {task.course} · {task.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                      task.completed
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {task.completed ? t.status.completed : t.status.inProgress}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ROW 3: Lower 3 Dimensional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        
        {/* Card 1: Course Progress Donut */}
        <div className="clay-card p-6 flex flex-col justify-between bg-white dark:bg-[#1E172A]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-[#263047] dark:text-[#F3EEF9]">
              {t.sections.courseProgress}
            </h3>
            <button
              onClick={() => onNavigateTab('progress')}
              className="text-xs text-purple-600 font-bold cursor-pointer"
            >
              {t.sections.viewAll}
            </button>
          </div>

          <div className="flex items-center justify-around py-3">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F3E8FF" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#C9B6F2"
                  strokeWidth="4"
                  strokeDasharray={`${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-black text-[#263047] dark:text-gray-100 font-mono">
                  {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}%` : '0%'}
                </span>
                <span className="block text-[8px] text-[#6B7280] dark:text-gray-400 font-black uppercase">Rate</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-[#374151] dark:text-gray-300">
                {completedCount} / {tasks.length} {isRTL ? 'مهام منجزة' : 'tasks done'}
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-gray-400 font-medium">
                {pendingTasks.length} {isRTL ? 'قيد المتابعة' : 'in queue'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Study Reminder Card (Integrated 3D Clay Succulent) */}
        <div className="clay-card p-6 flex items-center justify-between gap-4 bg-gradient-to-br from-[#FFF5F8] to-white dark:from-[#261B35] dark:to-[#1A1325]">
          <div className="w-18 h-18 rounded-2xl overflow-hidden shadow-md border-2 border-white/80 bg-white/40 shrink-0">
            <img
              src={SUCCULENT_IMG}
              alt="Study Companion Plant"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-black text-[#263047] dark:text-gray-100">
              {t.sections.dontForget}
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 font-medium">
              {t.sections.tasksDueSoon.replace('{count}', String(tasksDueSoon.length))}
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('tasks')}
              className="clay-button px-3.5 py-1.5 rounded-xl bg-[#C9B6F2] hover:bg-[#bba4e8] text-white text-xs font-black shadow-xs cursor-pointer"
            >
              {t.sections.viewTasks}
            </button>
          </div>
        </div>

        {/* Card 3: Academic Motivation Card (Integrated 3D Happy Cloud) */}
        <div className="clay-card p-6 flex items-center justify-between gap-4 bg-gradient-to-br from-[#FFF9EA] to-white dark:from-[#282116] dark:to-[#1C160E]">
          <div className="w-18 h-18 rounded-2xl overflow-hidden shadow-md border-2 border-white/80 bg-white/40 shrink-0">
            <img
              src={CLOUD_IMG}
              alt="Happy Cloud"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-black text-[#263047] dark:text-gray-100">
              {t.sections.encouragementTitle}
            </h4>
            <p className="text-xs text-[#4B5563] dark:text-gray-300 leading-relaxed font-medium">
              {profile.gender === 'female'
                ? t.sections.encouragementFemale
                : t.sections.encouragementMale}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
