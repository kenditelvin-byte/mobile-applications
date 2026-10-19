import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SACCOProduct,
  Loan,
  LoanRepayment,
  SavingsAccount,
  Transaction,
  SharesAccount,
  NotificationItem,
  SACCOAnnouncement,
  User,
  LoanRepaymentFrequency,
} from '../types';
import { StorageService } from '../database/storage';
import { useAuth } from './AuthContext';

interface SACCOContextType {
  // Member Specific Data
  savings: SavingsAccount | null;
  shares: SharesAccount | null;
  myLoans: Loan[];
  myRepayments: LoanRepayment[];
  myTransactions: Transaction[];
  myNotifications: NotificationItem[];
  unreadNotifsCount: number;
  availableLoanLimit: number;

  // Global / Admin Data
  products: SACCOProduct[];
  announcements: SACCOAnnouncement[];
  allLoans: Loan[];
  allTransactions: Transaction[];
  allRepayments: LoanRepayment[];
  allMembers: User[];

  // Statistics
  stats: {
    totalSavings: number;
    totalLoansDisbursed: number;
    totalOutstandingLoans: number;
    totalActiveMembers: number;
    totalRepaymentsReceived: number;
  };

  isLoading: boolean;
  refreshData: () => Promise<void>;
  resetDatabaseToDemo: () => Promise<void>;

  // Member Actions
  depositSavings: (amount: number, method: 'mpesa' | 'bank_transfer', reference?: string) => Promise<{ success: boolean; message: string }>;
  withdrawSavings: (amount: number, method: 'mpesa' | 'bank_transfer', reason: string) => Promise<{ success: boolean; message: string }>;
  applyForLoan: (
    productId: string,
    requestedAmount: number,
    durationMonths: number,
    frequency: LoanRepaymentFrequency,
    purpose: string
  ) => Promise<{ success: boolean; message: string; loan?: Loan }>;
  makeLoanRepayment: (
    loanId: string,
    amount: number,
    paymentMethod: 'mpesa' | 'bank_transfer' | 'savings_deduction'
  ) => Promise<{ success: boolean; message: string }>;
  buyShares: (units: number, paymentMethod: 'mpesa' | 'savings_deduction') => Promise<{ success: boolean; message: string }>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Admin Actions
  approveLoan: (loanId: string, approvedAmount: number, notes?: string) => Promise<{ success: boolean; message: string }>;
  rejectLoan: (loanId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  approveMember: (memberId: string) => Promise<{ success: boolean; message: string }>;
  rejectMember: (memberId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  createAnnouncement: (title: string, content: string, priority: 'normal' | 'high' | 'urgent') => Promise<{ success: boolean }>;
  saveProduct: (product: SACCOProduct) => Promise<{ success: boolean }>;
}

const SACCOContext = createContext<SACCOContextType | undefined>(undefined);

export const SACCOProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [savings, setSavings] = useState<SavingsAccount | null>(null);
  const [shares, setShares] = useState<SharesAccount | null>(null);
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [myRepayments, setMyRepayments] = useState<LoanRepayment[]>([]);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [myNotifications, setMyNotifications] = useState<NotificationItem[]>([]);

  const [products, setProducts] = useState<SACCOProduct[]>([]);
  const [announcements, setAnnouncements] = useState<SACCOAnnouncement[]>([]);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allRepayments, setAllRepayments] = useState<LoanRepayment[]>([]);
  const [allMembers, setAllMembers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [prods, loans, repayments, txs, notifs, anncs, users, allSav] = await Promise.all([
        StorageService.getProducts(),
        StorageService.getLoans(),
        StorageService.getRepayments(),
        StorageService.getTransactions(),
        StorageService.getNotifications(),
        StorageService.getAnnouncements(),
        StorageService.getUsers(),
        StorageService.getSavings(),
      ]);

      setProducts(prods);
      setAllLoans(loans);
      setAllRepayments(repayments);
      setAllTransactions(txs);
      setAnnouncements(anncs);
      setAllMembers(users);

      if (currentUser) {
        const memSavings = await StorageService.getMemberSavings(currentUser.id);
        const memShares = await StorageService.getMemberShares(currentUser.id);
        setSavings(memSavings);
        setShares(memShares);

        setMyLoans(loans.filter((l) => l.memberId === currentUser.id));
        setMyRepayments(repayments.filter((r) => r.memberId === currentUser.id));
        setMyTransactions(txs.filter((t) => t.memberId === currentUser.id));
        setMyNotifications(
          notifs.filter((n) => n.userId === currentUser.id || n.userId === 'all')
        );
      }
    } catch (e) {
      console.error('Error loading SACCO data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived: Available loan limit (SACCO policy: 3 times savings balance minus existing active/pending loans)
  const activeLoansSum = myLoans
    .filter((l) => l.status === 'active' || l.status === 'approved')
    .reduce((sum, l) => sum + l.outstandingBalance, 0);

  const savingsBal = savings?.currentBalance || 0;
  const maxBorrowingPower = savingsBal * 3;
  const availableLoanLimit = Math.max(0, maxBorrowingPower - activeLoansSum);

  // Unread count
  const unreadNotifsCount = myNotifications.filter((n) => !n.isRead).length;

  // Global SACCO statistics for Admin & Reports
  const totalSavings = Object.values(
    allMembers.reduce((acc, _) => acc, {} as Record<string, number>)
  ).reduce((a, b) => a + b, 0);

  const totalLoansDisbursed = allLoans
    .filter((l) => l.status === 'active' || l.status === 'completed')
    .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);

  const totalOutstandingLoans = allLoans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.outstandingBalance, 0);

