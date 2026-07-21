import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Lender } from '../types';

interface GoogleSignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lender: Lender) => void;
}

export default function GoogleSignIn({ isOpen, onClose, onSuccess }: GoogleSignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password' | 'success'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com') && !email.toLowerCase().endsWith('@google.com')) {
      setError('Lender portal requires a valid Gmail account (@gmail.com)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('password');
    }, 800);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Enter your password');
      return;
    }

    if (password.length < 4) {
      setError('Wrong password. Try again or click Forgot password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      
      // Extract a nice name from Gmail
      const localPart = email.split('@')[0];
      const name = localPart
        .split(/[._\-+]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      setTimeout(() => {
        onSuccess({
          email: email.toLowerCase(),
          name: name || 'Authorized Lender',
          photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(localPart)}`,
          balance: 5000000, // Initial pre-approved virtual lender capital (₱5,000,000 PHP)
        });
        onClose();
        // Reset state
        setEmail('');
        setPassword('');
        setStep('email');
      }, 1000);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-100"
      >
        {/* Top Header Controls */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 sm:p-10">
          {/* Authentic Google "G" Logo */}
          <div className="flex justify-center mb-6">
            <svg className="w-10 h-10" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.41-.57-.72-1.22-.87-1.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 tracking-tight font-display">
                    Sign in with Google
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    to access the secure Lender Portal
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-4 text-xs font-medium text-amber-800 bg-amber-50 rounded-full border border-amber-200">
                    <ShieldAlert size={12} />
                    Required: Must use a Gmail address
                  </div>
                </div>

                <form onSubmit={handleNextEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email or phone
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@gmail.com"
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:outline-hidden transition-all duration-200 ${
                        error
                          ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                          : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                    {error && (
                      <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Not your computer? Use Guest mode to sign in privately.{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                      Learn more
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <a
                      href="#"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Create account
                    </a>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Next
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'password' && (
              <motion.div
                key="password-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 tracking-tight font-display">
                    Welcome
                  </h3>
                  {/* Selected Account Bubble */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 mt-3 bg-gray-100 hover:bg-gray-200/80 rounded-full border border-gray-200 transition-all duration-150 cursor-pointer text-sm font-medium text-gray-700 max-w-xs">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                      {email.charAt(0)}
                    </div>
                    <span className="truncate max-w-[160px]">{email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setPassword('');
                        setError('');
                      }}
                      className="text-[10px] text-blue-600 font-semibold hover:underline border-l border-gray-300 pl-1.5 ml-0.5"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Enter your password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:outline-hidden transition-all duration-200 ${
                        error
                          ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                          : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                    {error && (
                      <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="show-password"
                      className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="show-password" className="text-xs text-gray-600 cursor-pointer select-none">
                      Show password
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <a
                      href="#"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot password?
                    </a>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="flex justify-center mb-4 text-emerald-500">
                  <CheckCircle2 size={56} className="animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-display">
                  Authentication Successful
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Redirecting to your secure lender workspace...
                </p>
                <div className="flex justify-center mt-6">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Security Footer */}
        <div className="bg-gray-50 px-8 py-4 flex items-center justify-between border-t border-gray-100 text-[11px] text-gray-500">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            256-bit SSL Secure Auth
          </span>
          <div className="flex gap-3">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
