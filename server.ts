import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function for Groq API
function getGroqKey() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key' || apiKey.trim() === '') {
    return null;
  }
  return apiKey;
}

// REST API for Email Refinement
app.post('/api/gemini/refine', async (req, res) => {
  const { text, tone, variables } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  const groqKey = getGroqKey();

  if (groqKey) {
    try {
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

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        })
      });

      if (!response.ok) {
        throw new Error('Groq API error for email refinement');
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ ...parsed, isMocked: false });
      } catch (parseErr) {
        console.error('Failed to parse Groq output as JSON:', responseText);
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
      console.error('Groq API call failed, falling back to local text processing:', err.message);
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
    info: 'Using high-contrast offline HR logic. Configure GROQ_API_KEY for custom live AI refinement.'
  });
});

// ─── Groq API: Resume Skills Extraction ─────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.post('/api/groq/resume-skills', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length < 20) {
    return res.status(400).json({ error: 'Resume text is required (minimum 20 characters)' });
  }

  // Sanitize: limit to 8000 chars to prevent abuse
  const sanitizedText = text.slice(0, 8000);

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim() !== '' && groqKey !== 'your_groq_api_key') {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a professional resume analyst. Extract all technical skills, soft skills, tools, frameworks, programming languages, and domain expertise from the given resume text. Return a JSON object with a single key "skills" containing an array of skill strings. Be thorough — include all skills mentioned directly or implied. Return ONLY valid JSON, no markdown.`
            },
            {
              role: 'user',
              content: `Extract all skills from this resume:\n\n${sanitizedText}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('[Groq] API call failed:', errData);
        throw new Error('Groq API error');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';

      try {
        const parsed = JSON.parse(content);
        const skills = Array.isArray(parsed.skills) ? parsed.skills : [];
        return res.json({ skills, isMocked: false });
      } catch (parseErr) {
        console.error('[Groq] Failed to parse response:', content);
        throw new Error('Parse error');
      }
    } catch (err: any) {
      console.error('[Groq] Falling back to local extraction:', err.message);
    }
  }

  // Fallback: local keyword extraction
  const SKILL_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'express', 'sql', 'postgresql', 'mongodb', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'git', 'html', 'css', 'tailwind', 'figma',
    'product management', 'project management', 'agile', 'scrum', 'leadership',
    'marketing', 'sales', 'analytics', 'data science', 'machine learning',
    'ai', 'deep learning', 'nlp', 'devops', 'ci/cd', 'testing', 'automation',
    'communication', 'teamwork', 'problem solving', 'strategic planning',
    'finance', 'accounting', 'operations', 'supply chain', 'recruitment',
    'c++', 'c#', '.net', 'ruby', 'rails', 'php', 'laravel', 'swift',
    'kotlin', 'flutter', 'react native', 'next.js', 'graphql', 'rest api',
    'linux', 'networking', 'cybersecurity', 'blockchain', 'web3',
    'excel', 'powerpoint', 'tableau', 'power bi', 'sap', 'salesforce',
  ];

  const textLower = sanitizedText.toLowerCase();
  const found = SKILL_KEYWORDS.filter(s => textLower.includes(s));

  return res.json({ skills: found, isMocked: true });
});

// ─── Google OAuth: refresh access token (keeps client_secret on server) ───

app.post('/api/auth/google/refresh', async (req, res) => {
  const refreshToken = req.body?.refresh_token;
  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(503).json({
      error: 'Google OAuth refresh is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the server.',
    });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await tokenRes.json().catch(() => ({}));

    if (!tokenRes.ok) {
      console.error('[Google] Token refresh failed:', data);
      return res.status(tokenRes.status === 400 ? 401 : 502).json({
        error: data.error_description || data.error || 'Failed to refresh Google token',
      });
    }

    return res.json({
      access_token: data.access_token,
      expires_in: data.expires_in ?? 3600,
      token_type: data.token_type,
    });
  } catch (err: unknown) {
    console.error('[Google] Token refresh error:', err);
    return res.status(500).json({ error: 'Internal error refreshing token' });
  }
});

// ─── Razorpay Integration ─────────────────────────────────────

