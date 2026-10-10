import React from 'react';
import { TaskItem, StudySession, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { CheckCircle2, Clock, BookOpen, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface ProgressViewProps {
  tasks: TaskItem[];
  sessions: StudySession[];
  language?: Language;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  tasks,
  sessions,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  
  const now = new Date();
  const overdueTasks = pendingTasks.filter((t) => new Date(t.deadline).getTime() < now.getTime());

  const totalTasks = tasks.length || 1;
  const completionRate = Math.round((completedTasks.length / totalTasks) * 100);

  // Planned vs completed study hours
  const totalPlannedMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedMinutes = sessions.filter((s) => s.completed).reduce((acc, s) => acc + s.durationMinutes, 0);
  const plannedHours = Math.round((totalPlannedMinutes / 60) * 10) / 10;
  const doneHours = Math.round((completedMinutes / 60) * 10) / 10;

  // Progress by course
  const courseMap: Record<string, { total: number; completed: number; totalMinutes: number }> = {};
  tasks.forEach((task) => {
    const c = task.course || 'OTHER';
    if (!courseMap[c]) {
      courseMap[c] = { total: 0, completed: 0, totalMinutes: 0 };
    }
    courseMap[c].total += 1;
    courseMap[c].totalMinutes += task.durationMinutes;
    if (task.completed) {
      courseMap[c].completed += 1;
    }
  });

  const courseList = Object.entries(courseMap);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="clay-card p-6 md:p-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#263047] dark:text-[#F3EEF9] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            {isRTL ? 'إحصائيات الإنجاز والنشاط الأكاديمي' : 'Academic Analytics & Progress'}
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1">
            {isRTL ? 'مؤشرات دقيقة مبنية على المهام وجلسات المذاكرة الفعلية المخزنة لديك' : 'Live metrics computed directly from your tasks and calendar study logs'}
          </p>
        </div>

        <div className="text-end">
          <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {completionRate}%
          </span>
          <span className="block text-xs font-semibold text-[#6B7280] dark:text-gray-400">
            {t.stats.onTimeRate}
          </span>
        </div>
      </div>

      {/* 4 Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400">{t.stats.tasksCompleted}</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#263047] dark:text-white font-mono">
            {completedTasks.length} <span className="text-xs font-normal text-[#6B7280] dark:text-gray-400">/ {tasks.length}</span>
          </div>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400">{t.stats.pendingTasks}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#263047] dark:text-white font-mono">
            {pendingTasks.length}
          </div>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400">{t.stats.studyHours}</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#263047] dark:text-white font-mono">
            {doneHours} <span className="text-xs font-normal text-[#6B7280] dark:text-gray-400">/ {plannedHours} hrs</span>
          </div>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400">{isRTL ? 'المهام المتأخرة' : 'Overdue Tasks'}</span>
            <AlertCircle className={`w-4 h-4 ${overdueTasks.length > 0 ? 'text-red-500' : 'text-[#6B7280] dark:text-gray-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold font-mono ${overdueTasks.length > 0 ? 'text-red-500' : 'text-[#263047] dark:text-white'}`}>
            {overdueTasks.length}
          </div>
        </div>
      </div>

      {/* Course Breakdown List */}
      <div className="clay-card p-6 md:p-8 space-y-4">
        <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9] mb-4">
          {t.sections.courseProgress}
        </h3>

        <div className="space-y-4">
          {courseList.map(([courseName, stat]) => {
            const courseRate = Math.round((stat.completed / (stat.total || 1)) * 100);
            return (
              <div key={courseName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#374151] dark:text-gray-200">{courseName}</span>
                  <span className="text-purple-600 font-mono">
                    {stat.completed}/{stat.total} {isRTL ? 'مهام' : 'tasks'} ({courseRate}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#F7B9D5] to-[#C9B6F2] rounded-full transition-all duration-500"
                    style={{ width: `${courseRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
