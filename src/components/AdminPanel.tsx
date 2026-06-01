import React, { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Trash2, Edit3, Check, X, Briefcase, Users, AlertCircle, CheckCircle2, RefreshCw, FileSpreadsheet } from 'lucide-react';
import type { DirectJob, ReferralOpportunity } from '../types';
import { fetchAllDirectJobs, fetchAllReferralOpportunities, insertDirectJob, updateDirectJob, deleteDirectJob, insertReferralOpportunity, updateReferralOpportunity, deleteReferralOpportunity, bulkInsertDirectJobs, bulkInsertReferralOpportunities } from '../lib/supabaseData';

type AdminView = 'jobs' | 'referrals';

export const AdminPanel: React.FC = () => {
  const [view, setView] = useState<AdminView>('jobs');
  const [jobs, setJobs] = useState<DirectJob[]>([]);
  const [referrals, setReferrals] = useState<ReferralOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showAddRef, setShowAddRef] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    const [j, r] = await Promise.all([fetchAllDirectJobs(), fetchAllReferralOpportunities()]);
    setJobs(j); setReferrals(r); setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const flash = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000);
  };

  // ─── Add Job Form ─────────────────────────────────────────
  const [jf, setJf] = useState({ company: '', job_title: '', location: '', batch: '', salary: '', stipend: '', employment_type: '', skills: '', email: '', application_link: '' });

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jf.company || !jf.job_title) { flash('Company and Job Title required', 'error'); return; }
    const { error } = await insertDirectJob({ ...jf, source_message: '' });
    if (error) { flash(error, 'error'); return; }
    flash('Job added successfully', 'success'); setShowAddJob(false);
    setJf({ company: '', job_title: '', location: '', batch: '', salary: '', stipend: '', employment_type: '', skills: '', email: '', application_link: '' });
    loadData();
  };

  // ─── Add Referral Form ────────────────────────────────────
  const [rf, setRf] = useState({ company: '', job_titles: '', location: '', eligibility: '', salary: '', stipend: '', referral_form_link: '', career_page_link: '', other_links: '' });

  const handleAddRef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rf.company || !rf.job_titles) { flash('Company and Job Titles required', 'error'); return; }
    const { error } = await insertReferralOpportunity({ ...rf, source_message: '' });
    if (error) { flash(error, 'error'); return; }
    flash('Referral added successfully', 'success'); setShowAddRef(false);
    setRf({ company: '', job_titles: '', location: '', eligibility: '', salary: '', stipend: '', referral_form_link: '', career_page_link: '', other_links: '' });
    loadData();
  };

  // ─── CSV Upload ───────────────────────────────────────────
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) { flash('CSV file is empty or has no data rows', 'error'); return; }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\r/g, ''));

    if (view === 'jobs') {
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVLine(lines[i]);
        const row: any = {};
        headers.forEach((h, idx) => {
          const key = mapJobHeader(h);
          if (key) row[key] = (vals[idx] || '').trim();
        });
        if (row.company && row.job_title) rows.push(row);
      }
      if (!rows.length) { flash('No valid rows found. Need "company" and "job_title" columns.', 'error'); return; }
      const { error, count } = await bulkInsertDirectJobs(rows);
      if (error) { flash(error, 'error'); return; }
      flash(`Imported ${count} jobs successfully`, 'success'); loadData();
    } else {
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVLine(lines[i]);
        const row: any = {};
        headers.forEach((h, idx) => {
          const key = mapRefHeader(h);
          if (key) row[key] = (vals[idx] || '').trim();
        });
        if (row.company && row.job_titles) rows.push(row);
      }
      if (!rows.length) { flash('No valid rows found. Need "company" and "job_titles" columns.', 'error'); return; }
      const { error, count } = await bulkInsertReferralOpportunities(rows);
      if (error) { flash(error, 'error'); return; }
      flash(`Imported ${count} referrals successfully`, 'success'); loadData();
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDeactivateJob = async (id: string) => {
    const { error } = await deleteDirectJob(id);
    if (error) flash(error, 'error'); else { flash('Job deactivated', 'success'); loadData(); }
  };

  const handleDeactivateRef = async (id: string) => {
    const { error } = await deleteReferralOpportunity(id);
    if (error) flash(error, 'error'); else { flash('Referral deactivated', 'success'); loadData(); }
  };

  const handleReactivateJob = async (id: string) => {
    const { error } = await updateDirectJob(id, { is_active: true });
    if (error) flash(error, 'error'); else { flash('Job reactivated', 'success'); loadData(); }
  };

  const handleReactivateRef = async (id: string) => {
    const { error } = await updateReferralOpportunity(id, { is_active: true });
    if (error) flash(error, 'error'); else { flash('Referral reactivated', 'success'); loadData(); }
  };

  const activeJobs = jobs.filter(j => j.is_active);
  const inactiveJobs = jobs.filter(j => !j.is_active);
  const activeRefs = referrals.filter(r => r.is_active);
  const inactiveRefs = referrals.filter(r => !r.is_active);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: activeJobs.length, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Inactive Jobs', value: inactiveJobs.length, color: 'text-neutral-500 bg-neutral-100' },
          { label: 'Active Referrals', value: activeRefs.length, color: 'text-blue-700 bg-blue-50' },
          { label: 'Inactive Referrals', value: inactiveRefs.length, color: 'text-neutral-500 bg-neutral-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#ecebe6] rounded-xl p-4 elite-card-shadow">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{s.label}</p>
            <h3 className="text-2xl font-serif-display font-bold text-neutral-900 mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`flex items-center space-x-2 p-3 rounded-xl text-xs font-medium border ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* View Toggle + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex bg-neutral-100 rounded-xl p-1 border border-neutral-200/50">
          {(['jobs', 'referrals'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${view === v ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60' : 'text-neutral-400 hover:text-neutral-600'}`}>
              {v === 'jobs' ? 'Direct Jobs' : 'Referral Opportunities'}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => { if (fileRef.current) fileRef.current.click(); }}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
            <Upload className="w-3.5 h-3.5" /><span>Upload CSV</span>
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          <button onClick={() => view === 'jobs' ? setShowAddJob(true) : setShowAddRef(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
            <Plus className="w-3.5 h-3.5" /><span>Add {view === 'jobs' ? 'Job' : 'Referral'}</span>
          </button>
          <button onClick={loadData} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="bg-white border border-[#ecebe6] rounded-xl p-6 elite-card-shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="font-serif-display text-base font-bold text-neutral-900">Add New Direct Job</h3>
            <button onClick={() => setShowAddJob(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(jf).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{k.replace(/_/g, ' ')}</label>
                <input value={v} onChange={e => setJf(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2 text-xs outline-none focus:border-neutral-900" placeholder={k.replace(/_/g, ' ')} />
              </div>
            ))}
            <div className="md:col-span-2 flex justify-end pt-2">
              <button type="submit" className="px-5 py-2 bg-neutral-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-neutral-800 transition-colors flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5" /><span>Save Job</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Referral Modal */}
      {showAddRef && (
        <div className="bg-white border border-[#ecebe6] rounded-xl p-6 elite-card-shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="font-serif-display text-base font-bold text-neutral-900">Add New Referral Opportunity</h3>
            <button onClick={() => setShowAddRef(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleAddRef} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(rf).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{k.replace(/_/g, ' ')}</label>
                <input value={v} onChange={e => setRf(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full bg-[#faf9f6] border border-neutral-200 rounded-lg p-2 text-xs outline-none focus:border-neutral-900" placeholder={k.replace(/_/g, ' ')} />
              </div>
            ))}
            <div className="md:col-span-2 flex justify-end pt-2">
              <button type="submit" className="px-5 py-2 bg-neutral-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-neutral-800 transition-colors flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5" /><span>Save Referral</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-16 text-xs text-neutral-400">Loading data from Supabase...</div>
      ) : view === 'jobs' ? (
        <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-neutral-500" />
            <h3 className="font-serif-display text-base font-bold text-neutral-900">Direct Jobs ({jobs.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                  {['Company', 'Job Title', 'Location', 'Salary/Stipend', 'Email', 'Link', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {jobs.map(job => (
                  <tr key={job.id} className={`hover:bg-neutral-50/50 transition-colors ${!job.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-neutral-900 max-w-[140px] truncate">{job.company}</td>
                    <td className="px-4 py-3 text-neutral-700 max-w-[180px] truncate">{job.job_title}</td>
                    <td className="px-4 py-3 text-neutral-500">{job.location || '—'}</td>
                    <td className="px-4 py-3 text-neutral-600 font-mono">{job.salary || job.stipend || '—'}</td>
                    <td className="px-4 py-3">{job.email ? <a href={`mailto:${job.email}`} className="text-blue-600 hover:underline truncate block max-w-[140px]">{job.email}</a> : '—'}</td>
                    <td className="px-4 py-3">{job.application_link ? <a href={job.application_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apply ↗</a> : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${job.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {job.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {job.is_active ? (
                        <button onClick={() => handleDeactivateJob(job.id)} className="text-neutral-400 hover:text-rose-600 transition-colors" title="Deactivate"><Trash2 className="w-3.5 h-3.5" /></button>
                      ) : (
                        <button onClick={() => handleReactivateJob(job.id)} className="text-neutral-400 hover:text-emerald-600 transition-colors" title="Reactivate"><RefreshCw className="w-3.5 h-3.5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-neutral-400">No jobs found. Add some or upload a CSV.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#ecebe6] rounded-xl elite-card-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center space-x-2">
            <Users className="w-4 h-4 text-neutral-500" />
            <h3 className="font-serif-display text-base font-bold text-neutral-900">Referral Opportunities ({referrals.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                  {['Company', 'Roles', 'Location', 'Salary', 'Eligibility', 'Referral Link', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {referrals.map(ref => (
                  <tr key={ref.id} className={`hover:bg-neutral-50/50 transition-colors ${!ref.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-neutral-900 max-w-[140px] truncate">{ref.company}</td>
                    <td className="px-4 py-3 text-neutral-700 max-w-[200px] truncate">{ref.job_titles}</td>
                    <td className="px-4 py-3 text-neutral-500">{ref.location || '—'}</td>
                    <td className="px-4 py-3 text-neutral-600 font-mono">{ref.salary || ref.stipend || '—'}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-[120px] truncate">{ref.eligibility || '—'}</td>
                    <td className="px-4 py-3">{ref.referral_form_link ? <a href={ref.referral_form_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Form ↗</a> : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ref.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {ref.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ref.is_active ? (
                        <button onClick={() => handleDeactivateRef(ref.id)} className="text-neutral-400 hover:text-rose-600 transition-colors" title="Deactivate"><Trash2 className="w-3.5 h-3.5" /></button>
                      ) : (
                        <button onClick={() => handleReactivateRef(ref.id)} className="text-neutral-400 hover:text-emerald-600 transition-colors" title="Reactivate"><RefreshCw className="w-3.5 h-3.5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
                {referrals.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-neutral-400">No referrals found. Add some or upload a CSV.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CSV Helpers ──────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.replace(/\r/g, '')); current = ''; }
    else { current += ch; }
  }
  result.push(current.replace(/\r/g, ''));
  return result;
}

function mapJobHeader(h: string): string | null {
  const map: Record<string, string> = {
    company: 'company', job_title: 'job_title', location: 'location',
    batch: 'batch', salary: 'salary', stipend: 'stipend',
    employment_type: 'employment_type', skills: 'skills',
    email: 'email', application_link: 'application_link', source_message: 'source_message',
  };
  return map[h] || null;
}

function mapRefHeader(h: string): string | null {
  const map: Record<string, string> = {
    company: 'company', job_titles: 'job_titles', location: 'location',
    eligibility: 'eligibility', salary: 'salary', stipend: 'stipend',
    referral_form_link: 'referral_form_link', career_page_link: 'career_page_link',
    other_links: 'other_links', source_message: 'source_message',
  };
  return map[h] || null;
}
