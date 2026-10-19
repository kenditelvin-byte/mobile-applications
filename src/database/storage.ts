import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  SACCOProduct,
  Loan,
  LoanRepayment,
  SavingsAccount,
  Transaction,
  SharesAccount,
  NotificationItem,
  SACCOAnnouncement,
} from '../types';

const STORAGE_KEYS = {
  USERS: '@sacco_users_v2',
  PRODUCTS: '@sacco_products_v2',
  LOANS: '@sacco_loans_v2',
  REPAYMENTS: '@sacco_repayments_v2',
  SAVINGS: '@sacco_savings_v2',
  TRANSACTIONS: '@sacco_transactions_v2',
  SHARES: '@sacco_shares_v2',
  NOTIFICATIONS: '@sacco_notifications_v2',
  ANNOUNCEMENTS: '@sacco_announcements_v2',
  CURRENT_USER_ID: '@sacco_current_user_id_v2',
};

// Seed Data
export const INITIAL_PRODUCTS: SACCOProduct[] = [
  {
    id: 'prod-normal',
    name: 'Normal Development Loan',
    description: 'Long term financing for property, land, building or investments at friendly rates.',
    interestRate: 10.0,
    minAmount: 20000,
    maxAmount: 1500000,
    minDurationMonths: 6,
    maxDurationMonths: 36,
    repaymentFrequency: ['monthly'],
    icon: 'briefcase',
  },
  {
    id: 'prod-emergency',
    name: 'Emergency Loan',
    description: 'Rapid disbursal for medical or unforeseen urgent family emergencies.',
    interestRate: 12.0,
    minAmount: 5000,
    maxAmount: 100000,
    minDurationMonths: 1,
    maxDurationMonths: 12,
    repaymentFrequency: ['monthly', 'bi-weekly'],
    icon: 'medkit',
  },
  {
    id: 'prod-education',
    name: 'School Fees Loan',
    description: 'Tailored for secondary and tertiary tuition fees with flexible installments.',
    interestRate: 8.0,
    minAmount: 10000,
    maxAmount: 300000,
    minDurationMonths: 3,
    maxDurationMonths: 12,
    repaymentFrequency: ['monthly'],
    icon: 'school',
  },
  {
    id: 'prod-instant',
    name: 'Instant Mobile Cash',
    description: 'Quick credit up to 50% of your savings balance with zero paperwork.',
    interestRate: 14.0,
    minAmount: 2000,
    maxAmount: 50000,
    minDurationMonths: 1,
    maxDurationMonths: 6,
    repaymentFrequency: ['monthly', 'bi-weekly'],
    icon: 'flash',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-01',
    memberNumber: 'SACCO-ADM-001',
    fullName: 'Sarah Wambui (Admin)',
    nationalId: '12345678',
    phone: '+254 712 345 678',
    email: 'admin@sacco.org',
    gender: 'female',
    dob: '1985-05-14',
    address: 'Nairobi SACCO Towers, 4th Floor',
    password: 'Admin123!',
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: '2025-01-01',
  },
  {
    id: 'usr-member-01',
    memberNumber: 'SACCO-MBR-1042',
    fullName: 'David Kiprono Cheruiyot',
    nationalId: '29876543',
    phone: '+254 722 987 654',
    email: 'david.kiprono@gmail.com',
    gender: 'male',
    dob: '1992-08-23',
    address: 'Upper Hill, Nairobi, Kenya',
    password: 'Member123!',
    role: 'member',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2025-02-10',
  },
  {
    id: 'usr-member-02',
    memberNumber: 'SACCO-MBR-1043',
    fullName: 'Grace Muthoni Njenga',
    nationalId: '31456789',
    phone: '+254 733 112 233',
    email: 'grace.muthoni@yahoo.com',
    gender: 'female',
    dob: '1994-11-05',
    address: 'Westlands, Nairobi, Kenya',
    password: 'Member123!',
    role: 'member',
    status: 'pending', // for admin to demonstrate approval!
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-03-01',
  },
];

export const INITIAL_SAVINGS: Record<string, SavingsAccount> = {
  'usr-member-01': {
    memberId: 'usr-member-01',
    currentBalance: 185000,
    totalDeposited: 210000,
    totalWithdrawn: 25000,
    lastDepositDate: '2026-03-10',
  },
  'usr-member-02': {
    memberId: 'usr-member-02',
    currentBalance: 45000,
    totalDeposited: 45000,
    totalWithdrawn: 0,
    lastDepositDate: '2026-03-01',
  },
};

