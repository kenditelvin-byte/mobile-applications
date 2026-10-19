# PESA PAP SACCO — ARCHITECTURE & CODEBASE DOSSIER
## Comprehensive File Manifest for `components`, `database`, `context`, and `screens`

This document details every source file within the **PESA PAP SACCO** application, specifying the design architecture, functional responsibilities, and structural relationships between the UI components, database persistence, state contexts, and screen modules.

---

### 1. Database & Persistence Layer (`src/database/`)

#### [`storage.ts`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/database/storage.ts)
- **Role:** Central persistent database layer built on `@react-native-async-storage/async-storage`.
- **Primary Entities:**
  - `Users` (KYC profiles, hashed passwords, roles: member/admin, account statuses).
  - `SACCOProducts` (Normal, Emergency, School Fees, Instant Microcash loan products with interest rates and tenures).
  - `Loans` (Loan application records, principal, simple reducing interest, duration, status: pending/active/rejected/completed).
  - `LoanRepayments` (Amortization payments, payment methods, transaction reference numbers, remaining balances).
  - `SavingsAccounts` (Member deposit balances, total deposited, total withdrawn, last deposit dates).
  - `SharesAccounts` (Share units, par value KES 1,000, statutory minimum tracking).
  - `Transactions` (Global audit ledger recording deposits, repayments, disbursements, withdrawals, and share purchases).
  - `Notifications` (System events, alerts, due date warnings).
  - `Announcements` (Executive broadcasts with priority levels).
- **Key Methods:**
  - `initDatabase(forceReset)`: Automatically seeds demo members (`David Kiprono`, `Grace Muthoni`), active loans, transactions, and admin accounts on first launch.
  - `getUserByEmailOrMemberNumber(identifier)`: Multi-credential query.
  - `addLoan`, `updateLoan`, `addRepayment`, `addTransaction`, `addNotification`.

---

### 2. State & Context Management Layer (`src/context/`)

#### [`AuthContext.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/context/AuthContext.tsx)
- **Role:** Session management, member onboarding, authentication, and role authorization.
- **Key Methods:**
  - `login(identifier, password)`: Validates credentials, checks account suspension, stores active session.
  - `register(userData)`: Validates KYC details, generates unique member number (`SACCO-MBR-10XX`), initializes savings and shares accounts.
  - `logout()`: Clears active session safely.
  - `updateProfile(updates)`: Modifies phone, email, residence, or profile avatar.
  - `changePassword(oldPass, newPass)`: Secure password modification.
  - `resetPassword(identifier, newPass)`: Simulated OTP verification and recovery.
  - `switchDemoUser(role)`: 1-click switcher between Active Member, Super Admin, and Pending KYC Member.

#### [`SACCOContext.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/context/SACCOContext.tsx)
- **Role:** Central financial engine executing cooperative business logic.
- **Formulas & Business Rules:**
  - Available Loan Limit: `Available Limit = (Savings × 3) - Current Active Loans`.
  - Savings Collateral Lock: Members cannot withdraw savings locked as security for active loans (`Collateral = ActiveLoans / 3`).
  - Loan Amortization: Real-time simple reducing interest and monthly installment calculation.
- **Key Methods:**
  - `depositSavings(amount, method, ref)`: Instant deposit with live balance recalculation and receipt logging.
  - `withdrawSavings(amount, method, reason)`: Validates withdrawal against free collateral.
  - `applyForLoan(productId, amount, tenure, freq, purpose)`: Validates limits and queues loan for credit committee review.
  - `makeLoanRepayment(loanId, amount, method)`: Partial/full settlement via M-Pesa or direct savings deduction.
  - `buyShares(units, method)`: Capital expansion with statutory compliance tracking.
  - `approveLoan`, `rejectLoan`, `approveMember`, `rejectMember`, `createAnnouncement`.

#### [`ThemeContext.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/context/ThemeContext.tsx)
- **Role:** Dynamic Light & Dark Mode controller.
- **Features:**
  - Persists preference in AsyncStorage (`@pesapap_theme_mode`).
  - Provides dynamic `colors`, `isDark`, and `toggleTheme()` hook.
  - Automatically adapts surfaces, status bar, cards, text, and bottom navigation bars.

---

### 3. Common UI Components (`src/components/common/`)

