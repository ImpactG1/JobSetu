/**
 * Resume Matcher — Groq ATS analysis + enhanced local job match scoring
 */
import type { ATSAnalysis, ATSSkillCategories, DirectJob, ExperienceLevel, ReferralOpportunity } from '../types';

// ─── Skill synonym / related groups for fuzzy local matching ─

const RELATED_SKILL_GROUPS: string[][] = [
  ['javascript', 'typescript', 'ecmascript', 'es6'],
  ['react', 'react.js', 'reactjs', 'next.js', 'nextjs'],
  ['node', 'node.js', 'nodejs', 'express'],
  ['python', 'django', 'flask', 'fastapi'],
  ['java', 'spring', 'spring boot', 'kotlin'],
  ['aws', 'amazon web services', 'cloud', 'gcp', 'azure'],
  ['sql', 'postgresql', 'mysql', 'mongodb', 'database'],
  ['docker', 'kubernetes', 'k8s', 'devops', 'ci/cd'],
  ['machine learning', 'ml', 'deep learning', 'ai', 'data science'],
  ['product management', 'product manager', 'pm', 'agile', 'scrum'],
  ['ui', 'ux', 'figma', 'design', 'user experience'],
  ['marketing', 'seo', 'digital marketing', 'growth'],
  ['finance', 'accounting', 'financial analysis', 'excel'],
];

function normalizeSkill(s: string): string {
  return s.toLowerCase().trim().replace(/[._-]/g, ' ');
}

function flattenSkillCategories(categories: ATSSkillCategories): string[] {
  return [
    ...categories.technical,
    ...categories.soft,
    ...categories.tools,
    ...categories.domains,
  ].map(s => s.trim()).filter(Boolean);
}

function getRelatedSkills(skill: string): Set<string> {
  const norm = normalizeSkill(skill);
  const related = new Set<string>([norm]);
  for (const group of RELATED_SKILL_GROUPS) {
    if (group.some(g => norm.includes(g) || g.includes(norm))) {
      group.forEach(g => related.add(normalizeSkill(g)));
    }
  }
  return related;
}

type MatchTier = 'exact' | 'partial' | 'related';

function classifySkillMatch(resumeSkill: string, jobSkill: string): MatchTier | null {
  const r = normalizeSkill(resumeSkill);
  const j = normalizeSkill(jobSkill);
  if (!r || !j) return null;
  if (r === j) return 'exact';
  if (r.includes(j) || j.includes(r)) return 'partial';

  const rRelated = getRelatedSkills(r);
  const jRelated = getRelatedSkills(j);
  for (const rs of rRelated) {
    for (const js of jRelated) {
      if (rs === js || rs.includes(js) || js.includes(rs)) return 'related';
    }
  }
  return null;
}

const TIER_WEIGHT: Record<MatchTier, number> = {
  exact: 1.0,
  partial: 0.65,
  related: 0.35,
};

function parseJobSkills(skills: string): string[] {
  return skills.split(/[;,|]/).map(s => s.trim()).filter(Boolean);
}

function titleKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[\s/,&-]+/)
    .filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'senior', 'junior', 'lead', 'staff'].includes(w));
}

// ─── Groq helpers ──────────────────────────────────────────

async function callGroqJSON(systemPrompt: string, userContent: string, maxTokens = 2048): Promise<unknown> {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!groqKey) throw new Error('VITE_GROQ_API_KEY not configured');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Groq API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

function parseATSResponse(raw: Record<string, unknown>): ATSAnalysis {
  const skillsRaw = (raw.skills || {}) as Record<string, unknown>;
  const skills: ATSSkillCategories = {
    technical: Array.isArray(skillsRaw.technical) ? skillsRaw.technical.map(String) : [],
    soft: Array.isArray(skillsRaw.soft) ? skillsRaw.soft.map(String) : [],
    tools: Array.isArray(skillsRaw.tools) ? skillsRaw.tools.map(String) : [],
    domains: Array.isArray(skillsRaw.domains) ? skillsRaw.domains.map(String) : [],
  };

  const breakdownRaw = (raw.atsBreakdown || raw.ats_breakdown || {}) as Record<string, number>;
  const atsBreakdown = {
    formatting: Number(breakdownRaw.formatting) || 0,
    keywords: Number(breakdownRaw.keywords) || 0,
    experience: Number(breakdownRaw.experience) || 0,
    education: Number(breakdownRaw.education) || 0,
    impact: Number(breakdownRaw.impact) || 0,
  };

  const level = String(raw.experience_level || 'mid').toLowerCase();
  const validLevels: ExperienceLevel[] = ['junior', 'mid', 'senior', 'lead'];
  const experience_level = validLevels.includes(level as ExperienceLevel)
    ? (level as ExperienceLevel)
    : 'mid';

  return {
    skills,
    atsScore: Math.min(100, Math.max(0, Number(raw.atsScore ?? raw.ats_score) || 0)),
    atsBreakdown,
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions.map(String) : [],
    experience_level,
    summary: String(raw.summary || ''),
    analyzedAt: new Date().toISOString(),
  };
}

