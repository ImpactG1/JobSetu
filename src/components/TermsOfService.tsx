import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, Mail, Calendar, ChevronRight } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', label: '1. Agreement to Terms' },
    { id: 'eligibility', label: '2. Eligibility & Accounts' },
    { id: 'services', label: '3. Platform Services' },
    { id: 'billing', label: '4. Subscriptions & Payments' },
    { id: 'acceptable-use', label: '5. Acceptable Use Policy' },
    { id: 'intellectual-property', label: '6. Intellectual Property' },
    { id: 'disclaimer', label: '7. Limitation of Liability' },
    { id: 'governing-law', label: '8. Governing Law' },
    { id: 'contact', label: '9. Contact Info' },
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
              <ShieldAlert className="w-3.5 h-3.5" /> Platform Terms
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-neutral-400 font-medium font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Last Updated: June 8, 2026
            </p>
          </div>
          <div className="text-left md:text-right text-xs text-neutral-400 max-w-xs leading-relaxed">
            By creating an account or accessing Reflyt, you agree to comply with and be bound by these Terms of Service.
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
            <section id="acceptance" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                1. Agreement to Terms
              </h2>
              <p>
                These Terms of Service govern your use of the <strong>Reflyt</strong> platform, website, and related career tools. Reflyt is operated as a career intelligence and networking tool.
              </p>
              <p>
                Please read these terms carefully. By accessing the site, registering an account, or purchasing subscription plans, you agree to be bound by these Terms of Service. If you do not agree to these terms, you are not authorized to use the platform.
              </p>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                2. Eligibility & Account Responsibilities
              </h2>
              <p>
                To use Reflyt, you must be at least 18 years of age (or the age of majority in your jurisdiction) and have the capacity to form binding legal agreements.
              </p>
              <p>
                When you create an account, you agree to:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>Provide accurate, current, and complete registration information.</li>
                <li>Maintain the confidentiality of your credentials and restrict access to your account.</li>
                <li>Promptly notify us of any security breach or unauthorized activity on your account.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that provide misleading information or engage in fraudulent activities.
              </p>
            </section>

            {/* Section 3 */}
            <section id="services" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                3. Platform Services
              </h2>
              <p>
                Reflyt provides a suite of resources to assist job seekers in managing and optimization of their application pipelines, including:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1.5">
                <li><strong>Curated Listings:</strong> Aggregate links and listings for direct job openings. We are not responsible for the accuracy of external postings or the hiring decisions of external companies.</li>
                <li><strong>Referral Network:</strong> Platform pathways to link applicants to employee referral opportunities.</li>
                <li><strong>ATS Resume Checker:</strong> AI-powered tools that scan and score resume content to evaluate compatibility parameters. Scores are for feedback purposes and do not guarantee selection.</li>
                <li><strong>Outreach Automation:</strong> Tools enabling connection to your Gmail inbox to coordinate cold recruiter outreach and log response rates.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="billing" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                4. Subscriptions, Payments & Razorpay Billings
              </h2>
              <p>
                Reflyt offers free and paid subscription models (Basic/Premium tiers) billed on monthly or yearly cycles.
              </p>
              <div className="p-4 bg-white border border-[#ecebe6] rounded-xl space-y-3">
                <span className="font-bold text-neutral-800 text-xs block">Payment Processing</span>
                <p className="text-xs text-neutral-500">
                  Payments are secure, encrypted, and processed entirely through <strong>Razorpay</strong>. By subscribing, you agree to Razorpay's terms of service and authorize recurring charges depending on your selected plan.
                </p>
                <span className="font-bold text-neutral-800 text-xs block">Cancellations & Renewals</span>
                <p className="text-xs text-neutral-500">
                  Your billing cycle auto-renews at the end of each period unless you cancel your plan through the settings dashboard before your renewal date.
                </p>
                <span className="font-bold text-neutral-800 text-xs block">Refunds</span>
                <p className="text-xs text-neutral-500">
                  Except as required by local consumer laws, all fees and subscription charges are non-refundable. If you believe there was a billing error or double charge processed by Razorpay, please contact support immediately to initiate review.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="acceptable-use" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                5. Acceptable Use Policy
              </h2>
              <p>
                Reflyt is designed to facilitate professional, targeted communication. You agree to use the platform responsibly and refrain from the following prohibited activities:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-2">
                <li>
                  <strong>Spamming HR/Recruiters:</strong> You may not use our email drafting or cold outreach tools to spam recruitment teams, submit repetitive duplicate messages, or send harassing communications.
                </li>
                <li>
                  <strong>Automated Scraping:</strong> You are prohibited from using scripts, scrapers, crawlers, or automation engines to harvest job postings, template designs, or database assets from the portal.
                </li>
                <li>
                  <strong>Abusive Activity:</strong> You may not transmit malware, conduct denial-of-service attempts, or bypass platform limitations (such as daily usage caps).
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="intellectual-property" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                6. Intellectual Property
              </h2>
              <p>
                All proprietary design systems, code architecture, brand layout, logos, copy, and AI email templates available on the Reflyt portal are the exclusive intellectual property of Reflyt.
              </p>
              <p>
                You retain ownership of your resumes, cover letters, and communications generated through the site. You grant Reflyt a limited, non-exclusive license to host and process these files solely as required to render services to you.
              </p>
            </section>

            {/* Section 7 */}
            <section id="disclaimer" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                7. Limitation of Liability & Warranty Disclaimers
              </h2>
              <p className="italic font-medium text-neutral-900">
                Reflyt is provided on an "as-is" and "as-available" basis without warranties of any kind.
              </p>
              <p>
                <strong>No Career Placement Guarantee:</strong> Reflyt is a software tool designed to aid your search efforts. We make no guarantees, express or implied, that using our ATS checkers, outreach draft templates, or referral links will result in recruiter replies, callbacks, job interviews, or job placements.
              </p>
              <p>
                <strong>Limitations:</strong> In no event shall Reflyt, its creators, or partners be liable for any indirect, incidental, special, consequential, or punitive damages (including loss of employment, data, profits, or goodwill) arising out of your use or inability to use the platform.
              </p>
            </section>

            {/* Section 8 */}
            <section id="governing-law" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                8. Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms of Service and any dispute arising from your use of Reflyt shall be governed by and construed in accordance with the laws of <strong>India</strong>, without regard to conflict of law principles.
              </p>
              <p>
                You agree that any legal action or proceeding arising out of or related to these terms shall be brought exclusively in the courts located in India.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="space-y-4 scroll-mt-24">
              <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight border-b border-[#ecebe6] pb-2">
                9. Contact Info
              </h2>
              <p>
                If you have any questions, disputes, or feedback regarding these Terms of Service, please reach out to our team:
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
