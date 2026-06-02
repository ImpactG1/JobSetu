/**
 * Dedicated ATS Checker — strict scoring aligned with industry tools (Cake, Jobscan, etc.)
 */
import type {
  ATSAnalysis,
  ATSCheckerReport,
  ATSCheckItem,
  ATSCheckStatus,
  ATSGrade,
  ATSReportGroup,
  ATSReportGroupId,
  ATSSkillCategories,
  ExperienceLevel,
} from '../types';

const GROUP_META: Record<ATSReportGroupId, { label: string; description: string }> = {
  content: {
    label: 'Content',
    description: 'Measurable results, impact metrics, and spelling/grammar quality.',
  },
  skills: {
    label: 'Skills',
    description: 'Hard and soft skills presence, relevance, and keyword alignment.',
  },
  format: {
    label: 'Format',
    description: 'Date formatting, length, bullet structure, and ATS-parseable layout.',
  },
  sections: {
    label: 'Sections',
    description: 'Required resume sections and standard ATS field compatibility.',
  },
  style: {
    label: 'Style',
    description: 'Professional voice, clarity, and avoidance of clichés.',
  },
};

async function callGroqJSON(systemPrompt: string, userContent: string, maxTokens = 4096): Promise<unknown> {
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
      temperature: 0.2,
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

function clampScore(n: number): number {
  return Math.min(100, Math.max(0, Math.round(Number(n) || 0)));
}

function scoreToGrade(score: number): ATSGrade {
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 45) return 'Fair';
  return 'Needs Work';
}

function scoreToStatus(score: number): ATSCheckStatus {
  if (score >= 70) return 'pass';
  if (score >= 45) return 'warning';
  return 'fail';
}

function parseCheck(raw: Record<string, unknown>, fallbackId: string, fallbackLabel: string): ATSCheckItem {
  const score = clampScore(Number(raw.score) || 0);
  const statusRaw = String(raw.status || '').toLowerCase();
  const status: ATSCheckStatus =
    statusRaw === 'pass' || statusRaw === 'warning' || statusRaw === 'fail'
      ? statusRaw
      : scoreToStatus(score);

  return {
    id: String(raw.id || fallbackId),
    label: String(raw.label || fallbackLabel),
    score,
    status,
    findings: Array.isArray(raw.findings) ? raw.findings.map(String).slice(0, 5) : [],
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.map(String).slice(0, 4) : [],
  };
}

function parseSkills(raw: Record<string, unknown>): ATSSkillCategories {
  const skillsRaw = (raw.skills || {}) as Record<string, unknown>;
  return {
    technical: Array.isArray(skillsRaw.technical) ? skillsRaw.technical.map(String) : [],
    soft: Array.isArray(skillsRaw.soft) ? skillsRaw.soft.map(String) : [],
    tools: Array.isArray(skillsRaw.tools) ? skillsRaw.tools.map(String) : [],
    domains: Array.isArray(skillsRaw.domains) ? skillsRaw.domains.map(String) : [],
  };
}

function parseGroups(raw: Record<string, unknown>): ATSReportGroup[] {
  const groupsRaw = Array.isArray(raw.groups) ? raw.groups : [];
  const defaultChecks: Record<ATSReportGroupId, { id: string; label: string }[]> = {
    content: [
      { id: 'measurable_results', label: 'Measurable Results' },
      { id: 'spelling_grammar', label: 'Spelling & Grammar' },
    ],
    skills: [
      { id: 'hard_skills', label: 'Hard Skills' },
      { id: 'soft_skills', label: 'Soft Skills' },
    ],
    format: [
      { id: 'date_formatting', label: 'Date Formatting' },
      { id: 'resume_length', label: 'Resume Length' },
      { id: 'bullet_points', label: 'Bullet Points' },
    ],
    sections: [{ id: 'required_sections', label: 'Required Sections' }],
    style: [
      { id: 'voice_tone', label: 'Voice & Tone' },
      { id: 'buzzwords_cliches', label: 'Buzzwords & Clichés' },
    ],
  };

  const parsed: ATSReportGroup[] = [];
  const groupIds = Object.keys(GROUP_META) as ATSReportGroupId[];

  for (const gid of groupIds) {
    const fromAi = groupsRaw.find(
      (g: Record<string, unknown>) => String(g.id).toLowerCase() === gid
    ) as Record<string, unknown> | undefined;

    const meta = GROUP_META[gid];
    const checksRaw = Array.isArray(fromAi?.checks) ? fromAi.checks : [];
    const defaults = defaultChecks[gid];

    const checks: ATSCheckItem[] = defaults.map((def, i) => {
      const cr = (checksRaw[i] || {}) as Record<string, unknown>;
      return parseCheck(
        { ...cr, id: cr.id || def.id, label: cr.label || def.label },
        def.id,
        def.label
      );
    });

    const groupScore =
      checks.length > 0
        ? clampScore(checks.reduce((s, c) => s + c.score, 0) / checks.length)
        : clampScore(Number(fromAi?.score) || 0);

    parsed.push({
      id: gid,
      label: meta.label,
      description: String(fromAi?.description || meta.description),
      score: groupScore,
      checks,
    });
  }

  return parsed;
}

