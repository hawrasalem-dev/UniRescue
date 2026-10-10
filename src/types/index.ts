export type Gender = 'female' | 'male';
export type Language = 'ar' | 'en';
export type ThemeMode = 'pink' | 'blue';

export type AcademicLevel = 
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface StudyPreferences {
  studyHoursPerDay: number;
  availableDays: string[];
  sessionLengthMinutes: number;
  breakLengthMinutes: number;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
}

export type TaskType = 'assignment' | 'project' | 'deliverable' | 'study' | 'exam' | 'quiz';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskDifficulty = 'hard' | 'medium' | 'easy';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  course: string;
  description?: string;
  type: TaskType;
  deadline: string; // ISO string
  durationMinutes: number;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  completed: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  colorTag?: string;
}

export type AvatarExpression = 'welcome' | 'planning' | 'focus' | 'celebrating' | 'encouraging' | 'rescue';

export interface AvatarConfig {
  id: string;
  gender: Gender;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  outfitStyle: string;
  outfitColor: string;
  glasses: string;
  accessory: string;
  facialHair?: string;
  state?: AvatarExpression;
  use3DPhotoModel?: boolean;
}

export interface UserProfile {
  name: string;
  gender: Gender;
  academicLevel: AcademicLevel;
  major?: string;
  language: Language;
  theme: ThemeMode;
  isDarkMode: boolean;
  preferences: StudyPreferences;
  avatar?: AvatarConfig;
  isOnboarded: boolean;
  createdAt: string;
}

// Dedicated Exam and Chapter Data Models (Strictly Separated from Normal Tasks)
export interface ExamChapter {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
}

export interface Exam {
  id: string;
  course: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  chapters: ExamChapter[];
  notes?: string;
  createdAt: string;
}

// Persistent Study Timer (Survives navigation and browser refresh with absolute timestamps)
export interface ActiveStudyTimer {
  id: string;
  examId: string;
  course: string;
  examTitle: string;
  chapterId: string;
  chapterName: string;
  totalDurationSeconds: number;
  remainingSecondsAtPause: number;
  startTimestamp: number; // epoch ms
  expectedEndTimestamp: number; // epoch ms
  state: 'idle' | 'running' | 'paused' | 'completed';
  sessionType: 'study' | 'break';
  breakDurationSeconds?: number;
}

export interface CompletedStudyRecord {
  id: string;
  examId: string;
  course: string;
  chapterId: string;
  chapterName: string;
  durationMinutes: number;
  completedDate: string; // ISO date
  timestamp: number;
}

// Post-Exam Evaluation
export type ExamRating = 'excellent' | 'average' | 'difficult';

export interface ExamEvaluation {
  id: string;
  examId: string;
  course: string;
  examTitle: string;
  examDate: string;
  rating: ExamRating;
  note?: string;
  evaluatedAt: string;
}

export interface StudySession {
  id: string;
  taskId: string;
  taskTitle: string;
  course: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  completed: boolean;
}

export interface RescueItemAction {
  taskId: string;
  taskTitle: string;
  action: 'prioritize_today' | 'postpone' | 'break_down' | 'lighten';
  reasonAr: string;
  reasonEn: string;
  suggestedDate?: string;
  adjustedDurationMinutes?: number;
}

export interface RescuePlan {
  status: 'critical' | 'heavy' | 'manageable';
  summaryAr: string;
  summaryEn: string;
  hoursNeeded: number;
  hoursAvailable: number;
  deficitHours: number;
  actions: RescueItemAction[];
  twinAdviceAr: string;
  twinAdviceEn: string;
}
