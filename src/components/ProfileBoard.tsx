import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Camera, 
  FileText, 
  UploadCloud, 
  X, 
  Save, 
  Check, 
  AlertCircle,
  Briefcase,
  Users,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  fetchUserProfile, 
  upsertUserProfile, 
  uploadAvatar, 
  uploadResume, 
  deleteResume 
} from '../lib/profileService';
import { 
  analyzeResumeWithATS,
  getTopMatchingJobs, 
  getTopMatchingReferrals,
  parseATSAnalysis,
} from '../lib/resumeMatcher';
import { extractTextFromPdfUrl, extractTextFromPdfFile } from '../lib/pdfExtractor';
import { UserProfileData, DirectJob, ReferralOpportunity, ATSAnalysis, ExperienceLevel } from '../types';

interface ProfileBoardProps {
  userId: string;
  realJobs: DirectJob[];
  realReferrals: ReferralOpportunity[];
  onResumeAnalysisUpdate?: (skills: string[], experienceLevel?: ExperienceLevel) => void;
}

const CircularMatchScore = ({ score }: { score: number }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-rose-500';
  if (score >= 75) colorClass = 'text-emerald-500';
  else if (score >= 50) colorClass = 'text-amber-500';

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-neutral-100"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-neutral-800">{score}%</span>
      </div>
    </div>
  );
};

const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  lead: 'Lead / Principal',
};

