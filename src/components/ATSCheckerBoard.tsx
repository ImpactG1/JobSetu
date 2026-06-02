import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Loader2,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Target,
  RotateCcw,
  Info,
} from 'lucide-react';
import type { ATSCheckerReport, ATSReportGroupId, ATSCheckStatus } from '../types';
import { runATSChecker } from '../lib/atsChecker';
import { extractTextFromPdfFile } from '../lib/pdfExtractor';
import { downloadATSReportPdf } from '../lib/atsReportPdf';

const CATEGORY_NAV: { id: ATSReportGroupId; label: string }[] = [
  { id: 'content', label: 'Content' },
  { id: 'skills', label: 'Skills' },
  { id: 'format', label: 'Format' },
  { id: 'sections', label: 'Sections' },
  { id: 'style', label: 'Style' },
];

function statusIcon(status: ATSCheckStatus) {
  if (status === 'pass') return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
  return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
}

function scoreRingColor(score: number): string {
  if (score >= 75) return 'text-emerald-500';
  if (score >= 60) return 'text-blue-600';
  if (score >= 45) return 'text-amber-500';
  return 'text-rose-500';
}

function scoreBg(score: number): string {
  if (score >= 75) return 'from-emerald-50 to-white border-emerald-100';
  if (score >= 60) return 'from-blue-50 to-white border-blue-100';
  if (score >= 45) return 'from-amber-50 to-white border-amber-100';
  return 'from-rose-50 to-white border-rose-100';
}