function computeOverallFromGroups(groups: ATSReportGroup[]): number {
  if (!groups.length) return 0;
  const weights: Record<ATSReportGroupId, number> = {
    content: 0.25,
    skills: 0.2,
    format: 0.2,
    sections: 0.15,
    style: 0.2,
  };
  let total = 0;
  let weightSum = 0;
  for (const g of groups) {
    const w = weights[g.id] ?? 0.2;
    total += g.score * w;
    weightSum += w;
  }
  return clampScore(total / weightSum);
}

function parseReport(raw: Record<string, unknown>, fileName: string, jobDescriptionUsed: boolean): ATSCheckerReport {
  const groups = parseGroups(raw);
  const aiOverall = clampScore(Number(raw.overallScore ?? raw.overall_score) || 0);
  const computedOverall = computeOverallFromGroups(groups);
  // Cap inflated AI scores — align with weighted category average (strict tools rarely exceed ~75)
  const adjustedOverall =
    aiOverall > 0
      ? clampScore(Math.min(aiOverall, computedOverall + 10))
      : computedOverall;

  const level = String(raw.experience_level || 'mid').toLowerCase();
  const validLevels: ExperienceLevel[] = ['junior', 'mid', 'senior', 'lead'];
  const experience_level = validLevels.includes(level as ExperienceLevel)
    ? (level as ExperienceLevel)
    : 'mid';

  return {
    overallScore: adjustedOverall,
    grade: scoreToGrade(adjustedOverall),
    scannedAt: new Date().toISOString(),
    fileName,
    executiveSummary: String(raw.executiveSummary || raw.executive_summary || ''),
    topPriorities: Array.isArray(raw.topPriorities)
      ? raw.topPriorities.map(String).slice(0, 6)
      : Array.isArray(raw.top_priorities)
        ? raw.top_priorities.map(String).slice(0, 6)
        : [],
    experience_level,
    skills: parseSkills(raw),
    missingHardSkills: Array.isArray(raw.missingHardSkills)
      ? raw.missingHardSkills.map(String)
      : Array.isArray(raw.missing_hard_skills)
        ? raw.missing_hard_skills.map(String)
        : [],
    missingSoftSkills: Array.isArray(raw.missingSoftSkills)
      ? raw.missingSoftSkills.map(String)
      : Array.isArray(raw.missing_soft_skills)
        ? raw.missing_soft_skills.map(String)
        : [],
    groups,
    jobDescriptionUsed,
  };
}

const STRICT_SYSTEM_PROMPT = `You are a STRICT ATS resume evaluator matching professional tools like Cake Resume Checker, Jobscan, and Resume Worded.

SCORING CALIBRATION (critical):
- Most resumes score 35-58. Average is ~50.
- 60-69 = above average. 70-74 = strong. 75+ = rare, only near-perfect ATS resumes.
- Do NOT inflate scores. Be critical like a hiring-system parser, not a cheerleader.
- Penalize: no metrics/numbers, clichés ("team player", "hard worker"), missing contact/skills/experience sections, inconsistent dates, dense paragraphs, tables/columns, graphics, skills without evidence, vague bullets.

Return ONLY valid JSON:
{
  "overallScore": number,
  "grade": "Needs Work"|"Fair"|"Good"|"Strong",
  "executiveSummary": "2-3 sentences",
  "topPriorities": ["max 5 critical fixes"],
  "experience_level": "junior"|"mid"|"senior"|"lead",
  "skills": { "technical": [], "soft": [], "tools": [], "domains": [] },
  "missingHardSkills": [],
  "missingSoftSkills": [],
  "groups": [
    {
      "id": "content",
      "score": number,
      "checks": [
        { "id": "measurable_results", "label": "Measurable Results", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] },
        { "id": "spelling_grammar", "label": "Spelling & Grammar", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] }
      ]
    },
    {
      "id": "skills",
      "score": number,
      "checks": [
        { "id": "hard_skills", "label": "Hard Skills", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] },
        { "id": "soft_skills", "label": "Soft Skills", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] }
      ]
    },
    {
      "id": "format",
      "score": number,
      "checks": [
        { "id": "date_formatting", "label": "Date Formatting", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] },
        { "id": "resume_length", "label": "Resume Length", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] },
        { "id": "bullet_points", "label": "Bullet Points", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] }
      ]
    },
    {
      "id": "sections",
      "score": number,
      "checks": [
        { "id": "required_sections", "label": "Required Sections", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] }
      ]
    },
    {
      "id": "style",
      "score": number,
      "checks": [
        { "id": "voice_tone", "label": "Voice & Tone", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] },
        { "id": "buzzwords_cliches", "label": "Buzzwords & Clichés", "score": number, "status": "pass"|"warning"|"fail", "findings": [], "recommendations": [] }
      ]
    }
  ]
}`;