  const totalActiveMembers = allMembers.filter((m) => m.status === 'active' && m.role === 'member').length;

  const totalRepaymentsReceived = allRepayments.reduce((sum, r) => sum + r.amount, 0);

  // Member Action: Deposit into Savings
  const depositSavings = async (
    amount: number,
    method: 'mpesa' | 'bank_transfer',
    reference?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || amount <= 0) {
      return { success: false, message: 'Invalid deposit amount' };
    }

    try {
      const refNum = reference || `${method === 'mpesa' ? 'MP' : 'BK'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      // Update savings
      const allSav = await StorageService.getSavings();
      const userSav = allSav[currentUser.id] || {
        memberId: currentUser.id,
        currentBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      };

      const newBal = userSav.currentBalance + amount;
      allSav[currentUser.id] = {
        ...userSav,
        currentBalance: newBal,
        totalDeposited: userSav.totalDeposited + amount,
        lastDepositDate: dateStr,
      };
      await StorageService.saveSavings(allSav);

      // Create transaction
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionNumber: `TXN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: currentUser.id,
        memberName: currentUser.fullName,
        memberNumber: currentUser.memberNumber,
        type: 'deposit',
        amount,
        date: dateStr,
        time: timeStr,
        description: `Savings Deposit via ${method === 'mpesa' ? 'M-Pesa Express' : 'Bank Wire'}`,
        status: 'completed',
        referenceNumber: refNum,
        balanceAfter: newBal,
      };
      await StorageService.addTransaction(tx);

      // Push notification
      await StorageService.addNotification({
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Deposit Successful',
        message: `Your deposit of KES ${amount.toLocaleString()} has been received and credited to your savings. New balance: KES ${newBal.toLocaleString()}. Ref: ${refNum}`,
        type: 'success',
        date: dateStr,
        time: timeStr,
        isRead: false,
        linkScreen: 'Savings',
      });

