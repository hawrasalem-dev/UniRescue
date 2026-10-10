import React, { useState } from 'react';
import { TaskItem, TaskPriority, TaskDifficulty, TaskType, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { X, Plus, Trash2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTasks: (tasks: Omit<TaskItem, 'id'>[]) => void;
  language?: Language;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTasks,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  // Manual Form States
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('assignment');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub_${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError(isRTL ? 'يرجى كتابة عنوان المهمة' : 'Please provide a task title');
      return;
    }
    if (!course.trim()) {
      setValidationError(isRTL ? 'يرجى كتابة رمز المادة أو اسمها' : 'Please provide a course code or name');
      return;
    }

    const fullDeadline = `${deadlineDate}T${deadlineTime}:00`;

    onSaveTasks([
      {
        title: title.trim(),
        course: course.trim().toUpperCase(),
        description: description.trim(),
        type,
        deadline: fullDeadline,
        durationMinutes: Number(durationMinutes) || 60,
        priority,
        difficulty,
        completed: false,
        subtasks,
      },
    ]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="clay-card bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-[#263047] dark:text-gray-100">
            {t.taskModal.title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-semibold">
            {validationError}
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
                {t.taskModal.titleLabel} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setValidationError('');
                }}
                placeholder={t.taskModal.titlePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-[#263047] dark:text-gray-100 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
                {t.taskModal.courseLabel} *
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  setValidationError('');
                }}
                placeholder={t.taskModal.coursePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-[#263047] dark:text-gray-100 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"
              />
            </div>
          </div>

          {/* Type, Priority, Difficulty, Duration */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
                {t.taskModal.typeLabel}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263047] dark:text-gray-200"
              >
                <option value="assignment">{t.taskTypes.assignment}</option>
                <option value="exam">{t.taskTypes.exam}</option>
                <option value="project">{t.taskTypes.project}</option>
                <option value="study">{t.taskTypes.study}</option>
                <option value="quiz">{t.taskTypes.quiz}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
                {t.taskModal.priorityLabel}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263047] dark:text-gray-200"
              >
                <option value="urgent">{t.status.urgent}</option>
                <option value="high">{t.status.high}</option>
                <option value="medium">{t.status.medium}</option>
                <option value="low">{t.status.low}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
                {t.taskModal.difficultyLabel}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263047] dark:text-gray-200"
              >
                <option value="hard">{t.status.hard}</option>
                <option value="medium">{t.status.medium}</option>
                <option value="easy">{t.status.easy}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
                {t.taskModal.durationLabel}
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263047] dark:text-gray-200"
              />
            </div>
          </div>

          {/* Deadline Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
                {t.taskModal.deadlineLabel} (Date)
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263047] dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
                {t.taskModal.deadlineLabel} (Time)
              </label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263047] dark:text-gray-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
              {t.taskModal.descLabel}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes, chapters, submission links..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-[#263047] dark:text-gray-100 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-bold text-[#374151] dark:text-gray-300 mb-1">
              {t.taskModal.subtasksLabel}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="e.g. Read chapter 4 or run unit tests"
                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-[#263047] dark:text-gray-200 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.taskModal.addSubtask}
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs text-[#374151] dark:text-gray-200"
                  >
                    <span>{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t.taskModal.cancel}
            </button>
            <button
              type="submit"
              className="clay-button px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-700"
            >
              {t.taskModal.saveTask}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
