export type ActiveTab = 'home' | 'discovery' | 'inbox' | 'referrals' | 'analytics' | 'settings' | 'admin';

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
