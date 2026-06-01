import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely to prevent crash on startup if key is missing
let aiClient: any = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API for Email Refinement
app.post('/api/gemini/refine', async (req, res) => {
  const { text, tone, variables } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  const client = getGeminiClient();

  if (client) {
    try {
      // Craft an exact prompt for the Gemini 3.5 Flash model
      const systemInstruction = `You are an elite executive talent AI recruiter at Elite HR Global. 
      You communicate with professional intelligence, authority, and warmth. 
      Your task is to refine email correspondence to match the user's selected tone perfectly, preserving all template variables like {first_name}, {company}, {position}, and {sender_name} unchanged.`;

      const prompt = `Refine this email draft to have a "${tone}" tone.
      
      Rules:
      1. Ensure the refined mail fits elite HR recruiting parameters.
      2. Strictly keep variables like {first_name}, {company}, {position}, or {sender_name} exactly as they are. DO NOT replace or drop them, otherwise the template engine fails.
      3. Reply with a valid JSON object matching the JSON schema below. Do not wrap in markdown code blocks like \`\`\`json.
      
      JSON schema layout to return:
      {
        "refinedText": "The full revised text of the email",
        "alternatives": [
          { "title": "Stronger Opening", "text": "Alternative phrase or opening sentence line" },
          { "title": "Direct CTA", "text": "Alternative call to action" }
        ],
        "analysis": {
          "wordCount": 114,
          "readTime": "2.1m",
          "sentiment": "High"
        }
      }
      
      Email to refine:
      "${text}"`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ ...parsed, isMocked: false });
      } catch (parseErr) {
        console.error('Failed to parse Gemini output as JSON:', responseText);
        // Fallback to manual parser helper or direct text
        return res.json({
          refinedText: responseText || text,
          alternatives: [
            { title: 'Stronger Opening', text: "I've been monitoring your trajectory at {company} and the momentum you've driven..." },
            { title: 'Direct CTA', text: 'Would you be open to a confidential exchange regarding your next strategic steps?' }
          ],
          analysis: {
            wordCount: text.split(/\s+/).length,
            readTime: '1.8m',
            sentiment: tone === 'Warm' ? 'Warm' : tone === 'Concise' ? 'Direct' : 'Formal'
          },
          isMocked: true,
          warn: 'Failed parsing AI response structure directly'
        });
      }
    } catch (err: any) {
      console.error('Gemini API call failed, falling back to local text processing:', err.message);
      // Fallback gracefully instead of failing
    }
  }

  // Graceful local offline fallback if key is missing or failed
  // This simulates beautiful refinements for a professional user experience
  let refinedText = text;
  let alternatives = [
    { title: 'Stronger Opening', text: "I've been closely monitoring your trajectory at {company}—and your recent pivot into expansion strategy." },
    { title: 'Direct CTA', text: 'Would you be open to a confidential exchange regarding your next strategic career pivot?' }
  ];
  let sentiment = 'High';

  if (tone === 'Formal') {
    refinedText = text
      .replace(/Dear \{first_name\},/gi, 'Dear {first_name},')
      .replace(/I have been closely following/gi, 'I have observed with great interest')
      .replace(/I would love to schedule/gi, 'It would be our distinct privilege to schedule')
      .replace(/Are you available/gi, 'Could you facilitate a brief exchange of availability');
    sentiment = 'Formal';
    alternatives = [
      { title: 'Elegant Frame', text: 'In evaluating candidate portfolios for our premier client partners, your credentials display unique synergy...' },
      { title: 'Refined Timeline', text: 'Should your schedule facilitate, let us orchestrate a confidential meeting at your earliest convenience.' }
    ];
  } else if (tone === 'Warm') {
    refinedText = text
      .replace(/Dear \{first_name\},/gi, 'Hi {first_name},')
      .replace(/following the impressive growth/gi, 'celebrating the wonderful momentum')
      .replace(/expertise we are currently seeking/gi, 'inspiring perspective we really value')
      .replace(/I would love to schedule/gi, "I'd truly love to jump on a short sync")
      .replace(/Warmly,/gi, 'With warm regards,');
    sentiment = 'Warm';
    alternatives = [
      { title: 'Collaborative Hook', text: "I'm genuinely inspired by what you’ve built over at {company} and your collaborative spirit..." },
      { title: 'Casual Sync', text: 'Let’s grab a quick coffee or call to chat through some exciting ideas. No pressure at all!' }
    ];
  } else if (tone === 'Concise') {
    refinedText = `Dear {first_name},

I've been tracking the impressive growth of {company}. Your experience scaling high-performance teams is a direct fit for an exclusive executive search we are conducting for a Tier-1 Venture firm.

We are specifically hunting for a Confidential VP of Talent at a Series C fintech disruptor. Are you open to a brief 10-minute introductory call?

Best,

{sender_name}
Elite HR Global`;
    sentiment = 'Direct';
    alternatives = [
      { title: 'Direct Value', text: "We have an urgent search for a Confidential VP of Talent. Your record at {company} matches perfectly." },
      { title: 'Immediate CTA', text: 'Are you available for a brief sync Tuesday or Wednesday afternoon next week?' }
    ];
  }

  const words = refinedText.split(/\s+/).filter((w: string) => w.length > 0).length;
  const minutes = Math.max(1, Math.round(words / 150));

  return res.json({
    refinedText,
    alternatives,
    analysis: {
      wordCount: words,
      readTime: `${minutes}.2m`,
      sentiment
    },
    isMocked: true,
    info: 'Using high-contrast offline HR logic. Configure GEMINI_API_KEY for custom live AI refinement.'
  });
});

// Serve health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Elite HR Server', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Configure Vite or Static Asset delivery
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server executing at http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error('Server setup failure:', err);
});
