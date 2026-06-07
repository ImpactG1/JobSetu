/**
 * SubscriptionContext — provides plan, usage, and gating throughout the app
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { PlanTier, UserSubscription, DailyUsage, UsageCheck } from '../types';
import {
  fetchUserSubscription,
  fetchTodayUsage,
  canApplyDirectJob,
  canClickReferral,
  trackDirectJobApply,
  trackReferralClick,
  PLAN_LIMITS,
} from '../lib/subscriptionService';

interface SubscriptionContextType {
  plan: PlanTier;
  subscription: UserSubscription | null;
  dailyUsage: DailyUsage | null;
  loading: boolean;

  // Gating checks
  checkDirectJob: () => UsageCheck;
  checkReferral: () => UsageCheck;

  // Track + increment (returns whether the action was allowed)
  applyDirectJob: (jobId: string, company: string, jobTitle: string, method: 'email' | 'link') => Promise<{ allowed: boolean; usage: UsageCheck }>;
  clickReferral: (referralId: string, company: string, jobTitles: string, formLink: string) => Promise<{ allowed: boolean; usage: UsageCheck }>;

  // Refresh after payment
  refreshSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({
  userId,
  children,
}) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const plan: PlanTier = subscription?.plan || 'free';

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [sub, usage] = await Promise.all([
        fetchUserSubscription(userId),
        fetchTodayUsage(userId),
      ]);
      setSubscription(sub);
      setDailyUsage(usage);
    } catch (err) {
      console.error('[SubscriptionContext] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshSubscription = useCallback(async () => {
    if (!userId) return;
    const sub = await fetchUserSubscription(userId);
    setSubscription(sub);
  }, [userId]);

  const refreshUsage = useCallback(async () => {
    if (!userId) return;
    const usage = await fetchTodayUsage(userId);
    setDailyUsage(usage);
  }, [userId]);

  const checkDirectJob = useCallback((): UsageCheck => {
    return canApplyDirectJob(plan, dailyUsage);
  }, [plan, dailyUsage]);

  const checkReferral = useCallback((): UsageCheck => {
    return canClickReferral(plan, dailyUsage);
  }, [plan, dailyUsage]);

  const applyDirectJob = useCallback(
    async (
      jobId: string,
      company: string,
      jobTitle: string,
      method: 'email' | 'link'
    ): Promise<{ allowed: boolean; usage: UsageCheck }> => {
      const check = canApplyDirectJob(plan, dailyUsage);
      if (!check.allowed) {
        return { allowed: false, usage: check };
      }

      // Track the apply
      await trackDirectJobApply(userId, jobId, company, jobTitle, method);

      // Optimistic update
      setDailyUsage(prev =>
        prev
          ? { ...prev, direct_job_applies: prev.direct_job_applies + 1 }
          : prev
      );

      const updatedCheck = canApplyDirectJob(plan, {
        ...dailyUsage!,
        direct_job_applies: (dailyUsage?.direct_job_applies || 0) + 1,
      });

      return { allowed: true, usage: updatedCheck };
    },
    [userId, plan, dailyUsage]
  );

  const clickReferral = useCallback(
    async (
      referralId: string,
      company: string,
      jobTitles: string,
      formLink: string
    ): Promise<{ allowed: boolean; usage: UsageCheck }> => {
      const check = canClickReferral(plan, dailyUsage);
      if (!check.allowed) {
        return { allowed: false, usage: check };
      }

      // Track the click
      await trackReferralClick(userId, referralId, company, jobTitles, formLink);

      // Optimistic update
      setDailyUsage(prev =>
        prev
          ? { ...prev, referral_clicks: prev.referral_clicks + 1 }
          : prev
      );

      const updatedCheck = canClickReferral(plan, {
        ...dailyUsage!,
        referral_clicks: (dailyUsage?.referral_clicks || 0) + 1,
      });

      return { allowed: true, usage: updatedCheck };
    },
    [userId, plan, dailyUsage]
  );

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        subscription,
        dailyUsage,
        loading,
        checkDirectJob,
        checkReferral,
        applyDirectJob,
        clickReferral,
        refreshSubscription,
        refreshUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
