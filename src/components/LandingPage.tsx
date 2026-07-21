import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Coins, 
  ArrowRight, 
  Percent, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  DollarSign, 
  Users, 
  PieChart,
  Lock,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

interface LandingPageProps {
  onEnterLender: () => void;
}

export default function LandingPage({ onEnterLender }: LandingPageProps) {
  const [calcAmount, setCalcAmount] = useState(250000);
  const [calcTerm, setCalcTerm] = useState(12);
  const interestRate = 0.20;

  const totalOwed = calcAmount * (1 + interestRate);
  const totalInterest = calcAmount * interestRate;
  const monthlyPayment = totalOwed / calcTerm;

  return (
    <div className="space-y-24 pb-16">
      {/* Dynamic Animated Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_-100px,rgba(59,130,246,0.06),rgba(255,255,255,0))] -z-10"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-8 px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 text-blue-800 text-xs font-semibold rounded-full border border-blue-100"
          >
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Standardized 20% Private Lending Portal
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight font-display leading-tight"
          >
            Predictable Fixed 20% Yields For <span className="text-blue-600">Private Lenders</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed"
          >
            Fund secured business & personal loan contracts at a fixed 20% yield rate. Audit real-time ledgers, manage automated monthly repayment streams, and sign in securely with Google.
          </motion.p>

          {/* Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={onEnterLender}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Lock size={16} />
              Access Lender Portal (Secure Gmail Auth)
              <ArrowRight size={18} />
            </button>
          </motion.div>

          {/* Social Proof Tags */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-500" /> Secure Escrow
            </div>
            <div className="flex items-center gap-1.5">
              <Percent size={16} className="text-emerald-500" /> 20.00% Standard Rate
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-emerald-500" /> Automated Monthly Yields
            </div>
          </motion.div>
        </div>
      </section>

      {/* Structured Platform Benefits (Borrowers vs Lenders) */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6">
        <div>
          {/* FOR LENDERS */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-blue-600"></div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <Coins size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 font-display">Standardized Investment Program</h3>
              <p className="text-sm text-gray-500">Secure high-yielding assets backed by certified repayment contracts.</p>
            </div>

            <ul className="space-y-4 pt-2">
              <li className="flex gap-3 items-start">
                <div className="p-0.5 bg-blue-50 text-blue-600 rounded-full shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Superior 20% Returns</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Diversify away from volatile equities into stable contracts yielding a standardized 20% flat yield.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="p-0.5 bg-blue-50 text-blue-600 rounded-full shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Gmail-Required Integration</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Enterprise Google security keeps lender profiles verified, integrated, and fully secure.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="p-0.5 bg-blue-50 text-blue-600 rounded-full shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Real-Time Yield Tracker</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Watch earnings tick up dynamically, manage active capital, and audit transparent ledger transactions.</p>
                </div>
              </li>
            </ul>

            <div className="pt-4 text-center">
              <button
                onClick={onEnterLender}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Access Lender Dashboard &rarr;
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Dynamic Interactive Calculator Widget */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-br from-gray-900 to-gray-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_300px_at_100%_100%,rgba(59,130,246,0.1),rgba(0,0,0,0))]"></div>
          
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Yield Sandbox</span>
            <h3 className="text-2xl font-bold tracking-tight font-display">Lender Yield Estimator</h3>
            <p className="text-xs text-gray-400">See exactly how much yield your investment earns over the specified term with our standard 20% flat interest program.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-white/10 pt-6">
            
            {/* Input range blocks */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                  <span>Funding Range</span>
                  <span className="text-white text-sm font-mono">₱{calcAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1500000"
                  step="10000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                  <span>Repayment Term</span>
                  <span className="text-white text-sm font-mono">{calcTerm} Months</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="6"
                  value={calcTerm}
                  onChange={(e) => setCalcTerm(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Metric Displays */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-2 gap-x-4 gap-y-6 relative z-10">
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Standard Rate</span>
                <span className="block text-xl font-extrabold text-blue-400 font-display">20.00%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Total Interest</span>
                <span className="block text-xl font-extrabold text-white font-display">₱{totalInterest.toLocaleString()}</span>
              </div>
              <div className="space-y-0.5 col-span-2 border-t border-white/10 pt-4">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide block">Estimated Monthly Pay</span>
                <span className="block text-2xl font-black text-emerald-400 font-display">
                  ₱{monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-sm text-gray-300 font-normal"> / mo</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
