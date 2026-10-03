import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  LogOut,
  RefreshCw,
  KeyRound,
  UserCheck,
  Clock,
} from 'lucide-react';
import { UserAccount, NetworkSpeed } from '../types';
import { TEST_PERSONAS } from '../data/mavenProjectData';

interface LoginPageProps {
  networkSpeed: NetworkSpeed;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  // External ref hooks for automated test runner interaction
  externalEmail?: string;
  externalPassword?: string;
  isExecutingAutomation?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  networkSpeed,
  currentUser,
  onLoginSuccess,
  onLogout,
  externalEmail,
  externalPassword,
  isExecutingAutomation = false,
}) => {
  // Form states
  const [email, setEmail] = useState('clara@lumengoods.com');
  const [password, setPassword] = useState('Lumen2026!Secure');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation & alerts
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Dynamic loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Verifying credentials...');

  // 2FA Flow
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [pending2FAUser, setPending2FAUser] = useState<UserAccount | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorCountdown, setTwoFactorCountdown] = useState(45);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Update external values if driven by test runner
  useEffect(() => {
    if (externalEmail !== undefined) setEmail(externalEmail);
  }, [externalEmail]);

  useEffect(() => {
    if (externalPassword !== undefined) setPassword(externalPassword);
  }, [externalPassword]);

  // 2FA countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (is2FAModalOpen && twoFactorCountdown > 0) {
      timer = setInterval(() => {
        setTwoFactorCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [is2FAModalOpen, twoFactorCountdown]);

  // Handle latency delay calculation
  const getDelayMs = () => {
    if (networkSpeed === 'instant') return 50;
    if (networkSpeed === 'slow') return 3000;
    return 1200; // normal
  };

  const handlePersonaSelect = (personaKey: string) => {
    const persona = TEST_PERSONAS[personaKey];
    if (persona) {
      setEmail(persona.email);
      setPassword(persona.password);
      setEmailError(null);
      setPasswordError(null);
      setAlertMessage(null);
    }
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Reset previous errors
    setEmailError(null);
    setPasswordError(null);
    setAlertMessage(null);

    // Client-side validation checks
    let hasValidationError = false;
    if (!email.trim()) {
      setEmailError('Please enter a valid email address.');
      hasValidationError = true;
    } else if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address format.');
      hasValidationError = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasValidationError = true;
    }

    if (hasValidationError) return;

    if (isLockedOut) {
      setAlertMessage('Account temporarily locked due to consecutive failed attempts.');
      return;
    }

    // Dynamic Loading Sequence
    setIsLoading(true);
    setLoadingStepText('Resolving TLS & CSRF token...');

    const delay = getDelayMs();
    if (delay > 500) {
      await new Promise((r) => setTimeout(r, delay * 0.4));
      setLoadingStepText('Validating cryptographic credentials...');
      await new Promise((r) => setTimeout(r, delay * 0.6));
    } else {
      await new Promise((r) => setTimeout(r, delay));
    }

    setIsLoading(false);

    // Check account status
    const targetEmail = email.trim().toLowerCase();

    // Check locked user scenario
    if (targetEmail === 'locked.user@lumengoods.com') {
      setIsLockedOut(true);
      setAlertMessage('Account temporarily locked due to consecutive failed attempts.');
      return;
    }

    // Check VIP 2FA scenario
    if (targetEmail === 'vip.alex@lumengoods.com') {
      if (password === 'Lumen2026!Vip') {
        setPending2FAUser(TEST_PERSONAS.vip);
        setIs2FAModalOpen(true);
        setTwoFactorCountdown(45);
        setTwoFactorCode(['', '', '', '', '', '']);
        return;
      }
    }

    // Check standard Customer scenario
    if (targetEmail === 'clara@lumengoods.com') {
      if (password === 'Lumen2026!Secure') {
        setFailedAttempts(0);
        onLoginSuccess(TEST_PERSONAS.customer);
        return;
      }
    }

    // Invalid credentials flow
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);

    if (nextAttempts >= 3) {
      setIsLockedOut(true);
      setAlertMessage('Account temporarily locked due to consecutive failed attempts.');
    } else {
      setAlertMessage('Invalid email or password combination.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...twoFactorCode];
    newOtp[index] = value.slice(-1);
    setTwoFactorCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify2FA = async () => {
    const code = twoFactorCode.join('');
    if (code.length < 6) {
      setTwoFactorError('Please enter all 6 digits.');
      return;
    }

    setIsLoading(true);
    setLoadingStepText('Verifying time-based one-time password (TOTP)...');
    await new Promise((r) => setTimeout(r, getDelayMs()));
    setIsLoading(false);

    if (code === '849201' || code === '123456') {
      setIs2FAModalOpen(false);
      if (pending2FAUser) {
        onLoginSuccess(pending2FAUser);
      }
    } else {
      setTwoFactorError('Invalid security code. Please try again.');
    }
  };

  // If already authenticated, show the customer dashboard
  if (currentUser) {
    return (
      <div id="customer-dashboard" className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-sm transition-colors">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#B8860B] dark:text-[#D4AF37]">
                Authenticated Member Portal
              </span>
              <h1 id="member-greeting-heading" className="text-3xl font-serif font-medium mt-1 text-zinc-900 dark:text-zinc-100">
                Welcome back, {currentUser.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
                <span id="user-email-display">{currentUser.email}</span>
                <span aria-hidden="true">·</span>
                <span>Role: {currentUser.role.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 inline" /> Session Encrypted
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                <ShoppingBag className="w-4 h-4 text-[#B8860B] dark:text-[#D4AF37]" />
                <span>Bag: <strong id="cart-item-count" className="font-mono">3</strong> items</span>
              </div>
              <button
                id="logout-action-btn"
                onClick={onLogout}
                className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Member Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Orders</div>
              <div className="text-2xl font-serif font-medium mt-1 tabular-nums text-zinc-900 dark:text-zinc-100">
                {currentUser.orderCount || 12}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Last ordered 3 days ago</div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Atelier Loyalty Points</div>
              <div className="text-2xl font-serif font-medium mt-1 tabular-nums text-[#B8860B] dark:text-[#D4AF37]">
                {currentUser.loyaltyPoints || 1250}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Tier: {currentUser.role === 'vip' ? 'Platinum Private Client' : 'Select Connoisseur'}</div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Security Multi-Factor</div>
              <div className="text-2xl font-serif font-medium mt-1 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span>{currentUser.requires2FA ? 'Enforced' : 'Optional'}</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Biometric passkey compatible</div>
            </div>
          </div>

          {/* Recent Curated Orders */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
              Recent Acquired Pieces
            </h3>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
              <div className="p-3.5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">Travertine Sculptural Table Lamp</div>
                  <div className="text-zinc-500 text-[11px]">SKU: LUM-7704 · Order #1042</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium">$580.00</div>
                  <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">Delivered</div>
                </div>
              </div>
              <div className="p-3.5 flex items-center justify-between bg-white dark:bg-[#18181B]">
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">Brushed Brass Candle Holder Set</div>
                  <div className="text-zinc-500 text-[11px]">SKU: LUM-2291 · Order #1039</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium">$240.00</div>
                  <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">Delivered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto py-8 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* Test Persona Quick Selector Toolbar */}
      <div className="mb-6 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <KeyRound className="w-4 h-4 text-[#B8860B] dark:text-[#D4AF37]" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Quick Test Personas:</span>
          <span className="hidden sm:inline text-zinc-400">Click to prefill credentials for automation testing</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePersonaSelect('customer')}
            className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-200 font-medium"
          >
            Clara (Standard)
          </button>
          <button
            type="button"
            onClick={() => handlePersonaSelect('vip')}
            className="px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 font-medium hover:bg-amber-100/50 transition-colors"
          >
            Alex (VIP 2FA)
          </button>
          <button
            type="button"
            onClick={() => handlePersonaSelect('locked')}
            className="px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            Julian (Locked Account)
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('test.invalid@lumengoods.com');
              setPassword('BadPassword123');
              setEmailError(null);
              setPasswordError(null);
            }}
            className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Bad Creds
          </button>
        </div>
      </div>

      {/* Main Split Layout: Editorial Brand Showcase Left, Login Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Editorial Panel (5 cols) */}
        <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-between p-8 sm:p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-b from-[#F4F4F0] to-[#EAEAE4] dark:from-[#18181B] dark:to-[#121214] relative overflow-hidden min-h-[480px]">
          {/* Subtle architectural background ornament */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-black/5 dark:border-white/5 pointer-events-none" />
          <div className="absolute right-10 top-10 w-40 h-40 rounded-full border border-black/5 dark:border-white/5 pointer-events-none" />

          <div>
            <div className="text-xs uppercase tracking-widest text-[#B8860B] dark:text-[#D4AF37] font-semibold mb-3">
              Atelier Private Client
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
              Timeless Living, Curated for the Senses.
            </h2>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
              Sign in to manage your private acquisition orders, reserve seasonal limited releases, and review personalized interior consultations.
            </p>
          </div>

          {/* Social Proof / Claim-to-Proof Adjacency */}
          <div className="mt-10 pt-6 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center gap-1 text-[#B8860B] dark:text-[#D4AF37] mb-2">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-mono font-medium">Lumen Guarantee</span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic font-serif leading-relaxed">
              "Every piece is authenticated with its artisanal provenance registry. Authenticated customers receive white-glove carbon-neutral delivery."
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-zinc-200">Helena Berg</span>
              <span aria-hidden="true">·</span>
              <span>Chief Curator, Zurich</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Card (7 cols) */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-sm relative transition-colors">
            {/* Dynamic AJAX / Network Loading Overlay */}
            {isLoading && (
              <div
                id="auth-dynamic-loader"
                role="status"
                aria-live="polite"
                className="absolute inset-0 z-30 bg-white/85 dark:bg-[#18181B]/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all"
              >
                <div className="w-10 h-10 border-2 border-zinc-200 dark:border-zinc-700 border-t-[#B8860B] dark:border-t-[#D4AF37] rounded-full animate-spin mb-4" />
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{loadingStepText}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                  Selenium WebDriverWait sync active (timeout 10s)
                </div>
              </div>
            )}

            {/* Header */}
            <div className="mb-8">
              <div className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-1">
                Account Access
              </div>
              <h1 id="login-brand-heading" className="text-2xl sm:text-3xl font-serif font-medium text-zinc-900 dark:text-zinc-100">
                Sign in to Your Account
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Enter your registered email and passphrase to continue.
              </p>
            </div>

            {/* Account Lockout Warning Banner */}
            {isLockedOut && (
              <div
                id="lockout-warning-banner"
                role="alert"
                className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/25 text-red-900 dark:text-red-200 text-xs flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Security Alert: Account Lockout Triggered</div>
                  <p className="mt-0.5 leading-relaxed text-red-700 dark:text-red-300">
                    Account temporarily locked due to consecutive failed attempts. Please reset your password or contact Atelier Concierge.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLockedOut(false);
                      setFailedAttempts(0);
                      setAlertMessage(null);
                    }}
                    className="mt-2 text-xs underline font-medium hover:opacity-80"
                  >
                    Reset Lockout (Testing Helper)
                  </button>
                </div>
              </div>
            )}

            {/* General Auth Alert Message Banner */}
            {alertMessage && !isLockedOut && (
              <div
                id="auth-alert-message"
                role="alert"
                className="mb-6 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/25 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{alertMessage}</div>
              </div>
            )}

            {/* Social Authentication Providers */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setLoadingStepText('Connecting to Google Identity Services...');
                  await new Promise((r) => setTimeout(r, 800));
                  setIsLoading(false);
                  onLoginSuccess(TEST_PERSONAS.customer);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setLoadingStepText('Connecting to Apple ID Secure Enclave...');
                  await new Promise((r) => setTimeout(r, 800));
                  setIsLoading(false);
                  onLoginSuccess(TEST_PERSONAS.customer);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73 1.01.08 2.03-.5 2.64-1.23z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-6">
              <div className="grow border-t border-zinc-200 dark:border-zinc-800"></div>
              <span className="shrink-0 mx-4 text-[11px] uppercase tracking-wider text-zinc-400">
                Or continue with email
              </span>
              <div className="grow border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="login-email-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email-input"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="name@domain.com"
                    aria-invalid={emailError ? 'true' : 'false'}
                    aria-describedby={emailError ? 'email-validation-error' : undefined}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors outline-hidden ${
                      emailError
                        ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 text-red-900 dark:text-red-100 focus:ring-1 focus:ring-red-500'
                        : 'border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:border-[#B8860B] dark:focus:border-[#D4AF37] focus:ring-1 focus:ring-[#B8860B] dark:focus:ring-[#D4AF37]'
                    }`}
                  />
                </div>
                {emailError && (
                  <p id="email-validation-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                  >
                    Passphrase
                  </label>
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                  >
                    Forgot passphrase?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="••••••••••••"
                    aria-invalid={passwordError ? 'true' : 'false'}
                    aria-describedby={passwordError ? 'password-validation-error' : undefined}
                    className={`w-full pl-10 pr-11 py-2.5 rounded-lg border text-sm transition-colors outline-hidden ${
                      passwordError
                        ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 text-red-900 dark:text-red-100 focus:ring-1 focus:ring-red-500'
                        : 'border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:border-[#B8860B] dark:focus:border-[#D4AF37] focus:ring-1 focus:ring-[#B8860B] dark:focus:ring-[#D4AF37]'
                    }`}
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-validation-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="login-remember-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#B8860B] dark:text-[#D4AF37] focus:ring-[#B8860B] focus:ring-offset-0 bg-transparent"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Remember this device for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isLoading || isLockedOut}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    isLockedOut
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white shadow-xs'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer notice & New Account link */}
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <span>New to Lumen Atelier? </span>
              <button
                type="button"
                onClick={() => {
                  setAlertMessage('Registration is open to invited private clients. Use test personas above.');
                }}
                className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                Apply for Private Membership
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Modal */}
      {is2FAModalOpen && (
        <div
          id="two-factor-auth-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mfa-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#B8860B] dark:text-[#D4AF37]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 id="mfa-title" className="text-xl font-serif font-medium text-zinc-900 dark:text-zinc-100">
                  Two-Factor Verification
                </h3>
                <p className="text-xs text-zinc-500">Security code sent to your registered authenticator</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              Enter the 6-digit verification code. (For automated test execution, the standard test passcode is{' '}
              <strong className="font-mono text-zinc-900 dark:text-zinc-100">849201</strong>).
            </p>

            {/* 6 Digit Input Slots */}
            <div className="flex justify-between gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  id={`mfa-code-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={twoFactorCode[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  ref={(el) => {
                    otpInputsRef.current[idx] = el;
                  }}
                  className="w-11 h-13 text-center text-lg font-mono font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:border-[#B8860B] dark:focus:border-[#D4AF37] focus:ring-1 focus:ring-[#B8860B] outline-hidden"
                />
              ))}
            </div>

            {twoFactorError && (
              <p id="mfa-error-notice" role="alert" className="text-xs text-red-600 dark:text-red-400 mb-4">
                {twoFactorError}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-zinc-500 mb-6">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>00:{twoFactorCountdown < 10 ? `0${twoFactorCountdown}` : twoFactorCountdown}</span>
              </span>
              <button
                type="button"
                id="mfa-resend-btn"
                disabled={twoFactorCountdown > 0}
                onClick={() => {
                  setTwoFactorCountdown(45);
                  setTwoFactorError(null);
                }}
                className={`font-medium ${
                  twoFactorCountdown > 0
                    ? 'text-zinc-400 cursor-not-allowed'
                    : 'text-[#B8860B] dark:text-[#D4AF37] hover:underline'
                }`}
              >
                Resend Code
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIs2FAModalOpen(false)}
                className="w-1/2 py-2.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="mfa-verify-btn"
                onClick={handleVerify2FA}
                className="w-1/2 py-2.5 px-4 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-serif font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Reset Passphrase
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Enter your email address to receive secure reset credentials.
            </p>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 mb-6">
                Password recovery link has been dispatched to <strong>{forgotEmail}</strong>.
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:border-[#B8860B] outline-hidden"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotSuccess(false);
                }}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Close
              </button>
              {!forgotSuccess && (
                <button
                  type="button"
                  onClick={() => setForgotSuccess(true)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
