export interface Loan {
  id: string;
  businessName: string;
  category: string;
  description: string;
  requestedAmount: number;
  fundedAmount: number;
  termMonths: number;
  interestRate: number; // e.g. 0.20 (20%)
  status: 'PENDING' | 'MARKETPLACE' | 'FUNDED' | 'REPAYING' | 'PAID';
  createdAt: string;
  borrowerEmail: string;
  lenderId: string | null;
  paymentsMade: number;
  totalPaid: number;
  interestOnlyPaid?: number;
  interestOnlyExtensionAllowed?: boolean;
  interestOnlyExtensionPaidThisPeriod?: boolean;
  extensionDays?: number;
}

export interface Transaction {
  id: string;
  loanId: string;
  loanName: string;
  type: 'FUNDING' | 'REPAYMENT';
  amount: number;
  timestamp: string;
  sender: string;
  receiver: string;
}

export interface Lender {
  email: string;
  name: string;
  photoUrl: string;
  balance: number;
}