export async function runATSChecker(
  resumeText: string,
  options?: { fileName?: string; jobDescription?: string }
): Promise<{ report: ATSCheckerReport; isMocked: boolean }> {
  const sanitized = resumeText.slice(0, 14000).trim();
  if (!sanitized) throw new Error('Resume text is empty. Upload a text-based PDF (not a scanned image).');

  const fileName = options?.fileName || 'resume.pdf';
  const jobDescriptionUsed = Boolean(options?.jobDescription?.trim());

  try {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqKey) {
      return { report: buildFallbackReport(sanitized, fileName, jobDescriptionUsed), isMocked: true };
    }

    let userPrompt = `Analyze this resume with STRICT ATS scoring:\n\n${sanitized}`;
    if (jobDescriptionUsed) {
      userPrompt += `\n\n--- TARGET JOB DESCRIPTION (compare skills & keywords) ---\n${options!.jobDescription!.slice(0, 4000)}`;
    }

    const raw = (await callGroqJSON(STRICT_SYSTEM_PROMPT, userPrompt)) as Record<string, unknown>;
    const report = parseReport(raw, fileName, jobDescriptionUsed);
    return { report, isMocked: false };
  } catch (err) {
    console.error('[atsChecker] runATSChecker failed:', err);
    return { report: buildFallbackReport(sanitized, fileName, jobDescriptionUsed), isMocked: true };
  }
}

