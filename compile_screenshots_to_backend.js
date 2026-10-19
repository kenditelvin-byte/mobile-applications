const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const srcScreenshotsDir = path.join(__dirname, 'screenshots');
const backendDir = path.join(__dirname, 'pesa pap backend');
const targetScreenshotsDir = path.join(backendDir, 'screenshots');

// Ensure destination directories exist
if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir, { recursive: true });
}
if (!fs.existsSync(targetScreenshotsDir)) {
  fs.mkdirSync(targetScreenshotsDir, { recursive: true });
}

// 1. Copy all screenshot PNG files into "pesa pap backend/screenshots"
const files = fs.readdirSync(srcScreenshotsDir).filter(f => f.endsWith('.png'));
console.log(`Found ${files.length} screenshots to copy and compile.`);

const screenshotList = [];

files.sort().forEach((file, index) => {
  const src = path.join(srcScreenshotsDir, file);
  const dest = path.join(targetScreenshotsDir, file);
  fs.copyFileSync(src, dest);

  // Generate clean title
  const cleanTitle = file
    .replace(/^\d+_/, '')
    .replace('.png', '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  screenshotList.push({
    file,
    title: cleanTitle,
    index: index + 1,
    absolutePath: dest.replace(/\\/g, '/'),
  });
});

console.log('Copied all screenshots to:', targetScreenshotsDir);

// 2. Generate an HTML Document for the compilation
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PESA PAP SACCO - Complete Application Screenshots Submission</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #0B1120;
      color: #F8FAFC;
    }
    
    .cover-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 40px;
      box-sizing: border-box;
      background: linear-gradient(135deg, #0F2942 0%, #0A1C2E 100%);
      page-break-after: always;
    }

    .badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 42px;
      font-weight: 800;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
      color: #FFFFFF;
    }

    .subtitle {
      font-size: 18px;
      color: #94A3B8;
      max-width: 600px;
      line-height: 1.6;
      margin: 0 0 40px 0;
    }

    .meta-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px 36px;
      text-align: left;
      width: 100%;
      max-width: 480px;
      box-sizing: border-box;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 13.5px;
    }
    .meta-row:last-child {
      border-bottom: none;
    }
    .meta-label {
      color: #94A3B8;
    }
    .meta-value {
      color: #FFFFFF;
      font-weight: 700;
    }

    .gallery-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 24px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1E293B;
    }

    .screenshot-card {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 48px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      page-break-inside: avoid;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .num-pill {
      background: #3B82F6;
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
    }

    .file-name {
      font-size: 12px;
      color: #94A3B8;
      font-family: monospace;
      background: #0F172A;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .image-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0B1120;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #334155;
    }

    .image-wrapper img {
      max-width: 100%;
      max-height: 700px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>

  <div class="cover-page">
    <div class="badge">STU 3102: MOBILE APPLICATION DEVELOPMENT</div>
    <h1>PESA PAP SACCO</h1>
    <div class="subtitle">Complete Working Application Screenshots Compilation & System Verification Dossier</div>
    
    <div class="meta-box">
      <div class="meta-row">
        <span class="meta-label">Project Name:</span>
        <span class="meta-value">PESA PAP SACCO Mobile Banking</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Framework:</span>
        <span class="meta-value">React Native 0.86 / Expo SDK 57</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Persistence:</span>
        <span class="meta-value">AsyncStorage Relational Engine</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Theming:</span>
        <span class="meta-value">Adaptive Light & Dark Modes</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Verified Modules:</span>
        <span class="meta-value">Auth, Savings, Loans, Repayments, Admin</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Total Verified Screens:</span>
        <span class="meta-value">${screenshotList.length} Full-Page Captures</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Verification Date:</span>
        <span class="meta-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  </div>

  <div class="gallery-container">
    <div class="section-title">Verified Application Screen Captures</div>

    ${screenshotList.map(item => `
      <div class="screenshot-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="num-pill">SCREEN ${item.index.toString().padStart(2, '0')}</span>
            <h2 class="card-title">${item.title}</h2>
          </div>
          <span class="file-name">${item.file}</span>
        </div>
        <div class="image-wrapper">
          <img src="screenshots/${item.file}" alt="${item.title}" />
        </div>
      </div>
    `).join('')}

  </div>

</body>
</html>`;

const htmlFilePath = path.join(backendDir, 'PESA_PAP_SCREENSHOTS_PORTFOLIO.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log('Created HTML Gallery at:', htmlFilePath);

// 3. Compile to PDF using Puppeteer
async function generatePDF() {
  console.log('Generating PDF compilation via Chrome...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('file:///' + htmlFilePath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  const pdfPath = path.join(backendDir, 'PESA_PAP_SACCO_SCREENSHOTS_SUBMISSION.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm',
    },
  });

  await browser.close();
  console.log('Successfully generated PDF at:', pdfPath);
}

generatePDF().then(() => {
  // 4. Create README in "pesa pap backend"
  const readmeContent = `# PESA PAP SACCO — BACKEND & SCREENSHOTS COMPILATION DOSSIER

This directory contains the compiled screenshot deliverables and backend verification materials for **PESA PAP SACCO**.

### Included Deliverables:
1. **\`PESA_PAP_SACCO_SCREENSHOTS_SUBMISSION.pdf\`**:
   - Formal, full-page academic submission PDF containing all 26 mobile screen captures with numbered headers, metadata cover sheet, and module labels.
2. **\`PESA_PAP_SCREENSHOTS_PORTFOLIO.html\`**:
   - Interactive high-definition HTML gallery of all screens.
3. **\`screenshots/\` Directory**:
   - 26 original high-resolution PNG image captures (device scale 2x) covering every single module:
     - \`01_login_screen.png\`
     - \`02_registration_screen.png\`
     - \`03_forgot_password_screen.png\`
     - \`04_member_dashboard_light.png\`
     - \`05_member_dashboard_dark.png\`
     - \`06_savings_screen.png\`
     - \`07_savings_deposit_modal.png\`
     - \`08_savings_withdraw_modal.png\`
     - \`09_loans_overview.png\`
     - \`10_loan_application_modal.png\`
     - \`11_loan_repayment_screen.png\`
     - \`12_transactions_history.png\`
     - \`13_transaction_receipt_modal.png\`
     - \`14_shares_capital_screen.png\`
     - \`15_shares_buy_modal.png\`
     - \`16_notifications_screen.png\`
     - \`17_member_profile_screen.png\`
     - \`18_admin_dashboard.png\`
     - \`19_admin_members_directory.png\`
     - \`20_admin_member_detail_modal.png\`
     - \`21_admin_loans_desk.png\`
     - \`22_admin_loan_review_modal.png\`
     - \`23_admin_audit_ledger.png\`
     - \`24_admin_reports_analytics.png\`
     - \`25_admin_products_management.png\`
     - \`26_admin_announcements_screen.png\`

Compiled on: ${new Date().toLocaleString()}
`;

  fs.writeFileSync(path.join(backendDir, 'README.md'), readmeContent, 'utf-8');
  console.log('Created README in pesa pap backend.');
}).catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});

