import { TaskItem, UserProfile, Exam, CompletedStudyRecord, ExamEvaluation } from '../types';

export function getDemoTasks(): TaskItem[] {
  // Empty start for new users as explicitly requested
  return [];
}

export function getDemoExams(): Exam[] {
  return [];
}

export function getDemoStudyRecords(): CompletedStudyRecord[] {
  return [];
}

export function getDemoEvaluations(): ExamEvaluation[] {
  return [];
}

export function getDefaultUserProfile(gender: 'female' | 'male' = 'female'): UserProfile {
  return {
    name: '',
    gender,
    academicLevel: 1,
    language: 'ar',
    theme: gender === 'female' ? 'pink' : 'blue',
    isDarkMode: false,
    preferences: {
      studyHoursPerDay: 4,
      availableDays: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      sessionLengthMinutes: 45,
      breakLengthMinutes: 10,
      preferredStudyTime: 'afternoon',
    },
    isOnboarded: false,
    createdAt: new Date().toISOString(),
  };
}
