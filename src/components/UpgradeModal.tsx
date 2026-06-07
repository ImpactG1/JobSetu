import React from 'react';
import {
  X,
  Lock,
  Crown,
  ArrowRight,
  Clock,
  Zap,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { getTimeUntilReset, PLAN_LIMITS } from '../lib/subscriptionService';
import type { PlanTier } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePricing: () => void;
  limitType: 'direct' | 'referral';
  used?: number;
  limit?: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onNavigatePricing,
  limitType,
  used = 0,
  limit = 0,
}) => {
  const { plan } = useSubscription();
  const resetTime = getTimeUntilReset();

  if (!isOpen) return null;

  const isReferralBlocked = limitType === 'referral' && plan === 'free';
  const nextPlan: PlanTier = plan === 'free' ? 'basic' : 'premium';
  const nextPlanLimits = PLAN_LIMITS[nextPlan];
  const nextPlanName = nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1);
  const nextPlanPrice = nextPlan === 'basic' ? '₹149' : '₹299';

  const limitLabel = limitType === 'direct' ? 'Direct Job applies' : 'Referral applies';
  const nextLimit = limitType === 'direct'
    ? nextPlanLimits.directJobsPerDay
    : nextPlanLimits.referralsPerDay;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full overflow-hidden elite-card-shadow animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 pb-5 border-b border-amber-100/50 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/60 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              {isReferralBlocked ? (
                <Lock className="w-5 h-5 text-amber-700" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              )}
            </div>
            <div>
              <h3 className="font-serif-display text-base font-bold text-neutral-900">
                {isReferralBlocked ? 'Referrals Locked' : 'Daily Limit Reached'}
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </p>
            </div>
          </div>

          {isReferralBlocked ? (
            <p className="text-xs text-neutral-600 leading-relaxed">
              Referral job applications are not available on the Free plan. Upgrade to <strong>Basic</strong> or <strong>Premium</strong> to start applying through referrals.
            </p>
          ) : (
            <p className="text-xs text-neutral-600 leading-relaxed">
              You've used all <strong>{used} of {limit} {limitLabel}</strong> available today on your {plan.charAt(0).toUpperCase() + plan.slice(1)} plan.
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Time until reset */}
          {!isReferralBlocked && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 p-3 rounded-xl">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-800">
                  Limits reset in {resetTime.hours}h {resetTime.minutes}m
                </p>
                <p className="text-[10px] text-blue-600">
                  Come back tomorrow for more applies, or upgrade now.
                </p>
              </div>
            </div>
          )}

          {/* Upgrade card */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              {nextPlan === 'premium' ? (
                <Crown className="w-4 h-4 text-amber-400" />
              ) : (
                <Star className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                Upgrade to {nextPlanName}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-serif-display font-bold">{nextPlanPrice}</span>
              <span className="text-xs text-neutral-400">/month</span>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>
                  {nextLimit === Infinity ? 'Unlimited' : nextLimit} {limitLabel}
                  <span className="text-neutral-500 ml-1">(vs {limit} now)</span>
                </span>
              </div>
              {limitType === 'direct' && plan === 'free' && (
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>
                    {nextPlanLimits.referralsPerDay === Infinity ? 'Unlimited' : nextPlanLimits.referralsPerDay} Referral applies/day
                    <span className="text-neutral-500 ml-1">(vs 0 now)</span>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>All email templates + AI refinement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex flex-col gap-2">
          <button
            onClick={() => { onClose(); onNavigatePricing(); }}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-amber-200/30 hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
          >
            <span>View Plans & Upgrade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-neutral-400 hover:text-neutral-600 uppercase transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