export const INITIAL_SHARES: Record<string, SharesAccount> = {
  'usr-member-01': {
    memberId: 'usr-member-01',
    totalShares: 75,
    sharePrice: 1000, // KES 1,000 per share
    totalValue: 75000,
    minimumRequiredShares: 50,
    lastContributionDate: '2026-02-15',
  },
  'usr-member-02': {
    memberId: 'usr-member-02',
    totalShares: 20,
    sharePrice: 1000,
    totalValue: 20000,
    minimumRequiredShares: 50,
    lastContributionDate: '2026-03-01',
  },
};

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'ln-1001',
    loanNumber: 'LN-2025-0089',
    memberId: 'usr-member-01',
    memberName: 'David Kiprono Cheruiyot',
    memberNumber: 'SACCO-MBR-1042',
    productId: 'prod-normal',
    productName: 'Normal Development Loan',
    requestedAmount: 150000,
    approvedAmount: 150000,
    interestRate: 10.0,
    interestAmount: 15000,
    totalRepayment: 165000,
    monthlyInstallment: 13750,
    durationMonths: 12,
    repaymentFrequency: 'monthly',
    purpose: 'Fencing and solar setup on agricultural farm',
    status: 'active',
    dateApplied: '2025-10-15',
    dateApproved: '2025-10-18',
    dateDisbursed: '2025-10-19',
    amountRepaid: 82500,
    outstandingBalance: 82500,
    nextRepaymentDate: '2026-04-15',
  },
  {
    id: 'ln-1002',
    loanNumber: 'LN-2026-0120',
    memberId: 'usr-member-01',
    memberName: 'David Kiprono Cheruiyot',
    memberNumber: 'SACCO-MBR-1042',
    productId: 'prod-emergency',
    productName: 'Emergency Loan',
    requestedAmount: 35000,
    approvedAmount: 0,
    interestRate: 12.0,
    interestAmount: 4200,
    totalRepayment: 39200,
    monthlyInstallment: 6533,
    durationMonths: 6,
    repaymentFrequency: 'monthly',
    purpose: 'Urgent vehicle mechanical repairs',
    status: 'pending', // Pending so admin can review and approve!
    dateApplied: '2026-03-12',
    amountRepaid: 0,
    outstandingBalance: 39200,
    nextRepaymentDate: '2026-04-12',
  },
  {
    id: 'ln-1000',
    loanNumber: 'LN-2025-0012',
    memberId: 'usr-member-01',
    memberName: 'David Kiprono Cheruiyot',
    memberNumber: 'SACCO-MBR-1042',
    productId: 'prod-education',
    productName: 'School Fees Loan',
    requestedAmount: 50000,
    approvedAmount: 50000,
    interestRate: 8.0,
    interestAmount: 4000,
    totalRepayment: 54000,
    monthlyInstallment: 9000,
    durationMonths: 6,
    repaymentFrequency: 'monthly',
    purpose: 'First Term College Tuition',
    status: 'completed',
    dateApplied: '2025-01-10',
    dateApproved: '2025-01-12',
    dateDisbursed: '2025-01-13',
    dateCompleted: '2025-07-15',
    amountRepaid: 54000,
    outstandingBalance: 0,
  },
];

