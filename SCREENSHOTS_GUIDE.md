# PESA PAP SACCO MOBILE APPLICATION — SCREENSHOTS & DEMONSTRATION GUIDE
## Comprehensive Guide for Capturing Screenshots for PDF Submission

This guide outlines every single required screen from the project specification, where to find it in the app, and key features to highlight in your presentation and screenshot submission document.

---

### Summary Checklist of Required Screenshots

| # | Screen Name | Navigation in App | Key Elements to Show |
|---|---|---|---|
| **1** | **Splash / Welcome Screen** | Initial App Launch | PESA PAP SACCO branding, Light/Dark mode switcher, secure connection badge, high-res logo |
| **2** | **Login Screen** | Sign In View | Member Number / Email input, Password with eye toggle, 1-Click Demo buttons (Member, Admin, Pending) |
| **3** | **Registration Screen** | Tap "Register as Member" from Login | Full KYC form: Name, National ID, Gender chips, DOB, Phone, Email, Address, Password, Bylaws agreement |
| **4** | **Password Recovery Screen** | Tap "Forgot Password?" from Login | Identification input, 6-digit verification OTP flow (Demo: `458921`), New password fields |
| **5** | **Member Dashboard** | Sign In as Member (`David Kiprono`) | Welcome banner, Savings balance card (`KES 185,000`), Available loan limit (`KES 472,500`), Quick action buttons, Upcoming loan alert, Savings growth chart, Recent transactions |
| **6** | **Savings Screen** | Tap "Savings" tab | Current balance card (`KES 185,000`), Deposit & Withdraw action buttons, 6-month growth trajectory chart, Savings statement list |
| **7** | **Deposit Modal** | Tap "Deposit Funds" on Savings screen | M-Pesa Express vs Bank Wire selector, amount input, quick amount chips (`+1,000`, `+5,000`, etc.) |
| **8** | **Withdrawal Modal** | Tap "Withdraw" on Savings screen | Destination selector, amount input, collateral locking protection rule notification |
| **9** | **Loans Screen (Overview & Status)** | Tap "Loans" tab | Available borrowing limit (`KES 472,500`), Active loans list with repayment progress bars, Settled loan history, Available SACCO credit products |
| **10** | **Loan Application & Calculator Modal**| Tap "Apply Loan" or `+` on Loans screen | Product selector chips, Requested amount, Tenure in months, Repayment frequency, Purpose input, Real-time Loan Repayment Summary (Principal, Interest, Total, Monthly installment) |
| **11** | **Loan Details & Schedule Modal** | Tap any loan card in Loans screen | Loan number, Amount requested vs approved, Total repayment, Amount repaid, Outstanding balance, Monthly installment, Application and due dates |
| **12** | **Loan Repayment Screen** | Tap "Repay Loan" or "Make Repayment" | Outstanding balance card, Next repayment date, Payment method (M-Pesa, Deduct from Savings, Bank Wire), Quick buttons (Full installment, 50%, Clear full loan), Live balance preview, Repayment history list |
| **13** | **Transaction History & Ledger** | Tap "Statement" tab | Search bar, Type filter chips (All, Deposits, Repayments, Loans, Shares, Withdrawals), Transaction cards with reference IDs and balance after |
| **14** | **Transaction Receipt Modal** | Tap any transaction in Statement | Success badge, Formatted currency amount, Reference number, Type, Member details, Copy reference button |
| **15** | **SACCO Shares Screen** | Tap "Shares" shortcut on Dashboard | Total share capital (`KES 75,000`), Total shares owned (`75 units`), Statutory minimum compliance tracker (`75/50 Required - 150%`), Dividend estimator (`KES 8,625 @ 11.5%`), Share contribution history |
| **16** | **Buy Shares Modal** | Tap "Purchase More Shares" | Unit input, Quick unit chips (`5, 10, 20, 50, 100`), Payment source (M-Pesa or Savings), Total cost calculator |
| **17** | **Notifications Screen** | Tap Notification Bell on Dashboard | Real-time alerts for deposits, loan approvals, upcoming repayment dates, SACCO notices, Unread toggle, Mark all read button |
| **18** | **Member Profile Screen** | Tap "Profile" tab | Profile photograph with camera change button, Member number, Verification badge, KYC details (National ID, Phone, Email, Address), Change password button, Switch to Admin button |
| **19** | **Administrator Dashboard** | Sign In as Admin (`admin@sacco.org`) | Executive banner, Total loan portfolio, Active outstanding, Pending loan appraisal alert, Pending member registration alert, 6-module admin grid, Recovery health ratio, Live audit stream |
| **20** | **Admin Member Directory** | Tap "Members" in Admin portal | Search bar, Status filters (All, Active, Pending, Suspended), Member cards with KYC details, Member detail drawer with "Approve Member" or "Suspend Account" buttons |
| **21** | **Admin Loan Appraisal Desk** | Tap "Loans Desk" in Admin portal | Applications queue, Status filters (Pending, Active, Completed, Rejected), Loan review modal with credit notes, "Approve & Disburse" and "Reject Loan" action forms |
| **22** | **Admin Audit Ledger** | Tap "Audit Trail" in Admin portal | Global real-time transaction ledger across all cooperative members |
| **23** | **Admin Products Management** | Tap "Products" on Admin Dashboard | List of loan products with interest rates, limits, and tenures, "Add New SACCO Product" modal with custom interest and duration configurations |
| **24** | **Admin Announcements Screen** | Tap "Notices" on Admin Dashboard | Published notices with priority tags (Normal, High, Urgent), "Broadcast Announcement" modal that pushes notifications to all member devices |
| **25** | **Admin Reports & Analytics** | Tap "Reports" in Admin portal | Liquidity and savings mobilized, Portfolio at Risk (PAR > 30 days) ratio, Loan-to-deposit ratio, Member demographics, "Export PDF" button |
| **26** | **Logout Confirmation** | Tap Logout in Header | Clears active session and securely returns to Login screen |

