import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Briefcase, Mail, Users, Sparkles, CheckCircle2,
  UploadCloud, Star, ChevronRight, Shield, TrendingUp, Zap,
  FileText, ClipboardCheck, Search, Target, Award, Globe,
  Menu, X
} from 'lucide-react';

interface LandingPageProps {
  onNavigateAuth: () => void;
  onNavigateATS: () => void;
}

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Animated counter ── */
function AnimatedNumber({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [visible, target, duration]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth, onNavigateATS }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: Briefcase, title: 'Curated Job Listings', desc: 'Browse hundreds of verified direct job opportunities updated daily from top companies.' },
    { icon: Mail, title: 'HR Email Outreach', desc: 'Send professional emails directly to hiring managers with AI-powered templates.' },
    { icon: Users, title: 'Referral Network', desc: 'Access exclusive employee referral links to get your resume fast-tracked.' },
    { icon: ClipboardCheck, title: 'Free ATS Checker', desc: 'Scan your resume against real ATS algorithms and get actionable improvement tips.' },
    { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Track your job search progress with real-time metrics and conversion insights.' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your data stays safe with enterprise-grade encryption. No spam, ever.' },
  ];

  const steps = [
    { num: '01', title: 'Sign Up Free', desc: 'Create your account in seconds with Google or email.' },
    { num: '02', title: 'Upload Resume', desc: 'Get an instant ATS score and AI-powered improvement suggestions.' },
    { num: '03', title: 'Discover Jobs', desc: 'Browse curated listings and referral opportunities that match your skills.' },
    { num: '04', title: 'Apply & Track', desc: 'Send emails to HR, use referral links, and track every application.' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'SDE at Google', text: 'Reflyt helped me land 3 interviews in my first week. The referral feature is a game-changer!' },
    { name: 'Arjun Patel', role: 'Product Manager at Razorpay', text: 'The ATS checker improved my resume score from 42 to 85. Got callbacks from companies that ignored me before.' },
    { name: 'Sneha Reddy', role: 'Data Analyst at Microsoft', text: 'Love how I can email HRs directly and track everything. Way better than randomly applying on job boards.' },
  ];

  const s1 = useInView(); const s2 = useInView(); const s3 = useInView();
  const s4 = useInView(); const s5 = useInView(); const s6 = useInView();

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-800 overflow-x-hidden">
      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-[#ecebe6] shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center font-serif text-white text-base font-bold">R</div>
            <div>
              <span className="font-serif text-lg font-bold text-neutral-900 tracking-tight leading-none">Reflyt</span>
              <span className="hidden sm:block text-[9px] tracking-[0.2em] text-neutral-400 font-medium uppercase">Career Portal</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">How It Works</a>
            <a href="#ats-checker" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">ATS Checker</a>
            <a href="#testimonials" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">Reviews</a>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <button onClick={onNavigateAuth} className="text-xs font-bold text-neutral-600 hover:text-neutral-900 px-4 py-2 transition-colors">Sign In</button>
            <button onClick={onNavigateAuth} className="text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 px-5 py-2.5 rounded-lg transition-all elite-button flex items-center gap-1.5">
              Get Started Free <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#ecebe6] px-4 py-4 space-y-3 animate-lp-fade-in">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-neutral-700 py-2">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-neutral-700 py-2">How It Works</a>
            <a href="#ats-checker" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-neutral-700 py-2">ATS Checker</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-neutral-700 py-2">Reviews</a>
            <div className="pt-2 space-y-2 border-t border-[#ecebe6]">
              <button onClick={onNavigateAuth} className="w-full text-sm font-bold text-neutral-900 py-2.5 border border-neutral-200 rounded-lg">Sign In</button>
              <button onClick={onNavigateAuth} className="w-full text-sm font-bold text-white bg-neutral-900 py-2.5 rounded-lg flex items-center justify-center gap-1.5">Get Started Free <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-100/40 to-transparent rounded-full -mr-48 animate-lp-float" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full -ml-32 animate-lp-float-delayed" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-lp-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider animate-lp-slide-up">
              <Zap className="w-3.5 h-3.5" /> Free ATS Resume Checker — No Signup Required
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight animate-lp-slide-up stagger-1">
              Your Career,{' '}
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent">Reimagined</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-500 font-light leading-relaxed max-w-2xl mx-auto animate-lp-slide-up stagger-2">
              Get curated job listings, direct HR emails, employee referrals, and a free AI-powered ATS checker — everything you need to land your dream role, in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-lp-slide-up stagger-3">
              <button onClick={onNavigateAuth} className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all elite-button flex items-center justify-center gap-2">
                Start For Free <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={onNavigateATS} className="w-full sm:w-auto px-8 py-3.5 border border-neutral-300 hover:border-neutral-400 text-neutral-700 text-sm font-bold uppercase tracking-wider rounded-xl transition-all elite-button flex items-center justify-center gap-2">
                <ClipboardCheck className="w-4 h-4" /> Check Your ATS Score
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 animate-lp-slide-up stagger-3">No credit card required · Free forever plan available</p>
          </div>

          {/* Stats bar */}
          <div ref={s1.ref} className={`mt-16 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 transition-all duration-700 ${s1.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { val: 2500, suffix: '+', label: 'Job Listings' },
              { val: 800, suffix: '+', label: 'HR Emails' },
              { val: 350, suffix: '+', label: 'Referral Links' },
              { val: 15000, suffix: '+', label: 'Resumes Scanned' },
            ].map((s, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white border border-[#ecebe6] elite-card-shadow">
                <div className="text-2xl font-serif font-bold text-neutral-900"><AnimatedNumber target={s.val} />{s.suffix}</div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-20 sm:py-28 bg-white border-y border-[#ecebe6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={s2.ref} className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${s2.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3 h-3" /> Everything You Need
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              One platform. Every tool for your job search.
            </h2>
            <p className="text-sm text-neutral-400 mt-3 leading-relaxed">Stop juggling 10 different tools. Reflyt brings everything under one roof.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group p-6 rounded-2xl border border-[#ecebe6] bg-[#faf9f6] hover:bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-300 animate-lp-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={s3.ref} className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${s3.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full mb-4">
              <Target className="w-3 h-3" /> Simple Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              From signup to hired in 4 steps
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-white border border-[#ecebe6] elite-card-shadow group hover:border-neutral-300 transition-all duration-300">
                <span className="text-4xl font-serif font-bold text-neutral-100 group-hover:text-neutral-200 transition-colors">{step.num}</span>
                <h3 className="text-sm font-bold text-neutral-900 mt-2 mb-1.5">{step.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
                {i < 3 && <ChevronRight className="hidden lg:block absolute right-[-22px] top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-200 z-10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ATS CHECKER CTA ═══ */}
      <section id="ats-checker" className="py-20 sm:py-28 bg-[#141414] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-white/[0.06] to-transparent rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/[0.04] to-transparent rounded-full -ml-32 -mb-32 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div ref={s4.ref} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${s4.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-md border border-amber-400/10">
                <Sparkles className="w-3 h-3" /> 100% Free — No Signup Required
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
                Check Your Resume's{' '}
                <span className="text-neutral-400">ATS Score</span>{' '}
                Instantly
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-lg">
                Our AI-powered ATS checker analyzes your resume across 25+ criteria including content quality, keyword optimization, formatting, and structure — just like real Applicant Tracking Systems do.
              </p>
              <div className="space-y-3">
                {['Content & keyword analysis', 'Format & structure scoring', 'Missing skills detection', 'Downloadable PDF report'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-neutral-300">{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={onNavigateATS} className="px-8 py-3.5 bg-white hover:bg-neutral-100 text-neutral-900 text-sm font-bold uppercase tracking-wider rounded-xl transition-all elite-button flex items-center gap-2">
                <UploadCloud className="w-4 h-4" /> Check Your Resume Now
              </button>
            </div>
            <div className="relative">
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-semibold">resume_john_doe.pdf</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Analyzed</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="60" strokeWidth="8" fill="transparent" className="stroke-white/10" />
                      <circle cx="72" cy="72" r="60" strokeWidth="8" fill="transparent" stroke="#10b981" strokeDasharray={377} strokeDashoffset={377 - (78 / 100) * 377} strokeLinecap="round" className="animate-lp-score-ring" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">78</span>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ATS Score</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Content', score: 82 }, { label: 'Skills', score: 75 },
                    { label: 'Format', score: 90 }, { label: 'Sections', score: 68 },
                    { label: 'Style', score: 72 },
                  ].map((c, i) => (
                    <div key={i} className="text-center p-2 rounded-lg bg-white/[0.04]">
                      <div className="text-xs font-bold">{c.score}</div>
                      <div className="text-[8px] text-neutral-500 mt-0.5">{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={s5.ref} className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${s5.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full mb-4">
              <Star className="w-3 h-3" /> Loved by Job Seekers
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Real stories from real users
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-[#ecebe6] elite-card-shadow hover:border-neutral-300 transition-all duration-300 space-y-4">
                <div className="flex gap-1">{[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}</div>
                <p className="text-sm text-neutral-600 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-[#ecebe6]">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">{t.name.split(' ').map(w => w[0]).join('')}</div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{t.name}</div>
                    <div className="text-[10px] text-neutral-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 sm:py-28 bg-white border-t border-[#ecebe6]">
        <div ref={s6.ref} className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 transition-all duration-700 ${s6.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Ready to land your dream job?
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xl mx-auto">
            Join thousands of job seekers who are getting more interviews, more callbacks, and more offers with Reflyt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={onNavigateAuth} className="w-full sm:w-auto px-10 py-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all elite-button flex items-center justify-center gap-2">
              Get Started — It's Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#141414] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-serif text-white text-sm font-bold">R</div>
              <span className="font-serif text-lg font-bold tracking-tight">Reflyt</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-neutral-500">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#ats-checker" className="hover:text-white transition-colors">ATS Checker</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <p className="text-[10px] text-neutral-600">© {new Date().getFullYear()} Reflyt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
