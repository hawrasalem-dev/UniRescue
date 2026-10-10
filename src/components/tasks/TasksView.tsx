import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TaskItem, TaskPriority, TaskType, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { Plus, Search, CheckCircle2, Circle, Clock, Calendar, Filter, Trash2, Edit3, Sparkles } from 'lucide-react';

interface TasksViewProps {
  tasks: TaskItem[];
  onToggleTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddModal: () => void;
  language?: Language;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTaskComplete,
  onDeleteTask,
  onOpenAddModal,
  language = 'ar',
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const t = translations[language];
  const isRTL = language === 'ar';

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.course.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'pending') return !task.completed;
    if (filterType === 'completed') return task.completed;
    return task.type === filterType;
  });

  const handleToggle = (taskId: string, wasCompleted: boolean) => {
    onToggleTaskComplete(taskId);
    if (!wasCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      case 'high':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'medium':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Search & Add Button */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute top-3.5 start-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.header.searchPlaceholder}
            className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="clay-button w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.taskModal.manualTitle}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: isRTL ? 'الكل' : 'All' },
          { id: 'pending', label: t.status.inProgress },
          { id: 'completed', label: t.status.completed },
          { id: 'assignment', label: t.taskTypes.assignment },
          { id: 'exam', label: t.taskTypes.exam },
          { id: 'project', label: t.taskTypes.project },
          { id: 'quiz', label: t.taskTypes.quiz },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="clay-card p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
              {isRTL ? 'لا توجد مهام مطابقة' : 'No matching tasks'}
            </h3>
            <p className="text-xs text-gray-400">
              {isRTL ? 'أضف مهمة جديدة أو قم بتغيير الفلاتر' : 'Add a new task or adjust filters'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`clay-card p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                task.completed ? 'opacity-70 bg-gray-50/50 dark:bg-gray-850/50' : ''
              }`}
            >
              {/* Task Left Checkbox & Title */}
              <div className="flex items-start gap-3.5 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id, task.completed)}
                  className="mt-1 text-gray-400 hover:text-green-600 transition-colors shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] uppercase">
                      {task.course}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority === 'urgent' && t.status.urgent}
                      {task.priority === 'high' && t.status.high}
                      {task.priority === 'medium' && t.status.medium}
                      {task.priority === 'low' && t.status.low}
                    </span>
                    <h3 className={`text-sm font-bold text-gray-800 dark:text-gray-100 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Subtasks Progress */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
                      <span>
                        {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length}{' '}
                        {isRTL ? 'مهام فرعية' : 'subtasks'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Right: Deadline, Duration & Actions */}
              <div className="flex items-center gap-4 self-end md:self-auto shrink-0 text-xs">
                <div className="flex flex-col text-end">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {task.deadline?.split('T')[0]}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 justify-end font-mono">
                    <Clock className="w-3 h-3" />
                    {task.durationMinutes} min
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