export const INITIAL_REPAYMENTS: LoanRepayment[] = [
  {
    id: 'rep-001',
    loanId: 'ln-1001',
    loanNumber: 'LN-2025-0089',
    memberId: 'usr-member-01',
    amount: 13750,
    paymentMethod: 'mpesa',
    referenceNumber: 'QC89X12LM9',
    date: '2025-11-15',
    remainingBalance: 151250,
    notes: 'Installment 1 of 12',
  },
  {
    id: 'rep-002',
    loanId: 'ln-1001',
    loanNumber: 'LN-2025-0089',
    memberId: 'usr-member-01',
    amount: 27500,
    paymentMethod: 'mpesa',
    referenceNumber: 'RA45K998TY',
    date: '2026-01-15',
    remainingBalance: 123750,
    notes: 'Double installment payment',
  },
  {
    id: 'rep-003',
    loanId: 'ln-1001',
    loanNumber: 'LN-2025-0089',
    memberId: 'usr-member-01',
    amount: 41250,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'BNK-9002341',
    date: '2026-03-15',
    remainingBalance: 82500,
    notes: 'Quarterly lump installment',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    transactionNumber: 'TXN-2026-0891',
    memberId: 'usr-member-01',
    memberName: 'David Kiprono Cheruiyot',
    memberNumber: 'SACCO-MBR-1042',
    type: 'deposit',
    amount: 25000,
    date: '2026-03-10',
    time: '14:32',
    description: 'Monthly savings contribution via M-Pesa',
    status: 'completed',
    referenceNumber: 'RC882190JK',
    balanceAfter: 185000,
  },
  {
    id: 'tx-002',
    transactionNumber: 'TXN-2026-0744',
    memberId: 'usr-member-01',
    memberName: 'David Kiprono Cheruiyot',
    memberNumber: 'SACCO-MBR-1042',
    type: 'loan_repayment',
    amount: 13750,
    date: '2026-02-15',
    time: '11:15',
    description: 'Normal Loan installment repayment',
    status: 'completed',
    referenceNumber: 'QC89X12LM9',
    balanceAfter: 185000,
  },
  {
    id: 'tx-003',
    transactionNumber: 'TXN-2026-0610',
    memberId: 'usr-member-01',
    memberName: 'David Kiprono Cheruiyot',
    memberNumber: 'SACCO-MBR-1042',
    type: 'share_contribution',
    amount: 15000,
    date: '2026-02-10',
    time: '09:40',
    description: 'Purchase of 15 SACCO Share Units',
    status: 'completed',
    referenceNumber: 'SHR-009182',
    balanceAfter: 185000,
  },
  {
    id: 'tx-004',
    transactionNumber: 'TXN-2025-0520',
    memberId: 'usr-member-01',
    memberName: 'David Kiprono Cheruiyot',
    memberNumber: 'SACCO-MBR-1042',
    type: 'loan_disbursement',
    amount: 150000,
    date: '2025-10-19',
    time: '16:05',
    description: 'Disbursement of Normal Development Loan #LN-2025-0089',
    status: 'completed',
    referenceNumber: 'DSB-883921',
    balanceAfter: 160000,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-member-01',
    title: 'Deposit Received',
    message: 'Your monthly contribution of KES 25,000 has been credited to your savings balance.',
    type: 'success',
    date: '2026-03-10',
    time: '14:33',
    isRead: false,
    linkScreen: 'Savings',
  },
  {
    id: 'notif-2',
    userId: 'usr-member-01',
    title: 'Upcoming Loan Repayment',
    message: 'Installment for Normal Loan #LN-2025-0089 is due on April 15, 2026 (KES 13,750).',
    type: 'alert',
    date: '2026-03-08',
    time: '09:00',
    isRead: false,
    linkScreen: 'Repayment',
  },
  {
    id: 'notif-3',
    userId: 'all',
    title: 'Annual General Meeting (AGM) Notice',
    message: 'Members are invited to the 34th Annual General Meeting scheduled for April 28th at SACCO Auditorium.',
    type: 'info',
    date: '2026-03-01',
    time: '10:00',
    isRead: true,
  },
];

export const INITIAL_ANNOUNCEMENTS: SACCOAnnouncement[] = [
  {
    id: 'anc-01',
    title: '34th Annual General Meeting & Dividend Declaration',
    content:
      'All registered members are warmly invited to attend our upcoming hybrid AGM. The Board of Directors will recommend a dividend payout of 11.5% on share capital and 8.5% rebate on member deposits.',
    date: '2026-03-01',
    author: 'Board Secretary',
    priority: 'high',
  },
  {
    id: 'anc-02',
    title: 'New Instant Mobile Cash Loan Facility Launched',
    content:
      'You can now borrow up to 50% of your non-withdrawable savings instantly via the SACCO Mobile App with same-day disbursement.',
    date: '2026-02-15',
    author: 'Credit Committee',
    priority: 'normal',
  },
];