- [`Header.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/Header.tsx): Mobile top bar featuring title, subtitle, optional back navigation, unread notification badge, and direct **Sun/Moon Theme Toggle**.
- [`Button.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/Button.tsx): Customizable interactive buttons (primary, accent, danger, outline, ghost) with loading indicators and icon support.
- [`Card.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/Card.tsx): Standardized card wrapper supporting elevated, outlined, and subtle surface styles.
- [`InputField.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/InputField.tsx): Form input with label, icons, password visibility eye toggle, error message banners, and helper text.
- [`Badge.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/Badge.tsx): Color-coded status chip for `Active`, `Pending`, `Approved`, `Rejected`, `Completed`.
- [`StatCard.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/StatCard.tsx): Financial metric KPI widget with icon circle, formatted balance, and trend subtitle.
- [`SavingsGrowthChart.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/SavingsGrowthChart.tsx): Interactive 6-month visual bar chart with month tooltips and YoY percentage indicators.
- [`CustomModal.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/CustomModal.tsx): Bottom sheet popup dialog with title, close button, and scrollable body.
- [`EmptyState.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/components/common/EmptyState.tsx): Illustrated empty view with action buttons for zero-record states.

---

### 4. Screen Modules (`src/screens/`)

#### A. Authentication Screens (`src/screens/auth/`)
1. [`LoginScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/auth/LoginScreen.tsx): PESA PAP SACCO sign in, credentials validation, password visibility toggle, 1-Click Demo buttons (`Member Demo`, `Admin Demo`, `Pending Mbr`), and Dark Mode switcher.
2. [`RegisterScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/auth/RegisterScreen.tsx): Comprehensive membership KYC form (Full Name, National ID, Phone, Email, Gender selector, DOB, Address, Password, Bylaws agreement).
3. [`ForgotPasswordScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/auth/ForgotPasswordScreen.tsx): Multi-step recovery (Email input &rarr; 6-digit OTP verification &rarr; Password reset).

#### B. Member Screens (`src/screens/member/`)
4. [`DashboardScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/member/DashboardScreen.tsx): Executive member dashboard displaying savings, available loan limits, active loan alerts, quick action shortcuts, savings growth chart, and live transactions.
5. [`SavingsScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/member/SavingsScreen.tsx): Savings account balance, 8.5% rebate badge, instant M-Pesa/Bank deposit modal, collateral-protected withdrawal modal, and filtered statements.
6. [`LoansScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/member/LoansScreen.tsx): Available borrowing limit, active loan progress bars, loan product selector, and real-time interest & installment calculator.
7. [`RepaymentScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/member/RepaymentScreen.tsx): Loan installment settlement via M-Pesa Express, Savings Balance Deduction, or Bank Wire with real-time balance reduction preview.
8. [`TransactionsScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/member/TransactionsScreen.tsx): Audited financial ledger with search bar, category filter tabs, running balance tracker, and digital receipt modal.
9. [`SharesScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/member/SharesScreen.tsx): SACCO share capital portfolio, statutory minimum compliance progress bar (50 units), dividend estimator (11.5%), and buy shares modal.
10. [`NotificationsScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/member/NotificationsScreen.tsx): Event notifications for deposits, loan approvals/rejections, repayment dues, and SACCO notices with unread filters.
11. [`ProfileScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/member/ProfileScreen.tsx): Member KYC information, photograph avatar selector, change password modal, Light/Dark mode switcher, and switch to Admin portal.

#### C. Administrator Screens (`src/screens/admin/`)
12. [`AdminDashboardScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/admin/AdminDashboardScreen.tsx): Executive control center displaying SACCO macro metrics, pending loan and KYC alerts, recovery rate index, and real-time audit activity.
13. [`AdminMembersScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/admin/AdminMembersScreen.tsx): Member directory with search, status filters (Active, Pending, Suspended), KYC review, and instant account approval/suspension.
14. [`AdminLoansScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/admin/AdminLoansScreen.tsx): Credit committee loan appraisal queue, review modal with member savings collateral verification, approve with disbursement, or reject with notes.
15. [`AdminTransactionsScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/admin/AdminTransactionsScreen.tsx): Universal audit trail across all cooperative members with search and type filters.
16. [`AdminProductsScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/admin/AdminProductsScreen.tsx): SACCO credit product configuration (interest rates, minimum/maximum limits, and tenure terms).
17. [`AdminAnnouncementsScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/admin/AdminAnnouncementsScreen.tsx): Official announcements and emergency broadcasts pushed directly to member devices.
18. [`AdminReportsScreen.tsx`](file:///c:/Users/Kendi/Documents/Codex/2026-10-13/cr/outputs/Maker-download/src/screens/admin/AdminReportsScreen.tsx): SASRA regulatory prudential ratios, Portfolio at Risk (PAR > 30 days), loan-to-deposit ratio, and demographic analytics.

