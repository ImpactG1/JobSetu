export type ActiveTab = 'home' | 'profile' | 'ats-checker' | 'discovery' | 'inbox' | 'referrals' | 'analytics' | 'settings' | 'admin' | 'pricing' | 'privacy' | 'terms';

export interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  email: string;
}

// ─── Supabase-backed data types ────────────────────────────

export interface DirectJob {
  id: string;
  created_at: string;
  company: string;
  job_title: string;
  location: string;
  batch: string;
  salary: string;
  stipend: string;
  employment_type: string;
  skills: string;
  email: string;
  application_link: string;
  source_message: string;
  is_active: boolean;
}

export interface ReferralOpportunity {
  id: string;
  created_at: string;
  company: string;
  job_titles: string;
  location: string;
  eligibility: string;
  salary: string;
  stipend: string;
  referral_form_link: string;
  career_page_link: string;
  other_links: string;
  source_message: string;
  is_active: boolean;
}

export interface MetricCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  statusText?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'interview' | 'offer' | 'referral' | 'update';
  isHighPriority?: boolean;
}

export interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  imageUrl: string;
}

export interface FollowUpReminder {
  id: string;
  title: string;
  action: string;
  dueDate: string;
  isUrgent?: boolean;
}

export interface TrendingOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  logoLetter: string;
  logoBg: string;
  isFavorite: boolean;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  category: 'Engineering' | 'Design' | 'Product' | 'Marketing' | 'Finance';
  remote: boolean;
  companySize: '1-50' | '51-200' | '201-1k' | '1k+';
  aiMatchScore: number;
  description: string;
  logoLetter: string;
  logoBg: string;
  isFavorite: boolean;
}

export interface EmailThread {
  id: string;
  candidateName: string;
  subject: string;
  status: 'Replied' | 'Opened' | 'Sent' | 'Bounced';
  preview: string;
  time: string;
  avatar: string;
  email: string;
  tags?: string[];
  conversation: {
    senderName: string;
    senderEmail: string;
    avatarUrl?: string;
    time: string;
    body: string;
    isUser: boolean;
  }[];
}

export interface ReferralCandidate {
  id: string;
  name: string;
  role: string;
  department: string;
  stage: 'referred' | 'screening' | 'interviewing' | 'hired';
  source: 'Direct Referral' | 'Shared Link';
  statusText: string;
  isFinalRound?: boolean;
  dateClosed?: string;
}

export interface TopReferrer {
  rank: number;
  name: string;
  avatar: string;
  hires: number;
  points: number;
  level: string;
}

export interface Correspondence {
  id: string;
  candidateName: string;
  templateName: string;
  status: 'Opened' | 'Sent' | 'Draft';
  sentTime: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'Cold Outreach' | 'Follow-up' | 'Rejection' | 'Offer Letter' | 'Referral';
  variables: string[];
}

// ─── Gmail Integration Types ──────────────────────────────

export interface EmailActivity {
  id: string;
  user_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  company: string;
  job_title: string;
  gmail_message_id: string;
  status: 'sent' | 'delivered' | 'replied' | 'bounced';
  sent_at: string;
  created_at: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isRead: boolean;
  labels: string[];
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  base64Data: string;
}

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';

export interface ATSSkillCategories {
  technical: string[];
  soft: string[];
  tools: string[];
  domains: string[];
}

export interface ATSBreakdown {
  formatting: number;
  keywords: number;
  experience: number;
  education: number;
  impact: number;
}

export interface ATSAnalysis {
  skills: ATSSkillCategories;
  atsScore: number;
  atsBreakdown: ATSBreakdown;
  suggestions: string[];
  experience_level: ExperienceLevel;
  summary: string;
  analyzedAt?: string;
}

export type ATSCheckStatus = 'pass' | 'warning' | 'fail';

export interface ATSCheckItem {
  id: string;
  label: string;
  score: number;
  status: ATSCheckStatus;
  findings: string[];
  recommendations: string[];
}

export type ATSReportGroupId = 'content' | 'skills' | 'format' | 'sections' | 'style';

export interface ATSReportGroup {
  id: ATSReportGroupId;
  label: string;
  score: number;
  description: string;
  checks: ATSCheckItem[];
}

export type ATSGrade = 'Needs Work' | 'Fair' | 'Good' | 'Strong';

export interface ATSCheckerReport {
  overallScore: number;
  grade: ATSGrade;
  scannedAt: string;
  fileName: string;
  executiveSummary: string;
  topPriorities: string[];
  experience_level: ExperienceLevel;
  skills: ATSSkillCategories;
  missingHardSkills: string[];
  missingSoftSkills: string[];
  groups: ATSReportGroup[];
  jobDescriptionUsed: boolean;
}

export interface UserProfileData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  headline: string;
  avatar_url: string;
  resume_url: string;
  resume_filename: string;
  resume_skills: string;
  ats_score?: number;
  ats_analysis?: ATSAnalysis | Record<string, unknown>;
  updated_at: string;
  created_at: string;
}

// ─── Subscription & Payment Types ─────────────────────────

export type PlanTier = 'free' | 'basic' | 'premium';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'paused';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: PlanTier;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  razorpay_subscription_id: string;
  razorpay_customer_id: string;
  current_period_start: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyUsage {
  id: string;
  user_id: string;
  usage_date: string;
  direct_job_applies: number;
  referral_clicks: number;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  plan: PlanTier;
  billing_cycle: BillingCycle;
  status: 'captured' | 'failed' | 'refunded';
  paid_at: string;
  created_at: string;
}

export interface ReferralClick {
  id: string;
  user_id: string;
  referral_id: string;
  company: string;
  job_titles: string;
  referral_form_link: string;
  clicked_at: string;
}

export interface DirectJobApply {
  id: string;
  user_id: string;
  job_id: string;
  company: string;
  job_title: string;
  apply_method: 'email' | 'link';
  applied_at: string;
}

export interface PlanLimits {
  directJobsPerDay: number;
  referralsPerDay: number;
}

export interface UsageCheck {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}
