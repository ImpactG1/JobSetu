import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Check,
  X,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Loader2,
  CreditCard,
  Smartphone,
  BadgeCheck,
  ChevronDown,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { PLAN_PRICING } from '../lib/subscriptionService';
import { createSubscription, openRazorpayCheckout, verifyPayment } from '../lib/razorpayCheckout';
import { activateSubscription, recordPayment } from '../lib/subscriptionService';
import type { PlanTier, BillingCycle } from '../types';

export const PricingBoard: React.FC = () => {
  const { plan: currentPlan, refreshSubscription } = useSubscription();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [processing, setProcessing] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  const handleUpgrade = async (targetPlan: PlanTier) => {
    if (!user) return;
    if (targetPlan === 'free' || targetPlan === currentPlan) return;

    setProcessing(targetPlan);
    setResult(null);

    try {
      // Determine plan ID based on target plan and billing cycle
      const planIdKey = `RAZORPAY_PLAN_ID_${targetPlan.toUpperCase()}_${billingCycle.toUpperCase()}`;
      // For now, use the server to create subscriptions
      const subResult = await createSubscription(
        `${targetPlan}_${billingCycle}`,
        user.email || ''
      );

      if ('error' in subResult) {
        setResult({ success: false, message: subResult.error });
        setProcessing(null);
        return;
      }

      const pricing = PLAN_PRICING[targetPlan as 'basic' | 'premium'];
      const amount = billingCycle === 'monthly' ? pricing.monthly : pricing.yearly;

      // Open Razorpay checkout
      openRazorpayCheckout({
        subscriptionId: subResult.subscription_id,
        planName: targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1),
        amount,
        userEmail: user.email || '',
        userName: user.user_metadata?.full_name || '',
        onSuccess: async (response) => {
          try {
            // Verify on server
            const verifyResult = await verifyPayment({
              ...response,
              plan: targetPlan,
              billing_cycle: billingCycle,
              user_id: user.id,
            });

            if (verifyResult.success) {
              // Record payment and activate
              await recordPayment({
                user_id: user.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                amount,
                plan: targetPlan,
                billing_cycle: billingCycle,
              });

              await activateSubscription(
                user.id,
                targetPlan,
                billingCycle,
                response.razorpay_subscription_id
              );

              await refreshSubscription();
              setResult({ success: true, message: `🎉 Welcome to ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} plan! Your account has been upgraded.` });
            } else {
              setResult({ success: false, message: verifyResult.error || 'Payment verification failed' });
            }
          } catch (err: any) {
            setResult({ success: false, message: err.message || 'Error processing payment' });
          } finally {
            setProcessing(null);
          }
        },
        onFailure: (error) => {
          setResult({ success: false, message: error?.description || error?.message || 'Payment failed. Please try again.' });
          setProcessing(null);
        },
      });
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Something went wrong' });
      setProcessing(null);
    }
  };

  const plans = [
    {
      id: 'free' as PlanTier,
      name: 'Free',
      tagline: 'Get started exploring',
      icon: Zap,
      price: { monthly: '₹0', yearly: '₹0' },
      perMonth: { monthly: '₹0', yearly: '₹0' },
      features: [
        { text: '5 Direct Job applies/day', included: true },
        { text: 'View Referral Jobs', included: true, note: 'view only' },
        { text: 'Apply to Referrals', included: false },
        { text: 'ATS Resume Checker', included: true },
        { text: '1 Default Email Template', included: true },
        { text: 'All Email Templates', included: false },
        { text: 'AI Email Refinement', included: false },
        { text: 'Priority Support', included: false },
      ],
      gradient: 'from-neutral-100 to-neutral-50',
      border: 'border-neutral-200',
      badge: null,
      buttonStyle: 'bg-neutral-200 text-neutral-500 cursor-default',
      buttonText: currentPlan === 'free' ? 'Current Plan' : 'Free Plan',
    },
    {
      id: 'basic' as PlanTier,
      name: 'Basic',
      tagline: 'For serious job seekers',
      icon: Star,
      price: { monthly: PLAN_PRICING.basic.monthlyDisplay, yearly: PLAN_PRICING.basic.yearlyDisplay },
      perMonth: { monthly: PLAN_PRICING.basic.monthlyDisplay, yearly: PLAN_PRICING.basic.yearlyMonthly },
      saving: PLAN_PRICING.basic.yearlySaving,
      features: [
        { text: '30 Direct Job applies/day', included: true },
        { text: 'View Referral Jobs', included: true },
        { text: '7 Referral applies/day', included: true },
        { text: 'ATS Resume Checker', included: true },
        { text: 'All Email Templates', included: true },
        { text: 'AI Email Refinement', included: true },
        { text: 'Full Analytics Dashboard', included: true },
        { text: 'Priority Support', included: false },
      ],
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      badge: null,
      buttonStyle: 'bg-neutral-900 text-white hover:bg-neutral-800',
      buttonText: currentPlan === 'basic' ? 'Current Plan' : 'Upgrade to Basic',
    },
    {
      id: 'premium' as PlanTier,
      name: 'Premium',
      tagline: 'Unlimited power',
      icon: Crown,
      price: { monthly: PLAN_PRICING.premium.monthlyDisplay, yearly: PLAN_PRICING.premium.yearlyDisplay },
      perMonth: { monthly: PLAN_PRICING.premium.monthlyDisplay, yearly: PLAN_PRICING.premium.yearlyMonthly },
      saving: PLAN_PRICING.premium.yearlySaving,
      features: [
        { text: 'Unlimited Direct Job applies', included: true },
        { text: 'View Referral Jobs', included: true },
        { text: 'Unlimited Referral applies', included: true },
        { text: 'ATS Resume Checker', included: true },
        { text: 'All Email Templates', included: true },
        { text: 'AI Email Refinement', included: true },
        { text: 'Full Analytics + Export', included: true },
        { text: 'Priority Support', included: true },
      ],
      gradient: 'from-amber-50/80 via-orange-50/60 to-yellow-50/80',
      border: 'border-amber-300',
      badge: 'MOST POPULAR',
      buttonStyle: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-200/50',
      buttonText: currentPlan === 'premium' ? 'Current Plan' : 'Upgrade to Premium',
    },
  ];

  const faqs = [
    {
      id: 'payment',
      q: 'What payment methods are supported?',
      a: 'We support UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallets via Razorpay — India\'s most trusted payment gateway.',
    },
    {
      id: 'cancel',
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes, you can cancel your subscription at any time from your Settings page. Your plan benefits will continue until the end of your current billing period.',
    },
    {
      id: 'refund',
      q: 'What is the refund policy?',
      a: 'All subscription payments are final and non-refundable. Since you get immediate access to premium features upon payment, we encourage you to explore the Free plan first before upgrading. You can cancel anytime to prevent future charges.',
    },
    {
      id: 'upgrade',
      q: 'Can I upgrade or downgrade my plan?',
      a: 'Yes! You can upgrade anytime and the change takes effect immediately. To downgrade, cancel your current plan and switch when it expires.',
    },
    {
      id: 'reset',
      q: 'When do daily limits reset?',
      a: 'Daily usage limits reset at midnight IST (Indian Standard Time) every day.',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>Choose Your Plan</span>
        </div>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
          Supercharge Your Job Search
        </h1>
        <p className="text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed font-light">
          Get more applications, unlock referrals, and land your dream job faster with premium features.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex bg-neutral-100 rounded-xl p-1 border border-neutral-200/50">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Yearly
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
              SAVE 25%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrentPlan = currentPlan === p.id;
          const isDowngrade = (currentPlan === 'premium' && p.id !== 'premium') ||
                              (currentPlan === 'basic' && p.id === 'free');

          return (
            <div
              key={p.id}
              className={`relative bg-gradient-to-b ${p.gradient} border-2 ${
                p.id === 'premium' ? 'border-amber-300 shadow-xl shadow-amber-100/50' : p.border
              } rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                p.id === 'premium' ? 'md:-mt-2 md:mb-2 md:scale-[1.03]' : ''
              }`}
            >
              {/* Badge */}
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-amber-200/50 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    {p.badge}
                  </span>
                </div>
              )}

              {/* Current plan indicator */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-emerald-500 text-white text-[9px] font-bold tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <BadgeCheck className="w-3 h-3" />
                    ACTIVE
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    p.id === 'premium' ? 'bg-amber-100 text-amber-700' :
                    p.id === 'basic' ? 'bg-blue-100 text-blue-700' :
                    'bg-neutral-200 text-neutral-600'
                  }`}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-display text-lg font-bold text-neutral-900">{p.name}</h3>
                    <p className="text-[11px] text-neutral-500 font-medium">{p.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif-display text-3xl font-bold text-neutral-900">
                      {p.perMonth[billingCycle]}
                    </span>
                    {p.id !== 'free' && (
                      <span className="text-xs text-neutral-400 font-medium">/month</span>
                    )}
                  </div>
                  {p.id !== 'free' && billingCycle === 'yearly' && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-neutral-400 font-medium">
                        Billed {p.price.yearly}/year
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Save {p.saving}
                      </span>
                    </div>
                  )}
                  {p.id !== 'free' && billingCycle === 'monthly' && (
                    <p className="text-[11px] text-neutral-400 font-medium mt-1">
                      Billed monthly
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-2.5 mb-6">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {f.included ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-2.5 h-2.5 text-neutral-300" />
                      </div>
                    )}
                    <span className={`text-xs font-medium leading-relaxed ${
                      f.included ? 'text-neutral-700' : 'text-neutral-400'
                    }`}>
                      {f.text}
                      {(f as any).note && (
                        <span className="text-[10px] text-amber-600 font-bold ml-1">({(f as any).note})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={isCurrentPlan || p.id === 'free' || isDowngrade || !!processing}
                className={`w-full py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCurrentPlan ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : p.buttonStyle
                }`}
              >
                {processing === p.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isCurrentPlan ? (
                  <>
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Current Plan</span>
                  </>
                ) : isDowngrade ? (
                  <span>Cancel current plan first</span>
                ) : (
                  <>
                    <span>{p.buttonText}</span>
                    {p.id !== 'free' && <ArrowRight className="w-3.5 h-3.5" />}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Result feedback */}
      {result && (
        <div className={`mx-auto max-w-lg flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${
          result.success
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
            : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {result.success ? <BadgeCheck className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{result.message}</span>
        </div>
      )}

      {/* Payment Methods */}
      <div className="text-center space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
          Secure payments powered by
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Smartphone className="w-4 h-4" />
            <span className="text-[11px] font-bold">UPI</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <CreditCard className="w-4 h-4" />
            <span className="text-[11px] font-bold">Cards</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Shield className="w-4 h-4" />
            <span className="text-[11px] font-bold">Net Banking</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Shield className="w-4 h-4" />
            <span className="text-[11px] font-bold">Razorpay Secured</span>
          </div>
        </div>
      </div>

      {/* Plan Comparison Table */}
      <div className="bg-white border border-[#ecebe6] rounded-2xl overflow-hidden elite-card-shadow">
        <div className="p-6 border-b border-[#ecebe6]">
          <h3 className="font-serif-display text-lg font-bold text-neutral-900">
            Detailed Plan Comparison
          </h3>
          <p className="text-xs text-neutral-400 font-medium mt-1">
            Everything you need to know about each plan
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-[#ecebe6]">
                <th className="text-left p-4 font-bold text-neutral-500 uppercase tracking-wider">Feature</th>
                <th className="text-center p-4 font-bold text-neutral-500 uppercase tracking-wider">Free</th>
                <th className="text-center p-4 font-bold text-blue-700 uppercase tracking-wider">Basic</th>
                <th className="text-center p-4 font-bold text-amber-700 uppercase tracking-wider">Premium</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Direct Job Applications', free: '5/day', basic: '30/day', premium: 'Unlimited' },
                { feature: 'Referral Job Applications', free: '—', basic: '7/day', premium: 'Unlimited' },
                { feature: 'View Referral Listings', free: '✓ (view only)', basic: '✓', premium: '✓' },
                { feature: 'ATS Resume Checker', free: '✓', basic: '✓', premium: '✓' },
                { feature: 'Email Templates', free: '1 default', basic: 'All templates', premium: 'All templates' },
                { feature: 'AI Email Refinement', free: '—', basic: '✓', premium: '✓' },
                { feature: 'Analytics Dashboard', free: 'Basic', basic: 'Full', premium: 'Full + Export' },
                { feature: 'Gmail Integration', free: '✓', basic: '✓', premium: '✓' },
                { feature: 'Priority Support', free: '—', basic: '—', premium: '✓' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-medium text-neutral-700">{row.feature}</td>
                  <td className="p-4 text-center text-neutral-500">{row.free}</td>
                  <td className="p-4 text-center font-medium text-neutral-700">{row.basic}</td>
                  <td className="p-4 text-center font-bold text-neutral-900">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h3 className="font-serif-display text-lg font-bold text-neutral-900 text-center">
          Frequently Asked Questions
        </h3>
        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white border border-[#ecebe6] rounded-xl overflow-hidden elite-card-shadow">
              <button
                onClick={() => setFaqOpen(faqOpen === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-xs font-bold text-neutral-800">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${
                  faqOpen === faq.id ? 'rotate-180' : ''
                }`} />
              </button>
              {faqOpen === faq.id && (
                <div className="px-4 pb-4 -mt-1 animate-in slide-in-from-top-1 duration-150">
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
          <Clock className="w-3 h-3" />
          <span>Daily limits reset at midnight IST • All prices include GST</span>
        </div>
      </div>
    </div>
  );
};
