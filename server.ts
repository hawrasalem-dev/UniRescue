import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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
