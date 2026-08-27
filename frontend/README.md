# FitPay Frontend — React + Vite + Tailwind + shadcn/ui

> Gym Management System — **FitPay: Charge and Grow**. Mobile-first React frontend consuming the Laravel REST API.

## Stack
- **Vite** + **React 19 (JSX)** — fast HMR, functional components + hooks
- **Tailwind CSS v4** via `@tailwindcss/vite` — utility-first, mobile-first
- **shadcn/ui (JSX, new-york)** — accessible primitives (Button, Card, Dialog, Drawer, Sheet, Table, etc.)
- **lucide-react** — icons
- **axios** — API client (`src/lib/api.js`, reads `VITE_API_URL` from `.env`)
- **radix-ui**, **vaul**, **class-variance-authority**, **zod**, **react-hook-form** — shadcn dependencies

## Project Structure
```
frontend/
├── components.json          # shadcn config (JSX, new-york, neutral)
├── jsconfig.json            # @/* alias → ./src/*
├── vite.config.js           # react + tailwind + @ alias + /api proxy
├── index.html               # title: FitPay — Charge and Grow
├── .env                     # VITE_API_URL=http://localhost:8000/api
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx              # Demo dashboard (mobile-first showcase)
    ├── index.css            # @import "tailwindcss" + tw-animate-css + shadcn theme tokens
    ├── lib/
    │   ├── utils.js         # cn() helper
    │   └── api.js           # axios instance + Bearer token + 401 handler
    ├── hooks/
    │   └── use-mobile.js
    ├── components/
    │   ├── ui/              # shadcn components (button, card, input, table, dialog, drawer, sheet, etc.)
    │   ├── Layout/AppLayout.jsx
    │   ├── StatCard.jsx
    │   └── MemberCard.jsx   # mobile card vs desktop table row
    └── pages/
        ├── Auth/Login.jsx
        ├── Dashboard/Index.jsx
        ├── Members/Index.jsx + Create/Show/Edit
        ├── MembershipPlans/Index.jsx
        ├── Payments/Index.jsx + Create.jsx
        ├── Attendance/Index.jsx
        └── Reports/Index.jsx
```

## Quick Start
```bash
# 1) Install
cd frontend
npm install

# 2) Env
cp .env.example .env
# edit VITE_API_URL if backend is not http://localhost:8000/api

# 3) Dev
npm run dev        # http://localhost:5173

# 4) Build
npm run build      # dist/
npm run preview
```

## Env
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=FitPay
VITE_APP_URL=http://localhost:5173
```
Backend (`backend/.env`) should have matching:
```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

## shadcn/ui
Config: `components.json` — `tsx: false` (JSX), style `new-york`, `iconLibrary: lucide`.
Add components:
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog drawer sheet card table form input select badge
```

## Mobile-First Rules (MANDATORY)
- Base = 375px, then `sm:` / `md:` / `lg:` — e.g. `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Containers `container mx-auto px-4 sm:px-6`, no fixed pixel widths
- Tables: `overflow-x-auto` on desktop, card stack on mobile (`sm:hidden` / `hidden sm:block`)
- Dialogs: `Drawer` (bottom sheet) on mobile, `Dialog` on desktop; nav via `Sheet` hamburger
- Touch targets `min-h-11` (~44px), thumb-zone bottom bar on mobile
- Verify at 375px & 320px — no horizontal scroll, `min-w-0` + `break-words`

## API Client
`src/lib/api.js` reads `import.meta.env.VITE_API_URL`, injects `Authorization: Bearer <fitpay_token>` from `localStorage`, handles 401.

## Backend Connection
Laravel API lives in `fitpay/backend` (`php artisan serve` → :8000). Frontend proxies `/api` to `VITE_API_URL` in dev via `vite.config.js`.

## Verification
```bash
npm run build   # ✓ 1976 modules, no errors
```
