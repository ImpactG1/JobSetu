import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  Plus, 
  MapPin, 
  AlertCircle, 
  HeartHandshake, 
  Check, 
  ChevronDown, 
  ArrowUpRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { ReferralCandidate, TopReferrer } from '../types';

interface ReferralsBoardProps {
  referrals: ReferralCandidate[];
  topReferrers: TopReferrer[];
  onUpdateStage: (id: string, newStage: 'referred' | 'screening' | 'interviewing' | 'hired') => void;
  onAddReferral: (candidateName: string, role: string, department: string, source: string) => void;
}

export const ReferralsBoard: React.FC<ReferralsBoardProps> = ({
  referrals,
  topReferrers,
  onUpdateStage,
  onAddReferral
}) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateRole, setCandidateRole] = useState('');
  const [candidateDept, setCandidateDept] = useState('Engineering');
  
  // Kanban stages list
  const stages = [
    { key: 'referred' as const, label: 'Referred', bg: 'bg-[#ecebe6]/40 text-neutral-800' },
    { key: 'screening' as const, label: 'Screening', bg: 'bg-blue-50 text-blue-700' },
    { key: 'interviewing' as const, label: 'Interviewing', bg: 'bg-amber-50 text-amber-700 font-bold border border-amber-200/50' },
    { key: 'hired' as const, label: 'Hired', bg: 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50' }
  ];

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateRole.trim()) return;

    onAddReferral(candidateName, candidateRole, candidateDept, 'Direct Referral');
    setCandidateName('');
    setCandidateRole('');
    setShowSubmissionForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Canvas & Leaderboard Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Decorative Top Leaderboard Scoreboard Banner */}
        <div className="lg:col-span-8 bg-neutral-900 text-white rounded-2xl p-6 relative overflow-hidden elite-card-shadow flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#ecebe6]/10 to-transparent rounded-full -mr-12 -mt-12 pointer-events-none"></div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ecebe6]">
                EMPLOYEE REFERRAL SCOREBOARD
              </span>
            </div>
            <h3 className="font-serif-display text-2xl font-bold tracking-tight">
              Honoring Our Top Strategy Contributors
            </h3>
            <p className="text-xs text-neutral-300 leading-normal font-light">
              We leverage verified coordinate linkages to attract premiere leadership competency. Review top tiers:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 relative z-10">
            {topReferrers.map((ref) => (
              <div 
                key={ref.rank} 
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center space-x-3.5 hover:bg-white/10 transition"
              >
                <img
                  src={ref.avatar}
                  alt={ref.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{ref.name}</h4>
                  <div className="flex items-center space-x-1.5 text-[10px] text-neutral-400 font-mono">
                    <span className="text-amber-400 font-bold">{ref.hires} Hires</span>
                    <span>•</span>
                    <span>{ref.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Submission Prompt Banner */}
        <div className="lg:col-span-4 bg-[#faf9f6] border border-[#ecebe6] rounded-2xl p-6 elite-card-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-neutral-900 font-bold text-sm">
              <HeartHandshake className="w-4.5 h-4.5 text-neutral-500" />
              <span>Referral Network</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Attract top executive talent. Earn custom Gold level tier benefits and points multipliers.
            </p>
          </div>

          {showSubmissionForm ? (
            <form onSubmit={handleSub} className="space-y-2.5 animate-in slide-in-from-bottom-2 duration-150">
              <input
                type="text"
                required
                placeholder="Candidate Full Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-200 rounded-lg p-2 outline-none focus:border-neutral-950"
              />
              <input
                type="text"
                required
                placeholder="E.g. Vice President Engineering"
                value={candidateRole}
                onChange={(e) => setCandidateRole(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-200 rounded-lg p-2 outline-none focus:border-neutral-950"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={candidateDept}
                  onChange={(e) => setCandidateDept(e.target.value)}
                  className="text-[10px] font-bold bg-white border border-neutral-200 rounded px-2 py-1 outline-none font-medium text-neutral-600"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Finance">Finance</option>
                </select>
                <div className="flex space-x-1 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setShowSubmissionForm(false)}
                    className="text-[9px] font-bold uppercase py-1 px-2.5 text-neutral-500 hover:text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-neutral-900 text-white text-[9px] font-bold uppercase py-1 px-2.5 rounded-md hover:bg-neutral-800"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="w-full text-center bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase py-2.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Referral Mandate</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Kanban Board Pipeline Stages */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif-display text-xl font-bold text-neutral-900">
            Referrals Pipeline Kanban
          </h3>
          <p className="text-xs text-neutral-400 font-medium font-sans">
            Track strategic alignment lifecycles and promote candidate positions instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const stageReferrals = referrals.filter(r => r.stage === stage.key);

            return (
              <div 
                key={stage.key} 
                className="bg-[#faf9f6] border border-[#ecebe6]/80 rounded-xl p-4 flex flex-col h-[520px] overflow-hidden"
              >
                {/* Stage Title Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#ecebe6]/50 mb-4 shrink-0">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${stage.bg}`}>
                    {stage.label} ({stageReferrals.length})
                  </span>
                </div>

                {/* Sub Cards Loop Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageReferrals.length === 0 ? (
                    <div className="h-40 border border-dashed border-[#ecebe6] rounded-xl flex items-center justify-center p-4 text-center text-[11px] text-neutral-400 leading-normal font-light">
                      No candidates in this lifecycle node.
                    </div>
                  ) : (
                    stageReferrals.map((cand) => (
                      <div 
                        key={cand.id} 
                        className="bg-white border border-[#ecebe6] hover:border-neutral-400 rounded-xl p-4 elite-card-shadow transition flex flex-col justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-bold text-neutral-900 truncate max-w-[130px]">
                              {cand.name}
                            </h4>
                            <span className="text-[9px] text-neutral-400 font-mono font-bold bg-neutral-100 rounded px-1.5 py-0.5">
                              {cand.department.toUpperCase()}
                            </span>
                          </div>
                          
                          <h5 className="text-[11px] text-neutral-800 font-semibold leading-tight capitalize">
                            {cand.role}
                          </h5>

                          <p className="text-[10px] text-neutral-400 font-medium">
                            Source: {cand.source}
                          </p>
                        </div>

                        {/* Action buttons allowing moving stages dynamically */}
                        <div className="pt-2 border-t border-neutral-50 flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wide">
                            {cand.statusText}
                          </span>

                          <div className="flex items-center space-x-1 shrink-0">
                            {stage.key !== 'hired' && (
                              <button
                                onClick={() => {
                                  const nextStages: Record<string, 'screening' | 'interviewing' | 'hired'> = {
                                    referred: 'screening',
                                    screening: 'interviewing',
                                    interviewing: 'hired'
                                  };
                                  onUpdateStage(cand.id, nextStages[stage.key]);
                                }}
                                className="text-[9px] font-bold uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white px-2 py-1 rounded transition flex items-center shadow-xs"
                                title="Promote Stage"
                              >
                                <span>Advance</span>
                                <ChevronRight className="w-3 h-3 ml-0.5" />
                              </button>
                            )}

                            {/* Demote helper button */}
                            {stage.key !== 'referred' && (
                              <button
                                onClick={() => {
                                  const prevStages: Record<string, 'referred' | 'screening' | 'interviewing'> = {
                                    screening: 'referred',
                                    interviewing: 'screening',
                                    hired: 'interviewing'
                                  };
                                  onUpdateStage(cand.id, prevStages[stage.key]);
                                }}
                                className="text-[9px] font-bold uppercase text-neutral-400 hover:text-neutral-700 px-1 hover:underline"
                                title="Demote Stage"
                              >
                                Demote
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Celebrants label indicator */}
                        {cand.stage === 'hired' && (
                          <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded text-[9px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Referral Bonus Issued!</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral tiers information details */}
      <div className="bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow">
        <h4 className="font-serif-display text-sm font-bold text-neutral-900 mb-2 uppercase">Referral Tiers Breakdown</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
            <span className="font-bold text-amber-800 block">Gold Tier (10+ Hires)</span>
            <span className="text-neutral-500 text-[11px]">Receive $10,000 cash bonus + 2x multiplier points multipliers.</span>
          </div>
          <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
            <span className="font-bold text-zinc-700 block">Silver Tier (5-9 Hires)</span>
            <span className="text-neutral-500 text-[11px]">Receive $5,000 cash bonus + invitation to President strategy summits.</span>
          </div>
          <div className="bg-[#faf9f6] p-3 rounded-lg border border-neutral-200/60">
            <span className="font-bold text-neutral-600 block">Bronze Tier (1-4 Hires)</span>
            <span className="text-neutral-500 text-[11px]">Receive $2,500 cash bonus + corporate strategy merits.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
