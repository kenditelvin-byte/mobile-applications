const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.join(__dirname, 'screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=430,932'],
    defaultViewport: {
      width: 412,
      height: 915,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  });

  const page = await browser.newPage();

  console.log('Navigating to http://localhost:8083...');
  await page.goto('http://localhost:8083', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);

  // Helper to click text
  async function clickByText(text) {
    return page.evaluate((t) => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (const el of elements) {
        if (el.textContent && el.textContent.trim() === t && el.children.length === 0) {
          el.click();
          return true;
        }
      }
      // fallback partial match
      for (const el of elements) {
        if (el.textContent && el.textContent.includes(t) && el.children.length === 0) {
          el.click();
          return true;
        }
      }
      return false;
    }, text);
  }

  // 1. Login Screen
  console.log('Capturing 01_login_screen.png');
  await page.screenshot({ path: path.join(outputDir, '01_login_screen.png') });

  // 2. Registration Screen
  console.log('Opening Register screen...');
  await clickByText('Register as Member');
  await sleep(1500);
  console.log('Capturing 02_registration_screen.png');
  await page.screenshot({ path: path.join(outputDir, '02_registration_screen.png') });

  // Back to login
  await clickByText('Back to Sign In');
  await sleep(1500);

  // 3. Forgot Password Screen
  console.log('Opening Forgot Password...');
  await clickByText('Forgot Password?');
  await sleep(1500);
  console.log('Capturing 03_forgot_password_screen.png');
  await page.screenshot({ path: path.join(outputDir, '03_forgot_password_screen.png') });

  // Back to login
  await clickByText('Back to Sign In');
  await sleep(1500);

  // 4. Login as Member
  console.log('Logging in as Member Demo...');
  await clickByText('Member Demo');
  await sleep(3000);

  // Member Dashboard (Light Mode)
  console.log('Capturing 04_member_dashboard_light.png');
  await page.screenshot({ path: path.join(outputDir, '04_member_dashboard_light.png') });

  // Toggle Dark Mode
  console.log('Toggling Dark Mode on Header...');
  // Find top bar theme button or click moon icon
  await page.evaluate(() => {
    // click the header theme icon
    const buttons = document.querySelectorAll('div[role="button"], button');
    for (const b of buttons) {
      if (b.innerHTML.includes('moon') || b.innerHTML.includes('sunny')) {
        b.click();
        break;
      }
    }
  });
  await sleep(1500);
  console.log('Capturing 05_member_dashboard_dark.png');
  await page.screenshot({ path: path.join(outputDir, '05_member_dashboard_dark.png') });

  // Switch back to Light Mode for consistency
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('div[role="button"], button');
    for (const b of buttons) {
      if (b.innerHTML.includes('moon') || b.innerHTML.includes('sunny')) {
        b.click();
        break;
      }
    }
  });
  await sleep(1000);

  // 5. Savings Screen
  console.log('Navigating to Savings...');
  await clickByText('Savings');
  await sleep(2000);
  console.log('Capturing 06_savings_screen.png');
  await page.screenshot({ path: path.join(outputDir, '06_savings_screen.png') });

  // Deposit Modal
  console.log('Opening Deposit Modal...');
  await clickByText('Deposit Funds');
  await sleep(1500);
  console.log('Capturing 07_savings_deposit_modal.png');
  await page.screenshot({ path: path.join(outputDir, '07_savings_deposit_modal.png') });

  // Close Deposit Modal
  await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('div[role="button"], button');
    for (const b of closeBtns) {
      if (b.innerHTML.includes('close')) {
        b.click();
        break;
      }
    }
  });
  await sleep(1000);

  // Withdrawal Modal
  console.log('Opening Withdraw Modal...');
  await clickByText('Withdraw');
  await sleep(1500);
  console.log('Capturing 08_savings_withdraw_modal.png');
  await page.screenshot({ path: path.join(outputDir, '08_savings_withdraw_modal.png') });

  // Close Withdraw Modal
  await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('div[role="button"], button');
    for (const b of closeBtns) {
      if (b.innerHTML.includes('close')) {
        b.click();
        break;
      }
    }
  });
  await sleep(1000);

  // 6. Loans Screen
  console.log('Navigating to Loans...');
  await clickByText('Loans');
  await sleep(2000);
  console.log('Capturing 09_loans_overview.png');
  await page.screenshot({ path: path.join(outputDir, '09_loans_overview.png') });

  // Loan Application Modal
  console.log('Opening Loan Application Modal...');
  await clickByText('Apply Loan');
  await sleep(1500);
  console.log('Capturing 10_loan_application_modal.png');
  await page.screenshot({ path: path.join(outputDir, '10_loan_application_modal.png') });

  // Close Loan Modal
  await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('div[role="button"], button');
    for (const b of closeBtns) {
      if (b.innerHTML.includes('close')) {
        b.click();
        break;
      }
    }
  });
  await sleep(1000);

  // 7. Loan Repayment Screen
  console.log('Navigating to Repayment...');
  await clickByText('Make Repayment');
  await sleep(2000);
  console.log('Capturing 11_loan_repayment_screen.png');
  await page.screenshot({ path: path.join(outputDir, '11_loan_repayment_screen.png') });

  // Back to loans
  await page.evaluate(() => {
    const backBtn = document.querySelector('div[role="button"]');
    if (backBtn) backBtn.click();
  });
  await sleep(1500);

  // 8. Statement / Transactions
  console.log('Navigating to Statement...');
  await clickByText('Statement');
  await sleep(2000);
  console.log('Capturing 12_transactions_history.png');
  await page.screenshot({ path: path.join(outputDir, '12_transactions_history.png') });

  // Open Transaction Receipt
  await page.evaluate(() => {
    const txRow = document.querySelector('div[role="button"]');
    // find a tx description element
    const items = Array.from(document.querySelectorAll('*'));
    for (const el of items) {
      if (el.textContent && el.textContent.includes('TXN-')) {
        el.click();
        break;
      }
    }
  });
  await sleep(1500);
  console.log('Capturing 13_transaction_receipt_modal.png');
  await page.screenshot({ path: path.join(outputDir, '13_transaction_receipt_modal.png') });

  // Close receipt
  await clickByText('Close Receipt');
  await sleep(1000);

  // 9. Shares Screen (via Dashboard)
  console.log('Navigating to Dashboard then Shares...');
  await clickByText('Dashboard');
  await sleep(1500);
  await clickByText('Shares');
  await sleep(2000);
  console.log('Capturing 14_shares_capital_screen.png');
  await page.screenshot({ path: path.join(outputDir, '14_shares_capital_screen.png') });

  // Buy Shares Modal
  console.log('Opening Buy Shares Modal...');
  await clickByText('Purchase More Shares');
  await sleep(1500);
  console.log('Capturing 15_shares_buy_modal.png');
  await page.screenshot({ path: path.join(outputDir, '15_shares_buy_modal.png') });

  // Close Buy Shares modal
  await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('div[role="button"], button');
    for (const b of closeBtns) {
      if (b.innerHTML.includes('close')) {
        b.click();
        break;
      }
    }
  });
  await sleep(1000);

  // Back to Dashboard
  await page.evaluate(() => {
    const backBtn = document.querySelector('div[role="button"]');
    if (backBtn) backBtn.click();
  });
  await sleep(1500);

  // 10. Notifications Screen
  console.log('Opening Notifications...');
  await page.evaluate(() => {
    // click notifications button in header
    const btns = document.querySelectorAll('div[role="button"]');
    for (const b of btns) {
      if (b.innerHTML.includes('notifications')) {
        b.click();
        break;
      }
    }
  });
  await sleep(2000);
  console.log('Capturing 16_notifications_screen.png');
  await page.screenshot({ path: path.join(outputDir, '16_notifications_screen.png') });

  // Back to Dashboard
  await page.evaluate(() => {
    const backBtn = document.querySelector('div[role="button"]');
    if (backBtn) backBtn.click();
  });
  await sleep(1500);

  // 11. Member Profile
  console.log('Navigating to Profile...');
  await clickByText('Profile');
  await sleep(2000);
  console.log('Capturing 17_member_profile_screen.png');
  await page.screenshot({ path: path.join(outputDir, '17_member_profile_screen.png') });

  // 12. Switch to Administrator Portal
  console.log('Switching to Administrator Portal...');
  await clickByText('Switch to Administrator Portal');
  await sleep(3000);

  // Admin Dashboard
  console.log('Capturing 18_admin_dashboard.png');
  await page.screenshot({ path: path.join(outputDir, '18_admin_dashboard.png') });

  // 13. Admin Members Directory
  console.log('Navigating to Admin Members...');
  await clickByText('Members');
  await sleep(2000);
  console.log('Capturing 19_admin_members_directory.png');
  await page.screenshot({ path: path.join(outputDir, '19_admin_members_directory.png') });

  // Click on a pending member to show modal
  await clickByText('Grace Muthoni Njenga');
  await sleep(1500);
  console.log('Capturing 20_admin_member_detail_modal.png');
  await page.screenshot({ path: path.join(outputDir, '20_admin_member_detail_modal.png') });

  // Close member modal
  await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('div[role="button"], button');
    for (const b of closeBtns) {
      if (b.innerHTML.includes('close')) {
        b.click();
        break;
      }
    }
  });
  await sleep(1000);

  // 14. Admin Loans Desk
  console.log('Navigating to Admin Loans Desk...');
  await clickByText('Loans Desk');
  await sleep(2000);
  console.log('Capturing 21_admin_loans_desk.png');
  await page.screenshot({ path: path.join(outputDir, '21_admin_loans_desk.png') });

  // Review a loan
  await clickByText('Review & Approve');
  await sleep(1500);
  console.log('Capturing 22_admin_loan_review_modal.png');
  await page.screenshot({ path: path.join(outputDir, '22_admin_loan_review_modal.png') });

  // Close review modal
  await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('div[role="button"], button');
    for (const b of closeBtns) {
      if (b.innerHTML.includes('close')) {
        b.click();
        break;
      }
    }
  });
  await sleep(1000);

  // 15. Admin Audit Trail
  console.log('Navigating to Admin Audit Trail...');
  await clickByText('Audit Trail');
  await sleep(2000);
  console.log('Capturing 23_admin_audit_ledger.png');
  await page.screenshot({ path: path.join(outputDir, '23_admin_audit_ledger.png') });

  // 16. Admin Reports
  console.log('Navigating to Admin Reports...');
  await clickByText('Reports');
  await sleep(2000);
  console.log('Capturing 24_admin_reports_analytics.png');
  await page.screenshot({ path: path.join(outputDir, '24_admin_reports_analytics.png') });

  // 17. Admin Products & Announcements (via Overview)
  console.log('Navigating to Admin Overview...');
  await clickByText('Overview');
  await sleep(2000);

  await clickByText('Products');
  await sleep(2000);
  console.log('Capturing 25_admin_products_management.png');
  await page.screenshot({ path: path.join(outputDir, '25_admin_products_management.png') });

  // Back to Overview
  await page.evaluate(() => {
    const backBtn = document.querySelector('div[role="button"]');
    if (backBtn) backBtn.click();
  });
  await sleep(1500);

  await clickByText('Notices');
  await sleep(2000);
  console.log('Capturing 26_admin_announcements_screen.png');
  await page.screenshot({ path: path.join(outputDir, '26_admin_announcements_screen.png') });

  await browser.close();
  console.log('All screenshots captured successfully in:', outputDir);
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});

