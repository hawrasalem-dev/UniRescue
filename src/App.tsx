import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  TaskItem,
  RescuePlan,
  Language,
  ThemeMode,
  Exam,
  ActiveStudyTimer,
  CompletedStudyRecord,
  ExamEvaluation,
} from './types';
import {
  getDemoTasks,
  getDefaultUserProfile,
  getDemoExams,
  getDemoStudyRecords,
  getDemoEvaluations,
} from './data/initialDemoData';
import { generateRandomAvatar } from './utils/avatarGenerator';
import { generateDeterministicSchedule } from './utils/scheduler';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { TasksView } from './components/tasks/TasksView';
import { SmartTalkView } from './components/smart/SmartTalkView';
import { CalendarView } from './components/calendar/CalendarView';
import { RescueModeView } from './components/rescue/RescueModeView';
import { ExamsView } from './components/exams/ExamsView';
import { StudySessionView } from './components/study/StudySessionView';
import { EvaluationsView } from './components/evaluations/EvaluationsView';
import { ProgressView } from './components/analytics/ProgressView';
import { TwinStudio } from './components/avatar/TwinStudio';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

const STORAGE_PROFILE_KEY = 'unirescue_user_profile_v3';
const STORAGE_TASKS_KEY = 'unirescue_tasks_v3';
const STORAGE_EXAMS_KEY = 'unirescue_exams_v3';
const STORAGE_TIMER_KEY = 'unirescue_timer_v3';
const STORAGE_STUDY_RECORDS_KEY = 'unirescue_study_records_v3';
const STORAGE_EVALS_KEY = 'unirescue_evals_v3';
const STORAGE_DEMO_KEY = 'unirescue_is_demo_mode_v3';

