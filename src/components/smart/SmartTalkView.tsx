import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TaskItem, TaskPriority, TaskDifficulty, TaskType, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Sparkles,
  Send,
  Check,
  Paperclip,
  UploadCloud,
  FileText,
  AlertCircle,
  Clock,
  Calendar,
  Trash2,
} from 'lucide-react';

interface SmartTalkViewProps {
  onAddTasks: (tasks: Omit<TaskItem, 'id'>[]) => void;
  language?: Language;
}

interface ExtractedTaskState {
  title: string;
  course: string;
  type: TaskType;
  deadline: string;
  durationMinutes: number;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  description?: string;
}

export const SmartTalkView: React.FC<SmartTalkViewProps> = ({
  onAddTasks,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTaskState[]>([]);
  const [constraintsNotice, setConstraintsNotice] = useState<string | null>(null);
  const [clarification, setClarification] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const samplePrompts = [
    { text: isRTL ? 'عندي واجب شبكات الأحد، واختبار حاسب الأربعاء، واليوم متاح ساعتين بس.' : 'I have a Networks assignment on Sunday and a CS test on Wednesday, 2 hours free today.' },
    { text: isRTL ? 'عندي تسليم مشروع التخرج الخميس القادم واختبار كيمياء الثلاثاء، رتب أولوياتي.' : 'Graduation project milestone next Thursday and Chemistry test on Tuesday, organize my priorities.' },
  ];

  const handleAnalyze = async (textToUse?: string) => {
    const text = textToUse || prompt;
    if (!text.trim()) return;

    setIsLoading(true);
    setSuccessNotice(false);
    setClarification(null);

    try {
      const res = await fetch('/api/smart-talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language,
          currentDate: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await res.json();
      if (data.tasks) {
        setExtractedTasks(data.tasks);
      }
      if (data.timeConstraints) {
        setConstraintsNotice(data.timeConstraints);
      }
      if (data.clarificationQuestion) {
        setClarification(data.clarificationQuestion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsLoading(true);
    setSuccessNotice(false);

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
          setExtractedTasks(data.tasks);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskField = (index: number, field: keyof ExtractedTaskState, val: any) => {
    const updated = [...extractedTasks];
    updated[index] = { ...updated[index], [field]: val };
    setExtractedTasks(updated);
  };

  const handleDeleteExtracted = (index: number) => {
    setExtractedTasks(extractedTasks.filter((_, i) => i !== index));
  };

  const handleConfirmAndSchedule = () => {
    if (extractedTasks.length === 0) return;

    const formatted: Omit<TaskItem, 'id'>[] = extractedTasks.map((t) => ({
      title: t.title,
      course: t.course || 'GENERAL',
      type: t.type || 'assignment',
      deadline: t.deadline || new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      durationMinutes: t.durationMinutes || 60,
      priority: t.priority || 'medium',
      difficulty: t.difficulty || 'medium',
      description: t.description || '',
      completed: false,
      subtasks: [],
    }));

    onAddTasks(formatted);
    setSuccessNotice(true);
    setExtractedTasks([]);
    setPrompt('');
    setUploadedFileName(null);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="clay-card p-6 md:p-8 bg-white dark:bg-[#1E172A]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#263047] dark:text-[#F3EEF9]">
              {t.smartTalk.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              {t.smartTalk.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Conversational & File Upload Box */}
      <div className="clay-card p-6 md:p-8 space-y-4 bg-white dark:bg-[#1E172A]">
        <div className="relative">
          {/* Light-mode friendly textarea: Clean white bg, subtle border, dark readable text */}
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.smartTalk.inputPlaceholder}
            className="w-full p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-[#263047] dark:text-gray-100 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
          />

          {/* Action Bar below textarea */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {/* File Upload Attachment Button */}
            <div className="flex items-center gap-3">
              <label className="clay-button inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-[#374151] dark:text-gray-200 rounded-2xl text-xs font-bold cursor-pointer transition-colors border border-gray-200 dark:border-gray-700">
                <Paperclip className="w-4 h-4 text-purple-600" />
                <span>{t.smartTalk.uploadButton}</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedFileName && (
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {uploadedFileName}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={isLoading || (!prompt.trim() && !uploadedFileName)}
              className="clay-button px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? t.smartTalk.analyzing : t.sections.sendSmartTalk}</span>
            </button>
          </div>

          {/* Examples chips */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400">
              {isRTL ? 'أمثلة سريعة للتجربة:' : 'Quick examples:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(s.text);
                    handleAnalyze(s.text);
                  }}
                  className="px-3 py-1 text-[11px] font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                >
                  {isRTL ? `مثال ${idx + 1}` : `Sample ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Follow-up question if any */}
        {clarification && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                {t.smartTalk.clarificationPrompt}
              </span>
              <p className="text-xs text-amber-700 dark:text-amber-300">{clarification}</p>
            </div>
          </div>
        )}

        {/* Constraints detected notice */}
        {constraintsNotice && (
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-xs text-purple-800 dark:text-purple-300 font-medium">
            ⏳ {isRTL ? 'القيود المرصودة:' : 'Constraints:'} {constraintsNotice}
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-xs font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            {isRTL ? 'تم اعتماد جميع المهام وإدراجها بنجاح في الجدول الأكاديمي!' : 'Tasks successfully verified and added to your schedule!'}
          </div>
        )}
      </div>

      {/* Extracted Tasks Review Cards */}
      {extractedTasks.length > 0 && (
        <div className="clay-card p-6 md:p-8 space-y-4 bg-white dark:bg-[#1E172A]">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9]">
              {t.smartTalk.suggestedTasksTitle} ({extractedTasks.length})
            </h3>
            <span className="text-xs text-gray-400">
              {isRTL ? 'يمكنك مراجعة وتعديل أي تفصيلة قبل الاعتماد' : 'Editable before saving'}
            </span>
          </div>

          <div className="space-y-3">
            {extractedTasks.map((task, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleUpdateTaskField(idx, 'title', e.target.value)}
                    className="flex-1 font-bold text-sm text-[#263047] dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={task.course}
                      onChange={(e) => handleUpdateTaskField(idx, 'course', e.target.value)}
                      className="w-28 px-2.5 py-1.5 text-xs font-extrabold uppercase rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExtracted(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div>
                    <label className="text-[10px] text-[#6B7280] dark:text-gray-400 font-bold block mb-0.5">
                      {isRTL ? 'النوع' : 'Type'}
                    </label>
                    <select
                      value={task.type}
                      onChange={(e) => handleUpdateTaskField(idx, 'type', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-semibold text-[#263047] dark:text-gray-100"
                    >
                      <option value="assignment">{t.taskTypes.assignment}</option>
                      <option value="project">{t.taskTypes.project}</option>
                      <option value="deliverable">{t.taskTypes.deliverable}</option>
                      <option value="study">{t.taskTypes.study}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#6B7280] dark:text-gray-400 font-bold block mb-0.5">
                      {isRTL ? 'الأولوية' : 'Priority'}
                    </label>
                    <select
                      value={task.priority}
                      onChange={(e) => handleUpdateTaskField(idx, 'priority', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-semibold text-[#263047] dark:text-gray-100"
                    >
                      <option value="urgent">{t.status.urgent}</option>
                      <option value="high">{t.status.high}</option>
                      <option value="medium">{t.status.medium}</option>
                      <option value="low">{t.status.low}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#6B7280] dark:text-gray-400 font-bold block mb-0.5">
                      {isRTL ? 'المدة (دقيقة)' : 'Duration (min)'}
                    </label>
                    <input
                      type="number"
                      step="15"
                      value={task.durationMinutes}
                      onChange={(e) => handleUpdateTaskField(idx, 'durationMinutes', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-semibold text-[#263047] dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#6B7280] dark:text-gray-400 font-bold block mb-0.5">
                      {isRTL ? 'الموعد' : 'Deadline'}
                    </label>
                    <input
                      type="datetime-local"
                      value={task.deadline ? task.deadline.slice(0, 16) : ''}
                      onChange={(e) => handleUpdateTaskField(idx, 'deadline', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-semibold text-[#263047] dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              type="button"
              onClick={handleConfirmAndSchedule}
              className="clay-button px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t.smartTalk.addTasksToSchedule}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
