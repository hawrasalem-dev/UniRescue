import React, { useState } from 'react';
import { TaskItem, TaskPriority, TaskDifficulty, TaskType, Subtask, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { X, Plus, Trash2, Sparkles, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTasks: (tasks: Omit<TaskItem, 'id'>[]) => void;
  language?: Language;
  initialMode?: 'manual' | 'smart' | 'upload';
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTasks,
  language = 'ar',
  initialMode = 'manual',
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'smart' | 'upload'>(initialMode);
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

  // Smart Talk inside modal
  const [smartPrompt, setSmartPrompt] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [smartExtractedTasks, setSmartExtractedTasks] = useState<any[]>([]);

  // File Upload inside modal
  const [isUploading, setIsUploading] = useState(false);
  const [uploadExtractedTasks, setUploadExtractedTasks] = useState<any[]>([]);
  const [uploadFileName, setUploadFileName] = useState('');

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

  const handleSmartAnalyze = async () => {
    if (!smartPrompt.trim()) return;
    setIsSmartLoading(true);
    try {
      const response = await fetch('/api/smart-talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: smartPrompt,
          language,
          currentDate: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await response.json();
      if (data.tasks && data.tasks.length > 0) {
        setSmartExtractedTasks(data.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSmartLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/extract-syllabus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: file.type || 'application/pdf',
            currentDate: new Date().toISOString(),
          }),
        });
        const data = await res.json();
        if (data.tasks) {
          setUploadExtractedTasks(data.tasks);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveExtracted = (extractedList: any[]) => {
    const formatted = extractedList.map((item) => ({
      title: item.title,
      course: item.course || 'GENERAL',
      description: item.description || '',
      type: (item.type as TaskType) || 'assignment',
      deadline: item.deadline || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      durationMinutes: item.durationMinutes || 60,
      priority: (item.priority as TaskPriority) || 'medium',
      difficulty: (item.difficulty as TaskDifficulty) || 'medium',
      completed: false,
      subtasks: [],
    }));
    onSaveTasks(formatted);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="clay-card bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Tabs: Manual / Smart Talk / File Upload */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-3 pe-8">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'manual'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t.taskModal.manualTitle}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('smart')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'smart'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.taskModal.smartTitle}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            {t.taskModal.uploadTitle}
          </button>
        </div>

        {/* Error notice */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-semibold">
            {validationError}
          </div>
        )}

        {/* TAB 1: Manual Input */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"
                />
              </div>
            </div>

            {/* Type, Priority, Difficulty, Duration */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.taskModal.typeLabel}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
                >
                  <option value="assignment">{t.taskTypes.assignment}</option>
                  <option value="exam">{t.taskTypes.exam}</option>
                  <option value="project">{t.taskTypes.project}</option>
                  <option value="study">{t.taskTypes.study}</option>
                  <option value="quiz">{t.taskTypes.quiz}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.taskModal.priorityLabel}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
                >
                  <option value="urgent">{t.status.urgent}</option>
                  <option value="high">{t.status.high}</option>
                  <option value="medium">{t.status.medium}</option>
                  <option value="low">{t.status.low}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.taskModal.difficultyLabel}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                  className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
                >
                  <option value="hard">{t.status.hard}</option>
                  <option value="medium">{t.status.medium}</option>
                  <option value="easy">{t.status.easy}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.taskModal.durationLabel}
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Deadline Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.taskModal.deadlineLabel} (Date)
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.taskModal.deadlineLabel} (Time)
                </label>
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t.taskModal.descLabel}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes, chapters, submission links..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Subtasks */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t.taskModal.subtasksLabel}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="e.g. Read chapter 4 or run unit tests"
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200"
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
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs"
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
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
        )}

        {/* TAB 2: Smart Talk Input */}
        {activeTab === 'smart' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.smartTalk.description}
            </p>
            <textarea
              rows={4}
              value={smartPrompt}
              onChange={(e) => setSmartPrompt(e.target.value)}
              placeholder={t.smartTalk.inputPlaceholder}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="button"
              onClick={handleSmartAnalyze}
              disabled={isSmartLoading || !smartPrompt.trim()}
              className="clay-button w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSmartLoading ? t.smartTalk.analyzing : t.sections.sendSmartTalk}
            </button>

            {/* Extracted Tasks Display */}
            {smartExtractedTasks.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    {t.smartTalk.suggestedTasksTitle} ({smartExtractedTasks.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSaveExtracted(smartExtractedTasks)}
                    className="clay-button px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-sm"
                  >
                    {t.taskModal.addAllExtracted}
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {smartExtractedTasks.map((st, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-purple-100 dark:border-gray-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-800 dark:text-gray-100">{st.title}</div>
                        <div className="text-gray-500 text-[11px] mt-0.5">
                          {st.course} · {st.durationMinutes} min · {st.priority}
                        </div>
                      </div>
                      <span className="text-purple-600 font-semibold text-[11px]">
                        {st.deadline?.split('T')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-3xl p-8 text-center bg-purple-50/30 dark:bg-purple-950/20">
              <UploadCloud className="w-10 h-10 text-purple-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {t.taskModal.dragFileText}
              </p>
              <p className="text-[11px] text-gray-400 mb-4">PDF, PNG, JPG (Max 15MB)</p>
              <label className="clay-button inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-purple-700 shadow-sm">
                <FileText className="w-3.5 h-3.5" />
                {t.taskModal.browseFiles}
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {uploadFileName && (
                <div className="mt-3 text-xs text-purple-700 dark:text-purple-300 font-semibold">
                  📄 {uploadFileName}
                </div>
              )}
            </div>

            {isUploading && (
              <div className="p-4 text-center text-xs font-semibold text-purple-600 animate-pulse">
                {t.taskModal.extracting}
              </div>
            )}

            {uploadExtractedTasks.length > 0 && (
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    {t.taskModal.extractedSuccess} ({uploadExtractedTasks.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSaveExtracted(uploadExtractedTasks)}
                    className="clay-button px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-sm"
                  >
                    {t.taskModal.addAllExtracted}
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uploadExtractedTasks.map((st, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-purple-100 dark:border-gray-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-800 dark:text-gray-100">{st.title}</div>
                        <div className="text-gray-500 text-[11px] mt-0.5">
                          {st.course} · {st.durationMinutes} min · {st.priority}
                        </div>
                      </div>
                      <span className="text-purple-600 font-semibold text-[11px]">
                        {st.deadline?.split('T')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
