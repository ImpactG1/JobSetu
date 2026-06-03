import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  MapPin, 
  RotateCcw, 
  Briefcase, 
  ChevronRight, 
  Mail,
  ExternalLink,
  Users,
  Search,
  X,
  Sparkles,
  Building2,
  GraduationCap,
  Banknote,
  Send,
  Check,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { DirectJob, ReferralOpportunity, EmailTemplate, EmailAttachment, ExperienceLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { sendGmailEmail } from '../lib/gmailService';
import { trackEmailSent } from '../lib/emailTracker';
import { isGoogleAuthError } from '../lib/googleAuth';
import {
  computeJobMatchScore,
  computeReferralMatchScore,
  getMatchScoreColor,
} from '../lib/resumeMatcher';

type DiscoveryTab = 'direct' | 'referral';

interface DiscoveryBoardProps {
  searchQuery: string;
  realJobs: DirectJob[];
  realReferrals: ReferralOpportunity[];
  templates: EmailTemplate[];
  userId: string;
  userEmail: string;
  userName: string;
  resumeSkills?: string[];
  experienceLevel?: ExperienceLevel;
}

const MatchScoreBadge = ({ score, show }: { score: number; show: boolean }) => {
  if (!show) return null;
  const colors = getMatchScoreColor(score);
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`relative flex items-center justify-center w-11 h-11 rounded-full border shrink-0 ${colors.bg}`}
      title={`${score}% match with your resume`}
    >
      <svg className="w-9 h-9 transform -rotate-90">
        <circle cx="18" cy="18" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-neutral-200" />
        <circle
          cx="18" cy="18" r={radius}
          stroke="currentColor" strokeWidth="2.5" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={colors.ring}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-[9px] font-bold ${colors.text}`}>{score}%</span>
    </div>
  );
};

export const DiscoveryBoard: React.FC<DiscoveryBoardProps> = ({
  searchQuery,
  realJobs,
  realReferrals,
  templates,
  userId,
  userEmail,
  userName,
  resumeSkills = [],
  experienceLevel,
}) => {
  const { getValidGoogleAccessToken, isGmailConnected } = useAuth();
  // Tab state
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('direct');

  // Filter States
  const [locationFilter, setLocationFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [employmentType, setEmploymentType] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [hasEmailOnly, setHasEmailOnly] = useState(false);
  const [hasLinkOnly, setHasLinkOnly] = useState(false);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(12);
  const [sortByMatch, setSortByMatch] = useState(false);

  const hasResumeAnalysis = resumeSkills.length > 0;

  // ─── Compose Modal State ─────────────────────────────────
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeJob, setComposeJob] = useState<DirectJob | null>(null);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSending, setComposeSending] = useState(false);
  const [composeResult, setComposeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState('');

  const openCompose = (job: DirectJob) => {
    setComposeJob(job);
    // Use first template as default if available
    const defaultTemplate = templates.find(t => t.category === 'Cold Outreach') || templates[0];
    if (defaultTemplate) {
      setSelectedTemplateId(defaultTemplate.id);
      applyTemplate(defaultTemplate, job);
    } else {
      setComposeSubject(`Application for ${job.job_title} at ${job.company}`);
      setComposeBody(`Dear Hiring Manager,\n\nI am writing to express my interest in the ${job.job_title} position at ${job.company}.\n\nBest regards,\n${userName}`);
    }
    setAttachments([]);
    setAttachmentError('');
    setComposeResult(null);
    setComposeOpen(true);
  };

  const applyTemplate = (tpl: EmailTemplate, job: DirectJob) => {
    let subject = tpl.subject;
    let body = tpl.body;
    // Replace variables with actual values
    const vars: Record<string, string> = {
      '{first_name}': 'Hiring Manager',
      '{company}': job.company,
      '{position}': job.job_title,
      '{sender_name}': userName || 'Applicant',
    };
    Object.entries(vars).forEach(([key, val]) => {
      subject = subject.replaceAll(key, val);
      body = body.replaceAll(key, val);
    });
    setComposeSubject(subject);
    setComposeBody(body);
  };

  const handleSendEmail = async () => {
    if (!composeJob?.email || !composeSubject.trim()) return;
    setComposeSending(true);
    setComposeResult(null);

    try {
      // Read files as base64
      const processedAttachments: EmailAttachment[] = await Promise.all(
        attachments.map(file => new Promise<EmailAttachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // The result is a data URL like "data:application/pdf;base64,JVBER..."
            const base64Data = result.split(',')[1];
            resolve({
              filename: file.name,
              mimeType: file.type || 'application/pdf',
              base64Data
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }))
      );

      let token = await getValidGoogleAccessToken();
      if (!token) {
        setComposeResult({ success: false, message: 'Gmail not connected. Please sign in with Google first.' });
        setComposeSending(false);
        return;
      }

      let result = await sendGmailEmail(token, composeJob.email, composeSubject, composeBody, userEmail, processedAttachments);

      if (!result.success && result.error && isGoogleAuthError(result.error)) {
        token = await getValidGoogleAccessToken({ forceRefresh: true });
        if (token) {
          result = await sendGmailEmail(token, composeJob.email, composeSubject, composeBody, userEmail, processedAttachments);
        }
      }
      if (result.success) {
        // Track in Supabase
        await trackEmailSent({
          user_id: userId,
          recipient_email: composeJob.email,
          recipient_name: composeJob.company,
          subject: composeSubject,
          body: composeBody,
          company: composeJob.company,
          job_title: composeJob.job_title,
          gmail_message_id: result.messageId || '',
        });
        setComposeResult({ success: true, message: `Email sent to ${composeJob.email} successfully!` });
        setTimeout(() => { setComposeOpen(false); setComposeResult(null); }, 2500);
      } else {
        setComposeResult({ success: false, message: result.error || 'Failed to send email' });
      }
    } catch (err: any) {
      setComposeResult({ success: false, message: err.message || 'Failed to send email' });
    } finally {
      setComposeSending(false);
    }
  };

  // Reset
  const resetFilters = () => {
    setLocationFilter('');
    setCompanyFilter('');
    setEmploymentType('All');
    setBatchFilter('All');
    setHasEmailOnly(false);
    setHasLinkOnly(false);
    setVisibleCount(12);
  };

  // ─── Derive filter options from real data ─────────────────

  const employmentTypes = useMemo(() => {
    const types = new Set<string>();
    realJobs.forEach(j => { if (j.employment_type) types.add(j.employment_type); });
    return ['All', ...Array.from(types).sort()];
  }, [realJobs]);

  const batchOptions = useMemo(() => {
    const batches = new Set<string>();
    const jobs = activeTab === 'direct' ? realJobs : [];
    jobs.forEach(j => {
      if (j.batch) {
        // Extract individual years from batch strings like "2024/2025/2026"
        j.batch.split('/').forEach(b => {
          const trimmed = b.trim();
          if (/^\d{4}$/.test(trimmed)) batches.add(trimmed);
        });
      }
    });
    return ['All', ...Array.from(batches).sort().reverse()];
  }, [realJobs, activeTab]);

  // ─── Filter direct jobs ───────────────────────────────────

  const filteredDirectJobs = useMemo(() => {
    return realJobs.filter(job => {
      // Global search
      if (searchQuery && !(
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.skills || '').toLowerCase().includes(searchQuery.toLowerCase())
      )) return false;

      // Location
      if (locationFilter && !(job.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false;

      // Company
      if (companyFilter && !job.company.toLowerCase().includes(companyFilter.toLowerCase())) return false;

      // Employment type
      if (employmentType !== 'All' && (job.employment_type || '').toLowerCase() !== employmentType.toLowerCase()) return false;

      // Batch
      if (batchFilter !== 'All' && !(job.batch || '').includes(batchFilter)) return false;

      // Has email
      if (hasEmailOnly && !job.email) return false;

      // Has application link
      if (hasLinkOnly && !job.application_link) return false;

      return true;
    });
  }, [realJobs, searchQuery, locationFilter, companyFilter, employmentType, batchFilter, hasEmailOnly, hasLinkOnly]);

  // ─── Filter referral opportunities ────────────────────────

  const filteredReferrals = useMemo(() => {
    return realReferrals.filter(ref => {
      // Global search
      if (searchQuery && !(
        (ref.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ref.job_titles || '').toLowerCase().includes(searchQuery.toLowerCase())
      )) return false;

      // Location
      if (locationFilter && !(ref.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false;

      // Company
      if (companyFilter && !(ref.company || '').toLowerCase().includes(companyFilter.toLowerCase())) return false;

      // Has referral form link
      if (hasLinkOnly && !ref.referral_form_link) return false;

      return true;
    });
  }, [realReferrals, searchQuery, locationFilter, companyFilter, hasLinkOnly]);

  const scoredDirectJobs = useMemo(() => {
    const list = filteredDirectJobs.map(job => ({
      job,
      score: hasResumeAnalysis ? computeJobMatchScore(resumeSkills, job, experienceLevel) : 0,
    }));
    if (sortByMatch && hasResumeAnalysis) {
      return [...list].sort((a, b) => b.score - a.score);
    }
    return list;
  }, [filteredDirectJobs, resumeSkills, experienceLevel, sortByMatch, hasResumeAnalysis]);

  const scoredReferrals = useMemo(() => {
    const list = filteredReferrals.map(ref => ({
      referral: ref,
      score: hasResumeAnalysis ? computeReferralMatchScore(resumeSkills, ref, experienceLevel) : 0,
    }));
    if (sortByMatch && hasResumeAnalysis) {
      return [...list].sort((a, b) => b.score - a.score);
    }
    return list;
  }, [filteredReferrals, resumeSkills, experienceLevel, sortByMatch, hasResumeAnalysis]);

  const currentItems = activeTab === 'direct' ? scoredDirectJobs : scoredReferrals;
  const totalCount = activeTab === 'direct' ? realJobs.length : realReferrals.length;
  const filteredCount = activeTab === 'direct' ? filteredDirectJobs.length : filteredReferrals.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8 animate-in fade-in duration-300">

      {/* ═══ Left Filter Panel ═══ */}
      <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-4 sm:p-6 space-y-5 h-fit lg:sticky lg:top-24 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-[#faf9f6]">
          <div className="flex items-center space-x-2 text-neutral-800 font-bold text-sm">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </div>
          <button onClick={resetFilters} className="text-[10px] uppercase font-bold tracking-wider text-rose-500 hover:text-rose-700 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /><span>Reset</span>
          </button>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Location</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><MapPin className="h-3.5 w-3.5 text-neutral-400" /></span>
            <input type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
              placeholder="e.g. Pune, Remote..." className="w-full text-xs bg-[#faf9f6] border border-neutral-200 focus:border-neutral-900 rounded-lg pl-8 pr-4 py-2 text-neutral-800 outline-none transition-all placeholder:text-neutral-400" />
          </div>
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Company</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Building2 className="h-3.5 w-3.5 text-neutral-400" /></span>
            <input type="text" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
              placeholder="e.g. IBM, Wipro..." className="w-full text-xs bg-[#faf9f6] border border-neutral-200 focus:border-neutral-900 rounded-lg pl-8 pr-4 py-2 text-neutral-800 outline-none transition-all placeholder:text-neutral-400" />
          </div>
        </div>

        {/* Employment Type (direct jobs only) */}
        {activeTab === 'direct' && employmentTypes.length > 1 && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Employment Type</label>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value)}
              className="w-full text-xs bg-[#faf9f6] border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 rounded-lg p-2.5 outline-none font-medium transition-colors cursor-pointer">
              {employmentTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
          </div>
        )}

        {/* Batch (direct jobs only) */}
        {activeTab === 'direct' && batchOptions.length > 1 && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Batch Year
            </label>
            <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
              className="w-full text-xs bg-[#faf9f6] border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 rounded-lg p-2.5 outline-none font-medium transition-colors cursor-pointer">
              {batchOptions.map(b => <option key={b} value={b}>{b === 'All' ? 'All Batches' : b}</option>)}
            </select>
          </div>
        )}

        {/* Toggle: Has Email */}
        {activeTab === 'direct' && (
          <div className="flex items-center space-x-3 bg-[#faf9f6] border border-neutral-100 p-3 rounded-lg">
            <input type="checkbox" id="hasEmail" checked={hasEmailOnly} onChange={e => setHasEmailOnly(e.target.checked)} className="w-4 h-4 rounded accent-neutral-900 cursor-pointer" />
            <label htmlFor="hasEmail" className="text-xs font-bold text-neutral-700 cursor-pointer select-none flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-neutral-400" /> Has HR Email
            </label>
          </div>
        )}

        {/* Toggle: Has Apply Link */}
        <div className="flex items-center space-x-3 bg-[#faf9f6] border border-neutral-100 p-3 rounded-lg">
          <input type="checkbox" id="hasLink" checked={hasLinkOnly} onChange={e => setHasLinkOnly(e.target.checked)} className="w-4 h-4 rounded accent-neutral-900 cursor-pointer" />
          <label htmlFor="hasLink" className="text-xs font-bold text-neutral-700 cursor-pointer select-none flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3 text-neutral-400" /> {activeTab === 'direct' ? 'Has Apply Link' : 'Has Referral Form'}
          </label>
        </div>

        {/* Filter summary */}
        <div className="pt-3 border-t border-neutral-100 text-center">
          <p className="text-[10px] text-neutral-400 font-medium">
            Showing <span className="text-neutral-900 font-bold">{filteredCount}</span> of {totalCount} {activeTab === 'direct' ? 'jobs' : 'referrals'}
          </p>
        </div>
      </div>

      {/* ═══ Right Content Area ═══ */}
      <div className="lg:col-span-3 space-y-6">

        {/* Category Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-neutral-100 rounded-xl p-1 border border-neutral-200/50 w-full sm:w-auto overflow-x-auto">
            <button onClick={() => { setActiveTab('direct'); resetFilters(); }}
              className={`flex items-center space-x-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'direct' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60' : 'text-neutral-400 hover:text-neutral-600'}`}>
              <Briefcase className="w-3.5 h-3.5" />
              <span>Direct Jobs</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'direct' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'}`}>{realJobs.length}</span>
            </button>
            <button onClick={() => { setActiveTab('referral'); resetFilters(); }}
              className={`flex items-center space-x-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'referral' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60' : 'text-neutral-400 hover:text-neutral-600'}`}>
              <Users className="w-3.5 h-3.5" />
              <span>Referral Jobs</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'referral' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'}`}>{realReferrals.length}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100/50 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Live from Database</span>
          </div>
        </div>

        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#ecebe6]">
          <div className="min-w-0">
            <h2 className="font-serif-display text-lg sm:text-xl font-bold text-neutral-900 uppercase">
              {activeTab === 'direct' ? 'Direct Job Listings' : 'Referral Opportunities'}
            </h2>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              <span className="text-neutral-900 font-semibold">{filteredCount} {filteredCount === 1 ? 'result' : 'results'}</span>
              {filteredCount < totalCount && ` (filtered from ${totalCount})`}
              {hasResumeAnalysis && (
                <span className="ml-2 text-indigo-600">• Personalized match scores active</span>
              )}
            </p>
          </div>
          {hasResumeAnalysis && (
            <button
              type="button"
              onClick={() => setSortByMatch(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                sortByMatch
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{sortByMatch ? 'Sorted by Match' : 'Sort by Match Score'}</span>
            </button>
          )}
        </div>

        {!hasResumeAnalysis && (
          <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5 -mt-2">
            <Sparkles className="w-3 h-3" />
            Upload and analyze your resume on Profile to see match scores on each card.
          </p>
        )}

        {/* Empty state */}
        {filteredCount === 0 ? (
          <div className="text-center py-20 bg-white border border-[#ecebe6] rounded-xl p-8 space-y-3 shadow-sm">
            {totalCount === 0 ? (
              <>
                <Briefcase className="w-10 h-10 text-neutral-300 mx-auto" />
                <h3 className="font-serif-display text-lg font-bold text-neutral-900 uppercase">No Data Yet</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  {activeTab === 'direct' ? 'No direct jobs have been uploaded yet. Ask an admin to upload job data via the Admin Panel.' : 'No referral opportunities available. Check back soon or ask an admin to upload referral data.'}
                </p>
              </>
            ) : (
              <>
                <Search className="w-10 h-10 text-neutral-300 mx-auto" />
                <h3 className="font-serif-display text-lg font-bold text-neutral-900 uppercase">No Matches Found</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  Try adjusting your filters or search query to find more results.
                </p>
                <button onClick={resetFilters} className="mt-2 text-neutral-900 hover:text-[#5e5a42] text-xs font-bold underline">Reset all filters</button>
              </>
            )}
          </div>
        ) : activeTab === 'direct' ? (
          /* ─── Direct Jobs Grid ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {scoredDirectJobs.slice(0, visibleCount).map(({ job, score }) => (
              <div key={job.id} className="bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow hover:border-neutral-400 transition-all group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {job.company.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-neutral-900 truncate">{job.company}</h4>
                      <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{job.location || 'Not specified'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <MatchScoreBadge score={score} show={hasResumeAnalysis} />
                    {job.employment_type && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">{job.employment_type}</span>
                    )}
                  </div>
                </div>

                {/* Title & Salary */}
                <h3 className="font-serif-display text-sm font-bold text-neutral-900 mb-1.5 leading-snug group-hover:text-black">{job.job_title}</h3>
                {(job.salary || job.stipend) && (
                  <div className="flex items-center gap-1 mb-2">
                    <Banknote className="w-3 h-3 text-neutral-400" />
                    <p className="text-xs font-mono font-semibold text-neutral-600">{job.salary || job.stipend}</p>
                  </div>
                )}

                {/* Batch */}
                {job.batch && (
                  <div className="flex items-center gap-1 mb-2">
                    <GraduationCap className="w-3 h-3 text-neutral-400" />
                    <span className="text-[10px] text-neutral-500 font-medium">Batch: {job.batch}</span>
                  </div>
                )}

                {/* Skills */}
                {job.skills && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills.split(';').slice(0, 5).map((s, i) => (
                      <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{s.trim()}</span>
                    ))}
                    {job.skills.split(';').length > 5 && <span className="text-[9px] text-neutral-400 font-medium">+{job.skills.split(';').length - 5} more</span>}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end space-x-2">
                  {job.email && (
                    <button onClick={() => openCompose(job)} className="px-3 py-1.5 border border-neutral-200 hover:border-neutral-300 text-[11px] font-bold uppercase rounded-lg text-neutral-600 hover:text-neutral-800 transition-colors flex items-center space-x-1.5">
                      <Mail className="w-3 h-3" /><span>Email HR</span>
                    </button>
                  )}
                  {job.application_link && (
                    <a href={job.application_link} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-bold uppercase rounded-lg shadow-sm transition-all flex items-center space-x-1.5">
                      <ExternalLink className="w-3 h-3" /><span>Apply</span>
                    </a>
                  )}
                  {!job.email && !job.application_link && (
                    <span className="text-[10px] text-neutral-400 italic">No direct apply method</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ─── Referral Opportunities Grid ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {scoredReferrals.slice(0, visibleCount).map(({ referral: ref, score }) => (
              <div key={ref.id} className="bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow hover:border-neutral-400 transition-all group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(ref.company || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-neutral-900 truncate">{ref.company || 'Multiple Companies'}</h4>
                      {ref.location && (
                        <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{ref.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <MatchScoreBadge score={score} show={hasResumeAnalysis} />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 uppercase">Referral</span>
                  </div>
                </div>

                {/* Roles */}
                <h3 className="font-serif-display text-sm font-bold text-neutral-900 mb-1.5 leading-snug group-hover:text-black line-clamp-2">{ref.job_titles}</h3>

                {/* Salary & Eligibility */}
                {(ref.salary || ref.stipend) && (
                  <div className="flex items-center gap-1 mb-2">
                    <Banknote className="w-3 h-3 text-neutral-400" />
                    <p className="text-xs font-mono font-semibold text-neutral-600">{ref.salary || ref.stipend}</p>
                  </div>
                )}
                {ref.eligibility && (
                  <div className="flex items-start gap-1 mb-2">
                    <GraduationCap className="w-3 h-3 text-neutral-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-neutral-500 font-medium line-clamp-2">{ref.eligibility}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end space-x-2">
                  {ref.career_page_link && (
                    <a href={ref.career_page_link} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-neutral-200 hover:border-neutral-300 text-[11px] font-bold uppercase rounded-lg text-neutral-600 hover:text-neutral-800 transition-colors flex items-center space-x-1.5">
                      <Building2 className="w-3 h-3" /><span>Careers</span>
                    </a>
                  )}
                  {ref.referral_form_link && (
                    <a href={ref.referral_form_link} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-blue-700 text-white hover:bg-blue-600 text-[11px] font-bold uppercase rounded-lg shadow-sm transition-all flex items-center space-x-1.5">
                      <Users className="w-3 h-3" /><span>Get Referred</span>
                    </a>
                  )}
                  {!ref.referral_form_link && !ref.career_page_link && (
                    <span className="text-[10px] text-neutral-400 italic">Check source for details</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredCount > visibleCount && (
          <button onClick={() => setVisibleCount(prev => prev + 12)}
            className="w-full py-3 text-xs font-bold text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors elite-card-shadow">
            Load More ({filteredCount - visibleCount} remaining)
          </button>
        )}
      </div>

      {/* ═══ Compose Email Modal ═══ */}
      {composeOpen && composeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-2xl w-full max-h-[90dvh] overflow-y-auto elite-card-shadow">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#ecebe6] bg-neutral-50/40">
              <div className="space-y-1">
                <h3 className="font-serif-display text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Compose Email to {composeJob.company}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Sending to: <span className="font-mono text-neutral-600">{composeJob.email}</span> • Re: {composeJob.job_title}
                </p>
              </div>
              <button onClick={() => setComposeOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template Selector */}
            {templates.length > 0 && (
              <div className="px-5 pt-4 pb-2 border-b border-[#ecebe6]/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3 h-3 text-neutral-400" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Use Template from Settings</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {templates.map(tpl => (
                    <button key={tpl.id} onClick={() => { setSelectedTemplateId(tpl.id); applyTemplate(tpl, composeJob); }}
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border transition ${selectedTemplateId === tpl.id ? 'bg-neutral-900 border-neutral-950 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compose Form */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Subject</label>
                <input type="text" value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
                  className="w-full text-xs bg-[#faf9f6] border border-neutral-200 focus:border-neutral-900 rounded-lg px-3 py-2.5 outline-none transition-all text-neutral-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Body</label>
                <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} rows={10}
                  className="w-full text-xs bg-[#faf9f6] border border-neutral-200 focus:border-neutral-900 rounded-lg p-3 outline-none transition-all text-neutral-800 font-light leading-relaxed resize-none" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Attachments</label>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".pdf,application/pdf"
                      multiple
                      onChange={(e) => {
                        setAttachmentError('');
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files) as File[];
                          const invalidFiles = newFiles.filter((f: File) => !f.name.toLowerCase().endsWith('.pdf'));
                          if (invalidFiles.length > 0) {
                            setAttachmentError('Pdf is most professional way to send emails to HR or Recruiter');
                            // Only keep valid pdfs
                            const validFiles = newFiles.filter((f: File) => f.name.toLowerCase().endsWith('.pdf'));
                            setAttachments(prev => [...prev, ...validFiles]);
                          } else {
                            setAttachments(prev => [...prev, ...newFiles]);
                          }
                        }
                        // Reset input
                        e.target.value = '';
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center w-full px-4 py-3 border border-dashed border-neutral-300 rounded-lg bg-[#faf9f6] hover:bg-neutral-50 hover:border-neutral-400 transition-colors">
                      <span className="text-xs font-bold text-neutral-500 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Click to attach PDF files
                      </span>
                    </div>
                  </div>
                  {attachmentError && (
                    <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {attachmentError}
                    </p>
                  )}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
                          <FileText className="w-3 h-3 text-neutral-500" />
                          <span className="text-[11px] font-medium text-neutral-700 max-w-[150px] truncate">{file.name}</span>
                          <button 
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="text-neutral-400 hover:text-rose-500 ml-1 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Result feedback */}
              {composeResult && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg text-[11px] font-medium ${composeResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  {composeResult.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{composeResult.message}</span>
                </div>
              )}

              {/* Gmail not connected warning */}
              {!isGmailConnected && (
                <div className="flex items-center space-x-2 p-3 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-100">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Gmail not connected. Sign in with Google to send emails.</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-3 p-5 border-t border-[#ecebe6] bg-neutral-50/20">
              <button onClick={() => setComposeOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 uppercase transition-colors">Cancel</button>
              <button onClick={handleSendEmail} disabled={composeSending || !composeSubject.trim()}
                className="px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase rounded-lg shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50">
                {composeSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{composeSending ? 'Sending...' : 'Send via Gmail'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
