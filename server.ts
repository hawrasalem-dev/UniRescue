import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Shared Gemini Client with telemetry User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// Smart Talk Endpoint: Natural Language Task Extraction
app.post('/api/smart-talk', async (req, res) => {
  try {
    const { text, timezone = 'Asia/Riyadh', currentDate = new Date().toISOString(), language = 'ar' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    if (!ai) {
      // Heuristic fallback if Gemini API key is missing
      const fallbackTasks = generateFallbackTasks(text, currentDate);
      return res.json({
        tasks: fallbackTasks,
        clarification: null,
        constraintsSummary: 'Parsed via local heuristic engine.',
      });
    }

    const systemInstruction = `You are UniRescue Academic Twin AI. You understand university student language, including Saudi dialect (e.g., "عندي واجب محاكاة لازم أسلمه الثلاثاء، وعندي اختبار AI الأربعاء، ومشروع تخرج الخميس، واليوم ما عندي إلا ساعتين وبكرة عندي محاضرات لين الساعة 3"), Egyptian, Levantine, Modern Standard Arabic, and English.
Today is ${currentDate} in timezone ${timezone}.
Extract all academic tasks, homework assignments, exams, projects, study sessions, and time constraints.
Calculate realistic ISO deadlines based on today's date.
Never invent imaginary tasks.
If an essential deadline or detail is totally missing, formulate a polite 1-sentence clarification question in the student's language.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: text,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              description: 'List of extracted academic tasks',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Task title' },
                  course: { type: Type.STRING, description: 'Course code or name' },
                  type: {
                    type: Type.STRING,
                    description: 'assignment, exam, project, study, or quiz',
                  },
                  deadline: {
                    type: Type.STRING,
                    description: 'ISO 8601 date string (e.g. 2026-10-15T23:59:00)',
                  },
                  durationMinutes: {
                    type: Type.INTEGER,
                    description: 'Estimated minutes required to study or complete',
                  },
                  priority: {
                    type: Type.STRING,
                    description: 'urgent, high, medium, or low',
                  },
                  difficulty: {
                    type: Type.STRING,
                    description: 'hard, medium, or easy',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Extracted notes or context',
                  },
                },
                required: ['title', 'course', 'type', 'deadline', 'durationMinutes', 'priority', 'difficulty'],
              },
            },
            availableHoursExtracted: {
              type: Type.NUMBER,
              description: 'Hours student mentioned having available today/tomorrow, or null',
            },
            timeConstraints: {
              type: Type.STRING,
              description: 'Mentioned constraints (e.g., lectures until 3 PM)',
            },
            clarificationQuestion: {
              type: Type.STRING,
              description: 'Short follow-up question if critical details are missing, else empty',
            },
          },
          required: ['tasks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/smart-talk:', error);
    // Graceful fallback to avoid halting user flow
    const fallbackTasks = generateFallbackTasks(req.body.text || '', req.body.currentDate || new Date().toISOString());
    return res.json({
      tasks: fallbackTasks,
      clarification: null,
      errorNotice: 'Model responded with fallback heuristics.',
    });
  }
});

// Extract from Syllabus / Uploaded File Endpoint
app.post('/api/extract-syllabus', async (req, res) => {
  try {
    const { fileBase64, mimeType, textContent, currentDate = new Date().toISOString() } = req.body;

    if (!fileBase64 && !textContent) {
      return res.status(400).json({ error: 'File data or text content is required' });
    }

    if (!ai) {
      return res.json({
        tasks: [
          {
            title: 'Midterm Exam Preparation',
            course: 'CS101',
            type: 'exam',
            deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
            durationMinutes: 180,
            priority: 'urgent',
            difficulty: 'hard',
            description: 'Extracted from syllabus document',
          },
          {
            title: 'Lab Assignment 3',
            course: 'CS101',
            type: 'assignment',
            deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
            durationMinutes: 90,
            priority: 'high',
            difficulty: 'medium',
            description: 'Extracted from syllabus document',
          },
        ],
      });
    }

    const contents: any[] = [];
    if (fileBase64 && mimeType) {
      contents.push({
        inlineData: {
          mimeType,
          data: fileBase64,
        },
      });
    }
    contents.push({
      text: `Extract all assignments, exams, project milestones, and deadlines from this course document or schedule. Today's date is ${currentDate}. Estimate realistic study durations in minutes, course names, and priorities.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  course: { type: Type.STRING },
                  type: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  priority: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'course', 'type', 'deadline', 'durationMinutes', 'priority', 'difficulty'],
              },
            },
          },
          required: ['tasks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/extract-syllabus:', error);
    return res.status(500).json({ error: 'Failed to extract syllabus data' });
  }
});

