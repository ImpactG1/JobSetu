/**
 * Subscription & Usage Tracking Service
 * Handles plan limits, daily usage, and apply/click tracking
 */
import { supabase } from './supabaseClient';
import type {
  PlanTier,
  UserSubscription,
  DailyUsage,
  PlanLimits,
  UsageCheck,
} from '../types';

// ─── Plan Limits Configuration ─────────────────────────────

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free:    { directJobsPerDay: 5,        referralsPerDay: 0 },
  basic:   { directJobsPerDay: 30,       referralsPerDay: 7 },
  premium: { directJobsPerDay: Infinity, referralsPerDay: Infinity },
};

// ─── Plan Pricing ──────────────────────────────────────────

export const PLAN_PRICING = {
  basic: {
    monthly: 14900,    // ₹149 in paise
    yearly: 134900,    // ₹1,349/year  (~₹112/mo, ~25% off)
    monthlyDisplay: '₹149',
    yearlyDisplay: '₹1,349',
    yearlyMonthly: '₹112',
    yearlySaving: '₹439',
  },
  premium: {
    monthly: 29900,    // ₹299 in paise
    yearly: 269900,    // ₹2,699/year  (~₹225/mo, ~25% off)
    monthlyDisplay: '₹299',
    yearlyDisplay: '₹2,699',
    yearlyMonthly: '₹225',
    yearlySaving: '₹889',
  },
};

// ─── Fetch user subscription ───────────────────────────────

export async function fetchUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no row exists, user is on free plan
    if (error.code === 'PGRST116') return null;
    console.error('[subscriptionService] fetchUserSubscription error:', error.message);
    return null;
  }
  return data as UserSubscription;
}

// ─── Get or create today's usage row ───────────────────────

export async function fetchTodayUsage(userId: string): Promise<DailyUsage | null> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Try to get existing
  const { data, error } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  if (error && error.code === 'PGRST116') {
    // No row for today, create one
    const { data: newRow, error: insertError } = await supabase
      .from('daily_usage')
      .insert([{ user_id: userId, usage_date: today, direct_job_applies: 0, referral_clicks: 0 }])
      .select()
      .single();

    if (insertError) {
      console.error('[subscriptionService] Error creating daily_usage:', insertError.message);
      return null;
    }
    return newRow as DailyUsage;
  }

  if (error) {
    console.error('[subscriptionService] fetchTodayUsage error:', error.message);
    return null;
  }

  return data as DailyUsage;
}

// ─── Check if user can apply to a direct job ───────────────

export function canApplyDirectJob(plan: PlanTier, usage: DailyUsage | null): UsageCheck {
  const limits = PLAN_LIMITS[plan];
  const used = usage?.direct_job_applies || 0;
  const limit = limits.directJobsPerDay;

  if (limit === Infinity) {
    return { allowed: true, used, limit, remaining: Infinity };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

// ─── Check if user can click a referral ────────────────────

export function canClickReferral(plan: PlanTier, usage: DailyUsage | null): UsageCheck {
  const limits = PLAN_LIMITS[plan];
  const used = usage?.referral_clicks || 0;
  const limit = limits.referralsPerDay;

  if (limit === Infinity) {
    return { allowed: true, used, limit, remaining: Infinity };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

// ─── Track a direct job apply + increment counter ──────────

export async function trackDirectJobApply(
  userId: string,
  jobId: string,
  company: string,
  jobTitle: string,
  method: 'email' | 'link'
): Promise<{ error: string | null }> {
  const today = new Date().toISOString().split('T')[0];

  // 1. Insert granular tracking record
  const { error: trackError } = await supabase
    .from('direct_job_applies')
    .insert([{ user_id: userId, job_id: jobId, company, job_title: jobTitle, apply_method: method }]);

  if (trackError) {
    console.error('[subscriptionService] trackDirectJobApply error:', trackError.message);
    return { error: trackError.message };
  }

  // 2. Upsert daily usage counter
  const { error: usageError } = await supabase.rpc('increment_direct_job_applies', {
    p_user_id: userId,
    p_date: today,
  });

  // Fallback if RPC doesn't exist: manual upsert
  if (usageError) {
    console.warn('[subscriptionService] RPC fallback for increment:', usageError.message);
    // Try upsert manually
    const existing = await fetchTodayUsage(userId);
    if (existing) {
      await supabase
        .from('daily_usage')
        .update({ direct_job_applies: existing.direct_job_applies + 1 })
        .eq('id', existing.id);
    }
  }

  return { error: null };
}

// ─── Track a referral click + increment counter ────────────

export async function trackReferralClick(
  userId: string,
  referralId: string,
  company: string,
  jobTitles: string,
  formLink: string
): Promise<{ error: string | null }> {
  const today = new Date().toISOString().split('T')[0];

  // 1. Insert granular tracking record
  const { error: trackError } = await supabase
    .from('referral_clicks')
    .insert([{
      user_id: userId,
      referral_id: referralId,
      company,
      job_titles: jobTitles,
      referral_form_link: formLink,
    }]);

  if (trackError) {
    console.error('[subscriptionService] trackReferralClick error:', trackError.message);
    return { error: trackError.message };
  }

  // 2. Upsert daily usage counter
  const { error: usageError } = await supabase.rpc('increment_referral_clicks', {
    p_user_id: userId,
    p_date: today,
  });

  if (usageError) {
    console.warn('[subscriptionService] RPC fallback for referral increment:', usageError.message);
    const existing = await fetchTodayUsage(userId);
    if (existing) {
      await supabase
        .from('daily_usage')
        .update({ referral_clicks: existing.referral_clicks + 1 })
        .eq('id', existing.id);
    }
  }

  return { error: null };
}

// ─── Record a payment ──────────────────────────────────────

export async function recordPayment(data: {
  user_id: string;
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
  amount: number;
  plan: PlanTier;
  billing_cycle: 'monthly' | 'yearly';
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payment_history').insert([{
    ...data,
    currency: 'INR',
    status: 'captured',
    paid_at: new Date().toISOString(),
  }]);
  if (error) return { error: error.message };
  return { error: null };
}

// ─── Activate a subscription ───────────────────────────────

export async function activateSubscription(
  userId: string,
  plan: PlanTier,
  billingCycle: 'monthly' | 'yearly',
  razorpaySubscriptionId: string
): Promise<{ error: string | null }> {
  const now = new Date();
  const periodEnd = new Date(now);
  if (billingCycle === 'monthly') {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert([{
      user_id: userId,
      plan,
      billing_cycle: billingCycle,
      status: 'active',
      razorpay_subscription_id: razorpaySubscriptionId,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: now.toISOString(),
    }], { onConflict: 'user_id' });

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Get time until daily reset (midnight IST) ─────────────

export function getTimeUntilReset(): { hours: number; minutes: number } {
  const now = new Date();
  // IST = UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const istMidnight = new Date(istNow);
  istMidnight.setHours(24, 0, 0, 0);

  const diff = istMidnight.getTime() - istNow.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}