// ─── Comprehensive ATS analysis (uses strict dedicated checker) ─

export async function analyzeResumeWithATS(resumeText: string): Promise<{
  analysis: ATSAnalysis;
  flatSkills: string[];
  isMocked: boolean;
}> {
  const sanitizedText = resumeText.slice(0, 12000);

  if (!sanitizedText.trim()) {
    throw new Error('Resume text is empty. Upload a text-based PDF.');
  }

  try {
    const { runATSChecker, atsCheckerReportToAnalysis, flattenSkillsFromReport } = await import('./atsChecker');
    const { report, isMocked } = await runATSChecker(sanitizedText, { fileName: 'profile-resume.pdf' });
    const analysis = atsCheckerReportToAnalysis(report);
    let flatSkills = flattenSkillsFromReport(report);
    if (!flatSkills.length) {
      flatSkills = extractSkillsFallback(sanitizedText);
      analysis.skills.technical = flatSkills;
    }
    return { analysis, flatSkills, isMocked };
  } catch (err) {
    console.error('[resumeMatcher] analyzeResumeWithATS failed:', err);
    return buildFallbackATS(sanitizedText);
  }
}

function buildFallbackATS(text: string): {
  analysis: ATSAnalysis;
  flatSkills: string[];
  isMocked: boolean;
} {
  const flatSkills = extractSkillsFallback(text);
  const base = Math.min(72, 35 + flatSkills.length * 4);
  return {
    analysis: {
      skills: { technical: flatSkills, soft: [], tools: [], domains: [] },
      atsScore: base,
      atsBreakdown: {
        formatting: base,
        keywords: base - 5,
        experience: base,
        education: base - 10,
        impact: base - 8,
      },
      suggestions: [
        'Add quantified achievements (metrics, %, revenue) to strengthen impact scores.',
        'Mirror keywords from target job descriptions in your skills section.',
        'Ensure consistent formatting and clear section headers for ATS parsers.',
      ],
      experience_level: 'mid',
      summary: 'Professional with diverse skills. Connect Groq API for full AI analysis.',
      analyzedAt: new Date().toISOString(),
    },
    flatSkills,
    isMocked: true,
  };
}

// ─── Legacy skill extraction (kept for compatibility) ───────

export async function extractResumeSkills(resumeText: string): Promise<{
  skills: string[];
  isMocked: boolean;
}> {
  const { flatSkills, isMocked } = await analyzeResumeWithATS(resumeText);
  return { skills: flatSkills, isMocked };
}

// ─── Groq per-job match (optional — higher cost) ───────────

export async function computeAIJobMatchScore(
  resumeSkills: string[],
  job: DirectJob,
  experienceLevel?: ExperienceLevel
): Promise<number> {
  try {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqKey || !resumeSkills.length) {
      return computeJobMatchScore(resumeSkills, job, experienceLevel);
    }

    const raw = (await callGroqJSON(
      `You score how well a candidate matches a job (0-100). Return JSON: { "score": number, "reason": "brief" }`,
      `Candidate skills: ${resumeSkills.join(', ')}
Experience level: ${experienceLevel || 'unknown'}
Job: ${job.job_title} at ${job.company}
Location: ${job.location}
Type: ${job.employment_type}
Required skills: ${job.skills}`,
      256
    )) as { score?: number };

    const score = Math.min(99, Math.max(0, Math.round(Number(raw.score) || 0)));
    return score;
  } catch {
    return computeJobMatchScore(resumeSkills, job, experienceLevel);
  }
}

// ─── Enhanced local job match score ────────────────────────

