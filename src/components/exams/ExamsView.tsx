import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Exam, ExamChapter, Gender, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { AcademicTwin } from '../avatar/AcademicTwin';
import {
  Plus,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  AlertCircle,
  X,
  GraduationCap,
} from 'lucide-react';

interface ExamsViewProps {
  exams: Exam[];
  gender: Gender;
  onAddExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onToggleChapter: (examId: string, chapterId: string) => void;
  language?: Language;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  gender,
  onAddExam,
  onDeleteExam,
  onToggleChapter,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [course, setCourse] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:00');
  const [chaptersCount, setChaptersCount] = useState<number>(4);
  const [chapterNames, setChapterNames] = useState<string[]>([
    'Introduction',
    'Core Concepts',
    'Advanced Topics',
    'Review & Problems',
  ]);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle chapters count change and dynamically adjust chapter names array
  const handleCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(20, count));
    setChaptersCount(validCount);
    setChapterNames((prev) => {
      const updated = [...prev];
      while (updated.length < validCount) {
        updated.push(`Chapter ${updated.length + 1}`);
      }
      return updated.slice(0, validCount);
    });
  };

  const handleChapterNameChange = (index: number, val: string) => {
    const updated = [...chapterNames];
    updated[index] = val;
    setChapterNames(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.trim()) {
      setErrorMsg(isRTL ? 'يرجى كتابة اسم المقرر' : 'Please provide course name');
      return;
    }

    const createdChapters: ExamChapter[] = chapterNames.map((name, i) => ({
      id: `chap_${Date.now()}_${i}`,
      name: name.trim() || `Chapter ${i + 1}`,
      completed: false,
    }));

    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      course: course.trim(),
      title: title.trim() || (isRTL ? 'اختبار نصفي / نهائي' : 'Midterm / Final'),
      date,
      time,
      chapters: createdChapters,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddExam(newExam);
    setIsModalOpen(false);
    // Reset form
    setCourse('');
    setTitle('');
    setNotes('');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Helper: calculate accurate countdown
  const getCountdown = (examDateStr: string, examTimeStr: string) => {
    const now = new Date();
    const examDateTime = new Date(`${examDateStr}T${examTimeStr}:00`);
    const diffMs = examDateTime.getTime() - now.getTime();

    if (diffMs < 0) {
      // Past exam
      return { text: t.exams.pastExam, isPast: true, isToday: false };
    }

    const diffHours = Math.floor(diffMs / (1000 * 3600));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours <= 0) return { text: t.exams.todayExam, isPast: false, isToday: true };
      return {
        text: t.exams.hoursLeft.replace('{hours}', String(diffHours)),
        isPast: false,
        isToday: true,
      };
    }

    return {
      text: t.exams.daysLeft.replace('{days}', String(diffDays)),
      isPast: false,
      isToday: false,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with 3D Character studying */}
      <div className="clay-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-[#FFF5F8] via-white to-[#F5EEFB] dark:from-[#281A36] dark:via-[#20152D] dark:to-[#191024]">
        <div className="flex items-center gap-5">
          <AcademicTwin gender={gender} pose="studying" size="lg" isAnimated />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#263047] dark:text-[#F3EEF9]">
              {t.exams.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              {t.exams.subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg('');
            setIsModalOpen(true);
          }}
          className="clay-button px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.exams.addExam}</span>
        </button>
      </div>

      {/* Main Content: If no exams exist -> Clean Empty State */}
      {exams.length === 0 ? (
        <div className="clay-card p-12 text-center space-y-4 bg-white dark:bg-[#1E172A]">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 mx-auto flex items-center justify-center text-2xl shadow-inner">
            📚
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
              {t.exams.emptyState}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {isRTL
                ? 'أضف أول اختبار لتوزيع الشباتر وتفعيل المؤقت الذكي وجلسات المذاكرة المركزة.'
                : 'Add your first exam to distribute chapters and enable focused study sessions.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="clay-button px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.exams.addFirst}</span>
          </button>
        </div>
      ) : (
        <>
          {/* Grid of Sticky-Note Style Exam Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam) => {
              const countdown = getCountdown(exam.date, exam.time);
              const completedCount = exam.chapters.filter((c) => c.completed).length;
              const totalCount = exam.chapters.length || 1;
              const progressPct = Math.round((completedCount / totalCount) * 100);

              return (
                <div
                  key={exam.id}
                  className="clay-card p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-[#1E172A] relative overflow-hidden"
                >
                  {/* Top: Course & Countdown Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs uppercase">
                        {exam.course}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#263047] dark:text-gray-100 mt-2">
                        {exam.title}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold shrink-0 shadow-xs ${
                        countdown.isPast
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          : countdown.isToday
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {countdown.text}
                    </span>
                  </div>

                  {/* Exam Date & Time */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      {exam.date}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      {exam.time}
                    </span>
                  </div>

                  {/* Chapters Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>{t.exams.chaptersProgress.replace('{done}', String(completedCount)).replace('{total}', String(totalCount))}</span>
                      <span className="font-mono text-purple-600">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#F7B9D5] to-[#C9B6F2] rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Chapters Checklist */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {exam.chapters.map((chap) => (
                      <div
                        key={chap.id}
                        onClick={() => onToggleChapter(exam.id, chap.id)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-2 transition-all ${
                          chap.completed
                            ? 'bg-green-50/70 dark:bg-green-950/20 border-green-200 text-gray-400 line-through'
                            : 'bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-purple-200'
                        }`}
                      >
                        <span className="truncate">{chap.name}</span>
                        {chap.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Delete Button */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Structured Table Overview */}
          <div className="clay-card p-6 md:p-8 bg-white dark:bg-[#1E172A] overflow-x-auto">
            <h3 className="text-sm font-bold text-[#263047] dark:text-[#F3EEF9] mb-4">
              {isRTL ? 'جدول ملخص الاختبارات والمواعيد' : 'Structured Exam Timetable'}
            </h3>
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold">
                  <th className="pb-3 text-start">{t.exams.tableHeaders.course}</th>
                  <th className="pb-3 text-start">{t.exams.tableHeaders.title}</th>
                  <th className="pb-3 text-start">{t.exams.tableHeaders.dateTime}</th>
                  <th className="pb-3 text-start">{t.exams.tableHeaders.chapters}</th>
                  <th className="pb-3 text-start">{t.exams.tableHeaders.countdown}</th>
                  <th className="pb-3 text-end">{t.exams.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {exams.map((ex) => {
                  const countdown = getCountdown(ex.date, ex.time);
                  const completedCount = ex.chapters.filter((c) => c.completed).length;
                  return (
                    <tr key={ex.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 font-extrabold text-purple-700 dark:text-purple-300">
                        {ex.course}
                      </td>
                      <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">
                        {ex.title}
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400 font-mono">
                        {ex.date} · {ex.time}
                      </td>
                      <td className="py-3 font-mono">
                        {completedCount}/{ex.chapters.length}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {countdown.text}
                        </span>
                      </td>
                      <td className="py-3 text-end">
                        <button
                          type="button"
                          onClick={() => onDeleteExam(ex.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Exam Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="clay-card bg-white dark:bg-gray-900 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 end-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              {t.exams.addExam}
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.exams.courseLabel} *
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder={t.exams.coursePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.exams.titleLabel}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t.exams.titlePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.exams.dateLabel}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.exams.timeLabel}
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Number of Chapters & Dynamic Fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t.exams.chaptersCountLabel} ({chaptersCount})
                  </label>
                  <div className="flex items-center gap-1">
                    {[3, 4, 5, 6, 8].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleCountChange(c)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                          chaptersCount === c
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {chapterNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-bold text-gray-400">
                        {i + 1}.
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleChapterNameChange(i, e.target.value)}
                        placeholder={`Chapter ${i + 1}`}
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.exams.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Focus on past papers and slides..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {t.exams.cancel}
                </button>
                <button
                  type="submit"
                  className="clay-button px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-700"
                >
                  {t.exams.saveExam}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