const OverallScoreRing = ({ score, grade }: { score: number; grade: string }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  React.useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, [score]);

  const offset = circumference - (animated ? score / 100 : 0) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="88" cy="88" r={radius} strokeWidth="10" fill="transparent" className="stroke-neutral-100" />
          <circle
            cx="88"
            cy="88"
            r={radius}
            strokeWidth="10"
            fill="transparent"
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${scoreRingColor(score)} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-neutral-900 tabular-nums">{score}</span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">ATS Score</span>
        </div>
      </div>
      <span className={`mt-3 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${score >= 60 ? 'bg-white border-neutral-200 text-neutral-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
        {grade}
      </span>
    </div>
  );
};

const CheckRow = ({ label, score, status, findings, recommendations }: {
  label: string;
  score: number;
  status: ATSCheckStatus;
  findings: string[];
  recommendations: string[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-100 rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {statusIcon(status)}
          <span className="text-sm font-semibold text-neutral-800">{label}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden hidden sm:block">
            <div
              className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-sm font-bold text-neutral-700 w-8 text-right">{score}</span>
          <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-neutral-50 bg-[#faf9f6]/50">
          {findings.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Findings</p>
              <ul className="space-y-1">
                {findings.map((f, i) => (
                  <li key={i} className="text-xs text-neutral-600 leading-relaxed flex gap-2">
                    <span className="text-neutral-300">—</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recommendations.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1.5">Recommendations</p>
              <ul className="space-y-1">
                {recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-neutral-700 leading-relaxed flex gap-2">
                    <span className="text-indigo-400 font-bold">→</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ATSCheckerBoard: React.FC = () => {
  const [report, setReport] = useState<ATSCheckerReport | null>(null);
  const [scanning, setScanning] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeCategory, setActiveCategory] = useState<ATSReportGroupId>('content');
  const [isMocked, setIsMocked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Partial<Record<ATSReportGroupId, HTMLDivElement | null>>>({});

  const scrollToCategory = (id: ATSReportGroupId) => {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF resume.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume must be under 5MB.');
      return;
    }

    setScanning(true);
    setError('');
    setReport(null);
    setFileName(file.name);

    try {
      const text = await extractTextFromPdfFile(file);
      const { report: result, isMocked: mocked } = await runATSChecker(text, {
        fileName: file.name,
        jobDescription: jobDescription.trim() || undefined,
      });
      setReport(result);
      setIsMocked(mocked);
      setActiveCategory('content');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to scan resume.');
    } finally {
      setScanning(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloading(true);
    setError('');
    try {
      await downloadATSReportPdf(report);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setFileName('');
    setError('');
    setIsMocked(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!report) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI ATS Resume Checker
          </div>
          <h1 className="font-serif-display text-2xl font-bold text-neutral-900">Scan your resume like Cake & Jobscan</h1>
          <p className="text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
            Strict ATS scoring across Content, Skills, Format, Sections, and Style — with a detailed PDF report you can download and share.
          </p>
        </div>

        <div className="bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow space-y-4">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Target role / job description (optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste a job description to check missing hard & soft skills..."
            rows={3}
            className="w-full text-xs bg-[#faf9f6] border border-neutral-200 rounded-lg p-3 outline-none focus:border-neutral-900 resize-none"
          />
        </div>

        <div
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => !scanning && fileInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-2xl p-12 flex flex-col items-center text-center cursor-pointer transition-all elite-card-shadow ${
            scanning ? 'border-neutral-200 opacity-70 pointer-events-none' : 'border-neutral-300 hover:border-indigo-400 hover:bg-indigo-50/20'
          }`}
        >
          {scanning ? (
            <>
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-sm font-bold text-neutral-800">Running strict ATS analysis…</p>
              <p className="text-xs text-neutral-400 mt-1">Checking content, skills, format, sections & style</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-neutral-400 mb-4" />
              <p className="text-sm font-bold text-neutral-800 mb-1">Drop your PDF resume here or click to upload</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">PDF only · Max 5MB · Text-based PDFs work best</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORY_NAV.map(cat => (
            <div key={cat.id} className="bg-white border border-[#ecebe6] rounded-lg p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{cat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Scores are calibrated to match strict checkers (typical range 35–65). AI suggestions may contain errors — review before applying.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Report header */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-xl border bg-gradient-to-r ${scoreBg(report.overallScore)}`}>
        <div className="flex items-center gap-6">
          <OverallScoreRing score={report.overallScore} grade={report.grade} />
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
              <span className="text-sm font-bold text-neutral-800 truncate">{report.fileName}</span>
              {report.jobDescriptionUsed && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                  <Target className="w-3 h-3" /> JD compared
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-xl">{report.executiveSummary}</p>
            {isMocked && (
              <p className="text-[10px] text-amber-700 font-medium">Offline heuristic scan — add VITE_GROQ_API_KEY for full AI analysis.</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF Report
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 border border-neutral-200 hover:border-neutral-300 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 text-neutral-600"
          >
            <RotateCcw className="w-4 h-4" />
            New Scan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Top priorities */}
      {report.topPriorities.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-3">Fix these first</h3>
          <ol className="space-y-2">
            {report.topPriorities.map((p, i) => (
              <li key={i} className="text-sm text-amber-900 flex gap-2">
                <span className="font-bold text-amber-600">{i + 1}.</span>
                {p}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category nav — Cake-style sidebar */}
        <nav className="lg:col-span-3 space-y-1 h-fit lg:sticky lg:top-24">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-2 mb-2">Report sections</p>
          {report.groups.map(group => (
            <button
              key={group.id}
              type="button"
              onClick={() => scrollToCategory(group.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === group.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>{group.label}</span>
              <span className={`text-xs font-bold tabular-nums ${activeCategory === group.id ? 'text-white/80' : 'text-neutral-400'}`}>
                {group.score}
              </span>
            </button>
          ))}
        </nav>

        {/* Detail panels */}
        <div className="lg:col-span-9 space-y-8">
          {report.groups.map(group => (
            <section
              key={group.id}
              ref={el => { sectionRefs.current[group.id] = el; }}
              className="scroll-mt-24"
            >
              <div className="flex items-end justify-between mb-4 pb-2 border-b border-[#ecebe6]">
                <div>
                  <h2 className="font-serif-display text-lg font-bold text-neutral-900">{group.label}</h2>
                  <p className="text-xs text-neutral-500 mt-0.5 max-w-xl">{group.description}</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold tabular-nums ${scoreRingColor(group.score)}`}>{group.score}</span>
                  <span className="text-[10px] text-neutral-400 block">/ 100</span>
                </div>
              </div>

              <div className="space-y-2">
                {group.checks.map(check => (
                  <div key={check.id}>
                    <CheckRow
                      label={check.label}
                      score={check.score}
                      status={check.status}
                      findings={check.findings}
                      recommendations={check.recommendations}
                    />
                  </div>
                ))}
              </div>

              {group.id === 'skills' && (report.missingHardSkills.length > 0 || report.missingSoftSkills.length > 0) && (
                <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Suggested additions</p>
                  {report.missingHardSkills.length > 0 && (
                    <p className="text-xs text-neutral-700">
                      <span className="font-bold">Hard skills:</span>{' '}
                      {report.missingHardSkills.join(', ')}
                    </p>
                  )}
                  {report.missingSoftSkills.length > 0 && (
                    <p className="text-xs text-neutral-700">
                      <span className="font-bold">Soft skills:</span>{' '}
                      {report.missingSoftSkills.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Sticky download on mobile */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="px-6 py-3 bg-neutral-900 text-white text-xs font-bold uppercase rounded-full shadow-lg flex items-center gap-2"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Report
        </button>
      </div>

      <p className="text-[11px] text-neutral-400 text-center pb-16 lg:pb-0">
        AI suggestions can make mistakes. Please review before applying. Inspired by professional ATS tools including{' '}
        <a href="https://www.cake.me/ai-resume-checker" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-600">
          Cake Resume Checker
        </a>.
      </p>
    </div>
  );
};
