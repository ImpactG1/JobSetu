import { supabase } from './supabaseClient';
import type { DirectJob, ReferralOpportunity } from '../types';

// ─── Direct Jobs ───────────────────────────────────────────

export async function fetchDirectJobs(): Promise<DirectJob[]> {
  const { data, error } = await supabase
    .from('direct_jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[supabaseData] fetchDirectJobs error:', error.message);
    return [];
  }
  return (data as DirectJob[]) || [];
}

export async function fetchAllDirectJobs(): Promise<DirectJob[]> {
  // Admin: fetch all including inactive
  const { data, error } = await supabase
    .from('direct_jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[supabaseData] fetchAllDirectJobs error:', error.message);
    return [];
  }
  return (data as DirectJob[]) || [];
}

export async function insertDirectJob(job: Omit<DirectJob, 'id' | 'created_at' | 'is_active'>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('direct_jobs').insert([job]);
  if (error) return { error: error.message };
  return { error: null };
}

export async function updateDirectJob(id: string, fields: Partial<DirectJob>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('direct_jobs').update(fields).eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteDirectJob(id: string): Promise<{ error: string | null }> {
  // Soft delete
  const { error } = await supabase.from('direct_jobs').update({ is_active: false }).eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function bulkInsertDirectJobs(jobs: Omit<DirectJob, 'id' | 'created_at' | 'is_active'>[]): Promise<{ error: string | null; count: number }> {
  const { error, data } = await supabase.from('direct_jobs').insert(jobs).select();
  if (error) return { error: error.message, count: 0 };
  return { error: null, count: data?.length || 0 };
}

// ─── Referral Opportunities ────────────────────────────────

export async function fetchReferralOpportunities(): Promise<ReferralOpportunity[]> {
  const { data, error } = await supabase
    .from('referral_opportunities')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[supabaseData] fetchReferralOpportunities error:', error.message);
    return [];
  }
  return (data as ReferralOpportunity[]) || [];
}

export async function fetchAllReferralOpportunities(): Promise<ReferralOpportunity[]> {
  const { data, error } = await supabase
    .from('referral_opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[supabaseData] fetchAllReferralOpportunities error:', error.message);
    return [];
  }
  return (data as ReferralOpportunity[]) || [];
}

export async function insertReferralOpportunity(ref: Omit<ReferralOpportunity, 'id' | 'created_at' | 'is_active'>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('referral_opportunities').insert([ref]);
  if (error) return { error: error.message };
  return { error: null };
}

export async function updateReferralOpportunity(id: string, fields: Partial<ReferralOpportunity>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('referral_opportunities').update(fields).eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteReferralOpportunity(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('referral_opportunities').update({ is_active: false }).eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function bulkInsertReferralOpportunities(refs: Omit<ReferralOpportunity, 'id' | 'created_at' | 'is_active'>[]): Promise<{ error: string | null; count: number }> {
  const { error, data } = await supabase.from('referral_opportunities').insert(refs).select();
  if (error) return { error: error.message, count: 0 };
  return { error: null, count: data?.length || 0 };
}
