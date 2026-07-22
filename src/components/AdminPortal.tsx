import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Trash2, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  RotateCcw, 
  PlusCircle, 
  ArrowRight, 
  FileText, 
  PieChart, 
  LogOut,
  Sliders,
  Award,
  Users,
  ShieldCheck,
  Briefcase,
  Coins,
  Wallet,
  Lock,
  Check,
  Eye,
  X,
  Percent,
  UserPlus,
  Search,
  Edit,
  ShieldX,
  UserX,
  RefreshCw,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Loan, Transaction } from '../types';

interface AdminPortalProps {
  loans: Loan[];
  transactions: Transaction[];
  onUpdateState: (updatedLoans: Loan[], updatedTxs: Transaction[]) => void;
  onLogout: () => void;
}

const PRESET_SAMPLE_LOANS = [
  {
    businessName: "Carlos Tecson",
    category: "Medical & Health",
    description: "Urgent dental restoration and root canal treatment package to repair severe nerve infection before starting a new job.",
    requestedAmount: 75000,
    termMonths: 6,
    borrowerEmail: "carlos.tecson@gmail.com"
  },
  {
    businessName: "Patricia Lim",
    category: "Education & Tuition",
    description: "Tuition support for master's degree in public administration first trimester course materials, enrollment, and thesis fees.",
    requestedAmount: 120000,
    termMonths: 12,
    borrowerEmail: "patricia.lim98@yahoo.com"
  },
  {
    businessName: "Roberto Bautista",
    category: "Home Renovation",
    description: "Installation of deep-well water filter systems and booster pumps to guarantee clean potable running water for my family of five.",
    requestedAmount: 95000,
    termMonths: 12,
    borrowerEmail: "roberto.b@outlook.com"
  },
  {
    businessName: "Sonia Reyes",
    category: "Personal & Emergency",
    description: "Bridge capital to fund critical motorcycle transmission repairs and commercial license renewal for my daily livelihood courier dispatch.",
    requestedAmount: 45000,
    termMonths: 6,
    borrowerEmail: "sonia.reyes@gmail.com"
  }
];