export default function App() {
  // Load User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDefaultUserProfile('female');
  });

  // Load Tasks
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TASKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDemoTasks();
  });

  // Load Exams
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXAMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDemoExams();
  });

  // Load Study History Records
  const [studyHistory, setStudyHistory] = useState<CompletedStudyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDY_RECORDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDemoStudyRecords();
  });

  // Load Active Study Timer
  const [activeTimer, setActiveTimer] = useState<ActiveStudyTimer | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TIMER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Load Exam Evaluations
  const [evaluations, setEvaluations] = useState<ExamEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EVALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDemoEvaluations();
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DEMO_KEY);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalInitialMode, setTaskModalInitialMode] = useState<'manual' | 'smart' | 'upload'>('manual');

  // Sync DOM attributes with theme, dark mode, language
  useEffect(() => {
    document.body.setAttribute('data-theme', profile.theme);
    if (profile.isDarkMode) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.dir = profile.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = profile.language;
  }, [profile.theme, profile.isDarkMode, profile.language]);

  // Persist Profile
  useEffect(() => {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Persist Tasks
  useEffect(() => {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Persist Exams
  useEffect(() => {
    localStorage.setItem(STORAGE_EXAMS_KEY, JSON.stringify(exams));
  }, [exams]);

  // Persist Timer
  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem(STORAGE_TIMER_KEY);
    }
  }, [activeTimer]);

  // Persist Study History
  useEffect(() => {
    localStorage.setItem(STORAGE_STUDY_RECORDS_KEY, JSON.stringify(studyHistory));
  }, [studyHistory]);

  // Persist Evaluations
  useEffect(() => {
    localStorage.setItem(STORAGE_EVALS_KEY, JSON.stringify(evaluations));
  }, [evaluations]);

  // Persist Demo Mode
  useEffect(() => {
    localStorage.setItem(STORAGE_DEMO_KEY, JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  // Deterministic schedule computation
  const scheduleResult = generateDeterministicSchedule(tasks, profile.preferences);
  const sessions = scheduleResult.sessions;

  // Handlers for Tasks
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const handleToggleSessionComplete = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      handleToggleTaskComplete(session.taskId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddTasks = (newTasks: Omit<TaskItem, 'id'>[]) => {
    const created: TaskItem[] = newTasks.map((t, idx) => ({
      ...t,
      id: `task_${Date.now()}_${idx}`,
    }));
    setTasks((prev) => [created[0], ...prev, ...created.slice(1)]);
  };

  // Handlers for Exams
  const handleAddExam = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
  };

  const handleDeleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
  };

  const handleToggleExamChapter = (examId: string, chapterId: string) => {
    setExams((prev) =>
      prev.map((ex) => {
        if (ex.id !== examId) return ex;
        return {
          ...ex,
          chapters: ex.chapters.map((chap) =>
            chap.id === chapterId
              ? {
                  ...chap,
                  completed: !chap.completed,
                  completedAt: !chap.completed ? new Date().toISOString() : undefined,
                }
              : chap
          ),
        };
      })
    );
  };

  const handleCompleteChapterFromTimer = (
    examId: string,
    chapterId: string,
    durationMinutes: number
  ) => {
    const exam = exams.find((e) => e.id === examId);
    const chapter = exam?.chapters.find((c) => c.id === chapterId);

    // Record study session history
    const record: CompletedStudyRecord = {
      id: `record_${Date.now()}`,
      examId,
      course: exam?.course || 'General',
      chapterId,
      chapterName: chapter?.name || 'General Chapter',
      durationMinutes,
      completedDate: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };
    setStudyHistory((prev) => [record, ...prev]);

    // Mark chapter as completed in exam
    handleToggleExamChapter(examId, chapterId);
  };

  const handleSaveEvaluation = (evalItem: ExamEvaluation) => {
    setEvaluations((prev) => {
      const filtered = prev.filter((e) => e.examId !== evalItem.examId);
      return [evalItem, ...filtered];
    });
  };

  const handleApplyRescuePlan = (plan: RescuePlan) => {
    // Apply rescue triage adjustments
    setTasks((prev) =>
      prev.map((task) => {
        const action = plan.actions.find((a) => a.taskId === task.id);
        if (!action) return task;

        if (action.action === 'postpone' && action.suggestedDate) {
          return {
            ...task,
            deadline: `${action.suggestedDate}T23:59:00`,
            priority: 'low',
          };
        }
        if (action.action === 'prioritize_today') {
          return {
            ...task,
            priority: 'urgent',
          };
        }
        if (action.action === 'break_down' && action.adjustedDurationMinutes) {
          return {
            ...task,
            durationMinutes: action.adjustedDurationMinutes,
          };
        }
        return task;
      })
    );
    setTimeout(() => {
      setCurrentTab('calendar');
    }, 1200);
  };

  const handleResetDemoData = () => {
    setTasks(getDemoTasks());
    setExams(getDemoExams());
    setStudyHistory(getDemoStudyRecords());
    setEvaluations(getDemoEvaluations());
    setActiveTimer(null);
  };

  const handleQuickSmartTalk = (_quickPrompt: string) => {
    setCurrentTab('smartTalk');
  };

  // If user has not onboarded yet
  if (!profile.isOnboarded) {
    return (
      <OnboardingWizard
        initialLang={profile.language}
        onComplete={(newProfile) => setProfile(newProfile)}
      />
    );
  }

  const activeAvatar = profile.avatar || generateRandomAvatar(profile.gender);

  return (
    <AppLayout
      profile={profile}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onToggleDarkMode={() => setProfile((p) => ({ ...p, isDarkMode: !p.isDarkMode }))}
      onToggleTheme={() =>
        setProfile((p) => ({ ...p, theme: p.theme === 'pink' ? 'blue' : 'pink' }))
      }
      onToggleLanguage={() =>
        setProfile((p) => ({ ...p, language: p.language === 'ar' ? 'en' : 'ar' }))
      }
    >
      {/* Overview Dashboard Tab */}
      {currentTab === 'overview' && (
        <OverviewDashboard
          profile={profile}
          tasks={tasks}
          sessions={sessions}
          exams={exams}
          onToggleTask={handleToggleTaskComplete}
          onNavigateTab={setCurrentTab}
          onQuickSmartTalk={handleQuickSmartTalk}
          language={profile.language}
        />
      )}

      {/* Tasks Tab */}
      {currentTab === 'tasks' && (
        <TasksView
          tasks={tasks}
          onToggleTaskComplete={handleToggleTaskComplete}
          onDeleteTask={handleDeleteTask}
          onOpenAddModal={() => {
            setTaskModalInitialMode('manual');
            setIsTaskModalOpen(true);
          }}
          language={profile.language}
        />
      )}

      {/* Smart Talk Tab */}
      {currentTab === 'smartTalk' && (
        <SmartTalkView
          onAddTasks={handleAddTasks}
          language={profile.language}
        />
      )}

      {/* Calendar Tab */}
      {currentTab === 'calendar' && (
        <CalendarView
          sessions={sessions}
          tasks={tasks}
          exams={exams}
          onToggleSessionComplete={handleToggleSessionComplete}
          language={profile.language}
        />
      )}

      {/* Rescue Mode Tab */}
      {currentTab === 'rescueMode' && (
        <RescueModeView
          tasks={tasks}
          preferences={profile.preferences}
          gender={profile.gender}
          onApplyRescuePlan={handleApplyRescuePlan}
          language={profile.language}
        />
      )}

      {/* Exams Tab */}
      {currentTab === 'exams' && (
        <ExamsView
          exams={exams}
          gender={profile.gender}
          onAddExam={handleAddExam}
          onDeleteExam={handleDeleteExam}
          onToggleChapter={handleToggleExamChapter}
          language={profile.language}
        />
      )}

      {/* Study Session Focused Timer Tab */}
      {currentTab === 'studySession' && (
        <StudySessionView
          exams={exams}
          gender={profile.gender}
          activeTimer={activeTimer}
          onUpdateActiveTimer={setActiveTimer}
          completedHistory={studyHistory}
          onCompleteChapter={handleCompleteChapterFromTimer}
          onNavigateToExams={() => setCurrentTab('exams')}
          language={profile.language}
        />
      )}

      {/* Post-Exam Evaluations Tab */}
      {currentTab === 'evaluations' && (
        <EvaluationsView
          exams={exams}
          evaluations={evaluations}
          onSaveEvaluation={handleSaveEvaluation}
          gender={profile.gender}
          onNavigateToExams={() => setCurrentTab('exams')}
          language={profile.language}
        />
      )}

      {/* Analytics & Progress Tab */}
      {currentTab === 'progress' && (
        <ProgressView
          tasks={tasks}
          sessions={sessions}
          language={profile.language}
        />
      )}

      {/* Academic Twin Studio Tab */}
      {currentTab === 'twin' && (
        <TwinStudio
          avatar={activeAvatar}
          onUpdateAvatar={(newAvatar) => setProfile((p) => ({ ...p, avatar: newAvatar }))}
          language={profile.language}
        />
      )}

      {/* Settings Tab */}
      {currentTab === 'settings' && (
        <SettingsView
          profile={profile}
          onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
          isDemoMode={isDemoMode}
          onToggleDemoMode={() => setIsDemoMode((d) => !d)}
          onResetDemoData={handleResetDemoData}
        />
      )}

      {/* Global Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTasks={handleAddTasks}
        language={profile.language}
        initialMode={taskModalInitialMode}
      />
    </AppLayout>
  );
}
