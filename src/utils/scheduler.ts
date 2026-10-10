import { TaskItem, StudySession, StudyPreferences, RescuePlan, RescueItemAction } from '../types';

export interface ScheduleResult {
  sessions: StudySession[];
  unscheduledTasks: { task: TaskItem; reason: string }[];
  conflicts: string[];
  totalMinutesNeeded: number;
  totalMinutesAvailable: number;
}

export function generateDeterministicSchedule(
  tasks: TaskItem[],
  preferences: StudyPreferences,
  referenceDate: Date = new Date()
): ScheduleResult {
  const activeTasks = tasks.filter(t => !t.completed);

  // Sort tasks by priority weight, then deadline closeness, then difficulty
  const priorityScore = { urgent: 4, high: 3, medium: 2, low: 1 };
  const difficultyScore = { hard: 3, medium: 2, easy: 1 };

  const sortedTasks = [...activeTasks].sort((a, b) => {
    const timeA = new Date(a.deadline).getTime();
    const timeB = new Date(b.deadline).getTime();
    
    // If deadline difference is significant (> 24 hrs), earlier deadline wins
    const dayDiff = (timeA - timeB) / (1000 * 60 * 60 * 24);
    if (Math.abs(dayDiff) >= 1) {
      return timeA - timeB;
    }

    // Otherwise, priority score decides
    const pDiff = priorityScore[b.priority] - priorityScore[a.priority];
    if (pDiff !== 0) return pDiff;

    return difficultyScore[b.difficulty] - difficultyScore[a.difficulty];
  });

  const sessions: StudySession[] = [];
  const unscheduledTasks: { task: TaskItem; reason: string }[] = [];
  const conflicts: string[] = [];

  const sessionLen = preferences.sessionLengthMinutes || 45;
  const breakLen = preferences.breakLengthMinutes || 10;
  const dailyStudyHours = preferences.studyHoursPerDay || 4;
  const maxDailyMinutes = dailyStudyHours * 60;

  // Let's generate schedule for the next 14 days
  const dayBuckets: Record<string, { usedMinutes: number; nextStartHour: number; nextStartMinute: number }> = {};

  // Initialize day availability
  const startDay = new Date(referenceDate);
  startDay.setHours(0, 0, 0, 0);

  // Preferred start time
  const baseStartHours = {
    morning: 9,
    afternoon: 14,
    evening: 17,
    night: 20,
  }[preferences.preferredStudyTime || 'afternoon'];

  for (let d = 0; d < 14; d++) {
    const dayDate = new Date(startDay);
    dayDate.setDate(dayDate.getDate() + d);
    const dateStr = dayDate.toISOString().split('T')[0];
    dayBuckets[dateStr] = {
      usedMinutes: 0,
      nextStartHour: baseStartHours,
      nextStartMinute: 0,
    };
  }

  let totalMinutesNeeded = 0;
  let totalMinutesAvailable = 14 * maxDailyMinutes;

  for (const task of sortedTasks) {
    let remainingMinutes = task.durationMinutes;
    totalMinutesNeeded += task.durationMinutes;
    const taskDeadline = new Date(task.deadline);

    let scheduledForTask = 0;

    for (let d = 0; d < 14; d++) {
      if (remainingMinutes <= 0) break;

      const dayDate = new Date(startDay);
      dayDate.setDate(dayDate.getDate() + d);
      const dateStr = dayDate.toISOString().split('T')[0];
      const bucket = dayBuckets[dateStr];

      // If this day is already past the deadline date, we cannot schedule
      if (dayDate.getTime() > taskDeadline.getTime()) {
        break;
      }

      // Check remaining capacity in this day
      const remainingDayCapacity = maxDailyMinutes - bucket.usedMinutes;
      if (remainingDayCapacity < 25) {
        continue;
      }

      // Chunk size for this session
      const chunkMinutes = Math.min(sessionLen, remainingMinutes, remainingDayCapacity);
      
      const startH = bucket.nextStartHour;
      const startM = bucket.nextStartMinute;
      
      let endH = startH;
      let endM = startM + chunkMinutes;
      while (endM >= 60) {
        endH += 1;
        endM -= 60;
      }

      const formatTime = (h: number, m: number) => 
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      // Check if session end goes past task deadline on the same day
      const sessionEndDateTime = new Date(dayDate);
      sessionEndDateTime.setHours(endH, endM, 0, 0);

      if (sessionEndDateTime.getTime() > taskDeadline.getTime()) {
        conflicts.push(`Task "${task.title}" has a deadline at ${task.deadline} which precedes this planned session slot.`);
        break;
      }

      sessions.push({
        id: `session_${task.id}_${d}_${sessions.length}`,
        taskId: task.id,
        taskTitle: task.title,
        course: task.course,
        date: dateStr,
        startTime: formatTime(startH, startM),
        endTime: formatTime(endH, endM),
        durationMinutes: chunkMinutes,
        completed: false,
      });

      bucket.usedMinutes += chunkMinutes;
      remainingMinutes -= chunkMinutes;
      scheduledForTask += chunkMinutes;

      // Advance start time with break
      let nextM = endM + breakLen;
      let nextH = endH;
      while (nextM >= 60) {
        nextH += 1;
        nextM -= 60;
      }
      bucket.nextStartHour = nextH;
      bucket.nextStartMinute = nextM;
    }

    if (remainingMinutes > 0) {
      unscheduledTasks.push({
        task,
        reason: scheduledForTask === 0 
          ? 'Deadline arrives before sufficient study capacity could be found.'
          : `Only ${scheduledForTask} of ${task.durationMinutes} minutes could fit before the deadline.`,
      });
    }
  }

  return {
    sessions,
    unscheduledTasks,
    conflicts,
    totalMinutesNeeded,
    totalMinutesAvailable,
  };
}

