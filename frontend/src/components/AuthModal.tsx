import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  User,
  Building2,
  Briefcase,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api';
import { UserProfile, AuthResponse } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('National Infrastructure Review Cell');
  const [designation, setDesignation] = useState('Project Review Analyst');

  // Verification states
  const [verifyTarget, setVerifyTarget] = useState<'email' | 'phone'>('email');
  const [otpValue, setOtpValue] = useState('');
  const [sandboxOtp, setSandboxOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Reset password states
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'submit'>('request');

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  // 1. Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.register({
        full_name: fullName,
        email,
        phone,
        password,
        organization,
        designation,
      });
      setSuccessMsg(res.message || 'Account registered! Please verify your contact information.');
      if (res.verification?.sandbox_email_otp) {
        setSandboxOtp(res.verification.sandbox_email_otp);
      }
      setMode('verify');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ identifier: email, password });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (verifyTarget === 'email') {
        await api.verifyEmailOtp(email, otpValue);
        setSuccessMsg('Email successfully verified!');
        // Move to phone verification if unverified
        setVerifyTarget('phone');
        setOtpValue('');
        setSandboxOtp(null);
        setCooldown(60);
      } else {
        await api.verifyPhoneOtp(phone, otpValue);
        const me = await api.getMe();
        onSuccess(me);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const target = verifyTarget === 'email' ? email : phone;
      const type = verifyTarget === 'email' ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';
      const res: any = await api.resendOtp(target, type);
      setSuccessMsg(res.message);
      if (res.sandbox_otp) setSandboxOtp(res.sandbox_otp);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Google Sign-In
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      // Passes simulated Google credential token (ready for real Google client ID)
      const res = await api.googleAuth('google-credential-token-sih-2026');
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Forgot / Reset Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (resetStep === 'request') {
        const res: any = await api.forgotPassword(resetEmail);
        setSuccessMsg(res.message);
        if (res.sandbox_otp) setSandboxOtp(res.sandbox_otp);
        setResetStep('submit');
      } else {
        await api.resetPassword({
          email: resetEmail,
          otp: resetOtp,
          new_password: newPassword,
        });
        setSuccessMsg('Password reset successfully! Please sign in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-gov-800 to-gov-900 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-sm tracking-wide uppercase">
                {mode === 'login' && 'Analyst Portal Access'}
                {mode === 'register' && 'Officer Account Registration'}
                {mode === 'verify' && 'Multi-Factor Verification'}
                {mode === 'forgot' && 'Password Recovery'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            National Infrastructure Vigilance & Project Intelligence System
          </p>
        </div>

        {/* Notifications / Alerts */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {sandboxOtp && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900">
              <div className="flex items-center justify-between font-bold">
                <span>⚡ Sandbox Code Active:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-800 text-sm">
                  {sandboxOtp}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-amber-700">
                (External SMS/SMTP provider unconfigured. Use this instant verification code).
              </p>
            </div>
          )}

          {/* ---------------- LOGIN MODE ---------------- */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email or Mobile Number
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@nic.in or 9876543210"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gov-700 py-2.5 text-xs font-bold text-white shadow transition hover:bg-gov-800 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>

              <div className="relative my-4 text-center">
                <hr className="border-slate-200" />
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] uppercase font-bold text-slate-400">
                  Or Connect With
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Don't have an analyst account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Register New Account
                </button>
              </div>
            </form>
          )}

          {/* ---------------- REGISTER MODE ---------------- */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name & Title
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Er. Rajesh Verma"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@pwd.gov.in"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution / Dept
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Dept of Public Works"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Superintending Engineer"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Strong Password (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gov-700 py-2.5 text-xs font-bold text-white shadow transition hover:bg-gov-800 disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ---------------- OTP VERIFICATION MODE ---------------- */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Verify Your {verifyTarget === 'email' ? 'Email Address' : 'Phone Number'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the 6-digit code dispatched to{' '}
                  <span className="font-semibold text-slate-800">
                    {verifyTarget === 'email' ? email : phone}
                  </span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full tracking-widest text-center text-lg font-bold font-mono rounded-lg border border-slate-300 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpValue.length < 4}
                className="w-full rounded-lg bg-gov-700 py-2.5 text-xs font-bold text-white shadow transition hover:bg-gov-800 disabled:opacity-50"
              >
                {loading ? 'Validating...' : 'Verify & Continue'}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline disabled:text-slate-400"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Resend Code {cooldown > 0 ? `(${cooldown}s)` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyTarget((t) => (t === 'email' ? 'phone' : 'email'))}
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Switch to {verifyTarget === 'email' ? 'Phone' : 'Email'}
                </button>
              </div>
            </form>
          )}

          {/* ---------------- FORGOT PASSWORD MODE ---------------- */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold text-slate-900">Account Recovery</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {resetStep === 'request'
                    ? 'Enter your registered email address to receive a secure recovery code.'
                    : 'Enter the recovery OTP and specify your new password.'}
                </p>
              </div>

              {resetStep === 'request' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="officer@nic.in"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gov-700 py-2.5 text-xs font-bold text-white shadow transition hover:bg-gov-800 disabled:opacity-50"
              >
                {loading
                  ? 'Processing...'
                  : resetStep === 'request'
                  ? 'Send Recovery Code'
                  : 'Update Password'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
