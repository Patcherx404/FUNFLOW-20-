import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('Username or Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    // Static check for user 'patcherx' and password 'Patcherx500'
    // Normalize username comparison just in case
    const normalizedUser = username.trim().toLowerCase();
    const isUserValid = normalizedUser === 'patcherx' || normalizedUser === 'patcherx@gmail.com';
    const isPasswordValid = password === 'Patcherx500';

    if (!isUserValid || !isPasswordValid) {
      setError('Invalid admin credentials. Please try again.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
      onClose();
      // Reset state
      setUsername('');
      setPassword('');
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md overflow-hidden bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800"
      >
        {/* Top Header Controls */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* Admin Shield Icon Header */}
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
              <Shield size={26} />
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold tracking-tight font-display text-white">
              PatcherX Admin Gateway
            </h3>
            <p className="mt-1.5 text-xs text-gray-400">
              Enter your administrative credentials to unlock system tools.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Admin Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="patcherx"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-850 text-white text-sm focus:bg-gray-800 focus:outline-hidden transition-all duration-200 ${
                  error
                    ? 'border-red-500 focus:ring-2 focus:ring-red-950'
                    : 'border-gray-800 focus:ring-2 focus:ring-indigo-950/50 focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-11 py-3 rounded-xl border bg-gray-850 text-white text-sm focus:bg-gray-800 focus:outline-hidden transition-all duration-200 ${
                    error
                      ? 'border-red-500 focus:ring-2 focus:ring-red-950'
                      : 'border-gray-800 focus:ring-2 focus:ring-indigo-950/50 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5 font-medium leading-relaxed">
                  <AlertCircle size={13} />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={14} />
                  Authorize & Enter
                </>
              )}
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-950/50 px-8 py-3.5 flex items-center justify-between border-t border-gray-850 text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block animate-pulse"></span>
            Superuser Session Node
          </span>
          <span>Version 2.0.1</span>
        </div>
      </motion.div>
    </div>
  );
}
