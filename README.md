# Talliffy Van Sales Pro

An end-to-end Van Sales and Distribution Accounting system seamlessly integrated with **Tally ERP / Tally Prime**, featuring a mobile application for field sales agents, a web dashboard for administrative management, and an Express/TypeScript backend.

---

## 🚀 Overview

Talliffy Van Sales Pro automates and streamlines field sales operations:
- **Mobile Sales App (`mobile/`)**: Order booking, invoice generation, van stock tracking, receipt vouchers, customer ledger balances, and offline sync for field agents.
- **Web Management Dashboard (`webapp/`)**: Real-time sales monitoring, route planning, inventory dispatching, user permissions, and analytics.
- **Backend API (`backend/`)**: RESTful API built with Node.js, Express, and TypeScript, providing business logic, authentication, and database orchestration.
- **Tally Integration Engine (`tdl/`)**: Tally Definition Language (TDL) and automated sync services bridging field transactions with Tally ERP 9 / Tally Prime.
- **ApexERP Module (`apexerp_extracted/`)**: Integrated double-entry accounting and ledger reconciliation modules.

---

## 📁 Repository Structure

```
vansales/
├── backend/            # Express + TypeScript REST API
│   ├── src/            # Controllers, routes, services, middleware
│   ├── .env.example    # Environment variable template
│   └── package.json
├── mobile/             # React Native / Expo field sales app
│   ├── app/            # Screens and navigation
│   └── package.json
├── webapp/             # React + Vite admin dashboard
│   ├── src/            # Components, pages, state management
│   └── package.json
├── tdl/                # Tally Definition Language & sync scripts
│   ├── talliffy_sync.tdl
│   └── talliffy_auto_sync.js
├── scripts/            # Utility scripts (icon generation, PDF reports)
└── apexerp_extracted/  # Distribution accounting web module
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher
- **npm** or **pnpm**
- **PostgreSQL**: For backend database
- **Tally ERP 9 / Tally Prime** (for live ERP sync)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and Tally credentials
npm run build
npm start
```

### 3. Web Dashboard Setup
```bash
cd webapp
npm install
npm run dev
```

### 4. Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```

---

## 🔒 Security & Configuration
- All sensitive credentials, secrets, and environment configurations are excluded from version control via `.gitignore`.
- Reference `.env.example` in `backend/` for required environment variables.

---

## 📄 License
Private & Proprietary - All Rights Reserved.
