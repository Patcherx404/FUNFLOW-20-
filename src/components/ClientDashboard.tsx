import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Eye, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Bell, 
  ShieldAlert,
  User,
  CreditCard,
  Check,
  FileCheck,
  Info
} from 'lucide-react';
import { Loan } from '../types';

interface DocumentFile {
  id: string;
  type: string;
  name: string;
  size: string;
  previewUrl: string;
  uploadedAt: string;
}

interface ClientApplication {
  id: string;
  name: string;
  email: string;
  amount: number;
  category: string;
  submittedAt: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  statusLabel: string;
  statusColor: string;
  description: string;
  notifications: {
    id: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    message: string;
    date: string;
  }[];
  initialDocs: DocumentFile[];
  isDocsApproved: boolean;
}

interface ClientDashboardProps {
  loans: Loan[];
  onMakeRepayment?: (loanId: string, paymentType: 'standard' | 'interest-only') => void;
}

export default function ClientDashboard({ loans, onMakeRepayment }: ClientDashboardProps) {
  const [selectedAppIndex, setSelectedAppIndex] = useState(0);
  const [clientPayType, setClientPayType] = useState<'standard' | 'interest-only'>('standard');

  // Client-uploaded documents list (mocked state tied to current selection, persisted in localStorage)
  const [uploadedDocs, setUploadedDocs] = useState<{ [appId: string]: DocumentFile[] }>(() => {
    const initial: { [appId: string]: DocumentFile[] } = {
      'loan-1': [],
      'loan-2': [
        {
          id: 'doc-1',
          type: 'Passport',
          name: 'passport_scan_machining.jpg',
          size: '1.4 MB',
          previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
          uploadedAt: '2026-04-15'
        }
      ],
      'loan-3': [
        {
          id: 'doc-2',
          type: "Driver's License",
          name: 'drivers_license_solar.png',
          size: '890 KB',
          previewUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=400',
          uploadedAt: '2026-07-20'
        }
      ],
      'loan-4': [],
      'loan-5': [],
      'loan-6': [
        {
          id: 'doc-3',
          type: 'National ID',
          name: 'national_id_logistics.jpg',
          size: '1.1 MB',
          previewUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400',
          uploadedAt: '2026-01-10'
        }
      ]
    };

    // Load actual stored values if they exist, or seed them if they don't
    Object.keys(initial).forEach(id => {
      const stored = localStorage.getItem(`client_docs_${id}`);
      if (stored) {
        try {
          initial[id] = JSON.parse(stored);
        } catch (e) {
          // ignore parsing error
        }
      } else {
        localStorage.setItem(`client_docs_${id}`, JSON.stringify(initial[id]));
      }
    });

    return initial;
  });

  const [documentType, setDocumentType] = useState('National ID');
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fallback to empty if loans is empty or deleted
  if (!loans || loans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 space-y-4">
        <ShieldAlert size={48} className="text-gray-300 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">No Active Client Accounts</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          All client files and application records have been deleted in the live loan manager. Please use the Admin Gateway to seed demo requests.
        </p>
      </div>
    );
  }

  // Construct applications dynamically from live loans list
  const dynamicApplications: ClientApplication[] = loans.map(loan => {
    const docs = uploadedDocs[loan.id] || [];
    
    let status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' = 'PENDING';
    let statusLabel = 'Pending Document Upload';
    let statusColor = 'amber';

    if (loan.status === 'PAID') {
      status = 'APPROVED';
      statusLabel = 'Fully Repaid • Closed';
      statusColor = 'emerald';
    } else if (loan.status === 'REPAYING') {
      status = 'APPROVED';
      statusLabel = 'Approved • Repaying';
      statusColor = 'emerald';
    } else if (loan.status === 'PENDING') {
      status = 'PENDING';
      statusLabel = 'Awaiting Admin Approval';
      statusColor = 'amber';
    } else if (loan.status === 'MARKETPLACE') {
      if (docs.length > 0) {
        status = 'UNDER_REVIEW';
        statusLabel = 'Under Review by Underwriting';
        statusColor = 'blue';
      } else {
        status = 'PENDING';
        statusLabel = 'Pending Document Upload';
        statusColor = 'amber';
      }
    }

    // Dynamic Contextual Notifications
    const notifications = [];
    if (loan.status === 'PAID') {
      notifications.push({
        id: `n-${loan.id}-1`,
        type: 'success' as const,
        message: `Congratulations! Your loan of ₱${loan.requestedAmount.toLocaleString()} has been fully paid and successfully closed.`,
        date: 'Today, 2:10 PM'
      });
      notifications.push({
        id: `n-${loan.id}-2`,
        type: 'info' as const,
        message: 'Lender Ledger: Certificate of Loan Completion issued. Repayment is 100% complete.',
        date: 'July 20, 2026'
      });
    } else if (loan.status === 'REPAYING') {
      notifications.push({
        id: `n-${loan.id}-1`,
        type: 'success' as const,
        message: `Your credit request of ₱${loan.requestedAmount.toLocaleString()} is active. Repayment progress: ${loan.paymentsMade} of ${loan.termMonths} ${loan.termMonths === 30 || loan.termMonths === 15 ? 'days' : loan.termMonths === 1 ? 'installment' : 'months'} paid (${Math.round(loan.paymentsMade / loan.termMonths * 100)}%).`,
        date: 'Today, 8:30 AM'
      });
      notifications.push({
        id: `n-${loan.id}-2`,
        type: 'info' as const,
        message: `Identity document check: Your submitted ID credentials have passed compliance audit.`,
        date: 'Yesterday'
      });
    } else if (loan.status === 'PENDING') {
      notifications.push({
        id: `n-${loan.id}-1`,
        type: 'info' as const,
        message: `Your credit request of ₱${loan.requestedAmount.toLocaleString()} has been submitted. It is now awaiting review and approval by the system administrator in the Admin Console.`,
        date: 'Just Now'
      });
      notifications.push({
        id: `n-${loan.id}-2`,
        type: 'warning' as const,
        message: `Status: Pending live loan manager underwriting approval. Lenders will be able to view and fund this in the marketplace once approved.`,
        date: 'Just Now'
      });
    } else {
      // MARKETPLACE
      if (docs.length === 0) {
        notifications.push({
          id: `n-${loan.id}-1`,
          type: 'warning' as const,
          message: `Lender Remarks: Please upload your National ID, Driver's License, or Passport to verify your identity. Your previous photocopy scan was unreadable.`,
          date: 'Today, 10:15 AM'
        });
        notifications.push({
          id: `n-${loan.id}-2`,
          type: 'info' as const,
          message: 'Your application has been created and saved in the secure FundFlow client registry.',
          date: loan.createdAt
        });
      } else {
        notifications.push({
          id: `n-${loan.id}-1`,
          type: 'info' as const,
          message: 'Underwriting Queue: Your submitted credentials are currently being reviewed by underwriting compliance.',
          date: 'Today, 10:15 AM'
        });
        notifications.push({
          id: `n-${loan.id}-2`,
          type: 'success' as const,
          message: `Credentials Uploaded: ${docs.map(d => d.type).join(', ')} successfully added to your client file.`,
          date: 'Just now'
        });
      }
    }

    const isDocsApproved = localStorage.getItem(`client_docs_approved_${loan.id}`) === 'true';

    return {
      id: loan.id,
      name: loan.businessName,
      email: loan.borrowerEmail,
      amount: loan.requestedAmount,
      category: loan.category,
      submittedAt: loan.createdAt,
      status,
      statusLabel,
      statusColor,
      description: loan.description,
      notifications,
      initialDocs: docs,
      isDocsApproved
    };
  });

  // Safeguard index bounds
  const activeIndex = selectedAppIndex >= dynamicApplications.length ? 0 : selectedAppIndex;
  const currentApp = dynamicApplications[activeIndex];
  const underlyingLoan = loans.find(l => l.id === currentApp.id);

  const currentDocs = uploadedDocs[currentApp.id] || [];

  // File selection / drag drop simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate standard upload progress/timeout
    setTimeout(() => {
      const localUrl = URL.createObjectURL(file);
      
      const newDoc: DocumentFile = {
        id: `doc-${Date.now()}`,
        type: documentType,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        previewUrl: localUrl,
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setUploadedDocs(prev => {
        const updatedDocsList = [newDoc, ...(prev[currentApp.id] || [])];
        localStorage.setItem(`client_docs_${currentApp.id}`, JSON.stringify(updatedDocsList));
        
        // When client uploads a new document, the approval status should reset to false
        localStorage.setItem(`client_docs_approved_${currentApp.id}`, 'false');

        return {
          ...prev,
          [currentApp.id]: updatedDocsList
        };
      });

      setIsUploading(false);
    }, 1000);
  };

  const handleRemoveDoc = (docId: string) => {
    setUploadedDocs(prev => {
      const updatedDocsList = (prev[currentApp.id] || []).filter(doc => doc.id !== docId);
      localStorage.setItem(`client_docs_${currentApp.id}`, JSON.stringify(updatedDocsList));
      
      // If we remove documents, let's also ensure approval is unset
      localStorage.setItem(`client_docs_approved_${currentApp.id}`, 'false');

      return {
        ...prev,
        [currentApp.id]: updatedDocsList
      };
    });
    if (previewDoc?.id === docId) {
      setPreviewDoc(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      
      {/* Top Interactive Demo Switching Rail */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest">Client Workspace Simulator</h4>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Select a client account profile to see how the dashboard adapts to different credit review statuses.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {dynamicApplications.map((app, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedAppIndex(index);
                    setPreviewDoc(null);
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex-1 md:flex-none text-left md:text-center ${
                    isActive 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-black' 
                      : 'bg-slate-950 text-gray-300 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="font-extrabold">{app.name}</div>
                  <div className="text-[10px] opacity-80 font-normal mt-0.5 flex items-center gap-1">
                    <span className="font-mono text-[9px]">{app.id}</span> • 
                    <span className="font-semibold text-[9px] uppercase">{app.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Loan Details & Status Tracker */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Tracker Banner */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Application Tracking</span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
                  ID: <span className="font-mono text-blue-600 font-extrabold">{currentApp.id}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full inline-block animate-pulse ${
                  currentApp.status === 'PENDING' ? 'bg-amber-500' :
                  currentApp.status === 'UNDER_REVIEW' ? 'bg-blue-500' :
                  currentApp.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></span>
                <span className={`px-3.5 py-1.5 text-xs font-black rounded-full uppercase border ${
                  currentApp.status === 'PENDING' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                  currentApp.status === 'UNDER_REVIEW' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                  currentApp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                  'bg-rose-500/10 text-rose-700 border-rose-500/20'
                }`}>
                  {currentApp.statusLabel}
                </span>
              </div>
            </div>

            {/* Visual Process Timeline */}
            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-4 gap-2 relative">
                
                {/* Horizontal Progress bar behind steps */}
                <div className="absolute top-4 left-[12%] right-[12%] h-[3px] bg-gray-100 -z-1">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: 
                        currentApp.status === 'PENDING' ? '25%' :
                        currentApp.status === 'UNDER_REVIEW' ? '66%' :
                        currentApp.status === 'APPROVED' ? '100%' : '50%'
                    }}
                  ></div>
                </div>

                {/* Step 1: Submitted */}
                <div className="text-center space-y-2">
                  <div className="mx-auto w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-4 border-white shadow-xs">
                    ✓
                  </div>
                  <span className="block text-[11px] font-bold text-gray-800">Submitted</span>
                  <span className="block text-[9px] text-gray-400 font-medium">{currentApp.submittedAt}</span>
                </div>

                {/* Step 2: Verification */}
                <div className="text-center space-y-2">
                  <div className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-4 border-white shadow-xs ${
                    currentApp.status === 'PENDING'
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {currentApp.status === 'PENDING' ? '!' : '✓'}
                  </div>
                  <span className="block text-[11px] font-bold text-gray-800">Verification</span>
                  <span className="block text-[9px] text-gray-400 font-medium">
                    {currentApp.status === 'PENDING' ? 'Action Required' : 'Completed'}
                  </span>
                </div>

                {/* Step 3: Review */}
                <div className="text-center space-y-2">
                  <div className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-4 border-white shadow-xs ${
                    currentApp.status === 'PENDING' ? 'bg-gray-100 text-gray-400' :
                    currentApp.status === 'UNDER_REVIEW' ? 'bg-blue-600 text-white animate-pulse' :
                    currentApp.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {currentApp.status === 'REJECTED' ? '✕' : (currentApp.status === 'APPROVED' ? '✓' : '3')}
                  </div>
                  <span className="block text-[11px] font-bold text-gray-800">Review</span>
                  <span className="block text-[9px] text-gray-400 font-medium">
                    {currentApp.status === 'UNDER_REVIEW' ? 'Underway' : 
                     currentApp.status === 'REJECTED' ? 'Declined' : 
                     currentApp.status === 'APPROVED' ? 'Approved' : 'Awaiting Docs'}
                  </span>
                </div>

                {/* Step 4: Decision */}
                <div className="text-center space-y-2">
                  <div className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-4 border-white shadow-xs ${
                    currentApp.status === 'APPROVED' ? 'bg-emerald-500 text-white' :
                    currentApp.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {currentApp.status === 'APPROVED' ? '🎉' : (currentApp.status === 'REJECTED' ? '✕' : '4')}
                  </div>
                  <span className="block text-[11px] font-bold text-gray-800 font-display">Decision</span>
                  <span className="block text-[9px] text-gray-400 font-medium">
                    {currentApp.status === 'APPROVED' ? 'Funds Cleared' : 
                     currentApp.status === 'REJECTED' ? 'Denied' : 'Pending'}
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Identity Document Upload Center</h4>
              <p className="text-xs text-gray-500 mt-1">
                Upload official credentials to satisfy credit requirements. Clear, legible color scans or photographs of Government IDs are required.
              </p>
            </div>

             {/* Document configuration controls */}
            {currentApp.isDocsApproved ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-xs flex items-start gap-3">
                <FileCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Identity Verification Approved & Locked</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Your submitted identity documents have been successfully verified and approved by the Underwriting Hub. To protect your credentials, editing or removing these files has been disabled.
                  </p>
                </div>
              </div>
            ) : currentApp.status !== 'APPROVED' && currentApp.status !== 'REJECTED' ? (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Select ID Document Type</label>
                  <select 
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="bg-white text-xs font-bold text-gray-800 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 w-full"
                  >
                    <option value="National ID">National ID Card</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="Passport">International Passport</option>
                    <option value="Professional ID">PRC/Government Work ID</option>
                  </select>
                </div>

                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Choose Scan File</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                      disabled={isUploading}
                    />
                    <div className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg py-2 px-3 transition-colors text-xs font-semibold text-gray-600 justify-center">
                      <Upload size={14} className="text-blue-500" />
                      {isUploading ? 'Uploading credentials securely...' : `Upload Selected ${documentType}`}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <FileCheck size={16} className="text-emerald-500" />
                This loan application status is currently locked. No additional uploads can be processed.
              </div>
            )}

            {/* Uploaded Documents List */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Submitted ID Attachments ({currentDocs.length})</h5>
              {currentDocs.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center space-y-2">
                  <Upload size={24} className="text-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-500">No identity documents uploaded yet</p>
                  <p className="text-[10px] text-gray-400">Please choose your government ID type above and upload to begin identity underwriting check.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentDocs.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`p-3 bg-white border rounded-xl flex items-center justify-between transition-all ${
                        previewDoc?.id === doc.id ? 'border-blue-500 bg-blue-50/10' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="block font-bold text-gray-800 text-xs truncate max-w-[150px]">{doc.name}</span>
                          <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{doc.type} • {doc.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 bg-gray-50 text-gray-500 hover:text-blue-600 rounded-lg border border-gray-100 transition-colors cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye size={13} />
                        </button>
                        {currentApp.status !== 'APPROVED' && currentApp.status !== 'REJECTED' && !currentApp.isDocsApproved && (
                          <button
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="p-1.5 bg-gray-50 text-gray-400 hover:text-rose-600 rounded-lg border border-gray-100 transition-colors cursor-pointer"
                            title="Replace / Remove Document"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Live Preview Panel */}
            {previewDoc && (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded font-mono">
                      SECURE PREVIEW
                    </span>
                    <span className="text-xs text-white font-mono font-semibold">{previewDoc.name} ({previewDoc.type})</span>
                  </div>
                  <button 
                    onClick={() => setPreviewDoc(null)}
                    className="text-gray-400 hover:text-white font-black text-xs px-2 py-1 bg-slate-800 rounded cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="aspect-video max-h-[300px] w-full bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 relative">
                  <img 
                    src={previewDoc.previewUrl} 
                    alt="Document preview" 
                    className="max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                  <span>Uploaded via Secure Escrow Tunnel</span>
                  <span>IP/Status: CERTIFIED</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Basic Details & Notifications Panel */}
        <div className="space-y-6">
          
          {/* Basic Loan Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 pb-3">
              <CreditCard size={14} className="text-blue-600" />
              Secured Loan Summary
            </h4>

            <div className="space-y-3">
              <div>
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Application Principal</span>
                <span className="text-2xl font-black text-gray-900 font-display block mt-1">
                  ₱{currentApp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Submit Date</span>
                  <span className="block font-bold text-gray-800 text-xs mt-1 flex items-center gap-1">
                    <Calendar size={11} className="text-gray-400" />
                    {currentApp.submittedAt}
                  </span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Rate (Mandate)</span>
                  <span className="block font-bold text-gray-800 text-xs mt-1 text-emerald-600">
                    20.00% Flat
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Target Purpose Category</span>
                <span className="text-xs font-bold text-gray-800 leading-normal block">
                  {currentApp.category}
                </span>
              </div>

              <div className="text-xs text-gray-500 leading-relaxed pt-1">
                <span className="font-bold text-gray-700 block text-[9px] uppercase mb-1">Description Brief</span>
                {currentApp.description}
              </div>
            </div>
          </div>

          {/* Client Interactive Repayment Hub */}
          {underlyingLoan && underlyingLoan.status === 'REPAYING' && onMakeRepayment && (
            <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-xs space-y-4 ring-2 ring-amber-500/10 animate-fadeIn">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <CreditCard size={14} className="text-amber-600" />
                Live Repayment Gateway
              </h4>

              <div className="bg-amber-50/70 border border-amber-100 p-3.5 rounded-xl text-xs space-y-1">
                <span className="block font-bold text-amber-800 uppercase text-[9px] tracking-wider">Repayment Status</span>
                <p className="text-amber-900 font-semibold leading-relaxed">
                  You have paid <strong className="text-amber-950 font-black">₱{Math.round(underlyingLoan.totalPaid).toLocaleString()}</strong> of <strong className="text-amber-950 font-black">₱{Math.round(underlyingLoan.requestedAmount * 1.20).toLocaleString()}</strong> total. 
                </p>
                <div className="text-[10px] text-amber-700/90 font-medium">
                  Installments completed: {underlyingLoan.paymentsMade} of {underlyingLoan.termMonths} total periods.
                  {underlyingLoan.interestOnlyPaid && underlyingLoan.interestOnlyPaid > 0 ? (
                    <span className="block mt-0.5 font-bold text-amber-800">
                      Accumulated interest-only payments made: ₱{Math.round(underlyingLoan.interestOnlyPaid).toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Repayment Type Option Picker */}
              <div className="space-y-3">
                {underlyingLoan.interestOnlyExtensionAllowed && (
                  <div className="bg-amber-50 text-amber-900 border border-amber-200/80 p-3.5 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs">
                    <span className="text-sm shrink-0">⚠️</span>
                    <div>
                      <p className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">
                        {underlyingLoan.interestOnlyExtensionPaidThisPeriod 
                          ? 'Pay Interest Only Active (15 Days Auto Extended)' 
                          : 'Admin Enabled: Pay Interest Only (Auto +15 Days)'}
                      </p>
                      <p className="text-[11px] text-amber-700 font-semibold mt-0.5 leading-relaxed">
                        {underlyingLoan.interestOnlyExtensionPaidThisPeriod 
                          ? 'You paid interest only. Your loan has been automatically extended by 15 days. Next period, you can pay interest again or pay the loan with interest.'
                          : 'Your lender / admin enabled Pay Interest Only with an automatic 15-day loan extension. If you have no money right now, pay only the interest to extend by 15 days and stay fully compliant.'}
                      </p>
                    </div>
                  </div>
                )}

                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Payment Type</span>
                
                <div className="grid grid-cols-1 gap-2">
                  {/* Standard Option */}
                  <button
                    type="button"
                    onClick={() => setClientPayType('standard')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      clientPayType === 'standard'
                        ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/10'
                        : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${clientPayType === 'standard' ? 'text-blue-800' : 'text-gray-700'}`}>
                        {underlyingLoan.interestOnlyExtensionAllowed 
                          ? 'Pay the Loan with Interest' 
                          : 'Standard Installment'}
                      </span>
                      <span className="text-xs font-black text-blue-750 font-mono">
                        ₱{Math.round((underlyingLoan.requestedAmount * 1.20) / underlyingLoan.termMonths).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium leading-normal">
                      {underlyingLoan.interestOnlyExtensionAllowed 
                        ? 'Pay the full amortized installment (principal portion plus 20% interest).' 
                        : 'Pays both principal portion and standard interest. Increments loan progress.'}
                    </span>
                  </button>

                  {/* Interest Only Option */}
                  <button
                    type="button"
                    onClick={() => setClientPayType('interest-only')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      clientPayType === 'interest-only'
                        ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/10'
                        : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${clientPayType === 'interest-only' ? 'text-amber-800' : 'text-gray-700'}`}>
                        {underlyingLoan.interestOnlyExtensionAllowed 
                          ? underlyingLoan.interestOnlyExtensionPaidThisPeriod 
                            ? 'Pay Interest Only (Auto Ext +15 Days)' 
                            : 'Pay Interest Only (Auto +15 Days Extension)'
                          : 'Interest Only (Defer Principal)'}
                      </span>
                      <span className="text-xs font-black text-amber-700 font-mono">
                        ₱{Math.round((underlyingLoan.requestedAmount * 0.20) / underlyingLoan.termMonths).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium leading-normal">
                      {underlyingLoan.interestOnlyExtensionAllowed 
                        ? underlyingLoan.interestOnlyExtensionPaidThisPeriod 
                          ? 'Pay only the interest portion. Auto-extends the loan by another 15 days.' 
                          : 'Pay only the 20% interest portion. Auto-extends your loan term by 15 days.'
                        : "Can't pay the full installment? Pay only the 20% interest part to keep the loan compliant."}
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  onMakeRepayment(underlyingLoan.id, clientPayType);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                  clientPayType === 'standard' 
                    ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' 
                    : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700'
                }`}
              >
                <Check size={14} />
                Pay {clientPayType === 'standard' 
                  ? (underlyingLoan.interestOnlyExtensionAllowed ? 'Loan with Interest' : 'Standard Repayment')
                  : (underlyingLoan.interestOnlyExtensionAllowed && underlyingLoan.interestOnlyExtensionPaidThisPeriod ? 'Interest Only (Next Period)' : underlyingLoan.interestOnlyExtensionAllowed ? 'Interest Only (15 Days Extension)' : 'Interest-Only Repayment')
                } via GCash (₱{
                  Math.round(
                    clientPayType === 'standard'
                      ? (underlyingLoan.requestedAmount * 1.20) / underlyingLoan.termMonths
                      : (underlyingLoan.requestedAmount * 0.20) / underlyingLoan.termMonths
                  ).toLocaleString()
                })
              </button>
            </div>
          )}

          {/* Real-time Notifications Feed */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bell size={14} className="text-blue-600" />
                Lender Communication
              </h4>
              <span className="bg-blue-50 text-blue-700 font-bold text-[9px] px-1.5 py-0.5 rounded font-mono">
                LIVE LOG
              </span>
            </div>

            <div className="space-y-3.5">
              {currentApp.notifications.map((notif) => {
                let badgeColor = '';
                if (notif.type === 'warning') badgeColor = 'bg-amber-500';
                if (notif.type === 'info') badgeColor = 'bg-blue-500';
                if (notif.type === 'success') badgeColor = 'bg-emerald-500';
                if (notif.type === 'danger') badgeColor = 'bg-rose-500';

                return (
                  <div key={notif.id} className="flex gap-2.5 items-start">
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${badgeColor}`}></span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-gray-400 block mt-1 font-semibold">{notif.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Private Security Constraints Footer */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="block text-[9px] font-bold text-gray-500 uppercase">Read-Only Safety Restraint</span>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                This account operates under secure, limited customer access. Standard clients are strictly restricted from authorizing loan disbursement, executing ledger modifications, or configuring user roles.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