function buildFallbackReport(text: string, fileName: string, jobDescriptionUsed: boolean): ATSCheckerReport {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasMetrics = /\d+%|\$\d+|\d+\+|\d{1,3}(,\d{3})+/.test(text);
  const hasEmail = /@/.test(text);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const clicheCount = (text.match(/team player|hard.?working|go.?getter|synergy|passionate|detail.?oriented/gi) || []).length;
  const bulletLines = (text.match(/^[\s]*[•\-\*]/gm) || []).length;

  const measurableScore = hasMetrics ? 62 : 38;
  const grammarScore = 55;
  const hardSkillsScore = Math.min(58, 30 + (text.match(/javascript|python|java|react|sql|aws|excel/gi) || []).length * 6);
  const softSkillsScore = 48;
  const dateScore = /\b(20\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(text) ? 58 : 35;
  const lengthScore = wordCount > 900 ? 42 : wordCount < 250 ? 45 : wordCount > 700 ? 52 : 60;
  const bulletScore = bulletLines >= 5 ? 58 : 40;
  const sectionsScore = hasEmail && hasPhone ? 55 : hasEmail ? 48 : 35;
  const voiceScore = 52;
  const buzzScore = clicheCount > 2 ? 35 : clicheCount > 0 ? 48 : 62;

  const mkCheck = (id: string, label: string, score: number, finding: string, rec: string): ATSCheckItem => ({
    id,
    label,
    score,
    status: scoreToStatus(score),
    findings: [finding],
    recommendations: [rec],
  });

  const groups: ATSReportGroup[] = [
    {
      id: 'content',
      label: 'Content',
      description: GROUP_META.content.description,
      score: clampScore((measurableScore + grammarScore) / 2),
      checks: [
        mkCheck(
          'measurable_results',
          'Measurable Results',
          measurableScore,
          hasMetrics ? 'Some quantified results detected.' : 'Few or no measurable outcomes (%, $, KPIs).',
          'Add 3-5 bullets with numbers: revenue, % improvement, users, time saved.'
        ),
        mkCheck(
          'spelling_grammar',
          'Spelling & Grammar',
          grammarScore,
          'Connect Groq API for full grammar analysis.',
          'Proofread and use consistent tense in experience bullets.'
        ),
      ],
    },
    {
      id: 'skills',
      label: 'Skills',
      description: GROUP_META.skills.description,
      score: clampScore((hardSkillsScore + softSkillsScore) / 2),
      checks: [
        mkCheck('hard_skills', 'Hard Skills', hardSkillsScore, 'Keyword-based skill scan only.', 'Add a dedicated Skills section with tools matching your target role.'),
        mkCheck('soft_skills', 'Soft Skills', softSkillsScore, 'Limited soft-skill evidence in text.', 'Show soft skills through outcomes, not adjectives alone.'),
      ],
    },
    {
      id: 'format',
      label: 'Format',
      description: GROUP_META.format.description,
      score: clampScore((dateScore + lengthScore + bulletScore) / 3),
      checks: [
        mkCheck('date_formatting', 'Date Formatting', dateScore, 'Verify consistent MM/YYYY or Month YYYY format.', 'Use one date style across all roles.'),
        mkCheck('resume_length', 'Resume Length', lengthScore, `Approx. ${wordCount} words detected.`, wordCount > 700 ? 'Trim to 1 page if <5 years experience.' : 'Expand impact bullets if too brief.'),
        mkCheck('bullet_points', 'Bullet Points', bulletScore, `${bulletLines} bullet-style lines found.`, 'Use action verbs + metrics in 4-6 bullets per role.'),
      ],
    },
    {
      id: 'sections',
      label: 'Sections',
      description: GROUP_META.sections.description,
      score: sectionsScore,
      checks: [
        mkCheck(
          'required_sections',
          'Required Sections',
          sectionsScore,
          `Contact signals: email ${hasEmail ? 'yes' : 'no'}, phone ${hasPhone ? 'yes' : 'no'}.`,
          'Include Contact, Summary/Headline, Experience, Education, and Skills sections.'
        ),
      ],
    },
    {
      id: 'style',
      label: 'Style',
      description: GROUP_META.style.description,
      score: clampScore((voiceScore + buzzScore) / 2),
      checks: [
        mkCheck('voice_tone', 'Voice & Tone', voiceScore, 'Automated tone check limited without AI.', 'Use confident, concise, active voice.'),
        mkCheck(
          'buzzwords_cliches',
          'Buzzwords & Clichés',
          buzzScore,
          clicheCount > 0 ? `${clicheCount} common cliché(s) detected.` : 'No major clichés detected.',
          'Replace generic phrases with specific achievements.'
        ),
      ],
    },
  ];

  const overallScore = computeOverallFromGroups(groups);

  return {
    overallScore,
    grade: scoreToGrade(overallScore),
    scannedAt: new Date().toISOString(),
    fileName,
    executiveSummary:
      'This offline scan uses basic heuristics. Connect VITE_GROQ_API_KEY for strict AI scoring comparable to Cake and Jobscan.',
    topPriorities: [
      'Add quantified results to experience bullets',
      'Ensure all required sections are present and ATS-parseable',
      'Remove buzzwords and strengthen skill keywords',
    ],
    experience_level: 'mid',
    skills: { technical: [], soft: [], tools: [], domains: [] },
    missingHardSkills: [],
    missingSoftSkills: [],
    groups,
    jobDescriptionUsed,
  };
}

/** Map strict ATS report → legacy profile ATS shape */
export function atsCheckerReportToAnalysis(report: ATSCheckerReport): ATSAnalysis {
  const content = report.groups.find(g => g.id === 'content');
  const skills = report.groups.find(g => g.id === 'skills');
  const format = report.groups.find(g => g.id === 'format');
  const sections = report.groups.find(g => g.id === 'sections');
  const style = report.groups.find(g => g.id === 'style');

  const measurable = content?.checks.find(c => c.id === 'measurable_results')?.score ?? content?.score ?? 0;

  const suggestions = report.topPriorities.length
    ? report.topPriorities
    : report.groups.flatMap(g => g.checks.flatMap(c => c.recommendations)).slice(0, 6);

  return {
    skills: report.skills,
    atsScore: report.overallScore,
    atsBreakdown: {
      formatting: format?.score ?? 0,
      keywords: skills?.score ?? 0,
      experience: measurable,
      education: sections?.score ?? 0,
      impact: content?.score ?? 0,
    },
    suggestions,
    experience_level: report.experience_level,
    summary: report.executiveSummary,
    analyzedAt: report.scannedAt,
  };
}

export function flattenSkillsFromReport(report: ATSCheckerReport): string[] {
  const { skills } = report;
  return [...skills.technical, ...skills.soft, ...skills.tools, ...skills.domains]
    .map(s => s.trim())
    .filter(Boolean);
}