const ATSScoreDashboard = ({ analysis }: { analysis: ATSAnalysis }) => {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, [analysis.atsScore]);

  const categories: { key: keyof ATSAnalysis['atsBreakdown']; label: string }[] = [
    { key: 'keywords', label: 'Keywords' },
    { key: 'formatting', label: 'Formatting' },
    { key: 'impact', label: 'Impact Metrics' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
  ];

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated ? analysis.atsScore / 100 : 0) * circumference;
  const scoreColor = analysis.atsScore >= 75 ? 'text-emerald-500' : analysis.atsScore >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 border border-indigo-100 rounded-xl p-6 elite-card-shadow space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-indigo-100/60">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-serif-display text-lg font-bold text-neutral-900">ATS Resume Score</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
          {EXPERIENCE_LABELS[analysis.experience_level]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-100" />
              <circle
                cx="64" cy="64" r={radius}
                stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${scoreColor} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-neutral-900">{analysis.atsScore}</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ATS Score</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-3">
          {categories.map(({ key, label }) => {
            const val = analysis.atsBreakdown[key];
            const barColor = val >= 75 ? 'bg-emerald-500' : val >= 50 ? 'bg-amber-500' : 'bg-rose-500';
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <span>{label}</span>
                  <span className="text-neutral-800">{val}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                    style={{ width: animated ? `${val}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {analysis.summary && (
        <p className="text-xs text-neutral-600 leading-relaxed font-medium border-t border-indigo-100/60 pt-4">
          {analysis.summary}
        </p>
      )}

      {analysis.suggestions.length > 0 && (
        <div className="space-y-2 border-t border-indigo-100/60 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">AI Improvement Tips</h4>
          <ul className="space-y-1.5">
            {analysis.suggestions.map((tip, i) => (
              <li key={i} className="text-xs text-neutral-700 flex gap-2 leading-relaxed">
                <span className="text-indigo-500 font-bold shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ProfileBoard: React.FC<ProfileBoardProps> = ({
  userId,
  realJobs,
  realReferrals,
  onResumeAnalysisUpdate,
}) => {
  const [profile, setProfile] = useState<Partial<UserProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const pendingResumeFileRef = useRef<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const data = await fetchUserProfile(userId);
    if (data) {
      setProfile(data);
      const parsed = parseATSAnalysis(data.ats_analysis);
      if (parsed) setAtsAnalysis(parsed);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    const { error } = await upsertUserProfile(userId, profile);
    if (error) {
      setErrorMsg(error);
    } else {
      setSuccessMsg('Profile updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingAvatar(true);
    setErrorMsg('');
    
    const { url, error } = await uploadAvatar(userId, file);
    if (error) {
      setErrorMsg(error);
    } else if (url) {
      setProfile(prev => ({ ...prev, avatar_url: url }));
    }
    
    setUploadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingResume(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const { url, error } = await uploadResume(userId, file);
    if (error) {
      setErrorMsg(error);
    } else if (url) {
      pendingResumeFileRef.current = file;
      setProfile(prev => ({ ...prev, resume_url: url, resume_filename: file.name }));
      setSuccessMsg('Resume uploaded successfully. Click Analyze to find matches.');
    }
    
    setUploadingResume(false);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const handleRemoveResume = async () => {
    setUploadingResume(true);
    const { error } = await deleteResume(userId);
    if (error) {
      setErrorMsg(error);
    } else {
      setProfile(prev => ({ ...prev, resume_url: '', resume_filename: '', resume_skills: '', ats_score: 0 }));
      setAtsAnalysis(null);
      pendingResumeFileRef.current = null;
      onResumeAnalysisUpdate?.([]);
    }
    setUploadingResume(false);
  };

  const handleAnalyzeResume = async () => {
    if (!profile.resume_url) return;
    
    setAnalyzingResume(true);
    setErrorMsg('');
    
    try {
      let resumeText: string;
      if (pendingResumeFileRef.current) {
        resumeText = await extractTextFromPdfFile(pendingResumeFileRef.current);
      } else {
        resumeText = await extractTextFromPdfUrl(profile.resume_url);
      }

      if (!resumeText.trim()) {
        setErrorMsg('Could not extract text from PDF. Try a text-based resume (not scanned images).');
        setAnalyzingResume(false);
        return;
      }

      const { analysis, flatSkills } = await analyzeResumeWithATS(resumeText);
      
      if (flatSkills.length > 0) {
        const skillsString = flatSkills.join(', ');
        await upsertUserProfile(userId, {
          resume_skills: skillsString,
          ats_score: analysis.atsScore,
          ats_analysis: analysis,
        });
        setProfile(prev => ({
          ...prev,
          resume_skills: skillsString,
          ats_score: analysis.atsScore,
          ats_analysis: analysis,
        }));
        setAtsAnalysis(analysis);
        onResumeAnalysisUpdate?.(flatSkills, analysis.experience_level);
        pendingResumeFileRef.current = null;
        setSuccessMsg('Resume analyzed with AI — match scores updated across Discovery.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg('Could not extract skills from resume.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze resume.';
      setErrorMsg(msg);
    }
    
    setAnalyzingResume(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const parsedSkills = profile.resume_skills ? profile.resume_skills.split(',').map(s => s.trim()) : [];
  const expLevel = atsAnalysis?.experience_level;
  const topJobs = getTopMatchingJobs(parsedSkills, realJobs, 6, expLevel);
  const topReferrals = getTopMatchingReferrals(parsedSkills, realReferrals, 4, expLevel);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Messages */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}
      
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#ecebe6] rounded-xl p-8 elite-card-shadow flex flex-col items-center text-center">
            
            <div className="relative group mb-5">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-neutral-300" />
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6 mb-1" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">Update</span>
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept=".jpg,.jpeg,.png" 
                className="hidden" 
              />
            </div>
            
            <h2 className="font-serif-display text-xl font-bold text-neutral-900">
              {profile.first_name || profile.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'Executive Professional'}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-medium">{profile.headline || 'Add a professional headline'}</p>
            
          </div>
          
          {/* Resume Upload Section */}
          <div className="bg-white border border-[#ecebe6] rounded-xl p-6 elite-card-shadow space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-[#faf9f6]">
              <FileText className="w-4.5 h-4.5 text-neutral-500" />
              <h3 className="font-serif-display text-base font-bold text-neutral-900 leading-snug">
                Professional Resume
              </h3>
            </div>
            
            {!profile.resume_url ? (
              <div 
                onClick={() => resumeInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 transition-colors group"
              >
                <UploadCloud className="w-8 h-8 text-neutral-400 group-hover:text-neutral-600 mb-3 transition-colors" />
                <p className="text-sm font-bold text-neutral-700 mb-1">Upload your PDF Resume</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">Max 5MB</p>
                <input 
                  type="file" 
                  ref={resumeInputRef} 
                  onChange={handleResumeChange} 
                  accept=".pdf,application/pdf" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-800 truncate">{profile.resume_filename || 'resume.pdf'}</p>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Uploaded Securely
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRemoveResume}
                    disabled={uploadingResume}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleAnalyzeResume}
                  disabled={analyzingResume}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {analyzingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{profile.resume_skills ? 'Re-analyze Resume' : 'Analyze Resume'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details & Matches */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-[#ecebe6] rounded-xl p-6 elite-card-shadow space-y-5">
            <h3 className="font-serif-display text-lg font-bold text-neutral-900 leading-snug pb-2 border-b border-[#faf9f6]">
              Personal Information
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-neutral-500 font-bold uppercase text-[10px] tracking-widest">First Name</label>
                  <input
                    type="text"
                    value={profile.first_name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950 text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Last Name</label>
                  <input
                    type="text"
                    value={profile.last_name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950 text-neutral-800"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950 text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Location</label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950 text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Professional Headline</label>
                <input
                  type="text"
                  value={profile.headline || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="e.g. Senior Product Designer | Fintech Enthusiast"
                  className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-950 text-neutral-800"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {atsAnalysis && (
            <ATSScoreDashboard analysis={atsAnalysis} />
          )}

          {/* AI Match Scores Section */}
          {profile.resume_skills && (
            <div className="bg-white border border-[#ecebe6] rounded-xl p-6 elite-card-shadow space-y-5">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#faf9f6]">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-serif-display text-lg font-bold text-neutral-900 leading-snug">
                  AI Job Matches
                </h3>
              </div>
              
              <div className="space-y-4 text-xs">
                <p className="text-neutral-500 leading-relaxed font-medium">
                  Based on your resume, our AI has extracted key skills (<span className="text-neutral-800 font-bold">{parsedSkills.slice(0, 5).join(', ')}{parsedSkills.length > 5 ? '...' : ''}</span>) and matched them against current opportunities.
                </p>

                {topJobs.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" /> Direct Jobs Matches
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topJobs.map(({ job, score }) => (
                        <div key={job.id} className="border border-neutral-200 rounded-xl p-4 flex items-center justify-between hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                          <div className="min-w-0 pr-4">
                            <h5 className="font-bold text-neutral-900 truncate">{job.job_title}</h5>
                            <p className="text-neutral-500 text-[10px] truncate">{job.company} • {job.location}</p>
                            <p className="text-indigo-600 font-bold text-[10px] mt-1">This Job Suits {score}% To You</p>
                          </div>
                          <CircularMatchScore score={score} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {topReferrals.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> Referral Opportunities
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topReferrals.map(({ referral, score }) => (
                        <div key={referral.id} className="border border-neutral-200 rounded-xl p-4 flex items-center justify-between hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                          <div className="min-w-0 pr-4">
                            <h5 className="font-bold text-neutral-900 truncate">{referral.job_titles}</h5>
                            <p className="text-neutral-500 text-[10px] truncate">{referral.company}</p>
                            <p className="text-indigo-600 font-bold text-[10px] mt-1">This Job Suits {score}% To You</p>
                          </div>
                          <CircularMatchScore score={score} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
