import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Coins, 
  User, 
  Lock, 
  Info, 
  Shield,
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Globe,
  Plus,
  Percent
} from 'lucide-react';
import { Loan, Transaction, Lender } from './types';
import { INITIAL_LOANS, INITIAL_TRANSACTIONS } from './data';
import LandingPage from './components/LandingPage';
import GoogleSignIn from './components/GoogleSignIn';
import LenderDashboard from './components/LenderDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPortal from './components/AdminPortal';
import ClientDashboard from './components/ClientDashboard';

export default function App() {
  // Global States persisted in localStorage
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentLender, setCurrentLender] = useState<Lender | null>(null);
  
  // Navigation / View states
  const [currentView, setCurrentView] = useState<'landing' | 'lender' | 'client' | 'admin'>('landing');
  const [isGoogleSignInOpen, setIsGoogleSignInOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Initialize and load from localstorage
  useEffect(() => {
    const cachedLoans = localStorage.getItem('fundflow_loans');
    const cachedTxs = localStorage.getItem('fundflow_txs');
    const cachedLender = localStorage.getItem('fundflow_lender');

    if (cachedLoans) {
      const parsedLoans = JSON.parse(cachedLoans) as Loan[];
      const containsOldData = parsedLoans.some(loan => loan.borrowerEmail === 'maria.santos@gmail.com');
      
      if (containsOldData) {
        // Reset state and cache to new loans and transactions
        setLoans(INITIAL_LOANS);
        localStorage.setItem('fundflow_loans', JSON.stringify(INITIAL_LOANS));
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem('fundflow_txs', JSON.stringify(INITIAL_TRANSACTIONS));
      } else {
        setLoans(parsedLoans);
      }
    } else {
      setLoans(INITIAL_LOANS);
      localStorage.setItem('fundflow_loans', JSON.stringify(INITIAL_LOANS));
    }

    if (cachedTxs) {
      const parsedTxs = JSON.parse(cachedTxs) as Transaction[];
      const containsOldTx = parsedTxs.some(tx => tx.loanId === 'loan-1' && tx.loanName === 'Maria Santos');
      
      if (containsOldTx) {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem('fundflow_txs', JSON.stringify(INITIAL_TRANSACTIONS));
      } else {
        setTransactions(parsedTxs);
      }
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('fundflow_txs', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    if (cachedLender) {
      try {
        const parsed = JSON.parse(cachedLender);
        if (parsed && parsed.email) {
          const perEmailSaved = localStorage.getItem(`fundflow_lender_${parsed.email}`);
          if (perEmailSaved) {
            setCurrentLender(JSON.parse(perEmailSaved));
          } else {
            setCurrentLender(parsed);
          }
        } else {
          setCurrentLender(parsed);
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  // Utility to save to localStorage
  const saveState = (updatedLoans: Loan[], updatedTxs: Transaction[], updatedLender: Lender | null) => {
    setLoans(updatedLoans);
    setTransactions(updatedTxs);
    setCurrentLender(updatedLender);
    
    localStorage.setItem('fundflow_loans', JSON.stringify(updatedLoans));
    localStorage.setItem('fundflow_txs', JSON.stringify(updatedTxs));
    if (updatedLender) {
      localStorage.setItem('fundflow_lender', JSON.stringify(updatedLender));
      localStorage.setItem(`fundflow_lender_${updatedLender.email}`, JSON.stringify(updatedLender));
    } else {
      localStorage.removeItem('fundflow_lender');
    }
  };

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Submit a brand new loan request (Auto-approved & instantly Active/Repaying)
  const handleSubmitLoan = (newLoan: {
    businessName: string;
    category: string;
    description: string;
    requestedAmount: number;
    termMonths: number;
    borrowerEmail: string;
  }) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `loan-${newLoan.businessName.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}-${randomSuffix}`;

    const loanObj: Loan = {
      id: generatedId,
      businessName: newLoan.businessName,
      category: newLoan.category,
      description: newLoan.description,
      requestedAmount: newLoan.requestedAmount,
      fundedAmount: 0,
      termMonths: newLoan.termMonths,
      interestRate: 0.20, // 20% interest rate mandated
      status: 'PENDING', // Awaiting manual review and approval in live loan manager
      createdAt: new Date().toISOString().split('T')[0],
      borrowerEmail: newLoan.borrowerEmail,
      lenderId: null,
      paymentsMade: 0,
      totalPaid: 0
    };

    const updatedLoans = [loanObj, ...loans];

    saveState(updatedLoans, transactions, currentLender);
    showToast(`Successfully submitted credit request for ${newLoan.businessName}! It is now awaiting System Admin review.`, 'success');
    return generatedId;
  };

  // 2. Fund an open loan request from the marketplace
  const handleFundLoan = (loanId: string) => {
    if (!currentLender) return;

    const targetLoanIndex = loans.findIndex(l => l.id === loanId);
    if (targetLoanIndex === -1) return;

    const loan = loans[targetLoanIndex];
    if (currentLender.balance < loan.requestedAmount) {
      showToast('Insufficient balance to fund this request', 'info');
      return;
    }

    // Process funding
    const updatedLender: Lender = {
      ...currentLender,
      balance: currentLender.balance - loan.requestedAmount
    };

    const updatedLoans = [...loans];
    updatedLoans[targetLoanIndex] = {
      ...loan,
      fundedAmount: loan.requestedAmount,
      status: 'REPAYING',
      lenderId: currentLender.email
    };

    // Append standard transaction log
    const txObj: Transaction = {
      id: `tx-fund-${Date.now()}`,
      loanId: loan.id,
      loanName: loan.businessName,
      type: 'FUNDING',
      amount: loan.requestedAmount,
      timestamp: new Date().toISOString(),
      sender: currentLender.email,
      receiver: loan.borrowerEmail
    };

    const updatedTxs = [txObj, ...transactions];
    saveState(updatedLoans, updatedTxs, updatedLender);
    showToast(`Funded ${loan.businessName} successfully at 20% yields!`, 'success');
  };

  // 3. Make a simulated repayment
  const handleMakeRepayment = (
    loanId: string, 
    paymentAmount: number, 
    paymentType: 'standard' | 'interest-only' = 'standard'
  ) => {
    const targetLoanIndex = loans.findIndex(l => l.id === loanId);
    if (targetLoanIndex === -1) return;

    const loan = loans[targetLoanIndex];
    const updatedLoans = [...loans];
    
    // total pay is principal + 20%
    const totalExpectedPayout = loan.requestedAmount * 1.20;
    const standardAmortized = totalExpectedPayout / loan.termMonths;
    const interestAmortized = (loan.requestedAmount * 0.20) / loan.termMonths;

    const actualPayAmount = paymentType === 'interest-only' ? interestAmortized : standardAmortized;

    let isLastPayment = false;
    let newPaymentsCount = loan.paymentsMade;
    let newTotalPaid = loan.totalPaid;
    let newInterestOnlyPaid = loan.interestOnlyPaid || 0;

    if (paymentType === 'interest-only') {
      newTotalPaid = Math.min(totalExpectedPayout, loan.totalPaid + interestAmortized);
      newInterestOnlyPaid += interestAmortized;
    } else {
      isLastPayment = loan.paymentsMade + 1 >= loan.termMonths;
      newPaymentsCount = loan.paymentsMade + 1;
      newTotalPaid = Math.min(totalExpectedPayout, loan.totalPaid + standardAmortized);
    }

    let nextExtPaid = loan.interestOnlyExtensionPaidThisPeriod;
    let nextExtAllowed = loan.interestOnlyExtensionAllowed;
    let nextExtensionDays = loan.extensionDays || (loan.interestOnlyExtensionAllowed ? 15 : 0);

    if (paymentType === 'interest-only') {
      nextExtPaid = true;
      // Auto extend 15 days when interest-only payment is made
      nextExtensionDays += 15;
    } else {
      // If standard repayment, reset the extension status since they paid the full loan installment
      nextExtPaid = false;
      nextExtAllowed = false;
    }

    updatedLoans[targetLoanIndex] = {
      ...loan,
      paymentsMade: newPaymentsCount,
      totalPaid: newTotalPaid,
      interestOnlyPaid: newInterestOnlyPaid,
      interestOnlyExtensionAllowed: nextExtAllowed,
      interestOnlyExtensionPaidThisPeriod: nextExtPaid,
      extensionDays: nextExtensionDays > 0 ? nextExtensionDays : undefined,
      status: isLastPayment ? 'PAID' : 'REPAYING'
    };

    // Calculate how much lender receives
    let updatedLender = currentLender;
    if (currentLender && loan.lenderId === currentLender.email) {
      updatedLender = {
        ...currentLender,
        balance: currentLender.balance + actualPayAmount
      };
    }

    // Append transaction
    const txObj: Transaction = {
      id: `tx-repay-${Date.now()}`,
      loanId: loan.id,
      loanName: loan.businessName,
      type: 'REPAYMENT',
      amount: actualPayAmount,
      timestamp: new Date().toISOString(),
      sender: loan.borrowerEmail,
      receiver: loan.lenderId || 'Platform Escrow'
    };

    const updatedTxs = [txObj, ...transactions];
    saveState(updatedLoans, updatedTxs, updatedLender);

    if (paymentType === 'interest-only') {
      showToast(`Registered Interest-Only payment of ₱${Math.round(interestAmortized).toLocaleString()} for ${loan.businessName}. Principal is untouched.`, 'success');
    } else if (isLastPayment) {
      showToast(`Congratulations! Loan contract for ${loan.businessName} has been fully repaid via GCash!`, 'success');
    } else {
      showToast(`Successfully registered monthly repayment of ₱${Math.round(standardAmortized).toLocaleString()} for ${loan.businessName} via GCash.`, 'success');
    }
  };

  // 4. Update lender wallet balance (Deposit / Withdraw)
  const handleUpdateLenderBalance = (amount: number, type: 'DEPOSIT' | 'WITHDRAW') => {
    if (!currentLender) return;
    const newBalance = type === 'DEPOSIT' 
      ? currentLender.balance + amount 
      : Math.max(0, currentLender.balance - amount);

    const updatedLender: Lender = {
      ...currentLender,
      balance: newBalance
    };

    // Create a transaction record
    const randomTxId = `tx-wallet-${Math.floor(10000 + Math.random() * 90000)}`;
    const txObj: Transaction = {
      id: randomTxId,
      timestamp: new Date().toISOString(),
      loanId: 'wallet',
      loanName: type === 'DEPOSIT' ? 'Capital Wallet Cash In' : 'Capital Wallet Withdrawal',
      type: type === 'DEPOSIT' ? 'REPAYMENT' : 'FUNDING',
      amount: amount,
      sender: type === 'DEPOSIT' ? 'Bank Gateway' : currentLender.email,
      receiver: type === 'DEPOSIT' ? currentLender.email : 'Bank Account'
    };

    const updatedTxs = [txObj, ...transactions];
    saveState(loans, updatedTxs, updatedLender);
    showToast(type === 'DEPOSIT' 
      ? `Deposited ₱${amount.toLocaleString()} into your Capital Wallet balance!` 
      : `Withdrew ₱${amount.toLocaleString()} from your Capital Wallet balance!`, 'success');
  };

  // Simulate a new borrower submitting a credit request
  const handleSimulateNewMarketplaceLoan = () => {
    const mockBusinesses = [
      { businessName: "Luzon Agricultural Tech", category: "Agriculture", description: "SME financing to procure organic fertilizers and smart drip irrigation systems for sustainable harvest yields." },
      { businessName: "Visayas Fishery Co.", category: "Fisheries", description: "Revolving capital to secure solar-powered cold storage preservation bins for deep-sea fish exports." },
      { businessName: "Mindanao Solar Grid", category: "Green Energy", description: "Bridge loan to finance off-grid monocrystalline panel modules for high-altitude micro-farms." },
      { businessName: "Manila Logistics Express", category: "Logistics", description: "Fleet upgrade for five delivery electric tricycles to optimize low-emission urban distribution." }
    ];
    
    const randomBiz = mockBusinesses[Math.floor(Math.random() * mockBusinesses.length)];
    const requestedAmount = Math.floor(2 + Math.random() * 9) * 1000; // ₱2,000 to ₱10,000
    const termMonths = [6, 12, 18][Math.floor(Math.random() * 3)];
    
    handleSubmitLoan({
      businessName: `${randomBiz.businessName} #${Math.floor(10 + Math.random() * 89)}`,
      category: randomBiz.category,
      description: randomBiz.description,
      requestedAmount: requestedAmount,
      termMonths: termMonths,
      borrowerEmail: `borrower.${Math.floor(100 + Math.random() * 899)}@gmail.com`
    });
  };

  const handleLenderAuthSuccess = (lender: Lender) => {
    // Check if there is an existing saved profile for this email address
    const savedKey = `fundflow_lender_${lender.email}`;
    const cachedForEmail = localStorage.getItem(savedKey);
    let finalLender = lender;
    if (cachedForEmail) {
      try {
        finalLender = JSON.parse(cachedForEmail);
      } catch (e) {
        finalLender = lender;
      }
    } else {
      localStorage.setItem(savedKey, JSON.stringify(lender));
    }

    // Save to the registered lenders list in localStorage
    const emailsRaw = localStorage.getItem('fundflow_registered_lenders');
    let emails: string[] = emailsRaw ? JSON.parse(emailsRaw) : [];
    if (!emails.includes(finalLender.email)) {
      emails.push(finalLender.email);
      localStorage.setItem('fundflow_registered_lenders', JSON.stringify(emails));
    }

    saveState(loans, transactions, finalLender);
    setCurrentView('lender');
    showToast(`Welcome back, ${finalLender.name}! Portal unlocked.`, 'success');
  };

  const handleLogout = () => {
    saveState(loans, transactions, null);
    setCurrentView('landing');
    showToast('Secure session logged out.', 'info');
  };

  // Nav block access
  const handleEnterLenderPortal = () => {
    if (currentLender) {
      setCurrentView('lender');
    } else {
      setIsGoogleSignInOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfcff] text-gray-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Platform Header Navigation - Hidden in Admin View for distraction-free operations */}
      {currentView !== 'admin' && (
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div 
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Percent size={18} className="font-bold text-white" />
              </div>
              <div>
                <span className="block text-sm font-extrabold tracking-tight text-gray-900 font-display">FundFlow 20%</span>
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block leading-none">Standardized Lending</span>
              </div>
            </div>

            {/* Quick tab switchers */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentView('landing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  currentView === 'landing'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Public Program
              </button>
              <button
                onClick={() => setCurrentView('client')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  currentView === 'client'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Client Workspace
              </button>
              <button
                onClick={handleEnterLenderPortal}
                className={`inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  currentView === 'lender'
                    ? 'bg-gray-900 text-white font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Lock size={11} className="text-gray-400" />
                Lender Workspace
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Container Stage */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              <LandingPage 
                onEnterLender={handleEnterLenderPortal}
              />
            </motion.div>
          )}

          {currentView === 'client' && (
            <motion.div
              key={`client-view-${currentLender?.email || 'guest'}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              <ClientDashboard 
                key={currentLender?.email || 'guest'}
                loans={loans} 
                currentUserEmail={currentLender?.email}
                onMakeRepayment={(loanId, paymentType) => handleMakeRepayment(loanId, 0, paymentType)}
                onApplyLoan={handleSubmitLoan}
              />
            </motion.div>
          )}

          {currentView === 'lender' && currentLender && (
            <motion.div
              key={`lender-view-${currentLender.email}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LenderDashboard 
                key={currentLender.email}
                lender={currentLender}
                loans={loans}
                transactions={transactions}
                onFundLoan={handleFundLoan}
                onLogout={handleLogout}
                onSimulateBorrowerPayment={(loanId, paymentType) => handleMakeRepayment(loanId, 0, paymentType)}
                onUpdateLenderBalance={handleUpdateLenderBalance}
                onSimulateNewMarketplaceLoan={handleSimulateNewMarketplaceLoan}
                onApplyLoan={handleSubmitLoan}
              />
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AdminPortal 
                loans={loans}
                transactions={transactions}
                onUpdateState={(updatedLoans, updatedTxs) => saveState(updatedLoans, updatedTxs, currentLender)}
                onLogout={() => {
                  setCurrentView('landing');
                  showToast('Admin session securely cleared.', 'info');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Global Banner Info */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-xs text-gray-400 font-medium space-y-2 mt-auto">
        <div className="flex justify-center items-center gap-1.5 text-gray-500 font-semibold mb-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          FundFlow Standard SME Escrow Trust V2.0
        </div>
        <p className="max-w-md mx-auto px-4">
          All investments carry risk. Our 20.00% fixed interest contracts are collateralized by certified business assets. Secure Google OAuth prevents fraud and coordinates secure pay-outs.
        </p>
        <p className="pt-4 text-[10px] text-gray-300">
          &copy; 2026 FundFlow Technologies. All Rights Reserved.
        </p>
        
        {/* Subtle Elegant Admin Login Trigger */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => setIsAdminLoginOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 border border-gray-200/80 rounded-lg transition-all cursor-pointer text-[10px] font-semibold shadow-xs"
          >
            <Shield size={11} />
            Secure Admin Gateway
          </button>
        </div>
      </footer>

      {/* Google Authentication Popover */}
      <GoogleSignIn 
        isOpen={isGoogleSignInOpen}
        onClose={() => setIsGoogleSignInOpen(false)}
        onSuccess={handleLenderAuthSuccess}
      />

      {/* Admin Gateway Login popover */}
      <AdminLoginModal 
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setCurrentView('admin');
          showToast('Welcome back, System Admin. Gateway open.', 'success');
        }}
      />

      {/* Floating Dynamic Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-gray-900 text-white rounded-xl shadow-xl p-4 border border-white/10 flex items-start gap-3"
          >
            <div className="bg-emerald-500 text-white p-1 rounded-md shrink-0 mt-0.5">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">System Event Alert</p>
              <p className="text-sm text-white mt-1 leading-normal font-medium">{toastMessage.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