export function computeJobMatchScore(
  resumeSkills: string[],
  job: DirectJob,
  experienceLevel?: ExperienceLevel
): number {
  if (!resumeSkills.length) return 0;

  const jobSkills = job.skills ? parseJobSkills(job.skills) : [];
  let score = 0;
  let maxWeight = 0;

  if (jobSkills.length) {
    for (const js of jobSkills) {
      maxWeight += 1;
      let bestTier: MatchTier | null = null;
      for (const rs of resumeSkills) {
        const tier = classifySkillMatch(rs, js);
        if (tier && (!bestTier || TIER_WEIGHT[tier] > TIER_WEIGHT[bestTier])) {
          bestTier = tier;
        }
      }
      if (bestTier) score += TIER_WEIGHT[bestTier];
    }
  } else {
    maxWeight = 3;
  }

  // Title keyword bonus (up to +15%)
  const titleWords = titleKeywords(job.job_title);
  let titleBonus = 0;
  for (const tw of titleWords) {
    for (const rs of resumeSkills) {
      const tier = classifySkillMatch(rs, tw);
      if (tier) {
        titleBonus += tier === 'exact' ? 0.08 : tier === 'partial' ? 0.05 : 0.03;
        break;
      }
    }
  }
  titleBonus = Math.min(0.15, titleBonus);

  // Domain / company context from job title + skills text
  const jobBlob = `${job.job_title} ${job.company} ${job.skills}`.toLowerCase();
  let domainBonus = 0;
  for (const rs of resumeSkills) {
    const norm = normalizeSkill(rs);
    if (jobBlob.includes(norm) && norm.length > 3) {
      domainBonus += 0.02;
    }
  }
  domainBonus = Math.min(0.1, domainBonus);

  // Employment type alignment
  let typeBonus = 0;
  if (job.employment_type) {
    const et = job.employment_type.toLowerCase();
    const level = experienceLevel || 'mid';
    if (et.includes('intern') && level === 'junior') typeBonus = 0.05;
    if (et.includes('full') && (level === 'mid' || level === 'senior')) typeBonus = 0.04;
    if (et.includes('contract') && level === 'senior') typeBonus = 0.03;
  }

  const base = maxWeight > 0 ? score / maxWeight : 0.25;
  const raw = (base + titleBonus + domainBonus + typeBonus) * 100;
  return Math.min(99, Math.max(0, Math.round(raw)));
}

export function computeReferralMatchScore(
  resumeSkills: string[],
  referral: ReferralOpportunity,
  experienceLevel?: ExperienceLevel
): number {
  if (!resumeSkills.length || !referral.job_titles) return 0;

  const pseudoJob: DirectJob = {
    id: referral.id,
    created_at: referral.created_at,
    company: referral.company || '',
    job_title: referral.job_titles,
    location: referral.location || '',
    batch: '',
    salary: referral.salary || '',
    stipend: referral.stipend || '',
    employment_type: '',
    skills: referral.job_titles.replace(/[,/]/g, ';'),
    email: '',
    application_link: '',
    source_message: '',
    is_active: referral.is_active,
  };

  let score = computeJobMatchScore(resumeSkills, pseudoJob, experienceLevel);

  if (referral.eligibility) {
    const elig = referral.eligibility.toLowerCase();
    for (const rs of resumeSkills) {
      if (elig.includes(normalizeSkill(rs))) {
        score = Math.min(99, score + 5);
        break;
      }
    }
  }

  return score;
}

// ─── Match score UI helpers ──────────────────────────────────

export function getMatchScoreColor(score: number): {
  ring: string;
  text: string;
  bg: string;
} {
  if (score >= 75) return { ring: 'text-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 50) return { ring: 'text-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
  return { ring: 'text-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
}

export function parseResumeSkillsString(skillsStr: string): string[] {
  if (!skillsStr?.trim()) return [];
  return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
}

export function parseATSAnalysis(raw: unknown): ATSAnalysis | null {
  if (!raw || typeof raw !== 'object') return null;
  try {
    return parseATSResponse(raw as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ─── Top matches ───────────────────────────────────────────

export function getTopMatchingJobs(
  resumeSkills: string[],
  jobs: DirectJob[],
  limit: number = 8,
  experienceLevel?: ExperienceLevel
): { job: DirectJob; score: number }[] {
  if (!resumeSkills.length) return [];

  return jobs
    .map(job => ({ job, score: computeJobMatchScore(resumeSkills, job, experienceLevel) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getTopMatchingReferrals(
  resumeSkills: string[],
  referrals: ReferralOpportunity[],
  limit: number = 4,
  experienceLevel?: ExperienceLevel
): { referral: ReferralOpportunity; score: number }[] {
  if (!resumeSkills.length) return [];

  return referrals
    .map(referral => ({
      referral,
      score: computeReferralMatchScore(resumeSkills, referral, experienceLevel),
    }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Fallback keyword extraction ─────────────────────────────

function extractSkillsFallback(text: string): string[] {
  const SKILL_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'express', 'sql', 'postgresql', 'mongodb', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'git', 'html', 'css', 'tailwind', 'figma',
    'product management', 'project management', 'agile', 'scrum', 'leadership',
    'marketing', 'sales', 'analytics', 'data science', 'machine learning',
    'ai', 'deep learning', 'nlp', 'devops', 'ci/cd', 'testing', 'automation',
    'communication', 'teamwork', 'problem solving', 'strategic planning',
    'finance', 'accounting', 'operations', 'supply chain', 'recruitment',
    'hr', 'talent acquisition', 'business development', 'consulting',
    'c++', 'c#', '.net', 'ruby', 'rails', 'php', 'laravel', 'swift',
    'kotlin', 'flutter', 'react native', 'next.js', 'graphql', 'rest api',
    'linux', 'networking', 'cybersecurity', 'blockchain', 'web3',
    'excel', 'powerpoint', 'tableau', 'power bi', 'sap', 'salesforce',
  ];

  const textLower = text.toLowerCase();
  return SKILL_KEYWORDS.filter(skill => textLower.includes(skill));
}