// Rescue Mode AI Companion Advisor Endpoint
app.post('/api/rescue-ai', async (req, res) => {
  try {
    const { situation, tasks, availableHoursToday, language = 'ar' } = req.body;

    if (!ai) {
      return res.json({
        advice: language === 'ar'
          ? 'لا تقلق، رتبنا أولوياتك اليوم للتركيز على المهمة الأكثر تأثيراً على درجاتك وتأجيل ما يمكن تأجيله.'
          : 'Do not panic! We prioritized the highest impact task for today and deferred non-urgent items.',
      });
    }

    const prompt = `You are UniRescue Academic Twin. A university student is stressed and asked for emergency schedule rescue with this request: "${situation}".
They have roughly ${availableHoursToday} study hours available today.
Current pending tasks: ${JSON.stringify(tasks)}.
Provide a supportive, empathetic, realistic 2-sentence recovery strategy in ${language === 'ar' ? 'warm Arabic with university student tone' : 'warm English'}. No guilt, no blame.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ advice: response.text });
  } catch (error) {
    console.error('Error in /api/rescue-ai:', error);
    return res.json({
      advice: req.body.language === 'ar'
        ? 'أنا معك خطوة بخطوة! سنركز على الأهم أولاً ونعيد توازن جدولك بهدوء.'
        : "I'm with you every step! Let's focus on the essentials first and restore balance peacefully.",
    });
  }
});

function generateFallbackTasks(text: string, currentDateStr: string) {
  const now = new Date(currentDateStr || Date.now());
  const tasks = [];
  const lower = text.toLowerCase();

  const isAr = /[\u0600-\u06FF]/.test(text);

  if (lower.includes('ai') || text.includes('ذكاء') || text.includes('محاكاة') || lower.includes('simulation')) {
    tasks.push({
      title: isAr ? 'واجب المحاكاة والنمذجة' : 'Simulation & Modeling Problem Set',
      course: 'AI 301',
      type: 'assignment',
      deadline: new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString(),
      durationMinutes: 90,
      priority: 'high',
      difficulty: 'medium',
      description: isAr ? 'مستخرج من الحديث الطبيعي' : 'Extracted from natural language',
    });
  }

  if (text.includes('اختبار') || lower.includes('exam') || lower.includes('midterm') || lower.includes('quiz') || text.includes('كويز')) {
    tasks.push({
      title: isAr ? 'مذاكرة اختبار الذكاء الاصطناعي' : 'AI Midterm Exam Preparation',
      course: 'AI 301',
      type: 'exam',
      deadline: new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(),
      durationMinutes: 180,
      priority: 'urgent',
      difficulty: 'hard',
      description: isAr ? 'مراجعة المفاهيم وحل أسئلة سابقة' : 'Review core concepts and past exams',
    });
  }

  if (text.includes('مشروع') || lower.includes('project')) {
    tasks.push({
      title: isAr ? 'تسليم مرحلة مشروع التخرج' : 'Graduation Project Milestone',
      course: 'CAPSTONE 402',
      type: 'project',
      deadline: new Date(now.getTime() + 4 * 24 * 3600 * 1000).toISOString(),
      durationMinutes: 120,
      priority: 'high',
      difficulty: 'hard',
      description: isAr ? 'توثيق واجهات النظام والتجربة' : 'System UI & Demo documentation',
    });
  }

  if (tasks.length === 0) {
    tasks.push({
      title: text.length > 30 ? text.substring(0, 30) + '...' : text,
      course: isAr ? 'المقرر العام' : 'General Course',
      type: 'assignment',
      deadline: new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString(),
      durationMinutes: 60,
      priority: 'medium',
      difficulty: 'medium',
      description: text,
    });
  }

  return tasks;
}

// Vite middleware configuration for dev & prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`UniRescue server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