---

### Step-by-Step Flow to Demonstrate the Complete Workflow

When demonstrating the application to your lecturer, follow this exact sequence:

1. **Member Login:**
   - Tap **"Member Demo"** (logs in as `David Kiprono`).
   - Highlight the **Dashboard** clean interface: Savings (`KES 185,000`), Available limit (`KES 472,500`), and 6-month growth chart.
2. **Deposit Savings:**
   - Tap **"Deposit"** -> Select **M-Pesa Express** -> Enter `KES 15,000` -> Confirm.
   - Show how the balance immediately updates to `KES 200,000`, a new transaction is logged, and a notification arrives.
3. **Apply for a Loan:**
   - Tap **"Loans"** -> Tap **"Apply Loan"**.
   - Select **School Fees Loan (8%)** -> Enter `KES 40,000` -> Tenure `6 months`.
   - Point out the **Real-Time Loan Repayment Summary** (Principal: 40,000, Interest: 1,600, Total: 41,600, Monthly Installment: 6,933).
   - Tap **Submit Application**. Application is saved in `pending` status.
4. **Switch to Administrator Account:**
   - Go to **Profile** -> Tap **"Switch to Administrator Portal"** (or Logout and tap **"Admin Demo"**).
   - Point out the **"Loan Applications Awaiting Review"** banner on the Admin Dashboard.
5. **Approve the Loan as Admin:**
   - Tap **"Loans Desk"** -> Select the pending loan submitted by David.
   - Tap **"Approve Loan"** -> Enter notes: "Approved by Credit Committee" -> Tap **"Confirm Disbursal & Notify Member"**.
   - Show that the loan is now `Active`, and a disbursement transaction was created.
6. **Switch Back to Member Account:**
   - Tap the Member icon at the top right of the Admin header.
   - Show that the loan is now **Active** in the member's account, and an **"Approved & Disbursed"** notification is present in the notification tray!
7. **Make a Loan Repayment:**
   - Tap **"Repay Loan"** -> Select the active loan.
   - Tap **"Full Installment"** -> Select **"Deduct from Savings Balance"** -> Tap **Pay**.
   - Demonstrate the dynamic balance reduction and instant payment receipt!
8. **View Transaction History:**
   - Tap **"Statement"** tab -> Search by keyword or filter by "Repayments" / "Deposits" -> Tap receipt.
9. **Buy SACCO Shares:**
   - Go to **Dashboard** -> Tap **"Shares"** -> Tap **"Purchase More Shares"** -> Select 10 units -> Confirm.
   - Show the statutory compliance progress bar update!
10. **Admin Reports:**
    - Switch to Admin -> Tap **"Reports"** -> Show Portfolio at Risk (PAR), Loan-to-deposit ratio, and Demographic distribution.

