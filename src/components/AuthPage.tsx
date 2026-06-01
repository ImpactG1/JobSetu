import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Briefcase,
  Shield,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError('');
    setSuccessMessage('');
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const validateForm = (): string | null => {
    if (!email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';

    if (mode === 'signup') {
      if (!fullName.trim()) return 'Full name is required.';
      if (!confirmPassword) return 'Please confirm your password.';
      if (password !== confirmPassword) return 'Passwords do not match.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage(
            'Account created successfully! Please check your email to verify your account before signing in.'
          );
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMessage('');
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
      // If successful, Supabase redirects to Google OAuth — no need to reset loading
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const features = [
    {
      icon: Briefcase,
      title: 'Executive Recruitment',
      description: 'Manage high-profile mandates and C-suite headhunts across global markets.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Drafting',
      description: 'Leverage Gemini AI to refine outreach emails with professional precision.'
    },
    {
      icon: Shield,
      title: 'Referral Pipeline',
      description: 'Track candidates through your Kanban pipeline from referral to placement.'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Deep-dive into conversion metrics, response rates, and team benchmarks.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] flex">
      {/* Left Panel — Branding & Feature Showcase */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Dark background */}
        <div className="absolute inset-0 bg-[#141414]" />
        
        {/* Subtle gradient accent */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-white/[0.06] to-transparent rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/[0.04] to-transparent rounded-full -ml-32 -mb-32 pointer-events-none" />
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center font-serif text-white text-lg font-bold">
              E
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-white tracking-tight leading-none">
                Elite HR
              </h1>
              <p className="text-[10px] tracking-[0.25em] text-neutral-500 font-medium uppercase">
                Executive Portal
              </p>
            </div>
          </div>

          {/* Center headline */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-amber-400/80 font-bold bg-amber-400/10 px-3 py-1.5 rounded-md border border-amber-400/10">
                Trusted by 500+ Executive Recruiters
              </span>
              <h2 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Where Elite Talent
                <span className="block text-neutral-400">Meets Strategy</span>
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed font-light max-w-md">
                The definitive platform for executive recruitment professionals managing high-stakes talent acquisition across Fortune 500 companies.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => {
                const IconComp = feature.icon;
                return (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center mb-3 group-hover:bg-white/[0.12] transition-colors">
                      <IconComp className="w-4 h-4 text-neutral-300" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">{feature.title}</h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex -space-x-2 shrink-0">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full bg-neutral-700 border-2 border-[#141414] flex items-center justify-center text-[10px] font-bold text-neutral-300"
                >
                  {['AT', 'AM', 'AS', 'JS'][i]}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-neutral-300 font-medium">
                "Transformed our executive hiring pipeline entirely."
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                — Alexander Thorne, Chief Strategy Officer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile brand (hidden on desktop) */}
          <div className="lg:hidden flex items-center justify-center space-x-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center font-serif text-white text-base font-bold">
              E
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-neutral-900 tracking-tight leading-none">
                Elite HR
              </h1>
              <p className="text-[9px] tracking-[0.25em] text-neutral-400 font-medium uppercase">
                Executive Portal
              </p>
            </div>
          </div>

          {/* Header text */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="font-serif text-2xl xl:text-3xl font-bold text-neutral-900 tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-neutral-400 font-light">
              {mode === 'login'
                ? 'Sign in to access your executive recruitment dashboard.'
                : 'Join the premier platform for talent acquisition leaders.'}
            </p>
          </div>

          {/* Mode toggle pills */}
          <div className="flex bg-neutral-100 rounded-xl p-1 border border-neutral-200/50">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-start space-x-2.5 p-3.5 bg-rose-50 border border-rose-200/60 rounded-xl text-xs text-rose-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Success alert */}
          {successMessage && (
            <div className="flex items-start space-x-2.5 p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-xs text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            id="auth-google-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className={`w-full py-3 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl border border-neutral-200 hover:border-neutral-300 shadow-sm transition-all duration-200 flex items-center justify-center space-x-3 elite-button ${
              isGoogleLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isGoogleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Or divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200/70" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-[#faf9f6] px-4 text-neutral-400 font-medium uppercase tracking-wider">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (sign up only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-neutral-300" />
                  </span>
                  <input
                    id="auth-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alexander Thorne"
                    className="w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-800 placeholder-neutral-300 outline-none transition-all duration-150"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-neutral-300" />
                </span>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-800 placeholder-neutral-300 outline-none transition-all duration-150"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-300" />
                </span>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 rounded-xl pl-10 pr-11 py-3 text-sm text-neutral-800 placeholder-neutral-300 outline-none transition-all duration-150"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-neutral-300 hover:text-neutral-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (sign up only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-neutral-300" />
                  </span>
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 rounded-xl pl-10 pr-11 py-3 text-sm text-neutral-800 placeholder-neutral-300 outline-none transition-all duration-150"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-neutral-300 hover:text-neutral-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 elite-button ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Portal' : 'Create Executive Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200/70" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-[#faf9f6] px-4 text-neutral-400 font-medium uppercase tracking-wider">
                {mode === 'login' ? 'New to Elite HR?' : 'Already have an account?'}
              </span>
            </div>
          </div>

          {/* Switch mode link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-600"
            >
              {mode === 'login' ? 'Create your executive account' : 'Sign in to your existing account'}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-neutral-300 font-light leading-relaxed pt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            <br />
            Protected by industry-grade encryption.
          </p>
        </div>
      </div>
    </div>
  );
};
