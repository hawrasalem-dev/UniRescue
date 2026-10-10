import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { StudySession, TaskItem, Exam, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface CalendarViewProps {
  sessions: StudySession[];
  tasks: TaskItem[];
  exams?: Exam[];
  onToggleSessionComplete: (sessionId: string) => void;
  language?: Language;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  tasks,
  exams = [],
  onToggleSessionComplete,
  language = 'ar',
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const t = translations[language];
  const isRTL = language === 'ar';

  const formatDayHeader = (d: Date) => {
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const shiftDate = (amount: number) => {
    const next = new Date(selectedDate);
    if (viewMode === 'day') next.setDate(next.getDate() + amount);
    else if (viewMode === 'week') next.setDate(next.getDate() + amount * 7);
    else next.setMonth(next.getMonth() + amount);
    setSelectedDate(next);
  };

  // Generate 7 days centered on selectedDate
  const currentWeekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(selectedDate);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    d.setDate(d.getDate() - dayOfWeek + i);
    return d;
  });

  const getSessionsForDate = (dateStr: string) => {
    return sessions.filter((s) => s.date === dateStr);
  };

  const getExamsForDate = (dateStr: string) => {
    return exams.filter((e) => e.date === dateStr);
  };

  const handleSessionCheck = (sessionId: string, wasCompleted: boolean) => {
    onToggleSessionComplete(sessionId);
    if (!wasCompleted) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="clay-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1E172A]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-inner">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#263047] dark:text-[#F3EEF9]">
              {selectedDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <p className="text-xs text-gray-400">{t.calendar.scheduleNotice}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Arrow navigation */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-xl cursor-pointer"
            >
              {isRTL ? 'اليوم' : 'Today'}
            </button>
            <button
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                {mode === 'day' && t.calendar.dayView}
                {mode === 'week' && t.calendar.weekView}
                {mode === 'month' && t.calendar.monthView}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spacious Full-Width Horizontal Weekly Calendar View */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          {currentWeekDays.map((d, index) => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const daySessions = getSessionsForDate(dateStr);
            const dayExams = getExamsForDate(dateStr);
            const totalItems = daySessions.length + dayExams.length;

            return (
              <div
                key={index}
                className={`clay-card p-5 md:p-6 transition-all bg-white dark:bg-[#1E172A] ${
                  isToday
                    ? 'border-2 border-purple-400 dark:border-purple-500 shadow-md ring-2 ring-purple-100 dark:ring-purple-950/40'
                    : 'border-transparent'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Day Date Header pill on the left */}
                  <div className="lg:w-48 shrink-0 flex lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-2 border-b lg:border-b-0 lg:border-e border-gray-100 dark:border-gray-800 pb-2 lg:pb-0 lg:pe-4">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase">
                        {d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long' })}
                      </div>
                      <div className="text-xl font-extrabold text-[#263047] dark:text-[#F3EEF9]">
                        {d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {isToday && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white shadow-xs">
                        {isRTL ? 'اليوم' : 'Today'}
                      </span>
                    )}
                  </div>

                  {/* Day's Events and Study Blocks in a flexible, spacious row */}
                  <div className="flex-1 min-w-0">
                    {totalItems === 0 ? (
                      <div className="text-xs text-gray-400 py-3 italic">
                        {isRTL ? 'لا توجد جلسات أو اختبارات مجدولة' : 'No scheduled items'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {/* Distinct Exam Markers */}
                        {dayExams.map((ex) => (
                          <div
                            key={ex.id}
                            className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2.5 shadow-xs"
                          >
                            <GraduationCap className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-200/60 dark:bg-red-900/60 text-red-800 dark:text-red-200">
                                {isRTL ? 'موعد اختبار' : 'Exam'}
                              </span>
                              <h4 className="font-extrabold text-xs text-gray-800 dark:text-gray-100 mt-1 truncate">
                                {ex.course} — {ex.title}
                              </h4>
                              <span className="text-[11px] text-gray-500 font-mono">
                                ⏰ {ex.time}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Study Sessions */}
                        {daySessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                              session.completed
                                ? 'bg-green-50/60 dark:bg-green-950/20 border-green-200 text-gray-400'
                                : 'bg-gray-50 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700 shadow-xs'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase">
                                {session.course}
                              </span>
                              <h4 className={`font-bold text-xs text-gray-800 dark:text-gray-100 mt-1 line-clamp-1 ${session.completed ? 'line-through text-gray-400' : ''}`}>
                                {session.taskTitle}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1 font-mono">
                                <Clock className="w-3 h-3 text-purple-500" />
                                <span>{session.startTime} - {session.endTime}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSessionCheck(session.id, session.completed)}
                              className="text-gray-400 hover:text-green-600 shrink-0 p-1"
                              title="Toggle Complete"
                            >
                              <CheckCircle className={`w-5 h-5 ${session.completed ? 'text-green-500 fill-green-50' : ''}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="clay-card p-6 md:p-8 space-y-4 bg-white dark:bg-[#1E172A]">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-lg font-bold text-[#263047] dark:text-[#F3EEF9]">
              {formatDayHeader(selectedDate)}
            </h3>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/40 px-3 py-1 rounded-full">
              {getSessionsForDate(selectedDate.toISOString().split('T')[0]).length} {isRTL ? 'جلسات' : 'sessions'}
            </span>
          </div>

          <div className="space-y-3">
            {getSessionsForDate(selectedDate.toISOString().split('T')[0]).length === 0 &&
            getExamsForDate(selectedDate.toISOString().split('T')[0]).length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                {t.calendar.noSessionsToday}
              </div>
            ) : (
              <>
                {getExamsForDate(selectedDate.toISOString().split('T')[0]).map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-6 h-6 text-red-600" />
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100">
                          {ex.course} — {ex.title}
                        </h4>
                        <span className="text-xs text-gray-500">⏰ {ex.time}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                      {isRTL ? 'اختبار اليوم' : 'Exam Today'}
                    </span>
                  </div>
                ))}

                {getSessionsForDate(selectedDate.toISOString().split('T')[0]).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSessionCheck(session.id, session.completed)}
                        className="text-gray-400 hover:text-green-600"
                      >
                        <CheckCircle className={`w-5 h-5 ${session.completed ? 'text-green-500 fill-green-50' : ''}`} />
                      </button>
                      <div>
                        <h4 className={`text-sm font-bold text-gray-800 dark:text-gray-100 ${session.completed ? 'line-through text-gray-400' : ''}`}>
                          {session.taskTitle}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {session.course} · {session.durationMinutes} min
                        </p>
                      </div>
                    </div>

                    <div className="font-mono text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl">
                      {session.startTime} - {session.endTime}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="clay-card p-6 bg-white dark:bg-[#1E172A] overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 mb-2">
            <span>{t.days.sun}</span>
            <span>{t.days.mon}</span>
            <span>{t.days.tue}</span>
            <span>{t.days.wed}</span>
            <span>{t.days.thu}</span>
            <span>{t.days.fri}</span>
            <span>{t.days.sat}</span>
          </div>

          <div className="grid grid-cols-7 gap-2 min-w-[500px]">
            {Array.from({ length: 31 }).map((_, i) => {
              const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
              const dateStr = d.toISOString().split('T')[0];
              const daySessions = getSessionsForDate(dateStr);
              const dayExams = getExamsForDate(dateStr);

              return (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedDate(d);
                    setViewMode('day');
                  }}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 min-h-[75px] cursor-pointer hover:border-purple-400 transition-colors flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{i + 1}</span>
                  <div className="space-y-1">
                    {dayExams.length > 0 && (
                      <span className="text-[10px] font-extrabold text-red-600 bg-red-100 dark:bg-red-950/60 px-1 py-0.5 rounded block truncate">
                        🎓 {dayExams.length} {isRTL ? 'اختبار' : 'Exam'}
                      </span>
                    )}
                    {daySessions.length > 0 && (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-1 py-0.5 rounded block truncate">
                        📖 {daySessions.length} {isRTL ? 'جلسة' : 'Sess'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