export function generateRescueAssessment(
  tasks: TaskItem[],
  preferences: StudyPreferences,
  customCondition?: string
): RescuePlan {
  const activeTasks = tasks.filter(t => !t.completed);
  const now = new Date();

  const totalMinutes = activeTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
  const hoursNeeded = Math.round((totalMinutes / 60) * 10) / 10;
  
  // Available hours over the next 3 days
  const dailyHours = preferences.studyHoursPerDay || 3.5;
  const hoursAvailableNext3Days = dailyHours * 3;
  const deficitHours = Math.max(0, Math.round((hoursNeeded - hoursAvailableNext3Days) * 10) / 10);

  const isCritical = deficitHours > 4 || activeTasks.some(t => {
    const diffHours = (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours < 24 && t.durationMinutes > 180;
  });

  const actions: RescueItemAction[] = [];

  // Sort: closest deadlines first
  const sorted = [...activeTasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  sorted.forEach((task, index) => {
    const diffHours = (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 36 && (task.priority === 'urgent' || task.priority === 'high')) {
      actions.push({
        taskId: task.id,
        taskTitle: task.title,
        action: 'prioritize_today',
        reasonAr: `موعد التسليم حرج (خلال أقل من 36 ساعة) — ركّز كامل طاقتك عليه الآن.`,
        reasonEn: `Critical deadline within 36 hours — prioritize all available study focus here now.`,
      });
    } else if (deficitHours > 2 && task.priority === 'low' && diffHours > 48) {
      actions.push({
        taskId: task.id,
        taskTitle: task.title,
        action: 'postpone',
        reasonAr: `مهمة ذات أولوية منخفضة وموعدها متأخر — تأجيلها يوفر لك وقتاً لحل الأزمة الحالية.`,
        reasonEn: `Low priority task with later deadline — deferring frees immediate bandwidth for urgent deadlines.`,
        suggestedDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
    } else if (task.durationMinutes >= 180) {
      actions.push({
        taskId: task.id,
        taskTitle: task.title,
        action: 'break_down',
        reasonAr: `مهمة طويلة جداً (${task.durationMinutes} دقيقة) — تقسيمها إلى أجزاء سريعة يقلل التوتر الذهني.`,
        reasonEn: `Lengthy task (${task.durationMinutes} min) — slicing into focused sprints prevents fatigue.`,
        adjustedDurationMinutes: 90,
      });
    } else {
      actions.push({
        taskId: task.id,
        taskTitle: task.title,
        action: 'lighten',
        reasonAr: `الإبقاء في الجدول مع التركيز على أهم 70% من المحتوى أولاً.`,
        reasonEn: `Keep scheduled with focus on highest-yield 70% core topics first.`,
      });
    }
  });

  const status = isCritical ? 'critical' : deficitHours > 0 ? 'heavy' : 'manageable';

  const summaryAr = isCritical
    ? `تنبيه: حجم المهام المتراكمة (${hoursNeeded} ساعة) يتجاوز قدرتك المتاحة للأيام القادمة بمقدار ${deficitHours} ساعة. تم تفعيل خطة التصفية الذكية لحماية معدلك بدون إرهاق!`
    : deficitHours > 0
    ? `لديك ضغط متوسط (${hoursNeeded} ساعة مذاكرة). الخطة المقترحة تفرغ مهامك غير العاجلة وتركز على مواعيد هذا الأسبوع.`
    : `جدولك الدراسي متوازن ومضبوط بشكل ممتاز!`;

  const summaryEn = isCritical
    ? `Alert: Total study backlog (${hoursNeeded} hrs) exceeds available capacity by ${deficitHours} hrs. Smart triage activated to safeguard GPA without burnout!`
    : deficitHours > 0
    ? `Moderate workload detected (${hoursNeeded} hrs needed). The plan defers secondary tasks and prioritizes near-term deadlines.`
    : `Your academic schedule is balanced and well-optimized!`;

  const twinAdviceAr = customCondition?.includes('ما قدرت أذاكر')
    ? 'لا تقلق، الأيام الصعبة طبيعية لكل طالب جامعي! أعيد توزيع مهام اليوم على الأيام القادمة بهدوء.'
    : customCondition?.includes('اختبار مفاجئ')
    ? 'سنفرغ لك مساحة فورية اليوم ونركز على مراجعة مفاهيم الاختبار ذات الوزن الأكبر في الدرجات!'
    : 'أنا معك في كل خطوة. اتبع هذه الخطة المركزة وستشعر بالسيطرة على المواد من جديد 💜';

  const twinAdviceEn = customCondition?.includes('test') || customCondition?.includes('exam')
    ? 'We cleared an immediate focus window today and prioritized the highest-weight exam concepts!'
    : "Don't stress, university life has unpredictable days! Follow this focused triage plan and you will regain control 💜";

  return {
    status,
    summaryAr,
    summaryEn,
    hoursNeeded,
    hoursAvailable: hoursAvailableNext3Days,
    deficitHours,
    actions,
    twinAdviceAr,
    twinAdviceEn,
  };
}
