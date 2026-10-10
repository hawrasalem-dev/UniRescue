import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Exam,
  Gender,
  Language,
  ActiveStudyTimer,
  CompletedStudyRecord,
} from '../../types';
import { translations } from '../../i18n/translations';
import { AcademicTwin } from '../avatar/AcademicTwin';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';

interface StudySessionViewProps {
  exams: Exam[];
  gender: Gender;
  activeTimer: ActiveStudyTimer | null;
  onUpdateActiveTimer: (timer: ActiveStudyTimer | null) => void;
  completedHistory: CompletedStudyRecord[];
  onCompleteChapter: (examId: string, chapterId: string, durationMinutes: number) => void;
  onNavigateToExams: () => void;
  language?: Language;
}

export const StudySessionView: React.FC<StudySessionViewProps> = ({
  exams,
  gender,
  activeTimer,
  onUpdateActiveTimer,
  completedHistory,
  onCompleteChapter,
  onNavigateToExams,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  // Session Setup Selection
  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    return activeTimer ? activeTimer.examId : exams[0]?.id || '';
  });
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    return activeTimer ? activeTimer.chapterId : exams[0]?.chapters[0]?.id || '';
  });
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  // Remaining Seconds calculated strictly from timestamps
  const [displaySeconds, setDisplaySeconds] = useState<number>(0);

  // Completion Dialog Modal
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Break Selector Modal
  const [showBreakSelector, setShowBreakSelector] = useState(false);

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const selectedChapter = selectedExam?.chapters.find((c) => c.id === selectedChapterId);

  // Timer Tick Effect (Uses absolute timestamps to prevent drift & survives refresh/tabs)
  useEffect(() => {
    if (!activeTimer) {
      setDisplaySeconds((durationHours * 60 + durationMinutes) * 60);
      return;
    }

    if (activeTimer.state === 'running') {
      const updateTick = () => {
        const now = Date.now();
        const diffMs = activeTimer.expectedEndTimestamp - now;
        const remaining = Math.max(0, Math.ceil(diffMs / 1000));
        setDisplaySeconds(remaining);

        if (remaining <= 0) {
          // Timer finished
          onUpdateActiveTimer({
            ...activeTimer,
            state: 'completed',
          });
          setShowCompletionDialog(true);
        }
      };

      updateTick();
      const interval = setInterval(updateTick, 1000);
      return () => clearInterval(interval);
    } else if (activeTimer.state === 'paused') {
      setDisplaySeconds(activeTimer.remainingSecondsAtPause);
    } else if (activeTimer.state === 'completed') {
      setDisplaySeconds(0);
      setShowCompletionDialog(true);
    }
  }, [activeTimer, durationHours, durationMinutes]);

  // Handlers
  const handleStartStudy = () => {
    if (!selectedExam || !selectedChapter) return;

    const totalSecs = (durationHours * 60 + durationMinutes) * 60;
    if (totalSecs <= 0) return;

    const now = Date.now();
    const newTimer: ActiveStudyTimer = {
      id: `timer_${now}`,
      examId: selectedExam.id,
      course: selectedExam.course,
      examTitle: selectedExam.title,
      chapterId: selectedChapter.id,
      chapterName: selectedChapter.name,
      totalDurationSeconds: totalSecs,
      remainingSecondsAtPause: totalSecs,
      startTimestamp: now,
      expectedEndTimestamp: now + totalSecs * 1000,
      state: 'running',
      sessionType: 'study',
    };

    onUpdateActiveTimer(newTimer);
  };

  const handlePause = () => {
    if (!activeTimer || activeTimer.state !== 'running') return;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((activeTimer.expectedEndTimestamp - now) / 1000));

    onUpdateActiveTimer({
      ...activeTimer,
      state: 'paused',
      remainingSecondsAtPause: remaining,
    });
  };

  const handleResume = () => {
    if (!activeTimer || activeTimer.state !== 'paused') return;
    const now = Date.now();
    const remainingSecs = activeTimer.remainingSecondsAtPause;

    onUpdateActiveTimer({
      ...activeTimer,
      state: 'running',
      startTimestamp: now,
      expectedEndTimestamp: now + remainingSecs * 1000,
    });
  };

  const handleReset = () => {
    if (!activeTimer) return;
    const totalSecs = activeTimer.totalDurationSeconds;
    const now = Date.now();

    onUpdateActiveTimer({
      ...activeTimer,
      state: 'paused',
      remainingSecondsAtPause: totalSecs,
      startTimestamp: now,
      expectedEndTimestamp: now + totalSecs * 1000,
    });
  };

  const handleEndSessionEarly = () => {
    setShowCompletionDialog(true);
  };

  const handleConfirmChapterDone = () => {
    if (!activeTimer) return;
    const studiedMins = Math.max(
      1,
      Math.round((activeTimer.totalDurationSeconds - displaySeconds) / 60)
    );

    onCompleteChapter(activeTimer.examId, activeTimer.chapterId, studiedMins);
    onUpdateActiveTimer(null);
    setShowCompletionDialog(false);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleNeedMoreTime = () => {
    setShowCompletionDialog(false);
    if (!activeTimer) return;
    // Reset timer with additional 30 mins
    const extensionSecs = 30 * 60;
    const now = Date.now();
    onUpdateActiveTimer({
      ...activeTimer,
      totalDurationSeconds: extensionSecs,
      remainingSecondsAtPause: extensionSecs,
      startTimestamp: now,
      expectedEndTimestamp: now + extensionSecs * 1000,
      state: 'running',
    });
  };

  const handleStartBreak = (breakMins: number) => {
    setShowBreakSelector(false);
    const now = Date.now();
    const breakSecs = breakMins * 60;

    if (activeTimer) {
      // Pause study and activate break
      const remainingStudySecs =
        activeTimer.state === 'running'
          ? Math.max(0, Math.ceil((activeTimer.expectedEndTimestamp - now) / 1000))
          : activeTimer.remainingSecondsAtPause;

      onUpdateActiveTimer({
        ...activeTimer,
        sessionType: 'break',
        state: 'running',
        remainingSecondsAtPause: remainingStudySecs,
        startTimestamp: now,
        expectedEndTimestamp: now + breakSecs * 1000,
        breakDurationSeconds: breakSecs,
      });
    } else {
      // Free break timer
      onUpdateActiveTimer({
        id: `break_${now}`,
        examId: '',
        course: 'Break',
        examTitle: 'Study Break',
        chapterId: '',
        chapterName: 'Relaxation',
        totalDurationSeconds: breakSecs,
        remainingSecondsAtPause: breakSecs,
        startTimestamp: now,
        expectedEndTimestamp: now + breakSecs * 1000,
        state: 'running',
        sessionType: 'break',
        breakDurationSeconds: breakSecs,
      });
    }
  };

  const handleEndBreakAndResumeStudy = () => {
    if (!activeTimer) return;
    const now = Date.now();
    const resumeStudySecs = activeTimer.remainingSecondsAtPause || 45 * 60;

    onUpdateActiveTimer({
      ...activeTimer,
      sessionType: 'study',
      state: 'running',
      startTimestamp: now,
      expectedEndTimestamp: now + resumeStudySecs * 1000,
    });
  };

  // Format HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // If no exams exist at all
  if (exams.length === 0) {
    return (
      <div className="clay-card p-12 text-center space-y-4 bg-white dark:bg-[#1E172A]">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
          📖
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            {t.studySession.noExamsTitle}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isRTL
              ? 'تتطلب جلسات المذاكرة اختيار شابتر مسجل ضمن أحد اختباراتك.'
              : 'Study sessions require selecting an active chapter from your exams.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToExams}
          className="clay-button px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t.studySession.goToExams}</span>
        </button>
      </div>
    );
  }

  const isTimerRunning = Boolean(activeTimer && activeTimer.state === 'running');
  const isBreakActive = Boolean(activeTimer && activeTimer.sessionType === 'break');

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="clay-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-[#FFF5F8] via-white to-[#F5EEFB] dark:from-[#281A36] dark:via-[#20152D] dark:to-[#191024]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#263047] dark:text-[#F3EEF9]">
            {t.studySession.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
            {t.studySession.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBreakSelector(true)}
          className="clay-button px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shrink-0"
        >
          <Coffee className="w-4 h-4" />
          <span>{t.studySession.breakButton}</span>
        </button>
      </div>

      {/* Main Grid: Timer on Left, Setup on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Large Countdown Clock & Studying Character */}
        <div className="lg:col-span-7 clay-card p-8 flex flex-col items-center justify-between bg-white dark:bg-[#1E172A] relative overflow-hidden">
          
          {/* Active Status Badge */}
          <div className="w-full flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              {isBreakActive
                ? t.studySession.breakRunning
                : activeTimer
                ? `${activeTimer.course} · ${activeTimer.chapterName}`
                : isRTL
                ? 'جاهز لبدء الجلسة'
                : 'Ready to Study'}
            </span>

            {isTimerRunning && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                {t.studySession.studyingActive}
              </span>
            )}
          </div>

          {/* Large Clock Display */}
          <div className="my-6 relative flex flex-col items-center justify-center">
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-full border-8 border-purple-100 dark:border-purple-950/40 flex flex-col items-center justify-center shadow-[inset_0_4px_8px_rgba(0,0,0,0.06)] bg-gradient-to-b from-white to-[#FDF8FC] dark:from-[#21162E] dark:to-[#170F20] relative">
              <span className="text-5xl md:text-6xl font-extrabold font-mono text-[#263047] dark:text-white tracking-wider">
                {formatTime(displaySeconds)}
              </span>
              <span className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 mt-2 uppercase tracking-widest">
                {isBreakActive ? 'Break Time' : 'Focus Time'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3 pt-2">
            {!activeTimer || activeTimer.state === 'idle' ? (
              <button
                type="button"
                onClick={handleStartStudy}
                className="clay-button px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t.studySession.startTimer}</span>
              </button>
            ) : isTimerRunning ? (
              <>
                <button
                  type="button"
                  onClick={handlePause}
                  className="clay-button px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>{t.studySession.pauseTimer}</span>
                </button>
                <button
                  type="button"
                  onClick={handleEndSessionEarly}
                  className="clay-button px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.studySession.finishTimer}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleResume}
                  className="clay-button px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t.studySession.resumeTimer}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="clay-button p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleEndSessionEarly}
                  className="clay-button px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md"
                >
                  {t.studySession.finishTimer}
                </button>
              </>
            )}
          </div>

          {/* Studying Academic Character Below Timer */}
          <div className="mt-8 flex flex-col items-center">
            <AcademicTwin
              gender={gender}
              pose="studying"
              size="lg"
              isAnimated={isTimerRunning && !isBreakActive}
            />
            <p className="text-xs text-gray-400 mt-2 font-medium">
              {isTimerRunning
                ? isBreakActive
                  ? 'خذ نفساً عميقاً واستمتع باستراحتك ☕'
                  : 'توأمك الأكاديمي يذاكر معك الآن في صمت وتركيز 📚'
                : 'اضغط على بدء الجلسة لمرافقة توأمك الأكاديمي'}
            </p>
          </div>

        </div>

        {/* Right Setup Box: Pick Exam, Chapter, Duration */}
        <div className="lg:col-span-5 clay-card p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-[#1E172A] space-y-6">
          <div className="space-y-5">
            <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9] border-b border-gray-100 dark:border-gray-800 pb-3">
              {isRTL ? 'إعدادات جلسة المذاكرة' : 'Session Configuration'}
            </h3>

            {/* Select Exam */}
            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1.5">
                {t.studySession.selectExam}
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  const ex = exams.find((x) => x.id === e.target.value);
                  if (ex && ex.chapters[0]) {
                    setSelectedChapterId(ex.chapters[0].id);
                  }
                }}
                disabled={isTimerRunning}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#263047] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.course} — {ex.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Chapter */}
            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1.5">
                {t.studySession.selectChapter}
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                disabled={isTimerRunning || !selectedExam}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#263047] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60"
              >
                {selectedExam?.chapters.map((chap) => (
                  <option key={chap.id} value={chap.id}>
                    {chap.name} {chap.completed ? '✅ (مكتمل)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selector: Hours and Minutes */}
            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-2">
                {t.studySession.durationLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-[#6B7280] dark:text-gray-400 block mb-1">{t.studySession.hours}</span>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    disabled={isTimerRunning}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#263047] dark:text-gray-100 disabled:opacity-60"
                  >
                    {[0, 1, 2, 3, 4].map((h) => (
                      <option key={h} value={h}>
                        {h} {t.studySession.hours}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-[#6B7280] dark:text-gray-400 block mb-1">{t.studySession.minutes}</span>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    disabled={isTimerRunning}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#263047] dark:text-gray-100 disabled:opacity-60"
                  >
                    {[15, 25, 30, 45, 50, 60].map((m) => (
                      <option key={m} value={m}>
                        {m} {t.studySession.minutes}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400 block mb-2">
              {isRTL ? 'فترات سريعة موصى بها:' : 'Recommended Focus Blocks:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {[25, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setDurationHours(Math.floor(mins / 60));
                    setDurationMinutes(mins % 60);
                  }}
                  disabled={isTimerRunning}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 disabled:opacity-40"
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Real Completed Sessions History (Calculates actual study hours) */}
      <div className="clay-card p-6 md:p-8 bg-white dark:bg-[#1E172A] space-y-4">
        <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9]">
          {t.studySession.recentSessionsTitle}
        </h3>

        {completedHistory.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6B7280] dark:text-gray-400">
            {t.studySession.emptySessions}
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {completedHistory.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-950/60 text-green-700 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-extrabold text-[#263047] dark:text-gray-100 block">
                      {rec.course} — {rec.chapterName}
                    </span>
                    <span className="text-[11px] text-[#6B7280] dark:text-gray-400">{rec.completedDate}</span>
                  </div>
                </div>

                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-xl">
                  {rec.durationMinutes} min
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Confirmation Modal */}
      {showCompletionDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="clay-card bg-white dark:bg-gray-900 w-full max-w-md p-6 md:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center text-2xl shadow-inner">
              🎉
            </div>

            <h3 className="text-lg font-extrabold text-[#263047] dark:text-[#F3EEF9]">
              {t.studySession.timerCompleteTitle}
            </h3>

            <p className="text-xs text-[#4B5563] dark:text-gray-400">
              {t.studySession.chapterCompleteQuestion}
            </p>

            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-xs font-bold text-purple-700 dark:text-purple-300">
              {activeTimer?.course}: {activeTimer?.chapterName}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                onClick={handleConfirmChapterDone}
                className="clay-button py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs shadow-md"
              >
                {t.studySession.yesCompleted}
              </button>

              <button
                type="button"
                onClick={handleNeedMoreTime}
                className="clay-button py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md"
              >
                {t.studySession.needMoreTime}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Break Duration Selector Modal */}
      {showBreakSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="clay-card bg-white dark:bg-gray-900 w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-2xl shadow-inner">
              ☕
            </div>

            <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9]">
              {t.studySession.breakDurationPrompt}
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleStartBreak(b)}
                  className="clay-button py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-extrabold text-xs hover:bg-purple-100"
                >
                  {b} min
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowBreakSelector(false)}
              className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 hover:text-[#263047] dark:hover:text-white pt-2 block mx-auto"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
