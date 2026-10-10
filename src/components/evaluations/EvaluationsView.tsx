import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Exam, ExamEvaluation, ExamRating, Language, Gender } from '../../types';
import { translations } from '../../i18n/translations';
import { AcademicTwin } from '../avatar/AcademicTwin';
import { Sparkles, Calendar, MessageSquare, Check, GraduationCap } from 'lucide-react';

interface EvaluationsViewProps {
  exams: Exam[];
  evaluations: ExamEvaluation[];
  onSaveEvaluation: (evaluation: ExamEvaluation) => void;
  gender: Gender;
  onNavigateToExams: () => void;
  language?: Language;
}

export const EvaluationsView: React.FC<EvaluationsViewProps> = ({
  exams,
  evaluations,
  onSaveEvaluation,
  gender,
  onNavigateToExams,
  language = 'ar',
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [activeExamId, setActiveExamId] = useState<string>(exams[0]?.id || '');
  const [selectedRating, setSelectedRating] = useState<ExamRating>('excellent');
  const [noteText, setNoteText] = useState<string>('');
  const [successSaved, setSuccessSaved] = useState(false);

  const selectedExam = exams.find((e) => e.id === activeExamId);

  const handleSelectExamForEdit = (examId: string) => {
    setActiveExamId(examId);
    setSuccessSaved(false);
    const existing = evaluations.find((ev) => ev.examId === examId);
    if (existing) {
      setSelectedRating(existing.rating);
      setNoteText(existing.note || '');
    } else {
      setSelectedRating('excellent');
      setNoteText('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const newEval: ExamEvaluation = {
      id: `eval_${selectedExam.id}`,
      examId: selectedExam.id,
      course: selectedExam.course,
      examTitle: selectedExam.title,
      examDate: selectedExam.date,
      rating: selectedRating,
      note: noteText.trim(),
      evaluatedAt: new Date().toISOString(),
    };

    onSaveEvaluation(newEval);
    setSuccessSaved(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  if (exams.length === 0) {
    return (
      <div className="clay-card p-12 text-center space-y-4 bg-white dark:bg-[#1E172A]">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
          📝
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            {t.evaluations.noEligibleExams}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isRTL
              ? 'تعتمد التقييمات حصرياً على الاختبارات المسجلة في جدولك.'
              : 'Evaluations connect strictly to exams registered in your timetable.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToExams}
          className="clay-button px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t.exams.addFirst}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="clay-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-[#FFF5F8] via-white to-[#F5EEFB] dark:from-[#281A36] dark:via-[#20152D] dark:to-[#191024]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#263047] dark:text-[#F3EEF9]">
            {t.evaluations.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
            {t.evaluations.subtitle}
          </p>
        </div>

        <AcademicTwin gender={gender} pose="welcome" size="sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Form: Evaluate Selected Exam */}
        <div className="lg:col-span-6 clay-card p-6 md:p-8 bg-white dark:bg-[#1E172A] space-y-5">
          <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9] border-b border-gray-100 dark:border-gray-800 pb-3">
            {isRTL ? 'تسجيل تقييم اختبار' : 'Submit Exam Feedback'}
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Exam selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {t.studySession.selectExam}
              </label>
              <select
                value={activeExamId}
                onChange={(e) => handleSelectExamForEdit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.course} — {ex.title} ({ex.date})
                  </option>
                ))}
              </select>
            </div>

            {/* 3 Emoji Buttons */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'مستوى صعوبة وتجربة الاختبار:' : 'Perceived Exam Difficulty:'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRating('excellent')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                    selectedRating === 'excellent'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/40 scale-105 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-3xl">😊</span>
                  <span className="text-xs font-extrabold text-green-700 dark:text-green-300">
                    {t.evaluations.ratingLabels.excellent}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRating('average')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                    selectedRating === 'average'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 scale-105 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-3xl">😐</span>
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                    {t.evaluations.ratingLabels.average}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRating('difficult')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                    selectedRating === 'difficult'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 scale-105 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-3xl">😞</span>
                  <span className="text-xs font-extrabold text-red-700 dark:text-red-300">
                    {t.evaluations.ratingLabels.difficult}
                  </span>
                </button>
              </div>
            </div>

            {/* Note text */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? 'ملاحظات وانطباعك عن الأسئلة:' : 'Reflections & Notes:'}
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t.evaluations.notePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <button
              type="submit"
              className="clay-button w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t.evaluations.saveEvaluation}</span>
            </button>

            {successSaved && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs font-bold text-center">
                {t.evaluations.evaluatedNotice}
              </div>
            )}
          </form>
        </div>

        {/* List of Evaluated Exams */}
        <div className="lg:col-span-6 clay-card p-6 md:p-8 bg-white dark:bg-[#1E172A] space-y-4">
          <h3 className="text-base font-bold text-[#263047] dark:text-[#F3EEF9] border-b border-gray-100 dark:border-gray-800 pb-3">
            {isRTL ? 'سجل تقييمات الاختبارات' : 'Saved Evaluations'}
          </h3>

          {evaluations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              {t.evaluations.emptyState}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {evaluations.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => handleSelectExamForEdit(ev.examId)}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-purple-300 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-purple-700 dark:text-purple-300">
                        {ev.course}
                      </span>
                      <span className="text-xs text-gray-500">· {ev.examTitle}</span>
                    </div>

                    <div className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {ev.examDate}
                    </div>

                    {ev.note && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                        "{ev.note}"
                      </p>
                    )}
                  </div>

                  <div className="text-2xl shrink-0 p-2 rounded-xl bg-white dark:bg-gray-800 shadow-xs border border-gray-100 dark:border-gray-700">
                    {ev.rating === 'excellent' && '😊'}
                    {ev.rating === 'average' && '😐'}
                    {ev.rating === 'difficult' && '😞'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
