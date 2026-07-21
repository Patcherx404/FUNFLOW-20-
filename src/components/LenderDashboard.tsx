import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  CheckCircle, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Lock, 
  ChevronRight, 
  Info,
  DollarSign,
  Briefcase,
  AlertCircle,
  Activity,
  LogOut,
  X,
  ShieldCheck,
  User,
  MapPin,
  Upload,
  Trash2,
  Eye,
  FileText,
  Check,
  ShieldAlert,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Loan, Transaction, Lender } from '../types';

interface LenderDashboardProps {
  lender: Lender;
  loans: Loan[];
  transactions: Transaction[];
  onFundLoan: (loanId: string) => void;
  onLogout: () => void;
  onSimulateBorrowerPayment: (loanId: string, paymentType?: 'standard' | 'interest-only') => void;
  onUpdateLenderBalance: (amount: number, type: 'DEPOSIT' | 'WITHDRAW') => void;
  onSimulateNewMarketplaceLoan: () => void;
  onApplyLoan: (newLoan: {
    businessName: string;
    category: string;
    description: string;
    requestedAmount: number;
    termMonths: number;
    borrowerEmail: string;
  }) => string;
}

export default function LenderDashboard({
  lender,
  loans,
  transactions,
  onFundLoan,
  onLogout,
  onSimulateBorrowerPayment,
  onUpdateLenderBalance,
  onSimulateNewMarketplaceLoan,
  onApplyLoan
}: LenderDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'transactions' | 'live-manager'>('overview');
  const [fundingAmountInput, setFundingAmountInput] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');
  const [selectedMarketplaceLoan, setSelectedMarketplaceLoan] = useState<Loan | null>(null);
  const [isFundingSuccess, setIsFundingSuccess] = useState(false);
  const [tickValue, setTickValue] = useState<number>(0);

  // Lender profile and verification (KYC) states
  const [lenderName, setLenderName] = useState<string>(() => {
    return localStorage.getItem(`lender_name_${lender.email}`) || lender.name;
  });
  const [lenderAddress, setLenderAddress] = useState<string>(() => {
    return localStorage.getItem(`lender_address_${lender.email}`) || '';
  });
  const [lenderIdType, setLenderIdType] = useState<string>(() => {
    return localStorage.getItem(`lender_id_type_${lender.email}`) || 'National ID';
  });
  const [lenderIdDoc, setLenderIdDoc] = useState<{ name: string; size: string; previewUrl: string } | null>(() => {
    const saved = localStorage.getItem(`lender_id_doc_${lender.email}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [verificationStatus, setVerificationStatus] = useState<'UNVERIFIED' | 'SUBMITTED' | 'VERIFIED'>(() => {
    return (localStorage.getItem(`lender_verification_status_${lender.email}`) as any) || 'UNVERIFIED';
  });
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [isPreviewingId, setIsPreviewingId] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Apply Loan Modal Form states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyFormRepaymentType, setApplyFormRepaymentType] = useState<'daily-30' | 'daily-15' | 'lump-15'>('daily-15');
  const [applyFormRequestedAmount, setApplyFormRequestedAmount] = useState('1000');
  const [applyFormError, setApplyFormError] = useState<string | null>(null);

  const activeLoan = loans.find(l => l.status !== 'PAID');
  const hasActiveLoan = !!activeLoan;

  const handleApplyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyFormError(null);

    if (hasActiveLoan) {
      setApplyFormError(`Active Loan Existing: You currently have an active loan (${activeLoan.businessName} - Status: ${activeLoan.status}). You cannot apply for a new loan until your active loan is fully repaid and closed.`);
      return;
    }

    if (verificationStatus !== 'VERIFIED') {
      setApplyFormError("Safety Requirement: You are required to fill up and submit your Lender KYC & Identity Profile before applying for a loan.");
      return;
    }

    let amount = parseFloat(applyFormRequestedAmount);
    if (applyFormRepaymentType === 'daily-30' || applyFormRepaymentType === 'daily-15' || applyFormRepaymentType === 'lump-15') {
      amount = 1000;
    }

    if (isNaN(amount) || amount < 100 || amount > 150000) {
      setApplyFormError("Requested amount must be between ₱100 and ₱150,000.");
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    let dynamicDesc = '';
    let terms = 15;

    if (applyFormRepaymentType === 'daily-30') {
      dynamicDesc = `30-day micro-repayment cycle of ₱40.00 daily`;
      terms = 30;
    } else if (applyFormRepaymentType === 'daily-15') {
      const calculatedDaily = (amount * 1.20) / 15;
      dynamicDesc = `15-day micro-repayment cycle of ₱${calculatedDaily.toFixed(2)} daily`;
      terms = 15;
    } else {
      dynamicDesc = `15-day term, single 1-time payment of ₱${(amount * 1.20).toFixed(2)} with 20% interest`;
      terms = 15; // standard micro contract is 15 days or periods
    }

    onApplyLoan({
      businessName: `Peer Loan #${randomSuffix}`,
      category: 'Microfinance',
      description: dynamicDesc,
      requestedAmount: amount,
      termMonths: terms,
      borrowerEmail: `borrower.${Math.floor(100 + Math.random() * 899)}@gmail.com`
    });

    // Reset Form
    setApplyFormRequestedAmount('1000');
    setApplyFormRepaymentType('daily-15');
    setIsApplyModalOpen(false);
  };

  const handleAutofillDemo = () => {
    const demoName = "Arthur Pendragon";
    const demoAddress = "Suite 300, 88 Corporate Avenue, Ortigas Center, Pasig City, Metro Manila";
    const demoIdType = "Passport";
    const demoIdDoc = {
      name: "passport_scan_lender_demo.jpg",
      size: "1.2 MB",
      previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
    };

    setLenderName(demoName);
    setLenderAddress(demoAddress);
    setLenderIdType(demoIdType);
    setLenderIdDoc(demoIdDoc);

    localStorage.setItem(`lender_name_${lender.email}`, demoName);
    localStorage.setItem(`lender_address_${lender.email}`, demoAddress);
    localStorage.setItem(`lender_id_type_${lender.email}`, demoIdType);
    localStorage.setItem(`lender_id_doc_${lender.email}`, JSON.stringify(demoIdDoc));
  };

  const handleIdDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingId(true);
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      const doc = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        previewUrl: fakeUrl
      };
      setLenderIdDoc(doc);
      localStorage.setItem(`lender_id_doc_${lender.email}`, JSON.stringify(doc));
      setIsUploadingId(false);
    }, 1000);
  };

  const handleRemoveIdDoc = () => {
    setLenderIdDoc(null);
    localStorage.removeItem(`lender_id_doc_${lender.email}`);
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!lenderName.trim()) {
      setFormError("Please enter your legal name.");
      return;
    }
    if (!lenderAddress.trim()) {
      setFormError("Please enter your residential address.");
      return;
    }
    if (!lenderIdDoc) {
      setFormError("Please upload your government-issued ID card scan.");
      return;
    }

    setVerificationStatus('SUBMITTED');
    localStorage.setItem(`lender_verification_status_${lender.email}`, 'SUBMITTED');

    // Store in global registered list
    const emailsRaw = localStorage.getItem('fundflow_registered_lenders');
    let emails: string[] = emailsRaw ? JSON.parse(emailsRaw) : [];
    if (!emails.includes(lender.email)) {
      emails.push(lender.email);
      localStorage.setItem('fundflow_registered_lenders', JSON.stringify(emails));
    }

    setTimeout(() => {
      setVerificationStatus('VERIFIED');
      localStorage.setItem(`lender_verification_status_${lender.email}`, 'VERIFIED');
      localStorage.setItem(`lender_name_${lender.email}`, lenderName);
      localStorage.setItem(`lender_address_${lender.email}`, lenderAddress);
      localStorage.setItem(`lender_id_type_${lender.email}`, lenderIdType);
    }, 1500);
  };

  const handleResetVerification = () => {
    setShowResetConfirm(true);
  };

  const confirmResetVerification = () => {
    setVerificationStatus('UNVERIFIED');
    setLenderAddress('');
    setLenderIdDoc(null);
    localStorage.removeItem(`lender_verification_status_${lender.email}`);
    localStorage.removeItem(`lender_address_${lender.email}`);
    localStorage.removeItem(`lender_id_doc_${lender.email}`);
    setShowResetConfirm(false);
    setFormError(null);
  };

  // Filter lender's active and historical loans
  const myPortfolio = loans.filter(l => l.lenderId === lender.email);
  const marketplaceLoans = loans.filter(l => l.status === 'MARKETPLACE');

  // Calculated lender stats
  const totalInvested = myPortfolio.reduce((acc, curr) => acc + curr.requestedAmount, 0);
  const activeCapital = myPortfolio
    .filter(l => l.status === 'REPAYING')
    .reduce((acc, curr) => acc + curr.requestedAmount, 0);
  
  // Dynamic Approved Loan stat:
  // Reflect the requestedAmount of the latest approved or active loan for this lender.
  const activeRepayingLoans = loans.filter(l => (l.status === 'REPAYING' || l.status === 'PAID') && l.lenderId === lender.email);
  const latestApprovedLoanAmount = activeRepayingLoans.length > 0 
    ? activeRepayingLoans[0].requestedAmount 
    : 1000;
  
  // 20% fixed interest rate yield calculations
  const totalExpectedInterest = myPortfolio.reduce((acc, curr) => acc + (curr.requestedAmount * curr.interestRate), 0);
  const actualInterestEarned = myPortfolio.reduce((acc, curr) => {
    if (curr.status === 'PAID') {
      return acc + (curr.requestedAmount * curr.interestRate);
    }
    // approximate based on payment progress
    const shareOfPrincipalPaid = curr.paymentsMade / curr.termMonths;
    const interestPerPayment = (curr.requestedAmount * curr.interestRate) / curr.termMonths;
    return acc + (interestPerPayment * curr.paymentsMade);
  }, 0);

  // Simulated live-ticking interest yield based on active capital at 20% APR
  // 20% of active capital per year -> activeCapital * 0.20
  // Per second = (activeCapital * 0.20) / (365 * 24 * 60 * 60)
  const interestPerSecond = activeCapital > 0 ? (activeCapital * 0.20) / (365 * 24 * 60 * 60) : 0;

  useEffect(() => {
    if (interestPerSecond === 0) return;
    
    const interval = setInterval(() => {
      setTickValue(prev => prev + interestPerSecond);
    }, 100); // tick every 100ms for extra fluid, real-time feel!
    
    return () => clearInterval(interval);
  }, [interestPerSecond]);

  const handleFundConfirm = (loan: Loan) => {
    if (lender.balance < loan.requestedAmount) {
      alert("Insufficient funds in your Capital Wallet balance. Please add virtual capital to fund this request.");
      return;
    }
    onFundLoan(loan.id);
    setIsFundingSuccess(true);
    setTimeout(() => {
      setIsFundingSuccess(false);
      setSelectedMarketplaceLoan(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Upper Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 text-emerald-600 p-2.5 rounded-xl border border-emerald-500/15">
              <Coins size={22} className="text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Secure Lenders Portal</span>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight font-display flex items-center gap-1.5">
                FundFlow Lenders
                <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Gmail Secure
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-full">
              <img 
                src={lender.photoUrl} 
                alt="Profile" 
                className="w-7 h-7 rounded-full bg-blue-100 border border-white shadow-xs"
              />
              <div className="text-left leading-none">
                <span className="block text-xs font-semibold text-gray-800">{lender.name}</span>
                <span className="text-[10px] text-gray-400">{lender.email}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Real-time Ticker & Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats Block 1: Approved Loan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-300 text-emerald-600">
              <ShieldCheck size={120} />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved Loan</p>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display mt-2">
                  ₱{latestApprovedLoanAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <ShieldCheck size={20} />
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
              {loans.some(l => l.id === 'loan-3' && l.status === 'MARKETPLACE') ? (
                <button
                  onClick={() => {
                    const firstLoan = loans.find(l => l.id === 'loan-3');
                    if (firstLoan) {
                      onFundLoan(firstLoan.id);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer animate-pulse hover:animate-none"
                >
                  <CheckCircle size={14} />
                  Approve First Loan (₱1,000)
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  First Loan Approved • Funds Ready for Disbursement
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Block 2: Invested Principal */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-300 text-indigo-600">
              <Briefcase size={120} />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Loan</p>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display mt-2">
                  ₱{totalInvested.toLocaleString()}
                </h3>
              </div>
              <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <Briefcase size={20} />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-sm text-[10px]">
                  20% APR
                </span>
                Fixed Interest Rate
              </div>
              <span className="font-semibold text-indigo-600">{myPortfolio.length} Loan Contracts</span>
            </div>
          </div>
        </div>

        {/* Workspace Tab Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-gray-200 pb-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTab === 'portfolio'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              My Contracts ({myPortfolio.length})
            </button>
            <button
              onClick={() => setActiveTab('live-manager')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'live-manager'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Activity size={14} className={activeTab === 'live-manager' ? 'text-emerald-400' : 'text-gray-500'} />
              Live Loan Manager
              {marketplaceLoans.length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded-full animate-pulse">
                  {marketplaceLoans.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Transaction Audit Log
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
            >
              <Plus size={14} />
              Apply for Loan
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              <Lock size={12} className="text-gray-400" />
              <span>Encrypted Session (2048-bit)</span>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Promotional Rate Banner */}
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Lenders Offer
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 font-display">
                    Maximize Yields at 20.00% Fixed Interest
                  </h4>
                  <p className="text-sm text-gray-600 max-w-xl leading-relaxed">
                    All personal loans sourced on our platform feature a mandatory, verified 20% flat interest rate, backed by verified peer agreements and reliable repayment plans.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  View My Portfolio
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Analytical Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Portfolio Health */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={16} className="text-emerald-500" />
                    Portfolio Activity & Performance Tracker
                  </h4>
                  {myPortfolio.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                      <Briefcase size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">You do not have any active loan contracts yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Please use the Admin Gateway or wait for automated client profiling.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Repayment Progress Info inside Portfolio Overview */}
                      <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                        <div className="flex items-start gap-2.5">
                          <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-bold text-indigo-900">P2P Repayment Tracker</h5>
                            <p className="text-[11px] text-indigo-700 mt-0.5">
                              Track your active borrower contracts, cumulative amortized payouts, and automated interest yield in real-time.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100 text-xs text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                              <th className="py-3 px-4">Borrower & Purpose</th>
                              <th className="py-3 px-4">Invested</th>
                              <th className="py-3 px-4">Yield (20%)</th>
                              <th className="py-3 px-4">Progress</th>
                              <th className="py-3 px-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-sm">
                            {myPortfolio.map((loan) => {
                              const projectedPayout = loan.requestedAmount * 1.20;
                              const progressPct = Math.round((loan.totalPaid / projectedPayout) * 100) || 0;
                              return (
                                <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 px-4">
                                    <div className="font-semibold text-gray-900">{loan.businessName}</div>
                                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                                      <span>{loan.category}</span>
                                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                      <span>{loan.termMonths === 30 ? '30 Days to Pay' : loan.termMonths === 15 ? '15 Days to Pay' : loan.termMonths === 1 ? '15 Days (1-Time Pay)' : `${loan.termMonths} Mo Contract`}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 font-semibold text-gray-800">
                                    ₱{loan.requestedAmount.toLocaleString()}
                                  </td>
                                  <td className="py-4 px-4 font-mono text-emerald-600 font-semibold">
                                    +₱{(loan.requestedAmount * 0.20).toLocaleString()}
                                  </td>
                                  <td className="py-4 px-4 min-w-[140px]">
                                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                                      <span className="text-gray-500">₱{loan.totalPaid.toLocaleString()} paid</span>
                                      <span className="text-emerald-600">{progressPct}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPct}%` }}
                                      ></div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    {loan.status === 'PAID' ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                                        <CheckCircle size={10} /> Fully Repaid
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                                        <Activity size={10} className="animate-pulse" /> Repaying
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Investment Distribution / Metrics Checklist */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Yield Multipliers & Risks
                  </h4>

                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">20% APR Guaranteed</h5>
                        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                          Your portfolio operates under a strictly standardized platform contract yielding exactly 20.00% fixed on funded amounts.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Lender Protection Fund</h5>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                          Each loan is collateralized. Our platform matches borrower requests with certified asset backing to secure your principal.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Monthly Payback Flow</h5>
                        <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                          Borrowers make regular payments consisting of amortized principal plus interest, ensuring your liquidity stays high.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Lenders Profile & KYC Verification Row */}
              <div id="kyc-profile-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Left Side Form / Display */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs lg:col-span-2 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 font-display">
                          Lender KYC & Identity Profile
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Complete verification to certify your status as a registered peer funder.
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {verificationStatus === 'UNVERIFIED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                          <ShieldAlert size={12} className="animate-bounce" />
                          Unverified Draft
                        </span>
                      )}
                      {verificationStatus === 'SUBMITTED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                          Under Auditing...
                        </span>
                      )}
                      {verificationStatus === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                          <Check size={12} className="text-emerald-600" />
                          KYC Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {verificationStatus === 'UNVERIFIED' || verificationStatus === 'SUBMITTED' ? (
                    <form onSubmit={handleSubmitVerification} className="space-y-5">
                      {formError && (
                        <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2 text-xs text-red-800 font-semibold animate-pulse">
                          <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Legal Name */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Full Legal Name
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                              <User size={15} />
                            </span>
                            <input
                              type="text"
                              required
                              value={lenderName}
                              onChange={(e) => setLenderName(e.target.value)}
                              disabled={verificationStatus === 'SUBMITTED'}
                              placeholder="e.g. Juan dela Cruz"
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60"
                            />
                          </div>
                        </div>

                        {/* ID Type Dropdown */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Government Issued ID Type
                          </label>
                          <select
                            value={lenderIdType}
                            onChange={(e) => setLenderIdType(e.target.value)}
                            disabled={verificationStatus === 'SUBMITTED'}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60"
                          >
                            <option value="National ID">National ID Card</option>
                            <option value="Passport">Passport</option>
                            <option value="Driver's License">Driver's License</option>
                            <option value="Unified Multi-Purpose ID (UMID)">UMID / Government ID</option>
                          </select>
                        </div>
                      </div>

                      {/* Residential Address */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Residential Address
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <MapPin size={15} />
                          </span>
                          <input
                            type="text"
                            required
                            value={lenderAddress}
                            onChange={(e) => setLenderAddress(e.target.value)}
                            disabled={verificationStatus === 'SUBMITTED'}
                            placeholder="e.g. Unit 123, Tower A, One Corporate Place, Makati City"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60"
                          />
                        </div>
                      </div>

                      {/* ID Photo Upload Section */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Upload Government ID Scan / Photo
                        </label>

                        {lenderIdDoc ? (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <FileText size={18} />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-bold text-gray-800 truncate">{lenderIdDoc.name}</span>
                                <span className="block text-[10px] text-gray-400">{lenderIdDoc.size}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsPreviewingId(true)}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-gray-100 rounded-lg transition-all cursor-pointer"
                                title="Preview ID document scan"
                              >
                                <Eye size={15} />
                              </button>
                              {verificationStatus !== 'SUBMITTED' && (
                                <button
                                  type="button"
                                  onClick={handleRemoveIdDoc}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-white border border-transparent hover:border-gray-100 rounded-lg transition-all cursor-pointer"
                                  title="Remove ID document"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative group">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              disabled={verificationStatus === 'SUBMITTED' || isUploadingId}
                              onChange={handleIdDocUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                            />
                            <div className="p-8 border-2 border-dashed border-gray-200 group-hover:border-indigo-500 rounded-xl bg-gray-50 group-hover:bg-indigo-50/10 text-center transition-all">
                              {isUploadingId ? (
                                <div className="space-y-2">
                                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                  <span className="block text-xs text-indigo-600 font-bold">Scanning ID document files...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload size={24} className="mx-auto text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                                  <p className="text-xs font-bold text-gray-700">Drag and drop or click to upload ID card photo</p>
                                  <p className="text-[10px] text-gray-400 mt-1">Accepts JPG, PNG, or PDF formats (Max size: 5MB)</p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Form Actions */}
                      <div className="pt-4 flex justify-end gap-3">
                        <button
                          type="submit"
                          disabled={verificationStatus === 'SUBMITTED' || isUploadingId}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {verificationStatus === 'SUBMITTED' ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Submitting KYC Profile...
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} />
                              Submit & Verify KYC Profile
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* VERIFIED DISPLAY STATE */
                    <div className="space-y-6">
                      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                          <CheckCircle size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Financial Security Auditing Standard</h5>
                          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                            Your peer-to-peer lending limits are fully active. Your registered ID has been securely logged on our system, maintaining complete conformity with AML rules.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Verified Funder Name</span>
                          <span className="block text-sm font-semibold text-gray-800 mt-1">{lenderName}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Registered Funder Email</span>
                          <span className="block text-sm font-semibold text-gray-800 mt-1">{lender.email}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Residential Address Registry</span>
                          <span className="block text-sm font-semibold text-gray-800 mt-1 leading-relaxed">{lenderAddress}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">ID Document Reference</span>
                          <span className="block text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                            <FileText size={14} className="text-gray-400" />
                            {lenderIdType} (Secure Storage)
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">ID Attachment</span>
                          {lenderIdDoc && (
                            <button
                              type="button"
                              onClick={() => setIsPreviewingId(true)}
                              className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <Eye size={13} />
                              Preview Scan Upload
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-gray-400 font-mono">KYC Audit Reference ID: FFL-{Math.floor(100000 + Math.random() * 900000)}</span>
                        <button
                          type="button"
                          onClick={handleResetVerification}
                          className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Reset / Edit Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Compliance Summary & Live ID Preview */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-indigo-600" />
                      ID Vault Preview
                    </h4>

                    {lenderIdDoc ? (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Your uploaded ID document card is encrypted using AES-256 protocols inside our private identity store.
                        </p>
                        <div className="relative rounded-xl overflow-hidden border border-gray-200/60 aspect-video group bg-slate-900">
                          <img
                            src={lenderIdDoc.previewUrl}
                            alt="ID Preview"
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600";
                            }}
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                            <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/20 px-2 py-0.5 rounded-sm self-start">
                              Secure Preview
                            </span>
                            <span className="block text-[11px] text-white font-bold truncate mt-1.5">
                              {lenderIdDoc.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center bg-gray-50/50 flex flex-col items-center justify-center min-h-[160px] text-gray-400">
                        <FileText size={32} className="text-gray-300 mb-2" />
                        <span className="text-xs font-bold text-gray-500">No active document uploaded</span>
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] leading-relaxed mx-auto">
                          Upload an ID to render a certified document preview here.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-50 text-xs text-gray-400 space-y-2 leading-relaxed font-medium">
                    <div className="flex justify-between">
                      <span>Encryption standard</span>
                      <span className="font-semibold text-gray-600 font-mono text-[10px]">AES-256 BIT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Server registry</span>
                      <span className="font-semibold text-gray-600 font-mono text-[10px]">MANILA_CLOUD_NODE</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}



          {/* PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-display">
                  My Active Yield Portfolio
                </h3>
                <p className="text-sm text-gray-500">
                  Track performance, repayments, and accrued earnings for your active credit agreements.
                </p>
              </div>

              {myPortfolio.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 font-semibold">You have not funded any personal contracts yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Sponsor client files from the Admin Portal or wait for new applications.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myPortfolio.map((loan) => {
                    const totalOwed = loan.requestedAmount * 1.20;
                    const amountPaid = loan.totalPaid;
                    const remainingBalance = Math.max(0, totalOwed - amountPaid);
                    const progressPct = Math.round((amountPaid / totalOwed) * 100) || 0;

                    return (
                      <div key={loan.id} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase">
                              {loan.category}
                            </span>
                            <h4 className="text-base font-bold text-gray-900 font-display mt-1.5">
                              {loan.businessName}
                            </h4>
                          </div>

                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            loan.status === 'PAID' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {loan.status === 'PAID' ? 'Repaid' : 'Active Loan'}
                          </span>
                        </div>

                        {/* Financial Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-50 text-xs">
                          <div>
                            <span className="text-gray-400 font-medium">Principal Funded</span>
                            <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                              ₱{loan.requestedAmount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Accrued Interest (20%)</span>
                            <span className="block text-sm font-extrabold text-emerald-600 mt-0.5">
                              +₱{(loan.requestedAmount * 0.20).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Term Progress</span>
                            <span className="block text-sm font-extrabold text-gray-900 mt-0.5">
                              {loan.paymentsMade} / {loan.termMonths} Payments
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar & Repay Details */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-500">Repayment Recouped</span>
                            <span className="text-emerald-600 font-bold">₱{amountPaid.toLocaleString()} / ₱{totalOwed.toLocaleString()} ({progressPct}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            ></div>
                          </div>
                        </div>

                        {loan.status !== 'PAID' && (
                          <div className="pt-2 flex items-center justify-between gap-4">
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={12} />
                              <span>Next amortized repayment scheduled monthly</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => onSimulateBorrowerPayment(loan.id, 'standard')}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                title="Pay amortized schedule using GCash"
                              >
                                Pay using GCash
                              </button>
                              <button
                                onClick={() => onSimulateBorrowerPayment(loan.id, 'interest-only')}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                              >
                                Simulate Interest Only
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 font-display">
                    Secure Ledger Audit Log
                  </h3>
                  <p className="text-xs text-gray-500">
                    Cryptographically tracked and timestamped movements of capital.
                  </p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No transactions recorded on this account yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold uppercase text-gray-400 bg-gray-50/50">
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Direct Merchant / Contract</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50/30">
                          <td className="py-4 px-4 font-mono text-xs text-gray-400">
                            {tx.id}
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-800">
                            {tx.loanName}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              tx.type === 'FUNDING'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {tx.type === 'FUNDING' ? (
                                <><ArrowUpRight size={12} /> Capital Funded</>
                              ) : (
                                <><ArrowDownLeft size={12} /> Repayment</>
                              )}
                            </span>
                          </td>
                          <td className={`py-4 px-4 text-right font-mono font-bold ${
                            tx.type === 'FUNDING' ? 'text-gray-950' : 'text-emerald-600'
                          }`}>
                            {tx.type === 'FUNDING' ? '-' : '+'}₱{tx.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* LIVE LOAN MANAGER TAB */}
          {activeTab === 'live-manager' && (
            <motion.div
              key="live-manager-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header Title */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                  <Activity size={20} className="text-emerald-500" />
                  Live Loan Manager
                </h3>
                <p className="text-sm text-gray-500">
                  Fund live SME credit requests with instant real-time synchronization.
                </p>
              </div>

              {/* LIVE SME MARKETPLACE SECTION */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 font-display">
                      Available SME Credit Applications
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Sponsor verified loan files in real-time. Watch repayments stream back to your account.
                    </p>
                  </div>

                  {/* Simulator buttons */}
                  <button
                    onClick={onSimulateNewMarketplaceLoan}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <RefreshCw size={12} className="mr-1.5" />
                    Simulate New SME Application (Live Sync)
                  </button>
                </div>

                {marketplaceLoans.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 max-w-lg mx-auto">
                    <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
                    <h5 className="text-sm font-bold text-gray-700">All SME loan applications are funded!</h5>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Lenders are currently waiting for new business applications. Click the button above to simulate a live credit request submitting in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {marketplaceLoans.map((loan) => {
                      const totalRepayment = loan.requestedAmount * 1.20;
                      const hasSufficientFunds = lender.balance >= loan.requestedAmount;

                      return (
                        <div key={loan.id} className="bg-gray-50 rounded-2xl border border-gray-200/60 p-5 space-y-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase rounded-md">
                                {loan.category}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Sync Match
                              </span>
                            </div>

                            <h5 className="text-base font-bold text-gray-900 font-display">
                              {loan.businessName}
                            </h5>
                            <p className="text-xs text-gray-500 leading-relaxed min-h-[50px]">
                              {loan.description}
                            </p>
                          </div>

                          <div className="space-y-4 pt-3 border-t border-gray-200/50">
                            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                              <div>
                                <span className="block text-gray-400 text-[10px] uppercase font-bold">Funding File</span>
                                <span className="block text-gray-800 font-extrabold mt-0.5">₱{loan.requestedAmount.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="block text-gray-400 text-[10px] uppercase font-bold">Fixed Yield</span>
                                <span className="block text-emerald-600 font-extrabold mt-0.5">+20% APR</span>
                              </div>
                              <div>
                                <span className="block text-gray-400 text-[10px] uppercase font-bold">Contract Term</span>
                                <span className="block text-gray-800 font-extrabold mt-0.5">{loan.termMonths === 30 ? '30 Days' : loan.termMonths === 15 ? '15 Days' : loan.termMonths === 1 ? '15 Days (1-Time)' : `${loan.termMonths} Months`}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-gray-200/40 text-xs font-semibold">
                              <span className="text-gray-500">Gross Repayment:</span>
                              <span className="text-indigo-700 font-extrabold">₱{totalRepayment.toLocaleString()}</span>
                            </div>

                            <div className="pt-2">
                              {hasSufficientFunds ? (
                                <button
                                  onClick={() => setSelectedMarketplaceLoan(loan)}
                                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  <ShieldCheck size={14} />
                                  Approve & Fund Contract
                                </button>
                              ) : (
                                <div className="space-y-2">
                                  <button
                                    disabled
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-200 text-gray-400 font-bold text-xs rounded-xl cursor-not-allowed"
                                  >
                                    Insufficient Wallet Funds
                                  </button>
                                  <button
                                    onClick={() => onUpdateLenderBalance(loan.requestedAmount - lender.balance, 'DEPOSIT')}
                                    className="w-full text-center text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
                                  >
                                    + Quick Add ₱{(loan.requestedAmount - lender.balance).toLocaleString()} to Fund
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Modal to Fund a Loan */}
      <AnimatePresence>
        {selectedMarketplaceLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 border border-gray-100 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Capital Commitment Offer</span>
                  <h3 className="text-lg font-bold text-gray-900 font-display mt-1">
                    Confirm Funding for {selectedMarketplaceLoan.businessName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMarketplaceLoan(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {!isFundingSuccess ? (
                <>
                  <div className="space-y-4 text-sm text-gray-600">
                    <p>
                      You are committing capital to fund the open credit request. By clicking confirm, you agree to the standard FundFlow Lender agreements.
                    </p>

                    {/* Financial Terms Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/50 space-y-3 font-medium">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Principal Investment:</span>
                        <span className="text-gray-900 font-bold">₱{selectedMarketplaceLoan.requestedAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Fixed Yield Return (20.00%):</span>
                        <span className="text-emerald-600 font-bold">+₱{(selectedMarketplaceLoan.requestedAmount * 0.20).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs border-t border-gray-200 pt-2.5">
                        <span className="text-gray-700">Total Contract Amortization:</span>
                        <span className="text-indigo-700 font-extrabold">₱{(selectedMarketplaceLoan.requestedAmount * 1.20).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200/50 leading-relaxed">
                      <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
                      <span>
                        Interest accrued is flat/fixed at 20.00% across the chosen {selectedMarketplaceLoan.termMonths === 30 ? '30 day' : selectedMarketplaceLoan.termMonths === 15 ? '15 day' : selectedMarketplaceLoan.termMonths === 1 ? '15 day (1-time pay)' : `${selectedMarketplaceLoan.termMonths} month`} term. Your capital wallet will be debited instantly.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedMarketplaceLoan(null)}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleFundConfirm(selectedMarketplaceLoan)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      Agree & Fund Contract
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 font-display">Capital Placed Successfully</h4>
                  <p className="text-sm text-gray-500">
                    You have funded {selectedMarketplaceLoan.businessName} with 20% flat yield returns!
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Modal for Document Scan Preview */}
      <AnimatePresence>
        {isPreviewingId && lenderIdDoc && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 font-display">
                    <Lock size={14} className="text-indigo-600" />
                    Secure ID Preview
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{lenderIdDoc.name} • {lenderIdDoc.size}</p>
                </div>
                <button
                  onClick={() => setIsPreviewingId(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 bg-slate-950 flex items-center justify-center aspect-video overflow-hidden">
                <img
                  src={lenderIdDoc.previewUrl}
                  alt="Secure ID Preview"
                  className="max-h-full max-w-full object-contain rounded-lg border border-slate-800"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600";
                  }}
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400 font-medium">
                This document is masked and securely cached. Unauthorized downloads are blocked.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal for Resetting KYC Profile */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 relative"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                  <Trash2 size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-900 font-display">
                    Reset KYC Profile?
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This will clear your submitted residential address and ID scan documents. You will need to complete and verify your profile again to maintain active peer funder status.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmResetVerification}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Reset & Edit Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLY FOR LOAN MODAL */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden relative z-10"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-emerald-100 animate-pulse" />
                  <h3 className="font-bold text-base font-display">Apply for Peer Loan</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleApplyFormSubmit} className="p-6 space-y-5 text-left">
                {applyFormError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{applyFormError}</span>
                  </div>
                )}

                {/* Active Loan Existing Callout Banner if user has an active loan */}
                {hasActiveLoan && activeLoan && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                      <ShieldAlert size={16} className="text-red-600 shrink-0" />
                      <span>Active Loan Existing - Application Locked</span>
                    </div>
                    <p className="text-xs text-red-800 font-medium leading-relaxed">
                      You currently have an active loan (<strong className="font-bold">{activeLoan.businessName}</strong>, Status: <span className="uppercase font-bold">{activeLoan.status}</span>). System policy restricts new loan applications while an active loan is open. Please pay off your existing loan in full before applying again.
                    </p>
                  </div>
                )}

                {/* KYC Required Callout Banner if not verified */}
                {!hasActiveLoan && verificationStatus !== 'VERIFIED' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                      <span>Lender KYC & Identity Profile Required for Safety</span>
                    </div>
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      Before applying for a loan, you are required to fill up and submit your Lender KYC & Identity Profile for safety and account verification.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsApplyModalOpen(false);
                        setTimeout(() => {
                          const element = document.getElementById('kyc-profile-section');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className="self-start px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <User size={14} />
                      Fill Up KYC & Identity Profile Now
                    </button>
                  </div>
                )}

                {/* Info Note about standard cycle */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Flexible Repayment terms</span>
                  <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                    Configure your peer loan with custom schedules. Interest remains flat/fixed at 20.00% across the term.
                  </p>
                </div>

                {/* Repayment Scheme Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Repayment Scheme</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { 
                        id: 'daily-30', 
                        title: '30 Days Daily Scheme (₱40/day)', 
                        desc: 'Pay exactly ₱40 daily on a fixed, pre-approved ₱1,000 loan' 
                      },
                      { 
                        id: 'daily-15', 
                        title: '15 Days Daily Scheme (₱80/day)', 
                        desc: 'Pay exactly ₱80 daily on a fixed, pre-approved ₱1,000 loan' 
                      },
                      { 
                        id: 'lump-15', 
                        title: '15 Days Lump-Sum (₱1,200)', 
                        desc: 'Pay entire ₱1,200 principal + interest as a single lump sum at day 15 on a fixed, pre-approved ₱1,000 loan' 
                      }
                    ].map((scheme) => (
                       <button
                        key={scheme.id}
                        type="button"
                        onClick={() => {
                          setApplyFormRepaymentType(scheme.id as any);
                          setApplyFormRequestedAmount('1000');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                          applyFormRepaymentType === scheme.id
                            ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/10'
                            : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`text-xs font-bold ${applyFormRepaymentType === scheme.id ? 'text-emerald-800' : 'text-gray-700'}`}>
                          {scheme.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium leading-normal">
                          {scheme.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Requested Amount (Fixed Pre-Approved)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₱</span>
                    <input
                      type="number"
                      required
                      min={100}
                      max={150000}
                      disabled={true}
                      value={applyFormRequestedAmount}
                      onChange={(e) => setApplyFormRequestedAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 placeholder-gray-400 bg-gray-100 text-gray-400 border border-gray-205 cursor-not-allowed font-sans border-gray-200"
                    />
                  </div>
                </div>

                {/* Real-time Schedule Breakdown */}
                {parseFloat(applyFormRequestedAmount) > 0 && (
                  <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Repayment Schedule</span>
                    
                    <div className="flex justify-between font-semibold text-gray-600">
                      <span>Loan Principal:</span>
                      <span className="text-gray-900">₱{parseFloat(applyFormRequestedAmount).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between font-semibold text-gray-600">
                      <span>Yield/Interest (20%):</span>
                      <span className="text-emerald-600">+₱{(parseFloat(applyFormRequestedAmount) * 0.20).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between font-extrabold text-gray-800 border-t border-dashed border-gray-200 pt-2 text-sm">
                      <span>Total Payout:</span>
                      <span className="text-indigo-700">₱{(parseFloat(applyFormRequestedAmount) * 1.20).toLocaleString()}</span>
                    </div>

                    {applyFormRepaymentType === 'daily-30' && (
                      <div className="bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center text-xs font-bold shadow-xs mt-1">
                        <div className="text-gray-500 flex flex-col">
                          <span>Daily Repayment</span>
                          <span className="text-[9px] font-normal text-gray-400">30 Days total term</span>
                        </div>
                        <span className="text-emerald-700 text-base font-extrabold font-display">
                          ₱40.00
                          <span className="text-xs font-normal text-gray-500"> / day</span>
                        </span>
                      </div>
                    )}

                    {applyFormRepaymentType === 'daily-15' && (
                      <div className="bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center text-xs font-bold shadow-xs mt-1">
                        <div className="text-gray-500 flex flex-col">
                          <span>Daily Repayment</span>
                          <span className="text-[9px] font-normal text-gray-400">15 Days total term</span>
                        </div>
                        <span className="text-emerald-700 text-base font-extrabold font-display">
                          ₱{((parseFloat(applyFormRequestedAmount) * 1.20) / 15).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs font-normal text-gray-500"> / day</span>
                        </span>
                      </div>
                    )}

                    {applyFormRepaymentType === 'lump-15' && (
                      <div className="bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center text-xs font-bold shadow-xs mt-1">
                        <div className="text-gray-500 flex flex-col">
                          <span>Repayment Mode</span>
                          <span className="text-[9px] font-normal text-gray-400">Paid 1-Time at Day 15</span>
                        </div>
                        <span className="text-emerald-700 text-base font-extrabold font-display">
                          ₱{(parseFloat(applyFormRequestedAmount) * 1.20).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs font-normal text-gray-500"> at end</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verificationStatus !== 'VERIFIED' || hasActiveLoan}
                    className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                      verificationStatus === 'VERIFIED' && !hasActiveLoan
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                    }`}
                  >
                    <CheckCircle size={14} />
                    {hasActiveLoan ? 'Active Loan Existing' : verificationStatus === 'VERIFIED' ? 'Submit Peer Loan Request' : 'KYC Profile Required'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
