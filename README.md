# 📱 Pesa Pap SACCO Mobile Application

[![Expo](https://img.shields.io/badge/Expo-SDK%2057-black?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-blue?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-green)]()
[![Theme](https://img.shields.io/badge/Theme-Light%20%26%20Dark%20Mode-purple)]()

> A modern, clean, and full-featured Cooperative Banking (SACCO) mobile application built with **React Native**, **Expo SDK 57**, **TypeScript**, and **AsyncStorage Persistence**.

---

## 🌟 Key Features

### 🌓 Complete Light & Dark Mode
- System-adaptive and instant manual switch between Light and Dark themes.
- High-contrast, WCAG-compliant color palettes tailored for mobile viewing comfort in both day and night conditions.
- Preserved theme state across sessions with one-tap toggle in the navigation header and login screen.

### 👤 Member Self-Service Portal
- **KYC & Authentication:** Comprehensive registration, multi-factor login (Member ID, National ID, or Email), and OTP-based password recovery.
- **Financial Dashboard:** Real-time balances for total savings, active loan liabilities, available borrowing limit (3× rule), and interactive 6-month growth trajectory chart.
- **Savings Management:** Deposit and withdrawal workflows with non-withdrawable savings collateral lockup protection.
- **Loan Desk & Calculator:** Live amortization calculator, multi-product loan application (Emergency, Development, School Fees, Asset Finance), and instant credit limit evaluation.
- **Loan Repayments:** Frictionless payments via M-Pesa STK push, savings balance deduction, or bank transfer with dynamic interest reduction.
- **Share Capital Ledger:** Statutory shareholding tracking, par-value computation (KES 1,000/share), and projected dividend earnings.
- **Transaction History & Receipts:** Searchable and filterable ledger with one-tap printable/viewable transaction receipts.
- **Notifications & Broadcasts:** Real-time event notifications for transactions, loan approvals, and SACCO executive announcements.

### 🛡️ Executive Administrator Control Center
- **Executive KPI Dashboard:** Total cooperative portfolio, savings liabilities, active loans under management, default rates, and member growth metrics.
- **Member Directory & KYC Desk:** Verify new members, inspect financial profiles, adjust membership status (Active / Suspended / Pending).
- **Credit Committee Appraisal Desk:** Review incoming loan requests, review collateral coverage, modify approved loan amounts, and disburse directly to member accounts.
- **Audit & General Ledger:** Centralized audit trail with cryptographic-style reference codes and filtering by type and date.
- **Financial Products Management:** Configure minimum and maximum loan limits, interest rates, and loan durations.
- **Announcements Broadcast:** Publish high-priority notices, general alerts, and AGM updates to all members.
- **SASRA Prudential Reports:** Regulatory compliance reports including Portfolio at Risk (PAR), liquidity ratios, and capital adequacy metrics.

---

## 📸 Deliverables & Documentation

The project includes complete submission deliverables located in the [`pesa pap backend/`](./pesa%20pap%20backend/) directory:

- 📄 **[PDF Dossier Submission](./pesa%20pap%20backend/PESA_PAP_SACCO_SCREENSHOTS_SUBMISSION.pdf):** 6.45 MB compiled dossier with high-resolution mobile screenshots, system architecture diagrams, and academic report.
- 🌐 **[Interactive HTML Portfolio](./pesa%20pap%20backend/PESA_PAP_SCREENSHOTS_PORTFOLIO.html):** Responsive web gallery of all 26 mobile screen captures with category filtering and light/dark preview.
- 📚 **[Academic & Technical Report](./PROJECT_DOCUMENTATION.md):** 380+ lines comprehensive specification covering Executive Summary, System Analysis, System Design, Implementation, and Testing.
- 🖼️ **Screenshots Directory:** 26 automated high-resolution captures in [`pesa pap backend/screenshots/`](./pesa%20pap%20backend/screenshots/) and [`screenshots/`](./screenshots/).

---

## 🛠️ Tech Stack & Architecture

- **Framework:** [Expo SDK 57](https://expo.dev) with React Native 0.83
- **Language:** TypeScript 5.9 with strict typechecking
- **Persistence Engine:** `@react-native-async-storage/async-storage` with relational schema and realistic seed data
- **Icons:** `@expo/vector-icons` (Ionicons)
- **Safe Area:** `react-native-safe-area-context`
- **Charts:** Custom responsive SVG/Canvas financial growth visualizer
- **Tooling:** Expo CLI, TypeScript compiler, Expo Doctor

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kenditelvin-byte/mobile-applications.git
   cd mobile-applications
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on a device or simulator:**
   - Scan the QR code using the **Expo Go** app (Android/iOS).
   - Press `a` for Android Emulator.
   - Press `i` for iOS Simulator.
   - Press `w` for Web Browser.

---

## 🔑 Demo Credentials

Quick 1-tap switcher is provided on the Login screen:

| Role | Username / ID | Password | Access Level |
|---|---|---|---|
| **Member** | `MEM-001` or `john@example.com` | `password123` | Member self-service dashboard, savings, loans, shares |
| **Admin** | `admin` or `admin@pesapap.co.ke` | `admin123` | Executive Admin portal, credit committee desk, KYC |

---

## 📋 Quality & Testing
- ✅ **Typecheck:** Clean run with zero errors (`npx tsc --noEmit`)
- ✅ **Expo Doctor:** 21/21 diagnostic checks passed (`npx expo-doctor`)
- ✅ **Cross-platform:** Verified responsive rendering on mobile viewports and web

---

## 📄 License
This project is developed for educational and demonstration purposes. All rights reserved.
