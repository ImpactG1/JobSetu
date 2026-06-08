import React, { useState } from 'react';
import { Shield, ArrowLeft, Mail, Calendar, ExternalLink, ChevronRight } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: '1. Introduction' },
    { id: 'data-collection', label: '2. Information We Collect' },
    { id: 'google-data', label: '3. Google API & Gmail Scope' },
    { id: 'ai-processing', label: '4. AI Drafting & Processing' },
    { id: 'data-sharing', label: '5. Third-Party Integrations' },
    { id: 'data-security', label: '6. Data Security & Retention' },
    { id: 'user-rights', label: '7. Your Privacy Rights' },
    { id: 'updates', label: '8. Policy Updates' },
    { id: 'contact', label: '9. Contact Us' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="group mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
        )}

        {/* Header Header */}
        <div className="border-b border-[#ecebe6] pb-8 mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-md border border-neutral-200/50">
              <Shield className="w-3.5 h-3.5" /> Legal Compliance
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-neutral-400 font-medium font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Last Updated: June 8, 2026
            </p>
          </div>
          <div className="text-left md:text-right text-xs text-neutral-400 max-w-xs leading-relaxed">
            Please read this policy carefully to understand how Reflyt collects, uses, and safeguards your personal information.
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          {/* Left Column - Desktop Sticky Navigation */}
          <aside className="hidden lg:block sticky top-24 border border-[#ecebe6] rounded-xl bg-white p-4 elite-card-shadow">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4 px-2">
              Table of Contents
            </h4>
            <nav className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group ${
                    activeSection === sec.id
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <span>{sec.label}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      activeSection === sec.id ? 'opacity-100 text-white' : 'text-neutral-400'
                    }`}
                  />
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Column - Policy Prose */}
          <main className="lg:col-span-3 space-y-12 text-sm leading-relaxed text-neutral-600 font-sans max-w-none">
            {/* Section 1 */}
            <section id="introduction" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                1. Introduction
              </h2>
              <p>
                Welcome to <strong>Reflyt</strong> ("we", "our", or "us"). We are committed to protecting your privacy and ensuring you have a secure experience on our career intelligence platform.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, share, and protect your information when you visit our website, register an account, upload resumes, connect external services (such as Google), or upgrade your plan through our portal. By using Reflyt, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collection" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                2. Information We Collect
              </h2>
              <p>
                To provide you with our career advancement features, direct job outreach tools, and ATS checking functionality, we collect several categories of information:
              </p>
              <div className="space-y-3 pl-2">
                <div className="p-3 bg-white border border-[#ecebe6] rounded-lg">
                  <span className="font-bold text-neutral-800 text-xs block mb-1">Account & Profile Information</span>
                  <p className="text-xs text-neutral-500">
                    When you create an account, we collect your name, email address, phone number, location, and professional headlines. If you sign in via Google OAuth, we receive authentication data (name, email, profile photo) provided by Google.
                  </p>
                </div>
                <div className="p-3 bg-white border border-[#ecebe6] rounded-lg">
                  <span className="font-bold text-neutral-800 text-xs block mb-1">Resume Files & Parser Data</span>
                  <p className="text-xs text-neutral-500">
                    When you upload a resume to check your ATS score or populate your profile, we parse the text to extract technical skills, soft skills, educational background, professional experience, and metadata. This information is indexed to match you with career opportunities.
                  </p>
                </div>
                <div className="p-3 bg-white border border-[#ecebe6] rounded-lg">
                  <span className="font-bold text-neutral-800 text-xs block mb-1">Outreach Correspondence Data</span>
                  <p className="text-xs text-neutral-500">
                    If you use our in-app inbox to correspond with recruiters or submit applications, we keep track of sent times, recipient information, templates selected, and delivery statuses to populate your personal dashboard.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="google-data" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2 flex items-center gap-2 text-rose-800">
                3. Google API & Gmail Scope Disclosure
              </h2>
              <p>
                Reflyt offers a direct email feature allowing you to connect your Google Workspace or Gmail account via secure Google OAuth.
              </p>
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-3">
                <p className="text-xs text-rose-950 font-medium">
                  <strong>Important Notice on Google Scopes:</strong>
                </p>
                <ul className="list-disc list-inside text-xs text-rose-900/90 space-y-1.5 pl-2">
                  <li><strong>Scope Requested:</strong> We request permission to send emails on your behalf (<code>https://www.googleapis.com/auth/gmail.send</code>) and read email metadata/threads (<code>https://www.googleapis.com/auth/gmail.readonly</code>) to monitor responses.</li>
                  <li><strong>Limited Use Compliance:</strong> Reflyt’s use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-rose-950 inline-flex items-center gap-0.5">Google API Services User Data Policy <ExternalLink className="w-3 h-3" /></a>, including its Limited Use requirements.</li>
                  <li><strong>Data Isolation:</strong> We do not share Google user data (such as your inbox history or sent email content) with third-party advertising partners, data brokers, or any third-party AI models. Your email content is processed solely to render your portal inbox and compile application metrics.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="ai-processing" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                4. AI Drafting & Processing
              </h2>
              <p>
                To help you draft professional outreach letters and customize applications, Reflyt integrates with the <strong>Groq API</strong>.
              </p>
              <p>
                When you initiate an AI draft or refinement, your resume details and context variables (such as recipient name and company) are transmitted securely to Groq API servers for processing.
              </p>
              <p className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-neutral-500 font-mono">
                Note: Groq API does not retain your data for model training purposes. Your inputs are handled as transient requests to execute professional generations. Your personal Gmail content is never fed into AI models.
              </p>
            </section>

            {/* Section 5 */}
            <section id="data-sharing" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                5. Third-Party Integrations
              </h2>
              <p>
                We do not sell, rent, or trade your personal information. To keep Reflyt operational, we share specific data with trusted services:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white border border-[#ecebe6] rounded-lg">
                  <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center shrink-0 font-serif text-[#1a1a1a] text-xs font-bold">SB</div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800">Supabase (Database & Storage)</h5>
                    <p className="text-xs text-neutral-400 mt-0.5">We store all user accounts, database entries, profiles, and resume PDF files in secure cloud hosting environments provided by Supabase with Row Level Security (RLS).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white border border-[#ecebe6] rounded-lg">
                  <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center shrink-0 font-serif text-[#1a1a1a] text-xs font-bold">RP</div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800">Razorpay (Payment Processor)</h5>
                    <p className="text-xs text-neutral-400 mt-0.5">All billing upgrades and subscriptions are processed by Razorpay. Your credit/debit card numbers and bank details are entered directly on Razorpay's PCI-DSS compliant checkout portals. Reflyt does not store or see your primary card credentials.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="data-security" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                6. Data Security & Retention
              </h2>
              <p>
                The security of your data is of paramount importance. We apply modern security protocols (SSL/TLS encryption, OAuth access tokens, secure database firewalls) to prevent unauthorized access.
              </p>
              <p>
                We retain your account data (resumes, metrics, history) for as long as your account remains active. You can cancel your subscription and request account deletion at any time, which initiates the purge of your personal details and storage files.
              </p>
            </section>

            {/* Section 7 */}
            <section id="user-rights" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                7. Your Privacy Rights
              </h2>
              <p>
                Depending on your location, you hold legal rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>The right to access, inspect, or correct your personal profile information at any time.</li>
                <li>The right to revoke connected third-party integrations (such as Google OAuth) from your Settings dashboard.</li>
                <li>The right to request absolute deletion of your profile and associated documents ("Right to be Forgotten").</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="updates" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                8. Policy Updates
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date at the top. You are advised to review this policy periodically for any changes.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                9. Contact Us
              </h2>
              <p>
                If you have any questions or feedback regarding this Privacy Policy, please reach out to us:
              </p>
              <div className="flex items-center gap-2 p-3 bg-white border border-[#ecebe6] rounded-lg text-xs text-neutral-500 w-fit">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span>support@reflyt.com</span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