export default function AdminPortal({ loans, transactions, onUpdateState, onLogout }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'loans' | 'transactions' | 'presets' | 'lender_mirror'>('loans');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  // Load registered lenders state
  const [registeredLenders, setRegisteredLenders] = useState<any[]>([]);
  const [selectedLenderDoc, setSelectedLenderDoc] = useState<any | null>(null);

  // Account management modals & search filters
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [accountFormEmail, setAccountFormEmail] = useState('');
  const [accountFormName, setAccountFormName] = useState('');
  const [accountFormAddress, setAccountFormAddress] = useState('');
  const [accountFormIdType, setAccountFormIdType] = useState('National ID');
  const [accountFormKycStatus, setAccountFormKycStatus] = useState<'UNVERIFIED' | 'SUBMITTED' | 'VERIFIED'>('VERIFIED');
  const [accountFormAccountStatus, setAccountFormAccountStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [accountFormBalance, setAccountFormBalance] = useState('5000000');
  const [accountFormError, setAccountFormError] = useState('');

  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [accountStatusFilter, setAccountStatusFilter] = useState('ALL');
  const [selectedAccountHistory, setSelectedAccountHistory] = useState<any | null>(null);

  const loadRegisteredLenders = () => {
    try {
      const emailSet = new Set<string>();

      // 1. Scan fundflow_registered_lenders from localStorage
      const emailsRaw = localStorage.getItem('fundflow_registered_lenders');
      if (emailsRaw) {
        try {
          const parsed = JSON.parse(emailsRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach(e => {
              if (typeof e === 'string' && e.trim()) {
                emailSet.add(e.toLowerCase().trim());
              }
            });
          }
        } catch (e) {
          console.error('[System Admin Console] Error parsing fundflow_registered_lenders:', e);
        }
      }

      // 2. Discover accounts from active loans (borrowers and lenders)
      loans.forEach(loan => {
        if (loan.borrowerEmail && loan.borrowerEmail.trim()) {
          emailSet.add(loan.borrowerEmail.toLowerCase().trim());
        }
        if (loan.lenderId && loan.lenderId.includes('@')) {
          emailSet.add(loan.lenderId.toLowerCase().trim());
        }
      });

      // 3. Scan all localStorage keys for registered user profiles or KYC entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          if (key.startsWith('fundflow_lender_')) {
            const em = key.replace('fundflow_lender_', '').toLowerCase().trim();
            if (em && em.includes('@')) emailSet.add(em);
          } else if (key.startsWith('lender_verification_status_')) {
            const em = key.replace('lender_verification_status_', '').toLowerCase().trim();
            if (em && em.includes('@')) emailSet.add(em);
          } else if (key.startsWith('lender_name_')) {
            const em = key.replace('lender_name_', '').toLowerCase().trim();
            if (em && em.includes('@')) emailSet.add(em);
          } else if (key.startsWith('user_account_status_')) {
            const em = key.replace('user_account_status_', '').toLowerCase().trim();
            if (em && em.includes('@')) emailSet.add(em);
          }
        }
      }

      // 4. Baseline system test accounts
      emailSet.add('projectile.afk@gmail.com');
      emailSet.add('lancelot.du_lac@gmail.com');

      const syncedEmails = Array.from(emailSet);

      // Instantly persist normalized list to prevent data loss or drift
      localStorage.setItem('fundflow_registered_lenders', JSON.stringify(syncedEmails));

      const loaded = syncedEmails.map(email => {
        // Read cached user profile if exists
        let cachedProfile: any = null;
        const cachedProfileRaw = localStorage.getItem(`fundflow_lender_${email}`);
        if (cachedProfileRaw) {
          try {
            cachedProfile = JSON.parse(cachedProfileRaw);
          } catch (e) {
            // ignore
          }
        }

        const defaultName = email === 'projectile.afk@gmail.com' 
          ? 'Arthur Pendragon' 
          : email === 'lancelot.du_lac@gmail.com' 
          ? 'Lancelot du Lac' 
          : email.split('@')[0].split(/[._\-+]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

        const name = localStorage.getItem(`lender_name_${email}`) || cachedProfile?.name || defaultName;
        const address = localStorage.getItem(`lender_address_${email}`) || (email === 'projectile.afk@gmail.com' ? 'Suite 300, 88 Corporate Avenue, Ortigas Center, Pasig City, Metro Manila' : email === 'lancelot.du_lac@gmail.com' ? 'Roundtable Court, Camelot Estate, Tagaytay, Cavite' : '');
        const idType = localStorage.getItem(`lender_id_type_${email}`) || 'National ID';
        
        const docRaw = localStorage.getItem(`lender_id_doc_${email}`);
        const idDoc = docRaw ? JSON.parse(docRaw) : (email === 'projectile.afk@gmail.com' || email === 'lancelot.du_lac@gmail.com' ? {
          name: email === 'projectile.afk@gmail.com' ? 'passport_scan_lender_demo.jpg' : 'drivers_license_lancelot.png',
          size: '1.2 MB',
          previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
        } : null);

        const status = localStorage.getItem(`lender_verification_status_${email}`) || (email === 'projectile.afk@gmail.com' || email === 'lancelot.du_lac@gmail.com' ? 'VERIFIED' : 'UNVERIFIED');
        const accountStatus = localStorage.getItem(`user_account_status_${email}`) || 'ACTIVE';
        
        const savedBal = localStorage.getItem(`user_balance_${email}`);
        const balance = savedBal !== null ? parseFloat(savedBal) : (cachedProfile?.balance || 5000000);

        // Calculate borrower & lender loan applications and history
        const borrowerLoans = loans.filter(l => l.borrowerEmail && l.borrowerEmail.toLowerCase() === email);
        const lenderLoans = loans.filter(l => l.lenderId && l.lenderId.toLowerCase() === email);

        return {
          email,
          name,
          address,
          idType,
          idDoc,
          status,
          accountStatus: accountStatus as 'ACTIVE' | 'SUSPENDED',
          balance,
          borrowerLoansCount: borrowerLoans.length,
          lenderLoansCount: lenderLoans.length,
          borrowerLoans,
          lenderLoans
        };
      });

      console.log(`[System Admin Console] Account synchronization complete. Total active accounts: ${loaded.length}`, loaded.map(u => u.email));
      setRegisteredLenders(loaded);
    } catch (err) {
      console.error('[System Admin Console] Account synchronization failure:', err);
    }
  };

  useEffect(() => {
    loadRegisteredLenders();
  }, [loans, transactions]);

  // Handlers for Admin account creation & editing
  const handleOpenCreateAccountModal = () => {
    setEditingAccount(null);
    setAccountFormEmail('');
    setAccountFormName('');
    setAccountFormAddress('');
    setAccountFormIdType('National ID');
    setAccountFormKycStatus('VERIFIED');
    setAccountFormAccountStatus('ACTIVE');
    setAccountFormBalance('5000000');
    setAccountFormError('');
    setShowAccountModal(true);
  };

  const handleOpenEditAccountModal = (account: any) => {
    setEditingAccount(account);
    setAccountFormEmail(account.email);
    setAccountFormName(account.name);
    setAccountFormAddress(account.address);
    setAccountFormIdType(account.idType || 'National ID');
    setAccountFormKycStatus(account.status);
    setAccountFormAccountStatus(account.accountStatus);
    setAccountFormBalance(account.balance.toString());
    setAccountFormError('');
    setShowAccountModal(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFormError('');

    const emailClean = accountFormEmail.trim().toLowerCase();
    if (!emailClean || !emailClean.includes('@')) {
      setAccountFormError('Please enter a valid Gmail address.');
      return;
    }

    const bal = parseFloat(accountFormBalance);
    if (isNaN(bal) || bal < 0) {
      setAccountFormError('Please enter a valid non-negative capital balance.');
      return;
    }

    try {
      localStorage.setItem(`lender_name_${emailClean}`, accountFormName || emailClean.split('@')[0]);
      localStorage.setItem(`lender_address_${emailClean}`, accountFormAddress || '');
      localStorage.setItem(`lender_id_type_${emailClean}`, accountFormIdType);
      localStorage.setItem(`lender_verification_status_${emailClean}`, accountFormKycStatus);
      localStorage.setItem(`user_account_status_${emailClean}`, accountFormAccountStatus);
      localStorage.setItem(`user_balance_${emailClean}`, bal.toString());

      const userProfile = {
        email: emailClean,
        name: accountFormName || emailClean.split('@')[0],
        photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(emailClean.split('@')[0])}`,
        balance: bal
      };
      localStorage.setItem(`fundflow_lender_${emailClean}`, JSON.stringify(userProfile));

      // Register email globally
      const emailsRaw = localStorage.getItem('fundflow_registered_lenders');
      let emails: string[] = emailsRaw ? JSON.parse(emailsRaw) : [];
      if (!emails.includes(emailClean)) {
        emails.push(emailClean);
        localStorage.setItem('fundflow_registered_lenders', JSON.stringify(emails));
      }

      setShowAccountModal(false);
      loadRegisteredLenders();
    } catch (err) {
      console.error('[System Admin Console] Error saving account:', err);
      setAccountFormError('Failed to save account record to system storage.');
    }
  };

  const handleToggleAccountStatus = (email: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    localStorage.setItem(`user_account_status_${email}`, newStatus);
    loadRegisteredLenders();
  };

  const handleDeleteUserAccount = (email: string) => {
    if (window.confirm(`Are you sure you want to permanently delete account (${email}) from the System Admin Console?`)) {
      try {
        const emailsRaw = localStorage.getItem('fundflow_registered_lenders');
        let emails: string[] = emailsRaw ? JSON.parse(emailsRaw) : [];
        emails = emails.filter(e => e.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('fundflow_registered_lenders', JSON.stringify(emails));

        localStorage.removeItem(`fundflow_lender_${email}`);
        localStorage.removeItem(`lender_name_${email}`);
        localStorage.removeItem(`lender_address_${email}`);
        localStorage.removeItem(`lender_id_doc_${email}`);
        localStorage.removeItem(`lender_verification_status_${email}`);
        localStorage.removeItem(`user_account_status_${email}`);
        localStorage.removeItem(`user_balance_${email}`);

        loadRegisteredLenders();
      } catch (err) {
        console.error('[System Admin Console] Error deleting user account:', err);
      }
    }
  };

  // States and loaders for client (borrower) documents in AdminPortal
  const [clientDocs, setClientDocs] = useState<{ [loanId: string]: any[] }>({});
  const [clientDocsApproved, setClientDocsApproved] = useState<{ [loanId: string]: boolean }>({});
  const [selectedClientDoc, setSelectedClientDoc] = useState<{ doc: any; loanName: string; loanId: string } | null>(null);

  const getClientDocs = (loanId: string) => {
    const raw = localStorage.getItem(`client_docs_${loanId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    // Fallback to default mock documents if not explicitly in localStorage yet
    if (loanId === 'loan-2') {
      return [{
        id: 'doc-1',
        type: 'Passport',
        name: 'passport_scan_machining.jpg',
        size: '1.4 MB',
        previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        uploadedAt: '2026-04-15'
      }];
    }
    if (loanId === 'loan-3') {
      return [{
        id: 'doc-2',
        type: "Driver's License",
        name: 'drivers_license_solar.png',
        size: '890 KB',
        previewUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=400',
        uploadedAt: '2026-07-20'
      }];
    }
    if (loanId === 'loan-6') {
      return [{
        id: 'doc-3',
        type: 'National ID',
        name: 'national_id_logistics.jpg',
        size: '1.1 MB',
        previewUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400',
        uploadedAt: '2026-01-10'
      }];
    }
    return [];
  };

  const getClientDocsApproved = (loanId: string) => {
    return localStorage.getItem(`client_docs_approved_${loanId}`) === 'true';
  };

  const loadClientDocsAndApproval = () => {
    const docsMap: { [loanId: string]: any[] } = {};
    const approvedMap: { [loanId: string]: boolean } = {};
    
    loans.forEach(loan => {
      docsMap[loan.id] = getClientDocs(loan.id);
      approvedMap[loan.id] = getClientDocsApproved(loan.id);
    });

    setClientDocs(docsMap);
    setClientDocsApproved(approvedMap);
  };

  useEffect(() => {
    loadClientDocsAndApproval();
  }, [loans]);

  const handleConfirmClientDocs = (loanId: string) => {
    localStorage.setItem(`client_docs_approved_${loanId}`, 'true');
    loadClientDocsAndApproval();
  };

  const handleRejectClientDocs = (loanId: string) => {
    localStorage.setItem(`client_docs_approved_${loanId}`, 'false');
    loadClientDocsAndApproval();
  };

  const handleDeleteClientDoc = (loanId: string, docId: string) => {
    const current = clientDocs[loanId] || [];
    const updated = current.filter(d => d.id !== docId);
    localStorage.setItem(`client_docs_${loanId}`, JSON.stringify(updated));
    // If we delete all documents or if documents are removed, we should unset approval
    if (updated.length === 0) {
      localStorage.setItem(`client_docs_approved_${loanId}`, 'false');
    }
    loadClientDocsAndApproval();
  };

  const handleDeleteAllClientDocs = (loanId: string) => {
    if (window.confirm("Are you sure you want to delete and clear all documents for this client?")) {
      localStorage.setItem(`client_docs_${loanId}`, JSON.stringify([]));
      localStorage.setItem(`client_docs_approved_${loanId}`, 'false');
      loadClientDocsAndApproval();
    }
  };

  // Action: Admin updates a lender's KYC status
  const handleUpdateLenderStatus = (email: string, newStatus: 'UNVERIFIED' | 'SUBMITTED' | 'VERIFIED') => {
    localStorage.setItem(`lender_verification_status_${email}`, newStatus);
    if (newStatus === 'UNVERIFIED') {
      // Also clear address and document to let them submit again
      localStorage.removeItem(`lender_address_${email}`);
      localStorage.removeItem(`lender_id_doc_${email}`);
      localStorage.setItem(`lender_name_${email}`, '');
    }
    loadRegisteredLenders();
  };

  // 1. Calculate platform-wide metrics
  const totalVolume = loans.reduce((sum, loan) => sum + loan.requestedAmount, 0);
  const fundedLoans = loans.filter(l => l.status === 'REPAYING' || l.status === 'PAID');
  const activeFunding = fundedLoans.reduce((sum, loan) => sum + loan.fundedAmount, 0);
  const repaidCapital = loans.reduce((sum, loan) => sum + loan.totalPaid, 0);

  // Dynamic Approved Loan stat:
  // Reflect the requestedAmount of the latest approved or active loan for the simulated lender.
  const activeRepayingLoans = loans.filter(l => (l.status === 'REPAYING' || l.status === 'PAID') && l.lenderId);
  const latestApprovedLoanAmount = activeRepayingLoans.length > 0 
    ? activeRepayingLoans[0].requestedAmount 
    : 1000;
  
  // Calculate total interest generated: loans that have repayments.
  // Payout is 20% interest on funded amount. 
  // Yield generated = sum of current (paymentsMade / termMonths) * (fundedAmount * 20%)
  const totalInterestEarned = loans.reduce((sum, loan) => {
    if (loan.fundedAmount === 0) return sum;
    const totalExpectedInterest = loan.fundedAmount * 0.20;
    const progress = loan.termMonths > 0 ? (loan.paymentsMade / loan.termMonths) : 0;
    return sum + (totalExpectedInterest * progress);
  }, 0);

  // Filtered loans list
  const filteredLoans = loans.filter(loan => {
    const matchesStatus = filterStatus === 'ALL' || loan.status === filterStatus;
    const matchesSearch = loan.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loan.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loan.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Action: Approve a pending client application and publish it to the marketplace
  const handleApproveLoan = (loanId: string) => {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        return {
          ...loan,
          status: 'MARKETPLACE' as const
        };
      }
      return loan;
    });
    onUpdateState(updatedLoans, transactions);
  };

  // Action: Force Approve/Fund from Admin (Simulates automatic platform seed investment)
  const handleForceFund = (loanId: string) => {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        return {
          ...loan,
          fundedAmount: loan.requestedAmount,
          status: 'REPAYING' as const,
          lenderId: 'admin@fundflow.net' // Admin seed account
        };
      }
      return loan;
    });

    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    // Create backing transaction
    const fundingTx: Transaction = {
      id: `tx-fund-admin-${Date.now()}`,
      loanId: targetLoan.id,
      loanName: targetLoan.businessName,
      type: 'FUNDING' as const,
      amount: targetLoan.requestedAmount,
      timestamp: new Date().toISOString(),
      sender: 'admin@fundflow.net',
      receiver: targetLoan.borrowerEmail
    };

    onUpdateState(updatedLoans, [fundingTx, ...transactions]);
  };

  // Action: Delete loan request entirely
  const handleDeleteLoan = (loanId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this loan request? All history will be lost.")) {
      const updatedLoans = loans.filter(loan => loan.id !== loanId);
      const updatedTxs = transactions.filter(tx => tx.loanId !== loanId);
      onUpdateState(updatedLoans, updatedTxs);
    }
  };

  // Action: Force single monthly repayment
  const handleForceRepayment = (loanId: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan || targetLoan.status !== 'REPAYING') return;

    const isLastPayment = targetLoan.paymentsMade + 1 >= targetLoan.termMonths;
    const newPaymentsMade = targetLoan.paymentsMade + 1;
    
    const totalExpectedPayout = targetLoan.requestedAmount * 1.20;
    const standardMonthlyAmortized = totalExpectedPayout / targetLoan.termMonths;
    const newTotalPaid = Math.min(totalExpectedPayout, targetLoan.totalPaid + standardMonthlyAmortized);

    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        return {
          ...loan,
          paymentsMade: newPaymentsMade,
          totalPaid: newTotalPaid,
          status: isLastPayment ? ('PAID' as const) : ('REPAYING' as const)
        };
      }
      return loan;
    });

    const repayTx: Transaction = {
      id: `tx-repay-admin-${Date.now()}`,
      loanId: targetLoan.id,
      loanName: targetLoan.businessName,
      type: 'REPAYMENT' as const,
      amount: standardMonthlyAmortized,
      timestamp: new Date().toISOString(),
      sender: targetLoan.borrowerEmail,
      receiver: targetLoan.lenderId || 'Platform Escrow'
    };

    onUpdateState(updatedLoans, [repayTx, ...transactions]);
  };

  // Action: Collect all remaining payments instantly (Fast-forward to PAID status)
  const handleForceCompletePayments = (loanId: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan || targetLoan.status !== 'REPAYING') return;

    const remainingPayments = targetLoan.termMonths - targetLoan.paymentsMade;
    if (remainingPayments <= 0) return;

    const totalExpectedPayout = targetLoan.requestedAmount * 1.20;
    const outstandingAmount = totalExpectedPayout - targetLoan.totalPaid;

    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        return {
          ...loan,
          paymentsMade: loan.termMonths,
          totalPaid: totalExpectedPayout,
          status: 'PAID' as const
        };
      }
      return loan;
    });

    const repayTx: Transaction = {
      id: `tx-repay-bulk-${Date.now()}`,
      loanId: targetLoan.id,
      loanName: targetLoan.businessName,
      type: 'REPAYMENT' as const,
      amount: outstandingAmount,
      timestamp: new Date().toISOString(),
      sender: targetLoan.borrowerEmail,
      receiver: targetLoan.lenderId || 'Platform Escrow'
    };

    onUpdateState(updatedLoans, [repayTx, ...transactions]);
  };

  // Action: Toggle Pay Interest Only & Auto Extend 15 days
  const handleToggleExtension = (loanId: string, allowed: boolean) => {
    const updatedLoans = loans.map(l => {
      if (l.id === loanId) {
        const currentExtDays = l.extensionDays || 0;
        return {
          ...l,
          interestOnlyExtensionAllowed: allowed,
          interestOnlyExtensionPaidThisPeriod: allowed ? false : l.interestOnlyExtensionPaidThisPeriod,
          extensionDays: allowed ? (currentExtDays === 0 ? 15 : currentExtDays) : currentExtDays
        };
      }
      return l;
    });
    onUpdateState(updatedLoans, transactions);
  };

  // Action: Reset entire system to standard mock defaults
  const handleResetToDefaults = () => {
    if (window.confirm("This will erase all active edits and restore default demo loans & transactions. Continue?")) {
      localStorage.removeItem('fundflow_loans');
      localStorage.removeItem('fundflow_txs');
      localStorage.removeItem('fundflow_lender');
      window.location.reload();
    }
  };

  // Action: Seed one of our sample high-yield credit requests
  const handleSeedPreset = (presetIndex: number) => {
    const preset = PRESET_SAMPLE_LOANS[presetIndex];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `loan-${preset.businessName.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}-${randomSuffix}`;

    const newLoanObj: Loan = {
      id: generatedId,
      businessName: preset.businessName,
      category: preset.category,
      description: preset.description,
      requestedAmount: preset.requestedAmount,
      fundedAmount: 0,
      termMonths: preset.termMonths,
      interestRate: 0.20,
      status: 'MARKETPLACE' as const,
      createdAt: new Date().toISOString().split('T')[0],
      borrowerEmail: preset.borrowerEmail,
      lenderId: null,
      paymentsMade: 0,
      totalPaid: 0
    };

    onUpdateState([newLoanObj, ...loans], transactions);
    alert(`Successfully seeded request for ${preset.businessName}! Check standard marketplace layout.`);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans pb-16">
      
      {/* Admin Title Banner */}
      <div className="bg-slate-950 border-b border-slate-800 py-6 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
              <Shield size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white font-display">
                  System Admin Console
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                  PatcherX V2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-spectrum database manipulation, escrow tracking, and contract state override portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Reset state storage to system default mock records"
            >
              <RotateCcw size={13} />
              Reset DB
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <LogOut size={13} />
              Exit Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* KPI Dashboard Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-300 text-emerald-500">
              <ShieldCheck size={120} />
            </div>
            <div className="flex justify-between items-start">
              {(() => {
                const pendingLoan = loans.find(l => l.status === 'PENDING');
                return (
                  <>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Underwriting</span>
                      <span className="block text-2xl font-black text-white mt-1.5">
                        {pendingLoan ? `₱${pendingLoan.requestedAmount.toLocaleString()}` : "₱0.00"}
                      </span>
                    </div>
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
                      <ShieldCheck size={18} />
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              {(() => {
                const pendingLoan = loans.find(l => l.status === 'PENDING');
                if (pendingLoan) {
                  return (
                    <button
                      onClick={() => handleApproveLoan(pendingLoan.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-colors cursor-pointer animate-pulse"
                    >
                      <CheckCircle2 size={12} />
                      Approve {pendingLoan.businessName.split(' ')[0]}'s Loan
                    </button>
                  );
                } else {
                  return (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      All Applications Underwritten
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-start justify-between">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Loan</span>
              <span className="block text-2xl font-black text-emerald-400 mt-1.5">₱{activeFunding.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-medium">{fundedLoans.filter(l => l.status === 'REPAYING').length} Active Loan Contracts</span>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 border border-emerald-500/10">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-start justify-between">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Principal Repaid</span>
              <span className="block text-2xl font-black text-blue-400 mt-1.5">₱{Math.round(repaidCapital).toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-medium">To Certified Lenders</span>
            </div>
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400 border border-blue-500/10">
              <DollarSign size={18} />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-start justify-between">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Earned Interest</span>
              <span className="block text-2xl font-black text-amber-400 mt-1.5">₱{Math.round(totalInterestEarned).toLocaleString()}</span>
              <span className="text-[10px] text-amber-500/80 block mt-1 font-medium">Standardized 20% flat rate</span>
            </div>
            <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 border border-amber-500/10">
              <Award size={18} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Admin Controls */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-5 py-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'loans' ? 'text-indigo-400 font-extrabold border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sliders size={13} />
              Live Loan Manager ({filteredLoans.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-5 py-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'presets' ? 'text-indigo-400 font-extrabold border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <PlusCircle size={13} />
              Seed Personal Mock Requests
            </span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-5 py-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'transactions' ? 'text-indigo-400 font-extrabold border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Activity size={13} />
              Transaction Log ({transactions.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('lender_mirror')}
            className={`px-5 py-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'lender_mirror' ? 'text-indigo-400 font-extrabold border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Coins size={13} />
              Lender Portal Mirror
            </span>
          </button>
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === 'loans' && (
            <div className="space-y-4">
              
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', 'PENDING', 'MARKETPLACE', 'REPAYING', 'PAID'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md tracking-wider transition-all cursor-pointer ${
                        filterStatus === status 
                          ? 'bg-indigo-600 text-white font-black' 
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search borrowers..."
                      className="w-full sm:w-64 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  {loans.length > 0 && (
                    <div className="relative flex items-center gap-1 shrink-0">
                      {showConfirmDeleteAll ? (
                        <>
                          <button
                            onClick={() => {
                              onUpdateState([], []);
                              setShowConfirmDeleteAll(false);
                            }}
                            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={11} />
                            Confirm Clear All?
                          </button>
                          <button
                            onClick={() => setShowConfirmDeleteAll(false)}
                            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowConfirmDeleteAll(true)}
                          className="px-3 py-2 bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Permanently delete all active loan files and clear current transactions ledger"
                        >
                          <Trash2 size={11} />
                          Remove All
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Table list of active credit applications */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="py-4 px-5">ID & Borrower Name</th>
                        <th className="py-4 px-5">Category</th>
                        <th className="py-4 px-5">Requested Amt</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5">Progress</th>
                        <th className="py-4 px-5">Borrower Info</th>
                        <th className="py-4 px-5 text-right">Actions Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredLoans.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                            No loan applications found matching your status/search filters.
                          </td>
                        </tr>
                      ) : (
                        filteredLoans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-4 px-5">
                              <span className="block text-slate-400 text-[9px] font-mono mb-0.5">{loan.id}</span>
                              <span className="block font-bold text-white text-sm">{loan.businessName}</span>
                            </td>
                            <td className="py-4 px-5">
                              <span className="bg-slate-800 border border-slate-750 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {loan.category}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <span className="block text-slate-100 font-bold text-sm">₱{loan.requestedAmount.toLocaleString()}</span>
                              <span className="block text-[10px] text-indigo-400">
                                {loan.termMonths === 30 ? '30 Days' : loan.termMonths === 15 ? '15 Days' : loan.termMonths === 1 ? '15 Days (1-Time)' : `${loan.termMonths} Months`}
                                {(loan.extensionDays || (loan.interestOnlyExtensionAllowed ? 15 : 0)) > 0 ? ` (+${loan.extensionDays || 15}d Auto Ext)` : ''} @ 20%
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                loan.status === 'PENDING'
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                  : loan.status === 'MARKETPLACE' 
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : loan.status === 'REPAYING'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  loan.status === 'PENDING'
                                    ? 'bg-orange-400'
                                    : loan.status === 'MARKETPLACE' 
                                    ? 'bg-amber-400'
                                    : loan.status === 'REPAYING'
                                    ? 'bg-blue-400'
                                    : 'bg-emerald-400'
                                }`}></span>
                                {loan.status}
                              </span>
                              {loan.interestOnlyExtensionAllowed && (
                                <span className="block mt-1.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-center">
                                  {loan.interestOnlyExtensionPaidThisPeriod ? 'Interest Only Paid (+15d)' : 'Pay Interest Only (+15d Auto Ext)'}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              {loan.status === 'PENDING' ? (
                                <span className="text-orange-400 text-[11px] italic font-semibold">Pending Approval</span>
                              ) : loan.status !== 'MARKETPLACE' ? (
                                <div>
                                  <div className="flex justify-between items-center text-[10px] mb-1">
                                    <span className="text-slate-400">{loan.paymentsMade}/{loan.termMonths} Paid</span>
                                    <span className="text-emerald-400 font-bold">
                                      {Math.round((loan.paymentsMade / loan.termMonths) * 100)}%
                                    </span>
                                  </div>
                                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                      style={{ width: `${(loan.paymentsMade / loan.termMonths) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-[11px] italic">Awaiting funding</span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <span className="block text-slate-300 font-mono text-[11px]">{loan.borrowerEmail}</span>
                              {loan.lenderId && (
                                <span className="block text-[10px] text-slate-500 truncate max-w-[150px]">Lender: {loan.lenderId}</span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right space-x-1 space-y-1">
                              {/* Override Pending state */}
                              {loan.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApproveLoan(loan.id)}
                                    className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2 py-1 rounded-md transition-all cursor-pointer"
                                    title="Approve application and publish to marketplace"
                                  >
                                    <CheckCircle2 size={11} />
                                    Approve Loan
                                  </button>
                                  <button
                                    onClick={() => handleForceFund(loan.id)}
                                    className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 font-bold text-[10px] px-2 py-1 rounded-md transition-all cursor-pointer"
                                    title="Skip marketplace and fund this contract with admin seed assets"
                                  >
                                    <Sparkles size={11} />
                                    Force Fund
                                  </button>
                                </>
                              )}

                              {/* Override Marketplace state -> Repaying */}
                              {loan.status === 'MARKETPLACE' && (
                                <button
                                  onClick={() => handleForceFund(loan.id)}
                                  className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2 py-1 rounded-md transition-all cursor-pointer"
                                  title="Skip marketplace and fund this contract with admin seed assets"
                                >
                                  <Sparkles size={11} />
                                  Force Fund
                                </button>
                              )}

                              {/* Simulation triggers */}
                              {loan.status === 'REPAYING' && (
                                <>
                                  <button
                                    onClick={() => handleForceRepayment(loan.id)}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-2 py-1 rounded-md transition-all cursor-pointer"
                                    title="Process single simulated monthly repayment"
                                  >
                                    <Clock size={11} />
                                    Repay Month
                                  </button>
                                  <button
                                    onClick={() => handleForceCompletePayments(loan.id)}
                                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded-md transition-all cursor-pointer"
                                    title="Complete all remaining months instantly with accrued yield pay-out"
                                  >
                                    <CheckCircle2 size={11} />
                                    Fully Paid
                                  </button>
                                  {loan.interestOnlyExtensionAllowed ? (
                                    <button
                                      onClick={() => handleToggleExtension(loan.id, false)}
                                      className="inline-flex items-center gap-1 bg-amber-950 hover:bg-amber-900 border border-amber-500/30 text-amber-400 font-bold text-[10px] px-2 py-1 rounded-md transition-all cursor-pointer animate-pulse"
                                      title="Disable Pay Interest Only option"
                                    >
                                      <Percent size={11} />
                                      Disable Pay Interest Only
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleExtension(loan.id, true)}
                                      className="inline-flex items-center gap-1 bg-amber-950/40 hover:bg-amber-950 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-bold text-[10px] px-2 py-1 rounded-md transition-all cursor-pointer"
                                      title="Allow client to pay interest only and automatically extend the loan by 15 days"
                                    >
                                      <Percent size={11} />
                                      Pay Interest Only (Auto +15 Days)
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Delete option always available */}
                              <button
                                onClick={() => handleDeleteLoan(loan.id)}
                                className="inline-flex items-center gap-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 border border-slate-700 hover:border-rose-900 text-slate-400 font-bold text-[10px] px-2 py-1 rounded-md transition-all cursor-pointer"
                                title="Permanently withdraw and delete this loan request"
                              >
                                <Trash2 size={11} />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-2">Seed Custom Credential Personal Applications</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Add pre-configured high-quality personal requests instantly to the marketplace. This avoids having to write custom ones from scratch when showcasing the borrower program.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRESET_SAMPLE_LOANS.map((preset, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-5 rounded-xl transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-bold text-white text-base">{preset.businessName}</h4>
                          <span className="bg-slate-800 text-indigo-400 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded border border-indigo-500/10">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Requested capital</span>
                          <span className="block text-sm font-extrabold text-white">₱{preset.requestedAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Term limit</span>
                          <span className="block text-sm font-semibold text-slate-300">{preset.termMonths} Months</span>
                        </div>
                        <button
                          onClick={() => handleSeedPreset(index)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Seed Loan
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 bg-slate-900 flex justify-between items-center border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-white">Cumulative Escrow Transactions Ledger</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Audited smart payments logs</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="py-4 px-5">Transaction ID</th>
                        <th className="py-4 px-5">Loan Reference</th>
                        <th className="py-4 px-5">Type</th>
                        <th className="py-4 px-5">Transfer Amount</th>
                        <th className="py-4 px-5">Route (Sender → Receiver)</th>
                        <th className="py-4 px-5 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                            No ledger transactions recorded in local platform memory.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-5 font-mono text-[10px] text-slate-400">
                              {tx.id}
                            </td>
                            <td className="py-3 px-5">
                              <span className="block font-semibold text-white">{tx.loanName}</span>
                              <span className="block text-[9px] font-mono text-slate-500">{tx.loanId}</span>
                            </td>
                            <td className="py-3 px-5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                                tx.type === 'FUNDING' ? 'text-indigo-400' : 'text-emerald-400'
                              }`}>
                                {tx.type === 'FUNDING' ? '⚡ Funding' : '💰 Repayment'}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-sm font-bold text-slate-100">
                              ₱{Math.round(tx.amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-1 text-slate-300 font-mono text-[10px]">
                                <span className="truncate max-w-[120px]" title={tx.sender}>{tx.sender}</span>
                                <span className="text-slate-500">→</span>
                                <span className="truncate max-w-[120px]" title={tx.receiver}>{tx.receiver}</span>
                              </div>
                            </td>
                            <td className="py-3 px-5 text-right text-[11px] text-slate-500">
                              {new Date(tx.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lender_mirror' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Replication Header Banner */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      Live Lender Portal Replication Active
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Mirrors real-time user profiles, active loan balances, and capital wallet structures.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 py-1.5 px-3.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span className="text-[11px] text-slate-300 font-mono">Channel: Secure OAuth</span>
                </div>
              </div>

              {/* Account Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Card 1: Approved Loan */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-300 text-emerald-500">
                    <ShieldCheck size={120} />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Loan</p>
                      <h3 className="text-3xl font-extrabold text-white tracking-tight font-display mt-2">
                        ₱{latestApprovedLoanAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
                      <ShieldCheck size={20} />
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between gap-2">
                    {loans.some(l => l.id === 'loan-3' && l.status === 'MARKETPLACE') ? (
                      <button
                        onClick={() => handleForceFund('loan-3')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer animate-pulse"
                      >
                        <CheckCircle2 size={14} />
                        Approve First Loan (₱1,000)
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        First Loan Approved • Funds Ready for Disbursement
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Card 2: Active Loan */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-300 text-indigo-500">
                    <Briefcase size={120} />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Loan</p>
                      <h3 className="text-3xl font-extrabold text-white tracking-tight font-display mt-2">
                        ₱{loans.filter(l => l.lenderId && (l.status === 'REPAYING' || l.status === 'PAID')).reduce((sum, loan) => sum + loan.fundedAmount, 0).toLocaleString()}
                      </h3>
                    </div>
                    <span className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
                      <Briefcase size={20} />
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-850">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold rounded-sm text-[10px]">
                        20% APR
                      </span>
                      Fixed Interest Rate
                    </div>
                    <span className="font-semibold text-indigo-400">
                      {loans.filter(l => l.lenderId && (l.status === 'REPAYING' || l.status === 'PAID')).length} Active Contracts
                    </span>
                  </div>
                </div>
              </div>

              {/* Registered Accounts & Account Management Console */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden mt-6">
                <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Users size={16} className="text-indigo-400" />
                      Synchronized Gmail User Accounts & Account Management Console
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time synchronized records for every registered Gmail account. Manage identity, balance, KYC, and suspension rules.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenCreateAccountModal}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      Create User Account
                    </button>
                    <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-indigo-500/30 font-mono">
                      {registeredLenders.length} SYNCHRONIZED ACCOUNTS
                    </span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search by Gmail address, legal name, or residential location..."
                      value={accountSearchQuery}
                      onChange={(e) => setAccountSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 outline-hidden transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={accountStatusFilter}
                      onChange={(e) => setAccountStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-300 text-xs rounded-xl px-3 py-2 outline-hidden cursor-pointer"
                    >
                      <option value="ALL">All Account & KYC Statuses</option>
                      <option value="ACTIVE">Status: ACTIVE</option>
                      <option value="SUSPENDED">Status: SUSPENDED</option>
                      <option value="VERIFIED">KYC: Verified</option>
                      <option value="SUBMITTED">KYC: Auditing</option>
                      <option value="UNVERIFIED">KYC: Unverified</option>
                    </select>
                    <button
                      onClick={loadRegisteredLenders}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Force Sync All User Accounts"
                    >
                      <RefreshCw size={13} />
                      Sync
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="py-4 px-5">Gmail Contact & Role</th>
                        <th className="py-4 px-5">Account Status</th>
                        <th className="py-4 px-5">Legal Profile</th>
                        <th className="py-4 px-5">Capital Wallet Balance</th>
                        <th className="py-4 px-5">KYC Identity</th>
                        <th className="py-4 px-5">Loan Activity</th>
                        <th className="py-4 px-5 text-right">Admin Actions & Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-medium">
                      {registeredLenders.filter(lender => {
                        const q = accountSearchQuery.toLowerCase().trim();
                        const matchesSearch = !q || 
                          lender.email.toLowerCase().includes(q) || 
                          lender.name.toLowerCase().includes(q) || 
                          lender.address.toLowerCase().includes(q);
                          
                        const matchesStatus = accountStatusFilter === 'ALL' || 
                          lender.accountStatus === accountStatusFilter || 
                          lender.status === accountStatusFilter;

                        return matchesSearch && matchesStatus;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-500">
                            No registered accounts match the selected search criteria.
                          </td>
                        </tr>
                      ) : (
                        registeredLenders.filter(lender => {
                          const q = accountSearchQuery.toLowerCase().trim();
                          const matchesSearch = !q || 
                            lender.email.toLowerCase().includes(q) || 
                            lender.name.toLowerCase().includes(q) || 
                            lender.address.toLowerCase().includes(q);
                            
                          const matchesStatus = accountStatusFilter === 'ALL' || 
                            lender.accountStatus === accountStatusFilter || 
                            lender.status === accountStatusFilter;

                          return matchesSearch && matchesStatus;
                        }).map((lender) => (
                          <tr key={lender.email} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-[10px] font-bold overflow-hidden shrink-0">
                                  <img
                                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(lender.email.split('@')[0])}`}
                                    alt="User avatar"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <span className="block font-bold text-white">{lender.email}</span>
                                  <span className="block text-[10px] text-slate-500">Registered Gmail User</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              {lender.accountStatus === 'SUSPENDED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full">
                                  <UserX size={10} />
                                  SUSPENDED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                                  <CheckCircle2 size={10} />
                                  ACTIVE
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <div className="max-w-xs">
                                <span className="block font-semibold text-slate-200">{lender.name || <span className="text-slate-600 italic font-normal">Not Submitted</span>}</span>
                                <span className="block text-[10px] text-slate-400 truncate" title={lender.address}>{lender.address || <span className="text-slate-600 italic font-normal">No address</span>}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-slate-200 font-bold font-mono">
                              ₱{lender.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-5">
                              <div className="space-y-1">
                                {lender.status === 'UNVERIFIED' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full">
                                    Unverified
                                  </span>
                                )}
                                {lender.status === 'SUBMITTED' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded-full animate-pulse">
                                    Auditing
                                  </span>
                                )}
                                {lender.status === 'VERIFIED' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                                    Verified
                                  </span>
                                )}
                                {lender.idDoc && (
                                  <button
                                    onClick={() => setSelectedLenderDoc(lender)}
                                    className="text-indigo-400 hover:text-indigo-300 text-[10px] block font-mono hover:underline cursor-pointer"
                                  >
                                    View ID Scan
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <button
                                onClick={() => setSelectedAccountHistory(lender)}
                                className="text-left group cursor-pointer"
                              >
                                <span className="block font-mono text-[11px] text-indigo-400 group-hover:underline font-bold">
                                  {lender.borrowerLoansCount} Borrower Apps • {lender.lenderLoansCount} Funded Loans
                                </span>
                                <span className="block text-[10px] text-slate-500">Click to view history</span>
                              </button>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex justify-end items-center gap-1.5 flex-wrap">
                                {lender.status !== 'VERIFIED' && (
                                  <button
                                    onClick={() => handleUpdateLenderStatus(lender.email, 'VERIFIED')}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Approve User KYC"
                                  >
                                    <Check size={11} />
                                    Approve KYC
                                  </button>
                                )}
                                {lender.status !== 'UNVERIFIED' && (
                                  <button
                                    onClick={() => handleUpdateLenderStatus(lender.email, 'UNVERIFIED')}
                                    className="px-2 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 font-bold text-[10px] rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Reject or Reset User KYC"
                                  >
                                    <X size={11} />
                                    Reset KYC
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleAccountStatus(lender.email, lender.accountStatus)}
                                  className={`px-2 py-1 font-bold text-[10px] rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1 ${
                                    lender.accountStatus === 'ACTIVE'
                                      ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border-amber-500/20'
                                      : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border-emerald-500/20'
                                  }`}
                                  title={lender.accountStatus === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                                >
                                  {lender.accountStatus === 'ACTIVE' ? (
                                    <>
                                      <ShieldX size={11} />
                                      Suspend
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={11} />
                                      Activate
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenEditAccountModal(lender)}
                                  className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Account Details"
                                >
                                  <Edit size={11} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUserAccount(lender.email)}
                                  className="p-1 bg-slate-900 hover:bg-red-950/60 text-rose-400 border border-slate-700 hover:border-red-500/30 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Account Record"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Client KYC & Documents Auditing Hub */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden mt-6">
                <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <FileText size={16} className="text-indigo-400" />
                      Client (Borrower) KYC & Documents Auditing Hub
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Approve, reject, or delete document scans submitted by borrowers. Approved documents are locked against client changes.</p>
                  </div>
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/30 font-mono font-sans">
                    {loans.length} TOTAL CLIENT APPLICATIONS
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="py-4 px-5">Borrower Contact</th>
                        <th className="py-4 px-5">SME Project & Loan ID</th>
                        <th className="py-4 px-5">Submitted ID Attachments</th>
                        <th className="py-4 px-5">Auditing Status</th>
                        <th className="py-4 px-5 text-right">Verification Auditing & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-medium">
                      {loans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-500">
                            No client applications found on the platform.
                          </td>
                        </tr>
                      ) : (
                        loans.map((loan) => {
                          const docs = clientDocs[loan.id] || [];
                          const isApproved = clientDocsApproved[loan.id];
                          return (
                            <tr key={loan.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="py-4 px-5">
                                <div>
                                  <span className="block font-bold text-white">{loan.borrowerEmail}</span>
                                  <span className="block text-[10px] text-slate-500">Business Borrower</span>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <div>
                                  <span className="block font-bold text-slate-200">{loan.businessName}</span>
                                  <span className="block text-[10px] font-mono text-slate-500">{loan.id} • ₱{loan.requestedAmount.toLocaleString()} • {loan.termMonths}m</span>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                {docs.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {docs.map((doc: any) => (
                                      <div key={doc.id} className="flex items-center gap-2">
                                        <span className="text-slate-300 font-mono text-[11px]">{doc.type} ({doc.size})</span>
                                        <button
                                          onClick={() => setSelectedClientDoc({ doc, loanName: loan.businessName, loanId: loan.id })}
                                          className="text-indigo-400 hover:text-indigo-300 text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                                        >
                                          View
                                        </button>
                                        {!isApproved && (
                                          <button
                                            onClick={() => handleDeleteClientDoc(loan.id, doc.id)}
                                            className="text-rose-400 hover:text-rose-300 text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                                            title="Delete document"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic font-normal">No Documents Submitted</span>
                                )}
                              </td>
                              <td className="py-4 px-5">
                                {isApproved ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                                    Verified & Approved
                                  </span>
                                ) : docs.length > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded-full animate-pulse">
                                    Auditing Pending
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full">
                                    Missing Documents
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {docs.length > 0 && !isApproved && (
                                    <button
                                      onClick={() => handleConfirmClientDocs(loan.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded transition-all cursor-pointer inline-flex items-center gap-1"
                                    >
                                      <Check size={11} />
                                      Confirm & Approve Docs
                                    </button>
                                  )}
                                  {isApproved && (
                                    <button
                                      onClick={() => handleRejectClientDocs(loan.id)}
                                      className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 font-bold text-[10px] rounded transition-all cursor-pointer inline-flex items-center gap-1"
                                    >
                                      <Trash2 size={11} />
                                      Reset / Unlock Edit
                                    </button>
                                  )}
                                  {docs.length > 0 && !isApproved && (
                                    <button
                                      onClick={() => handleDeleteAllClientDocs(loan.id)}
                                      className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 font-bold text-[10px] rounded transition-all cursor-pointer inline-flex items-center gap-1"
                                      title="Delete all documents"
                                    >
                                      Delete All
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lender Active Contracts Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden mt-6">
                <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-white">Lender Portfolio Contracts Monitor</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Active SME credit investments yielding 20%</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                    SECURE LEDGER
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="py-4 px-5">Contract ID & Business Name</th>
                        <th className="py-4 px-5">Principal</th>
                        <th className="py-4 px-5">Total Yield Return (20%)</th>
                        <th className="py-4 px-5">Payments Progress</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5 text-right">Lender Portal Simulator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-medium">
                      {loans.filter(l => l.lenderId && (l.status === 'REPAYING' || l.status === 'PAID')).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-500 text-xs leading-relaxed">
                            No active investment contracts currently held by lender.<br />
                            <span className="text-[10px] text-indigo-400 mt-1 block">Approve the "First Loan" or fund any marketplace application below to populate this list.</span>
                          </td>
                        </tr>
                      ) : (
                        loans.filter(l => l.lenderId && (l.status === 'REPAYING' || l.status === 'PAID')).map((loan) => {
                          const totalExpected = loan.requestedAmount * 1.20;
                          return (
                            <tr key={loan.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="py-4 px-5">
                                <span className="block text-slate-400 text-[9px] font-mono mb-0.5">{loan.id}</span>
                                <span className="block font-bold text-white text-sm">{loan.businessName}</span>
                              </td>
                              <td className="py-4 px-5 font-semibold text-slate-100">
                                ₱{loan.requestedAmount.toLocaleString()}
                              </td>
                              <td className="py-4 px-5 text-emerald-400 font-bold">
                                ₱{totalExpected.toLocaleString()}
                              </td>
                              <td className="py-4 px-5">
                                <div className="max-w-[180px]">
                                  <div className="flex justify-between items-center text-[10px] mb-1">
                                    <span className="text-slate-400">{loan.paymentsMade}/{loan.termMonths} {loan.termMonths === 30 || loan.termMonths === 15 ? 'Days' : loan.termMonths === 1 ? '1-Time Pay' : 'Months'}</span>
                                    <span className="text-emerald-400 font-bold">
                                      ₱{Math.round(loan.totalPaid).toLocaleString()} / ₱{Math.round(totalExpected).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                      style={{ width: `${(loan.paymentsMade / loan.termMonths) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  loan.status === 'REPAYING'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {loan.status}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-right space-x-1">
                                {loan.status === 'REPAYING' && (
                                  <>
                                    <button
                                      onClick={() => handleForceRepayment(loan.id)}
                                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer"
                                      title="Process mock monthly payment from borrower"
                                    >
                                      <Clock size={11} />
                                      Pay Month
                                    </button>
                                    <button
                                      onClick={() => handleForceCompletePayments(loan.id)}
                                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer"
                                      title="Settle all outstanding balances immediately"
                                    >
                                      <CheckCircle2 size={11} />
                                      Fully Paid
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marketplace Synchronization Mirror */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden mt-6">
                <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-white">Marketplace Open SME Credit Requests</h4>
                    <p className="text-xs text-slate-400 mt-0.5">SME applications awaiting initial lender selection</p>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                    {loans.filter(l => l.status === 'MARKETPLACE').length} AVAILABLE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                  {loans.filter(l => l.status === 'MARKETPLACE').length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
                      All SME applications have been funded! Use the "Seed Requests" tab to inject more.
                    </div>
                  ) : (
                    loans.filter(l => l.status === 'MARKETPLACE').map((loan) => (
                      <div key={loan.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750 transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-white text-sm">{loan.businessName}</h5>
                            <span className="bg-slate-800 text-indigo-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                              {loan.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                            {loan.description}
                          </p>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-800/60 pt-3 mt-2">
                          <div>
                            <span className="block text-[9px] text-slate-500 font-bold uppercase">Disbursement</span>
                            <span className="block font-extrabold text-white text-sm">₱{loan.requestedAmount.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleForceFund(loan.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Sparkles size={11} />
                            Fund & Disburse
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Admin Portal Document View Overlay */}
      <AnimatePresence>
        {selectedLenderDoc && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 text-white border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                    <Lock size={14} className="text-emerald-500" />
                    Admin ID Document Auditer
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Viewing credentials for {selectedLenderDoc.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLenderDoc(null)}
                  className="p-1.5 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 bg-slate-950 flex flex-col items-center justify-center aspect-video overflow-hidden border-b border-slate-800">
                <img
                  src={selectedLenderDoc.idDoc?.previewUrl}
                  alt="Lender ID Document"
                  className="max-h-full max-w-full object-contain rounded-lg border border-slate-800"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600";
                  }}
                />
              </div>
              <div className="p-4 bg-slate-900 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Funder Legal Name</span>
                  <span className="font-semibold text-white">{selectedLenderDoc.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">ID Card Type</span>
                  <span className="font-semibold text-white">{selectedLenderDoc.idType}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      handleUpdateLenderStatus(selectedLenderDoc.email, 'VERIFIED');
                      setSelectedLenderDoc(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Approve KYC
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateLenderStatus(selectedLenderDoc.email, 'UNVERIFIED');
                      setSelectedLenderDoc(null);
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Reject KYC
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Portal Client Document View Overlay */}
      <AnimatePresence>
        {selectedClientDoc && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 text-white border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                    <FileText size={14} className="text-indigo-400" />
                    Admin Client ID Document Auditer
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Viewing credential "{selectedClientDoc.doc.name}" for {selectedClientDoc.loanName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClientDoc(null)}
                  className="p-1.5 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 bg-slate-950 flex flex-col items-center justify-center aspect-video overflow-hidden border-b border-slate-800">
                <img
                  src={selectedClientDoc.doc.previewUrl}
                  alt="Client ID Document"
                  className="max-h-full max-w-full object-contain rounded-lg border border-slate-800"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600";
                  }}
                />
              </div>
              <div className="p-4 bg-slate-900 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Document Type</span>
                  <span className="font-semibold text-white">{selectedClientDoc.doc.type}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Uploaded At</span>
                  <span className="font-semibold text-white">{selectedClientDoc.doc.uploadedAt || 'N/A'}</span>
                </div>
                <div className="flex gap-1.5">
                  {!clientDocsApproved[selectedClientDoc.loanId] ? (
                    <button
                      onClick={() => {
                        handleConfirmClientDocs(selectedClientDoc.loanId);
                        setSelectedClientDoc(null);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleRejectClientDocs(selectedClientDoc.loanId);
                        setSelectedClientDoc(null);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Unlock/Reject
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this document?")) {
                        handleDeleteClientDoc(selectedClientDoc.loanId, selectedClientDoc.doc.id);
                        setSelectedClientDoc(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-red-950 text-red-400 border border-red-500/20 hover:bg-red-900/40 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Delete Doc
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit User Account Modal */}
      <AnimatePresence>
        {showAccountModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 text-white border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                    <UserPlus size={16} className="text-indigo-400" />
                    {editingAccount ? `Edit Account: ${editingAccount.email}` : 'Create New Synchronized Gmail User Account'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Configure identity, capital wallet balance, KYC verification status, and security permissions.
                  </p>
                </div>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveAccount} className="p-6 space-y-4 bg-slate-900 text-xs">
                {accountFormError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{accountFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Gmail Address *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingAccount}
                    placeholder="user.account@gmail.com"
                    value={accountFormEmail}
                    onChange={(e) => setAccountFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-hidden transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Arthur Pendragon"
                      value={accountFormName}
                      onChange={(e) => setAccountFormName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-hidden transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">ID Document Type</label>
                    <select
                      value={accountFormIdType}
                      onChange={(e) => setAccountFormIdType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-hidden cursor-pointer"
                    >
                      <option value="National ID">National ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="SSS / UMID ID">SSS / UMID ID</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Suite 300, 88 Corporate Avenue, Metro Manila"
                    value={accountFormAddress}
                    onChange={(e) => setAccountFormAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-hidden transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">KYC Status</label>
                    <select
                      value={accountFormKycStatus}
                      onChange={(e) => setAccountFormKycStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-hidden cursor-pointer"
                    >
                      <option value="VERIFIED">Verified</option>
                      <option value="SUBMITTED">Auditing</option>
                      <option value="UNVERIFIED">Unverified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Account State</label>
                    <select
                      value={accountFormAccountStatus}
                      onChange={(e) => setAccountFormAccountStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-hidden cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Wallet Balance (₱)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={accountFormBalance}
                      onChange={(e) => setAccountFormBalance(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-hidden transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAccountModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    Save & Synchronize
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Account Activity & Loan History Modal */}
      <AnimatePresence>
        {selectedAccountHistory && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 text-white border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold overflow-hidden shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedAccountHistory.email.split('@')[0])}`}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      {selectedAccountHistory.email}
                      {selectedAccountHistory.accountStatus === 'SUSPENDED' ? (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold rounded-full">SUSPENDED</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded-full">ACTIVE</span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Legal Name: {selectedAccountHistory.name || 'N/A'} • Wallet: ₱{selectedAccountHistory.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAccountHistory(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
                {/* Borrower Credit Applications */}
                <div>
                  <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-400" />
                    Borrower Credit Applications ({selectedAccountHistory.borrowerLoans.length})
                  </h5>
                  {selectedAccountHistory.borrowerLoans.length === 0 ? (
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center text-slate-500 italic">
                      No borrower credit applications submitted by this Gmail account.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedAccountHistory.borrowerLoans.map((loan: Loan) => (
                        <div key={loan.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{loan.businessName}</span>
                              <span className="text-[9px] font-mono text-slate-500">{loan.id}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              ₱{loan.requestedAmount.toLocaleString()} • {loan.termMonths} Months • 20% APR
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            loan.status === 'REPAYING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            loan.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            loan.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lender Funded Contracts */}
                <div>
                  <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-emerald-400" />
                    Lender Funded Contracts ({selectedAccountHistory.lenderLoans.length})
                  </h5>
                  {selectedAccountHistory.lenderLoans.length === 0 ? (
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center text-slate-500 italic">
                      No peer loans funded by this Gmail account.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedAccountHistory.lenderLoans.map((loan: Loan) => (
                        <div key={loan.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{loan.businessName}</span>
                              <span className="text-[9px] font-mono text-slate-500">{loan.id}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Funded: ₱{loan.fundedAmount.toLocaleString()} • Borrower: {loan.borrowerEmail}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            loan.status === 'REPAYING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedAccountHistory(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