const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || '').trim().replace(/^["']|["']$/g, '');
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim().replace(/^["']|["']$/g, '');

// Startup debug — verify keys loaded correctly (masked)
console.log(`[Razorpay Config] KEY_ID: ${RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.slice(0, 12) + '...' + RAZORPAY_KEY_ID.slice(-4) : 'NOT SET'} (${RAZORPAY_KEY_ID.length} chars)`);
console.log(`[Razorpay Config] KEY_SECRET: ${RAZORPAY_KEY_SECRET ? RAZORPAY_KEY_SECRET.slice(0, 4) + '****' + RAZORPAY_KEY_SECRET.slice(-4) : 'NOT SET'} (${RAZORPAY_KEY_SECRET.length} chars)`);

// Plan IDs — create these in Razorpay Dashboard > Subscriptions > Plans
const RAZORPAY_PLANS: Record<string, string> = {
  basic_monthly: (process.env.RAZORPAY_PLAN_ID_BASIC_MONTHLY || '').trim(),
  basic_yearly: (process.env.RAZORPAY_PLAN_ID_BASIC_YEARLY || '').trim(),
  premium_monthly: (process.env.RAZORPAY_PLAN_ID_PREMIUM_MONTHLY || '').trim(),
  premium_yearly: (process.env.RAZORPAY_PLAN_ID_PREMIUM_YEARLY || '').trim(),
};

console.log(`[Razorpay Config] Plans loaded:`, Object.entries(RAZORPAY_PLANS).map(([k, v]) => `${k}=${v ? v.slice(0, 10) + '...' : 'NOT SET'}`).join(', '));

// Create a Razorpay subscription
app.post('/api/razorpay/create-subscription', async (req, res) => {
  const { plan_id, email } = req.body;

  if (!plan_id || typeof plan_id !== 'string') {
    return res.status(400).json({ error: 'plan_id is required (e.g., basic_monthly)' });
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      error: 'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
    });
  }

  const razorpayPlanId = RAZORPAY_PLANS[plan_id];
  if (!razorpayPlanId) {
    return res.status(400).json({
      error: `No Razorpay plan found for "${plan_id}". Configure RAZORPAY_PLAN_ID_* in .env`,
      available_keys: Object.keys(RAZORPAY_PLANS),
    });
  }

  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: 12, // max billing cycles (12 months or 12 years)
        quantity: 1,
        notes: {
          email: email || '',
          plan: plan_id,
        },
      }),
    });

    const responseText = await response.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[Razorpay] Non-JSON response:', responseText.slice(0, 500));
      return res.status(502).json({ error: 'Invalid response from Razorpay API' });
    }

    if (!response.ok) {
      console.error('[Razorpay] Create subscription failed:', data);
      return res.status(response.status).json({
        error: data.error?.description || data.error?.code || 'Failed to create Razorpay subscription',
        details: data.error || null,
      });
    }

    console.log('[Razorpay] Subscription created:', data.id);
    return res.json({ subscription_id: data.id, status: data.status });
  } catch (err: any) {
    console.error('[Razorpay] Create subscription error:', err.message);
    return res.status(500).json({ error: `Internal error: ${err.message}` });
  }
});

// Verify Razorpay payment signature
app.post('/api/razorpay/verify-payment', async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
    plan,
    billing_cycle,
    user_id,
  } = req.body;

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }

  if (!RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ error: 'Razorpay key secret not configured' });
  }

  try {
    // Verify signature: HMAC SHA256 of "payment_id|subscription_id"
    const payload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Razorpay] Signature mismatch:', { expected: expectedSignature, got: razorpay_signature });
      return res.status(400).json({ error: 'Payment verification failed — signature mismatch' });
    }

    console.log(`[Razorpay] Payment verified: ${razorpay_payment_id} for user ${user_id}, plan=${plan}, cycle=${billing_cycle}`);

    return res.json({
      verified: true,
      payment_id: razorpay_payment_id,
      subscription_id: razorpay_subscription_id,
    });
  } catch (err: any) {
    console.error('[Razorpay] Verify error:', err);
    return res.status(500).json({ error: 'Internal error verifying payment' });
  }
});

// Razorpay Webhook (for subscription lifecycle events)
app.post('/api/razorpay/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ error: 'Razorpay not configured' });
  }

  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.error('[Razorpay Webhook] Signature mismatch');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event?.event;

    console.log(`[Razorpay Webhook] Event: ${eventType}`);

    // Handle key events
    switch (eventType) {
      case 'subscription.charged':
        console.log('[Razorpay Webhook] Subscription charged:', event.payload?.subscription?.entity?.id);
        break;
      case 'subscription.cancelled':
        console.log('[Razorpay Webhook] Subscription cancelled:', event.payload?.subscription?.entity?.id);
        break;
      case 'subscription.paused':
        console.log('[Razorpay Webhook] Subscription paused:', event.payload?.subscription?.entity?.id);
        break;
      case 'payment.captured':
        console.log('[Razorpay Webhook] Payment captured:', event.payload?.payment?.entity?.id);
        break;
      default:
        console.log('[Razorpay Webhook] Unhandled event:', eventType);
    }

    return res.json({ status: 'ok' });
  } catch (err: any) {
    console.error('[Razorpay Webhook] Error:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Serve health status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Elite HR Server',
    hasGroqKey: !!process.env.GROQ_API_KEY,
    hasGoogleRefresh: !!(process.env.GOOGLE_CLIENT_SECRET && (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID)),
    hasRazorpay: !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
  });
});

// ─── Start API server ──────────────────────────────────────
// In dev: Express runs on port 3001, Vite (port 3000) proxies /api to it
// In prod: Express serves both API and static files on port 3000
const API_PORT = process.env.NODE_ENV === 'production' ? PORT : 3001;

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(API_PORT, '0.0.0.0', () => {
  console.log(`[JobSetu API] Server running at http://localhost:${API_PORT}`);
  if (API_PORT === 3001) {
    console.log(`[JobSetu API] Vite dev server should run on port 3000 — API calls proxied via /api`);
  }
});