export class StorageService {
  static async initDatabase(forceReset = false): Promise<void> {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      if (!initialized || forceReset) {
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        await AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(INITIAL_LOANS));
        await AsyncStorage.setItem(STORAGE_KEYS.REPAYMENTS, JSON.stringify(INITIAL_REPAYMENTS));
        await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(INITIAL_SAVINGS));
        await AsyncStorage.setItem(STORAGE_KEYS.SHARES, JSON.stringify(INITIAL_SHARES));
        await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
        await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      }
    } catch (e) {
      console.error('Failed to initialize database:', e);
    }
  }

  // Current session
  static async getCurrentUserId(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  }

  static async setCurrentUserId(userId: string | null): Promise<void> {
    if (userId) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }

  // Users
  static async getUsers(): Promise<User[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  static async saveUsers(users: User[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  static async getUserByEmailOrMemberNumber(identifier: string): Promise<User | null> {
    const users = await this.getUsers();
    const clean = identifier.trim().toLowerCase();
    return (
      users.find(
        (u) =>
          u.email.toLowerCase() === clean ||
          u.memberNumber.toLowerCase() === clean ||
          u.nationalId === clean
      ) || null
    );
  }

  static async addUser(newUser: User): Promise<User> {
    const users = await this.getUsers();
    users.push(newUser);
    await this.saveUsers(users);

    // Initialize savings & shares accounts for new user
    const savings = await this.getSavings();
    savings[newUser.id] = {
      memberId: newUser.id,
      currentBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
    };
    await this.saveSavings(savings);

    const shares = await this.getShares();
    shares[newUser.id] = {
      memberId: newUser.id,
      totalShares: 0,
      sharePrice: 1000,
      totalValue: 0,
      minimumRequiredShares: 50,
    };
    await this.saveShares(shares);

    // Add registration notification
    await this.addNotification({
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      title: 'Registration Successful',
      message: `Welcome to our SACCO, ${newUser.fullName}! Your membership number is ${newUser.memberNumber}.`,
      type: 'success',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      isRead: false,
    });

    return newUser;
  }

  static async updateUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      await this.saveUsers(users);
    }
  }

  // Products
  static async getProducts(): Promise<SACCOProduct[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  static async saveProducts(products: SACCOProduct[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  // Loans
  static async getLoans(): Promise<Loan[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LOANS);
    return data ? JSON.parse(data) : [];
  }

  static async saveLoans(loans: Loan[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }

  static async addLoan(loan: Loan): Promise<Loan> {
    const loans = await this.getLoans();
    loans.unshift(loan);
    await this.saveLoans(loans);

    // Add notification
    await this.addNotification({
      id: `notif-${Date.now()}`,
      userId: loan.memberId,
      title: 'Loan Application Submitted',
      message: `Your application for ${loan.productName} of KES ${loan.requestedAmount.toLocaleString()} has been received and is pending credit committee review.`,
      type: 'info',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      isRead: false,
      linkScreen: 'Loans',
    });

    return loan;
  }

  static async updateLoan(loan: Loan): Promise<void> {
    const loans = await this.getLoans();
    const index = loans.findIndex((l) => l.id === loan.id);
    if (index !== -1) {
      loans[index] = loan;
      await this.saveLoans(loans);
    }
  }

  // Repayments
  static async getRepayments(): Promise<LoanRepayment[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REPAYMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async addRepayment(repayment: LoanRepayment): Promise<void> {
    const list = await this.getRepayments();
    list.unshift(repayment);
    await AsyncStorage.setItem(STORAGE_KEYS.REPAYMENTS, JSON.stringify(list));
  }

  // Savings
  static async getSavings(): Promise<Record<string, SavingsAccount>> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS);
    return data ? JSON.parse(data) : {};
  }

  static async saveSavings(savings: Record<string, SavingsAccount>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
  }

  static async getMemberSavings(memberId: string): Promise<SavingsAccount> {
    const savings = await this.getSavings();
    if (!savings[memberId]) {
      savings[memberId] = {
        memberId,
        currentBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      };
      await this.saveSavings(savings);
    }
    return savings[memberId];
  }

  // Shares
  static async getShares(): Promise<Record<string, SharesAccount>> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SHARES);
    return data ? JSON.parse(data) : {};
  }

  static async saveShares(shares: Record<string, SharesAccount>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SHARES, JSON.stringify(shares));
  }

  static async getMemberShares(memberId: string): Promise<SharesAccount> {
    const shares = await this.getShares();
    if (!shares[memberId]) {
      shares[memberId] = {
        memberId,
        totalShares: 0,
        sharePrice: 1000,
        totalValue: 0,
        minimumRequiredShares: 50,
      };
      await this.saveShares(shares);
    }
    return shares[memberId];
  }

  // Transactions
  static async getTransactions(): Promise<Transaction[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  static async addTransaction(tx: Transaction): Promise<void> {
    const list = await this.getTransactions();
    list.unshift(tx);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
  }

  // Notifications
  static async getNotifications(): Promise<NotificationItem[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  }

  static async saveNotifications(notifs: NotificationItem[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  static async addNotification(notif: NotificationItem): Promise<void> {
    const list = await this.getNotifications();
    list.unshift(notif);
    await this.saveNotifications(list);
  }

  // Announcements
  static async getAnnouncements(): Promise<SACCOAnnouncement[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async addAnnouncement(announcement: SACCOAnnouncement): Promise<void> {
    const list = await this.getAnnouncements();
    list.unshift(announcement);
    await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));

    // Also push a global notification to members
    await this.addNotification({
      id: `notif-anc-${Date.now()}`,
      userId: 'all',
      title: announcement.title,
      message: announcement.content.substring(0, 100) + '...',
      type: announcement.priority === 'urgent' ? 'alert' : 'info',
      date: announcement.date,
      time: new Date().toTimeString().slice(0, 5),
      isRead: false,
    });
  }
}

