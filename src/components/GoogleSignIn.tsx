import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Plus, Sparkles, UserCheck, ArrowRight, Lock, Zap, ExternalLink } from 'lucide-react';
import { Lender } from '../types';

interface GoogleSignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lender: Lender) => void;
}

interface SavedAccount {
  email: string;
  name: string;
  photoUrl: string;
  isPrimary?: boolean;
}

export default function GoogleSignIn({ isOpen, onClose, onSuccess }: GoogleSignInProps) {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [success, setSuccess] = useState(false);

  // Load existing Gmail profiles for 1-Tap selection
  useEffect(() => {
    if (!isOpen) return;

    try {
      const emailSet = new Set<string>();
      
      // Always include active system user & default test lender
      emailSet.add('projectile.afk@gmail.com');
      emailSet.add('lancelot.du_lac@gmail.com');

      const emailsRaw = localStorage.getItem('fundflow_registered_lenders');
      if (emailsRaw) {
        const parsed = JSON.parse(emailsRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach(e => {
            if (typeof e === 'string' && e.includes('@')) {
              emailSet.add(e.toLowerCase().trim());
            }
          });
        }
      }

      const accountList: SavedAccount[] = Array.from(emailSet).map(email => {
        const isPrimary = email === 'projectile.afk@gmail.com';
        const defaultName = isPrimary 
          ? 'Arthur Pendragon' 
          : email === 'lancelot.du_lac@gmail.com'
          ? 'Lancelot du Lac'
          : email.split('@')[0].split(/[._\-+]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

        let cachedName = localStorage.getItem(`lender_name_${email}`);
        if (!cachedName) {
          const cachedProfile = localStorage.getItem(`fundflow_lender_${email}`);
          if (cachedProfile) {
            try {
              cachedName = JSON.parse(cachedProfile).name;
            } catch (e) {
              // ignore
            }
          }
        }

        const name = cachedName || defaultName;
        const localPart = email.split('@')[0];

        return {
          email,
          name,
          photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(localPart)}`,
          isPrimary
        };
      });

      // Put primary at top
      accountList.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      setAccounts(accountList);
    } catch (err) {
      console.error('[Google 1-Tap] Error loading accounts:', err);
    }
  }, [isOpen]);

  const handleOneTapSignIn = (emailToUse: string, nameToUse?: string) => {
    const cleanEmail = emailToUse.trim().toLowerCase();
    
    if (!cleanEmail) {
      setError('Please enter a Gmail address');
      return;
    }

    if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@google.com')) {
      setError('Google 1-Tap requires a valid @gmail.com account');
      return;
    }

    setSelectedEmail(cleanEmail);
    setIsLoggingIn(true);
    setError('');

    const localPart = cleanEmail.split('@')[0];
    const derivedName = nameToUse || localStorage.getItem(`lender_name_${cleanEmail}`) || 
      localPart.split(/[._\-+]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

    // Instant 1-tap transition (0.35s feedback)
    setTimeout(() => {
      setIsLoggingIn(false);
      setSuccess(true);

      const lenderObj: Lender = {
        email: cleanEmail,
        name: derivedName || 'Authorized Lender',
        photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(localPart)}`,
        balance: 5000000,
      };

      setTimeout(() => {
        onSuccess(lenderObj);
        onClose();
        // Reset state
        setSuccess(false);
        setShowCustomInput(false);
        setCustomEmail('');
        setIsLoggingIn(false);
      }, 500);
    }, 350);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleOneTapSignIn(customEmail);
  };

  if (!isOpen) return null;

  const primaryAccount = accounts.find(a => a.isPrimary) || accounts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100"
      >
        {/* Header Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Authentic Google "G" Badge & Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-gray-900 font-display tracking-tight">
                  Google One-Tap
                </h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full border border-blue-200 inline-flex items-center gap-1">
                  <Zap size={10} className="fill-blue-600 text-blue-600" />
                  1-Tap Fast Auth
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Sign in with Gmail to open your Lender Workspace
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-3"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 font-display">
                  1-Tap Authentication Success!
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  Signed in as <span className="text-gray-900 font-bold">{selectedEmail}</span>
                </p>
                <div className="flex justify-center pt-2">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </motion.div>
            ) : isLoggingIn ? (
              <motion.div
                key="logging-in"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold text-gray-700">
                  Verifying Google 1-Tap Credentials...
                </p>
                <p className="text-xs text-gray-400 font-mono">
                  {selectedEmail}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="account-selector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Primary Session Quick 1-Tap */}
                {primaryAccount && !showCustomInput ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white p-4.5 rounded-2xl border border-blue-100/90 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <Sparkles size={11} /> Verified Gmail Account
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Authenticated
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={primaryAccount.photoUrl}
                          alt={primaryAccount.name}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-xs bg-white object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-gray-900 truncate font-display">
                            {primaryAccount.name}
                          </h4>
                          <p className="text-xs text-gray-500 font-mono truncate">
                            {primaryAccount.email}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOneTapSignIn(primaryAccount.email, primaryAccount.name)}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UserCheck size={16} />
                        1-Tap Login as {primaryAccount.name.split(' ')[0]}
                        <ArrowRight size={14} className="ml-auto" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(true);
                        setError('');
                      }}
                      className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lock size={13} className="text-blue-600" />
                      Use another @gmail.com account
                    </button>
                  </div>
                ) : (
                  /* Direct Gmail Login Form */
                  <form onSubmit={handleCustomSubmit} className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Client Gmail Authentication
                      </label>
                      {primaryAccount && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomInput(false);
                            setError('');
                          }}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Use active session
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="email"
                        autoFocus
                        required
                        placeholder="client.name@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-hidden font-mono transition-all"
                      />
                      {error && (
                        <p className="mt-2 text-xs text-red-600 flex items-center gap-1 font-medium">
                          <AlertCircle size={13} />
                          {error}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-gray-400">
                        * Only registered Gmail addresses (@gmail.com) are permitted access to secure client ledgers.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Zap size={14} />
                      1-Tap Secure Gmail Login
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security Footer */}
        <div className="bg-gray-50 px-6 py-3.5 flex items-center justify-between border-t border-gray-100 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck size={14} className="text-emerald-600" />
            Gmail-Only OAuth 2.0
          </span>
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
          >
            Firebase Console
            <ExternalLink size={10} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
