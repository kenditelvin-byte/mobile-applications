export type UserRole = 'member' | 'admin';

export type AccountStatus = 'active' | 'pending' | 'suspended';

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed';

export type LoanRepaymentFrequency = 'monthly' | 'bi-weekly';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'loan_disbursement'
  | 'loan_repayment'
  | 'share_contribution'
  | 'transfer';

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface User {
  id: string;
  memberNumber: string;
  fullName: string;
  nationalId: string;
  phone: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  address: string;
  password: string; // Hashed/demo-stored
  role: UserRole;
  status: AccountStatus;
  avatarUrl?: string;
  createdAt: string;
}

export interface SACCOProduct {
  id: string;
  name: string;
  description: string;
  interestRate: number; // Annual %
  minAmount: number;
  maxAmount: number;
  minDurationMonths: number;
  maxDurationMonths: number;
  repaymentFrequency: LoanRepaymentFrequency[];
  icon: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  productId: string;
  productName: string;
  requestedAmount: number;
  approvedAmount: number;
  interestRate: number; // percentage e.g. 10%
  interestAmount: number;
  totalRepayment: number;
  monthlyInstallment: number;
  durationMonths: number;
  repaymentFrequency: LoanRepaymentFrequency;
  purpose: string;
  status: LoanStatus;
  dateApplied: string;
  dateApproved?: string;
  dateDisbursed?: string;
  dateCompleted?: string;
  amountRepaid: number;
  outstandingBalance: number;
  nextRepaymentDate?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  loanNumber: string;
  memberId: string;
  amount: number;
  paymentMethod: 'mpesa' | 'bank_transfer' | 'savings_deduction';
  referenceNumber: string;
  date: string;
  remainingBalance: number;
  notes?: string;
}

export interface SavingsAccount {
  memberId: string;
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  lastDepositDate?: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  type: TransactionType;
  amount: number;
  date: string;
  time: string;
  description: string;
  status: TransactionStatus;
  referenceNumber: string;
  balanceAfter: number;
}

export interface SharesAccount {
  memberId: string;
  totalShares: number;
  sharePrice: number; // e.g. KES 100 or $10
  totalValue: number;
  minimumRequiredShares: number;
  lastContributionDate?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'all' or specific memberId
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  date: string;
  time: string;
  isRead: boolean;
  linkScreen?: string;
}

export interface SACCOAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'normal' | 'high' | 'urgent';
}