      await loadData();
      return { success: true, message: `Successfully deposited KES ${amount.toLocaleString()}` };
    } catch (e) {
      return { success: false, message: 'Deposit failed. Please try again.' };
    }
  };

  // Member Action: Withdraw from Savings
  const withdrawSavings = async (
    amount: number,
    method: 'mpesa' | 'bank_transfer',
    reason: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };
    if (amount <= 0) return { success: false, message: 'Invalid withdrawal amount' };

    const currentBal = savings?.currentBalance || 0;
    if (amount > currentBal) {
      return { success: false, message: 'Insufficient savings balance for this withdrawal.' };
    }

    // Safety check against active loan collateral: Member must maintain savings as collateral if active loans exist
    if (activeLoansSum > 0 && currentBal - amount < activeLoansSum / 3) {
      return {
        success: false,
        message: `Cannot withdraw. A minimum of KES ${Math.round(activeLoansSum / 3).toLocaleString()} is locked as collateral for active loans.`,
      };
    }

    try {
      const refNum = `WD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      const allSav = await StorageService.getSavings();
      const userSav = allSav[currentUser.id];
      const newBal = userSav.currentBalance - amount;

      allSav[currentUser.id] = {
        ...userSav,
        currentBalance: newBal,
        totalWithdrawn: userSav.totalWithdrawn + amount,
      };
      await StorageService.saveSavings(allSav);

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionNumber: `TXN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: currentUser.id,
        memberName: currentUser.fullName,
        memberNumber: currentUser.memberNumber,
        type: 'withdrawal',
        amount,
        date: dateStr,
        time: timeStr,
        description: `Savings Withdrawal to ${method === 'mpesa' ? 'M-Pesa' : 'Bank Account'}: ${reason}`,
        status: 'completed',
        referenceNumber: refNum,
        balanceAfter: newBal,
      };
      await StorageService.addTransaction(tx);

      await StorageService.addNotification({
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Withdrawal Processed',
        message: `Your withdrawal request of KES ${amount.toLocaleString()} was processed. New balance: KES ${newBal.toLocaleString()}.`,
        type: 'info',
        date: dateStr,
        time: timeStr,
        isRead: false,
        linkScreen: 'Savings',
      });

      await loadData();
      return { success: true, message: `Withdrawal of KES ${amount.toLocaleString()} processed successfully.` };
    } catch {
      return { success: false, message: 'Withdrawal processing failed.' };
    }
  };

  // Member Action: Apply for Loan
  const applyForLoan = async (
    productId: string,
    requestedAmount: number,
    durationMonths: number,
    frequency: LoanRepaymentFrequency,
    purpose: string
  ): Promise<{ success: boolean; message: string; loan?: Loan }> => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };

    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, message: 'Selected loan product not found' };

    if (requestedAmount < product.minAmount) {
      return { success: false, message: `Minimum loan amount for ${product.name} is KES ${product.minAmount.toLocaleString()}` };
    }
    if (requestedAmount > product.maxAmount) {
      return { success: false, message: `Maximum loan amount for ${product.name} is KES ${product.maxAmount.toLocaleString()}` };
    }

    if (requestedAmount > availableLoanLimit) {
      return {
        success: false,
        message: `Requested amount exceeds your available loan limit of KES ${availableLoanLimit.toLocaleString()}. Deposit more savings to qualify!`,
      };
    }

    // Calculations
    const annualRate = product.interestRate / 100;
    const totalInterest = Math.round(requestedAmount * annualRate * (durationMonths / 12));
    const totalRepayment = requestedAmount + totalInterest;
    const monthlyInstallment = Math.round(totalRepayment / durationMonths);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Compute estimated next repayment date (1 month from now)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextRepaymentDateStr = nextDate.toISOString().split('T')[0];

    const newLoan: Loan = {
      id: `ln-${Date.now()}`,
      loanNumber: `LN-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      memberId: currentUser.id,
      memberName: currentUser.fullName,
      memberNumber: currentUser.memberNumber,
      productId: product.id,
      productName: product.name,
      requestedAmount,
      approvedAmount: 0,
      interestRate: product.interestRate,
      interestAmount: totalInterest,
      totalRepayment,
      monthlyInstallment,
      durationMonths,
      repaymentFrequency: frequency,
      purpose,
      status: 'pending',
      dateApplied: dateStr,
      amountRepaid: 0,
      outstandingBalance: totalRepayment,
      nextRepaymentDate: nextRepaymentDateStr,
    };

    await StorageService.addLoan(newLoan);
    await loadData();

    return {
      success: true,
      message: 'Loan application submitted successfully! It is now queued for administrator review.',
      loan: newLoan,
    };
  };

  // Member Action: Make Loan Repayment
  const makeLoanRepayment = async (
    loanId: string,
    amount: number,
    paymentMethod: 'mpesa' | 'bank_transfer' | 'savings_deduction'
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };
    if (amount <= 0) return { success: false, message: 'Invalid payment amount' };

    const targetLoan = allLoans.find((l) => l.id === loanId);
    if (!targetLoan) return { success: false, message: 'Loan record not found' };
    if (targetLoan.status !== 'active') {
      return { success: false, message: 'Repayments can only be made on active loans.' };
    }

    if (paymentMethod === 'savings_deduction') {
      const userSav = savings?.currentBalance || 0;
      if (userSav < amount) {
        return { success: false, message: 'Insufficient savings balance to deduct repayment.' };
      }
    }

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);
      const refNum = `RP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // If deducting from savings, reduce savings
      if (paymentMethod === 'savings_deduction') {
        const allSav = await StorageService.getSavings();
        allSav[currentUser.id].currentBalance -= amount;
        await StorageService.saveSavings(allSav);
      }

      const newRepaid = targetLoan.amountRepaid + amount;
      const newOutstanding = Math.max(0, targetLoan.totalRepayment - newRepaid);
      const isCompleted = newOutstanding === 0;

      // Update next repayment date (1 month ahead if still active)
      let nextRepayDate = targetLoan.nextRepaymentDate;
      if (!isCompleted && targetLoan.nextRepaymentDate) {
        const d = new Date(targetLoan.nextRepaymentDate);
        d.setMonth(d.getMonth() + 1);
        nextRepayDate = d.toISOString().split('T')[0];
      }

      const updatedLoan: Loan = {
        ...targetLoan,
        amountRepaid: newRepaid,
        outstandingBalance: newOutstanding,
        status: isCompleted ? 'completed' : 'active',
        dateCompleted: isCompleted ? dateStr : undefined,
        nextRepaymentDate: isCompleted ? undefined : nextRepayDate,
      };
      await StorageService.updateLoan(updatedLoan);

      // Record repayment
      const repaymentRecord: LoanRepayment = {
        id: `rep-${Date.now()}`,
        loanId: targetLoan.id,
        loanNumber: targetLoan.loanNumber,
        memberId: currentUser.id,
        amount,
        paymentMethod,
        referenceNumber: refNum,
        date: dateStr,
        remainingBalance: newOutstanding,
        notes: isCompleted ? 'Final loan settlement' : 'Monthly installment repayment',
      };
      await StorageService.addRepayment(repaymentRecord);

      // Record transaction
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionNumber: `TXN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: currentUser.id,
        memberName: currentUser.fullName,
        memberNumber: currentUser.memberNumber,
        type: 'loan_repayment',
        amount,
        date: dateStr,
        time: timeStr,
        description: `Loan Repayment for ${targetLoan.loanNumber} (${targetLoan.productName})`,
        status: 'completed',
        referenceNumber: refNum,
        balanceAfter: savings?.currentBalance || 0,
      };
      await StorageService.addTransaction(tx);

      // Notification
      await StorageService.addNotification({
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: isCompleted ? 'Loan Fully Settled! 🎉' : 'Loan Repayment Received',
        message: isCompleted
          ? `Congratulations! You have fully cleared loan #${targetLoan.loanNumber}. Your borrowing limit has been upgraded.`
          : `Repayment of KES ${amount.toLocaleString()} received for loan #${targetLoan.loanNumber}. Outstanding balance: KES ${newOutstanding.toLocaleString()}.`,
        type: isCompleted ? 'success' : 'info',
        date: dateStr,
        time: timeStr,
        isRead: false,
        linkScreen: 'Loans',
      });

      await loadData();
      return {
        success: true,
        message: isCompleted
          ? `Loan #${targetLoan.loanNumber} has been fully repaid! Outstanding balance is KES 0.`
          : `Payment of KES ${amount.toLocaleString()} processed. Remaining balance: KES ${newOutstanding.toLocaleString()}`,
      };
    } catch {
      return { success: false, message: 'Repayment transaction failed.' };
    }
  };

  // Member Action: Buy SACCO Shares
  const buyShares = async (
    units: number,
    paymentMethod: 'mpesa' | 'savings_deduction'
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || units <= 0) return { success: false, message: 'Invalid number of shares' };

    const sharePrice = shares?.sharePrice || 1000;
    const totalCost = units * sharePrice;

    if (paymentMethod === 'savings_deduction') {
      const curSav = savings?.currentBalance || 0;
      if (curSav < totalCost) {
        return { success: false, message: 'Insufficient savings to purchase requested shares.' };
      }
    }

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);
      const refNum = `SH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      if (paymentMethod === 'savings_deduction') {
        const allSav = await StorageService.getSavings();
        allSav[currentUser.id].currentBalance -= totalCost;
        await StorageService.saveSavings(allSav);
      }

      // Update shares
      const allShares = await StorageService.getShares();
      const memShares = allShares[currentUser.id] || {
        memberId: currentUser.id,
        totalShares: 0,
        sharePrice: 1000,
        totalValue: 0,
        minimumRequiredShares: 50,
      };

      const newTotalShares = memShares.totalShares + units;
      const newTotalValue = newTotalShares * memShares.sharePrice;

      allShares[currentUser.id] = {
        ...memShares,
        totalShares: newTotalShares,
        totalValue: newTotalValue,
        lastContributionDate: dateStr,
      };
      await StorageService.saveShares(allShares);

      // Record transaction
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionNumber: `TXN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: currentUser.id,
        memberName: currentUser.fullName,
        memberNumber: currentUser.memberNumber,
        type: 'share_contribution',
        amount: totalCost,
        date: dateStr,
        time: timeStr,
        description: `Purchased ${units} SACCO Share Units @ KES ${sharePrice}`,
        status: 'completed',
        referenceNumber: refNum,
        balanceAfter: savings?.currentBalance || 0,
      };
      await StorageService.addTransaction(tx);

      // Notification
      await StorageService.addNotification({
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Shares Purchased',
        message: `You successfully bought ${units} SACCO shares for KES ${totalCost.toLocaleString()}. Total shares owned: ${newTotalShares}.`,
        type: 'success',
        date: dateStr,
        time: timeStr,
        isRead: false,
        linkScreen: 'Shares',
      });

      await loadData();
      return { success: true, message: `Successfully purchased ${units} shares.` };
    } catch {
      return { success: false, message: 'Failed to purchase shares.' };
    }
  };

  // Notification actions
  const markNotificationRead = async (id: string) => {
    const notifs = await StorageService.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    await StorageService.saveNotifications(updated);
    setMyNotifications(
      updated.filter((n) => n.userId === currentUser?.id || n.userId === 'all')
    );
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    const notifs = await StorageService.getNotifications();
    const updated = notifs.map((n) => {
      if (n.userId === currentUser.id || n.userId === 'all') {
        return { ...n, isRead: true };
      }
      return n;
    });
    await StorageService.saveNotifications(updated);
    setMyNotifications(
      updated.filter((n) => n.userId === currentUser.id || n.userId === 'all')
    );
  };

  // Admin Actions: Approve Loan
  const approveLoan = async (
    loanId: string,
    approvedAmount: number,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    const loan = allLoans.find((l) => l.id === loanId);
    if (!loan) return { success: false, message: 'Loan not found' };

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      // Recalculate interest and installments based on approved amount
      const annualRate = loan.interestRate / 100;
      const interestAmount = Math.round(approvedAmount * annualRate * (loan.durationMonths / 12));
      const totalRepayment = approvedAmount + interestAmount;
      const monthlyInstallment = Math.round(totalRepayment / loan.durationMonths);

      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);

      const updatedLoan: Loan = {
        ...loan,
        approvedAmount,
        interestAmount,
        totalRepayment,
        monthlyInstallment,
        outstandingBalance: totalRepayment,
        status: 'active',
        dateApproved: dateStr,
        dateDisbursed: dateStr,
        nextRepaymentDate: nextDate.toISOString().split('T')[0],
        adminNotes: notes,
      };

      await StorageService.updateLoan(updatedLoan);

      // Also record disbursement transaction
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionNumber: `TXN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: loan.memberId,
        memberName: loan.memberName,
        memberNumber: loan.memberNumber,
        type: 'loan_disbursement',
        amount: approvedAmount,
        date: dateStr,
        time: timeStr,
        description: `Disbursement of ${loan.productName} #${loan.loanNumber}`,
        status: 'completed',
        referenceNumber: `DSB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        balanceAfter: 0,
      };
      await StorageService.addTransaction(tx);

      // Notify member
      await StorageService.addNotification({
        id: `notif-${Date.now()}`,
        userId: loan.memberId,
        title: 'Loan Approved & Disbursed! 🎉',
        message: `Your loan application #${loan.loanNumber} for KES ${approvedAmount.toLocaleString()} has been APPROVED and disbursed to your account. First installment is due on ${nextDate.toLocaleDateString()}.`,
        type: 'success',
        date: dateStr,
        time: timeStr,
        isRead: false,
        linkScreen: 'Loans',
      });

      await loadData();
      return { success: true, message: `Loan #${loan.loanNumber} approved and disbursed!` };
    } catch {
      return { success: false, message: 'Failed to approve loan.' };
    }
  };

  // Admin Actions: Reject Loan
  const rejectLoan = async (
    loanId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> => {
    const loan = allLoans.find((l) => l.id === loanId);
    if (!loan) return { success: false, message: 'Loan not found' };

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      const updatedLoan: Loan = {
        ...loan,
        status: 'rejected',
        rejectionReason: reason,
      };
      await StorageService.updateLoan(updatedLoan);

      // Notify member
      await StorageService.addNotification({
        id: `notif-${Date.now()}`,
        userId: loan.memberId,
        title: 'Loan Application Update',
        message: `Your loan application #${loan.loanNumber} was not approved at this time. Reason: ${reason}`,
        type: 'alert',
        date: dateStr,
        time: timeStr,
        isRead: false,
        linkScreen: 'Loans',
      });

      await loadData();
      return { success: true, message: `Loan #${loan.loanNumber} marked as rejected.` };
    } catch {
      return { success: false, message: 'Failed to reject loan.' };
    }
  };

  // Admin Actions: Member approval & suspension
  const approveMember = async (memberId: string): Promise<{ success: boolean; message: string }> => {
    const user = allMembers.find((u) => u.id === memberId);
    if (!user) return { success: false, message: 'Member not found' };

    try {
      const updatedUser: User = { ...user, status: 'active' };
      await StorageService.updateUser(updatedUser);

      await StorageService.addNotification({
        id: `notif-${Date.now()}`,
        userId: memberId,
        title: 'Membership Account Approved',
        message: 'Your SACCO membership has been officially approved! You now have full access to savings, loans, and share capital.',
        type: 'success',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        isRead: false,
      });

      await loadData();
      return { success: true, message: `Member ${user.fullName} approved.` };
    } catch {
      return { success: false, message: 'Failed to approve member.' };
    }
  };

  const rejectMember = async (memberId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const user = allMembers.find((u) => u.id === memberId);
    if (!user) return { success: false, message: 'Member not found' };

    try {
      const updatedUser: User = { ...user, status: 'suspended' };
      await StorageService.updateUser(updatedUser);
      await loadData();
      return { success: true, message: `Member account ${user.fullName} has been suspended.` };
    } catch {
      return { success: false, message: 'Failed to suspend member.' };
    }
  };

  const createAnnouncement = async (
    title: string,
    content: string,
    priority: 'normal' | 'high' | 'urgent'
  ): Promise<{ success: boolean }> => {
    try {
      const newAnnc: SACCOAnnouncement = {
        id: `anc-${Date.now()}`,
        title,
        content,
        priority,
        date: new Date().toISOString().split('T')[0],
        author: currentUser?.fullName || 'SACCO Management',
      };
      await StorageService.addAnnouncement(newAnnc);
      await loadData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const saveProduct = async (product: SACCOProduct): Promise<{ success: boolean }> => {
    try {
      const prods = await StorageService.getProducts();
      const idx = prods.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        prods[idx] = product;
      } else {
        prods.push(product);
      }
      await StorageService.saveProducts(prods);
      await loadData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const resetDatabaseToDemo = async () => {
    await StorageService.initDatabase(true);
    await loadData();
  };

  return (
    <SACCOContext.Provider
      value={{
        savings,
        shares,
        myLoans,
        myRepayments,
        myTransactions,
        myNotifications,
        unreadNotifsCount,
        availableLoanLimit,

        products,
        announcements,
        allLoans,
        allTransactions,
        allRepayments,
        allMembers,

        stats: {
          totalSavings,
          totalLoansDisbursed,
          totalOutstandingLoans,
          totalActiveMembers,
          totalRepaymentsReceived,
        },

        isLoading,
        refreshData: loadData,
        resetDatabaseToDemo,

        depositSavings,
        withdrawSavings,
        applyForLoan,
        makeLoanRepayment,
        buyShares,
        markNotificationRead,
        markAllNotificationsRead,

        approveLoan,
        rejectLoan,
        approveMember,
        rejectMember,
        createAnnouncement,
        saveProduct,
      }}
    >
      {children}
    </SACCOContext.Provider>
  );
};

export const useSACCO = () => {
  const context = useContext(SACCOContext);
  if (!context) {
    throw new Error('useSACCO must be used within a SACCOProvider');
  }
  return context;
};

