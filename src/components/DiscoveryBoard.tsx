import React, { useState } from 'react';
import { 
  Filter, 
  MapPin, 
  DollarSign, 
  Layers, 
  Sparkles, 
  RotateCcw, 
  Briefcase, 
  ChevronRight, 
  Check, 
  UserPlus, 
  Star,
  Info,
  X
} from 'lucide-react';
import { JobOpportunity, DirectJob } from '../types';

interface DiscoveryBoardProps {
  jobs: JobOpportunity[];
  onToggleFavoriteJob: (id: string) => void;
  onAddReferral: (candidateName: string, role: string, department: string, source: string) => void;
  searchQuery: string;
  realJobs?: DirectJob[];
}

export const DiscoveryBoard: React.FC<DiscoveryBoardProps> = ({
  jobs,
  onToggleFavoriteJob,
  onAddReferral,
  searchQuery,
  realJobs = []
}) => {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [locationCity, setLocationCity] = useState<string>('');
  const [salaryMin, setSalaryMin] = useState<number>(100000);
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  // Interaction/Modal States
  const [selectedJobForSpec, setSelectedJobForSpec] = useState<JobOpportunity | null>(null);
  const [selectedJobForRefer, setSelectedJobForRefer] = useState<JobOpportunity | null>(null);

  // Referral Submission Form State
  const [refName, setRefName] = useState('');
  const [refNote, setRefNote] = useState('');
  const [refSuccessMsg, setRefSuccessMsg] = useState('');

  // Reset Filters handler
  const resetFilters = () => {
    setSelectedCategory('All');
    setLocationCity('');
    setSalaryMin(100000);
    setRemoteOnly(false);
    setSelectedSizes([]);
  };

  const [showAllReal, setShowAllReal] = useState(false);

  // Filter real jobs
  const filteredRealJobs = realJobs.filter(job => {
    if (searchQuery && !(
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.skills || '').toLowerCase().includes(searchQuery.toLowerCase())
    )) return false;
    if (locationCity && !(job.location || '').toLowerCase().includes(locationCity.toLowerCase())) return false;
    return true;
  });

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Filter Jobs logic
  const filteredJobs = jobs.filter(job => {
    // Top header search query block
    if (searchQuery && ! (
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && job.category !== selectedCategory) {
      return false;
    }

    // Location filter
    if (locationCity && !job.location.toLowerCase().includes(locationCity.toLowerCase())) {
      return false;
    }

    // Salary filter (checks if salaryMax is above slider selection)
    if (job.salaryMax < salaryMin) {
      return false;
    }

    // Remote checkbox
    if (remoteOnly && !job.remote) {
      return false;
    }

    // Company sizes
    if (selectedSizes.length > 0 && !selectedSizes.includes(job.companySize)) {
      return false;
    }

    return true;
  });

  // Color mapper for AI Match Score ring
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 70) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim()) return;

    if (selectedJobForRefer) {
      // Add referral dynamically in core state
      onAddReferral(
        refName, 
        selectedJobForRefer.title, 
        selectedJobForRefer.category, 
        'Direct Referral'
      );

      setRefSuccessMsg(`Successfully referred ${refName} for the ${selectedJobForRefer.title} role!`);
      setTimeout(() => {
        setRefSuccessMsg('');
        setRefName('');
        setRefNote('');
        setSelectedJobForRefer(null);
      }, 1800);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-300">
      {/* Left Filter Panel */}
      <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow p-6 space-y-6 h-fit sticky top-24">
        <div className="flex items-center justify-between pb-3 border-b border-[#faf9f6]">
          <div className="flex items-center space-x-2 text-neutral-800 font-bold text-sm">
            <Filter className="w-4 h-4" />
            <span>Faceted Filters</span>
          </div>
          <button 
            onClick={resetFilters}
            className="text-[10px] uppercase font-bold tracking-wider text-rose-500 hover:text-rose-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Category Selector Dropdown */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            Specialty Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs bg-[#faf9f6] border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 rounded-lg p-2.5 outline-none font-medium transition-colors cursor-pointer"
          >
            <option value="All">All Specialties</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        {/* Location search text */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            City or Region
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
            </span>
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="e.g. San Francisco..."
              className="w-full text-xs bg-[#faf9f6] border border-neutral-200 focus:border-neutral-900 rounded-lg pl-8 pr-4 py-2 text-neutral-800 outline-none transition-all placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Salary Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            <span>Minimum Scale</span>
            <span className="font-mono text-neutral-700 text-xs font-semibold">
              ${(salaryMin / 1000).toFixed(0)}k+
            </span>
          </div>
          <input
            type="range"
            min="100000"
            max="300000"
            step="10000"
            value={salaryMin}
            onChange={(e) => setSalaryMin(parseInt(e.target.value))}
            className="w-full accent-neutral-900 h-1 bg-[#ecebe6] rounded-lg cursor-pointer"
          />
        </div>

        {/* Remote Flag Toggle */}
        <div className="flex items-center space-x-3.5 bg-[#faf9f6] border border-neutral-100 p-3 rounded-lg">
          <input
            type="checkbox"
            id="remoteCheck"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-neutral-900 cursor-pointer"
          />
          <label 
            htmlFor="remoteCheck" 
            className="text-xs font-bold text-neutral-700 cursor-pointer select-none"
          >
            Remote / Distributed Only
          </label>
        </div>

        {/* Company Size Button Matrix */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            Enterprise Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['1-50', '51-200', '201-1k', '1k+'].map(size => {
              const checked = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`py-2 text-[11px] font-bold tracking-wider uppercase rounded-lg border text-center transition-all ${
                    checked
                      ? 'bg-neutral-900 border-neutral-950 text-white shadow-sm'
                      : 'bg-white border-neutral-200/80 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
                  }`}
                >
                  {size} px
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right side Grid Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#ecebe6]">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-neutral-900 uppercase">
              Opportunity Hub
            </h2>
            <p className="text-xs text-neutral-400 font-medium">
              We found <span className="text-neutral-900 font-semibold">{filteredJobs.length} matches</span> matching strategic guidelines.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-amber-50 text-amber-800 border border-amber-100/50 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-medium">Rankings matching active agent profile</span>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#ecebe6] rounded-xl p-8 space-y-3 shadow-sm">
            <Briefcase className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="font-serif-display text-lg font-bold text-neutral-900 uppercase">No Mandates Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Adjust your specialties sliders, geographic filters, or search variables to display active listings.
            </p>
            <button 
              onClick={resetFilters} 
              className="mt-2 text-neutral-900 hover:text-[#5e5a42] text-xs font-bold underline"
            >
              Reset active filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow hover:border-neutral-400 transition-all flex flex-col justify-between"
              >
                {/* Header info */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded ${job.logoBg} flex items-center justify-center font-bold text-white text-sm`}>
                        {job.logoLetter}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 truncate max-w-[150px]">{job.company}</h4>
                        <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          {job.location} {job.remote && "(Remote)"}
                        </span>
                      </div>
                    </div>

                    {/* Bookmark fav */}
                    <button
                      onClick={() => onToggleFavoriteJob(job.id)}
                      className={`p-1.5 rounded-full hover:bg-neutral-50 transition-colors ${
                        job.isFavorite ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500'
                      }`}
                      title="Bookmark Mandate"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Title and Salary Scale */}
                  <div className="space-y-1">
                    <h3 className="font-serif-display text-base font-bold text-neutral-900 leading-snug">
                      {job.title}
                    </h3>
                    <div className="text-xs text-neutral-600 font-bold font-mono">
                      ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                    </div>
                  </div>

                  {/* Snippet */}
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Score and actions in footer */}
                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  {/* AI Match ring structure */}
                  <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-700">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f0e9" strokeWidth="3" />
                        <circle 
                          cx="18" cy="18" r="14" fill="none" 
                          strokeWidth="3" 
                          strokeDasharray="88" 
                          strokeDashoffset={88 - (88 * job.aiMatchScore) / 100}
                          className={`${getScoreColor(job.aiMatchScore)} transition-all duration-500`}
                        />
                      </svg>
                      <span className="absolute text-[9px] font-bold font-mono text-neutral-800">
                        {job.aiMatchScore}
                      </span>
                    </div>
                    <span className="tracking-wide">AI MATCH</span>
                  </div>

                  {/* Quick actions triggers */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedJobForSpec(job)}
                      className="px-3 py-1.5 border border-neutral-200 hover:border-neutral-300 text-[11px] font-bold uppercase rounded-lg text-neutral-600 hover:text-neutral-800 transition-colors"
                    >
                      Specs
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJobForRefer(job);
                        setRefSuccessMsg('');
                      }}
                      className="px-3.5 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-bold uppercase rounded-lg shadow-sm transition-all flex items-center space-x-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Refer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Live Direct Jobs from Supabase ─── */}
        {realJobs.length > 0 && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-serif-display text-base font-bold text-neutral-900 uppercase">Live Direct Jobs</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{filteredRealJobs.length} LISTINGS</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRealJobs.slice(0, showAllReal ? filteredRealJobs.length : 6).map(job => (
                <div key={job.id} className="bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow hover:border-neutral-400 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">{job.company.charAt(0)}</div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 truncate max-w-[200px]">{job.company}</h4>
                        <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location || 'Not specified'}</span>
                      </div>
                    </div>
                    {job.employment_type && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">{job.employment_type}</span>}
                  </div>
                  <h3 className="font-serif-display text-sm font-bold text-neutral-900 mb-1 leading-snug">{job.job_title}</h3>
                  {(job.salary || job.stipend) && <p className="text-xs font-mono font-semibold text-neutral-600 mb-2">{job.salary || job.stipend}</p>}
                  {job.skills && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.skills.split(';').slice(0, 4).map((s, i) => <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{s.trim()}</span>)}
                      {job.skills.split(';').length > 4 && <span className="text-[9px] text-neutral-400">+{job.skills.split(';').length - 4}</span>}
                    </div>
                  )}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    {job.batch && <span className="text-[10px] text-neutral-400">Batch: {job.batch}</span>}
                    <div className="flex items-center space-x-2 ml-auto">
                      {job.email && <a href={`mailto:${job.email}`} className="px-3 py-1.5 border border-neutral-200 hover:border-neutral-300 text-[11px] font-bold uppercase rounded-lg text-neutral-600 hover:text-neutral-800 transition-colors">Email HR</a>}
                      {job.application_link && <a href={job.application_link} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-bold uppercase rounded-lg shadow-sm transition-all">Apply ↗</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredRealJobs.length > 6 && (
              <button onClick={() => setShowAllReal(!showAllReal)} className="w-full py-2.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
                {showAllReal ? 'Show Less' : `View All ${filteredRealJobs.length} Live Jobs`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. Modal: Opportunity Specifications Details */}
      {selectedJobForSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-xl w-full elite-card-shadow p-6 relative">
            <button 
              onClick={() => setSelectedJobForSpec(null)} 
              className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded ${selectedJobForSpec.logoBg} flex items-center justify-center font-bold text-white text-base`}>
                  {selectedJobForSpec.logoLetter}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">{selectedJobForSpec.company}</h4>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider">{selectedJobForSpec.location}</p>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif-display text-xl font-bold tracking-tight text-neutral-950">
                  {selectedJobForSpec.title}
                </h3>
                <div className="text-xs font-mono font-bold text-neutral-600 inline-block bg-neutral-100 px-2.5 py-1 rounded">
                  SALARY RANGE: ${(selectedJobForSpec.salaryMin / 1000).toFixed(0)}K - ${(selectedJobForSpec.salaryMax / 1000).toFixed(0)}K
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#5e5a42] font-bold">MANDATE SCOPE</span>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  {selectedJobForSpec.description}
                </p>
                <div className="grid grid-cols-2 gap-3.5 pt-2 text-[11px] text-neutral-600 bg-[#faf9f6] p-3 rounded-lg border border-neutral-100">
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase">Enterprise Division</span>
                    <span className="font-bold text-neutral-800">{selectedJobForSpec.category}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase">Headcount Size</span>
                    <span className="font-bold text-neutral-800">{selectedJobForSpec.companySize} Employees</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase">Workplace Arrangement</span>
                    <span className="font-bold text-neutral-800">{selectedJobForSpec.remote ? "Fully Remote" : "Onsite Headquarters"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase">Dynamic Match Score</span>
                    <span className="font-bold text-emerald-600">{selectedJobForSpec.aiMatchScore}% Competency Compatibility</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setSelectedJobForSpec(null)}
                  className="px-4 py-2 border border-neutral-200 text-xs rounded-lg font-bold text-neutral-600 hover:text-neutral-800"
                >
                  Close Specs
                </button>
                <button
                  onClick={() => {
                    setSelectedJobForSpec(null);
                    setSelectedJobForRefer(selectedJobForSpec);
                  }}
                  className="px-4.5 py-2 bg-neutral-900 border border-neutral-950 text-xs rounded-lg font-bold text-white shadow-sm hover:bg-neutral-800 transition"
                >
                  Refer for Mandate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Submit Referral Prompt */}
      {selectedJobForRefer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-md w-full elite-card-shadow p-6 relative">
            <button 
              onClick={() => setSelectedJobForRefer(null)} 
              className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleReferralSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#5e5a42] uppercase tracking-widest flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-[#5e5a42]" />
                  <span>Recommend Executive Candidate</span>
                </div>
                <h3 className="font-serif-display text-lg font-bold text-neutral-950">
                  {selectedJobForRefer.title}
                </h3>
                <p className="text-xs text-neutral-400">{selectedJobForRefer.company} • {selectedJobForRefer.location}</p>
              </div>

              {refSuccessMsg ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-4 rounded-lg flex items-center space-x-2 text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{refSuccessMsg}</span>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">Candidate Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Gonzalez"
                      value={refName}
                      onChange={(e) => setRefName(e.target.value)}
                      className="w-full text-xs bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">Strategic Alignment Note</label>
                    <textarea
                      placeholder="Explain why this person is a direct cultural or technical synergistic fit..."
                      value={refNote}
                      rows={3}
                      onChange={(e) => setRefNote(e.target.value)}
                      className="w-full text-xs bg-[#faf9f6] border border-neutral-200 rounded-lg p-2.5 outline-none focus:border-neutral-900 resize-none"
                    />
                  </div>

                  <div className="text-[10px] text-neutral-400 leading-relaxed">
                    This submission will instantly route to the **Referrals Tracking Kanban** at the 'Referred' entry stage for active review.
                  </div>

                  <div className="pt-3 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJobForRefer(null)}
                      className="px-3 py-2 border border-neutral-200 text-xs rounded-lg font-bold text-neutral-600 hover:text-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-950 text-xs rounded-lg font-bold text-white shadow-sm transition"
                    >
                      Submit Referral
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
