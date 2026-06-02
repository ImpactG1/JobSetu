/**
 * Email Activity Tracker — Supabase CRUD for per-user email tracking
 */
import { supabase } from './supabaseClient';
import type { EmailActivity } from '../types';

// ─── Track a sent email ────────────────────────────────────

export async function trackEmailSent(data: {
  user_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  company: string;
  job_title: string;
  gmail_message_id: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('email_activity').insert([{
    ...data,
    status: 'sent',
    sent_at: new Date().toISOString(),
  }]);
  if (error) return { error: error.message };
  return { error: null };
}

// ─── Fetch user's email activity ───────────────────────────

export async function fetchUserEmailActivity(
  userId: string
): Promise<EmailActivity[]> {
  const { data, error } = await supabase
    .from('email_activity')
    .select('*')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('[emailTracker] Fetch error:', error.message);
    return [];
  }
  return (data as EmailActivity[]) || [];
}

// ─── Fetch user's email stats ──────────────────────────────

export async function fetchUserEmailStats(userId: string): Promise<{
  totalSent: number;
  uniqueCompanies: number;
  uniqueJobs: number;
  thisWeek: number;
  thisMonth: number;
  byCompany: { company: string; count: number }[];
  byDay: { date: string; count: number }[];
}> {
  const activities = await fetchUserEmailActivity(userId);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const companies = new Set<string>();
  const jobs = new Set<string>();
  let thisWeek = 0;
  let thisMonth = 0;
  const companyMap = new Map<string, number>();
  const dayMap = new Map<string, number>();

  activities.forEach(a => {
    if (a.company) companies.add(a.company);
    if (a.job_title) jobs.add(a.job_title);
    
    const sentDate = new Date(a.sent_at);
    if (sentDate >= weekAgo) thisWeek++;
    if (sentDate >= monthAgo) thisMonth++;

    if (a.company) {
      companyMap.set(a.company, (companyMap.get(a.company) || 0) + 1);
    }

    const dayKey = sentDate.toISOString().split('T')[0];
    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
  });

  const byCompany = Array.from(companyMap.entries())
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Last 14 days with zero-fills
  const byDay: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    byDay.push({ date: key, count: dayMap.get(key) || 0 });
  }

  return {
    totalSent: activities.length,
    uniqueCompanies: companies.size,
    uniqueJobs: jobs.size,
    thisWeek,
    thisMonth,
    byCompany,
    byDay,
  };
}
