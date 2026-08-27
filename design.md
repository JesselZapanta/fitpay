# FitPay: Charge and Grow — Design System

Gym Management System · Web-based, mobile-friendly admin platform
Design reference for implementation (UI, layout, components, states)

---

## 1. Design Concept

**"Charge and Grow"** drives every visual decision:

- **Charge** → payments, energy, action. Represented by a hot, high-energy accent (ember orange).
- **Grow** → member progress, business growth, consistency. Represented by a confident green.

The admin using this system is gym staff, not developers — often mid-task at a front desk, sometimes on a tablet or phone. The UI must therefore be **fast to scan, forgiving of fat-finger taps, and calm under pressure** (a line of members waiting to check in is the real use case, not a quiet office). This is not a generic admin-template dashboard — it should feel like a piece of gym equipment: sturdy, high-contrast, purposeful.

Design principles:
1. **One primary action per screen** — never make the admin hunt for the button they need.
2. **Status is a color, not a sentence** — payment/membership state is readable at a glance (badge/pill, not paragraph).
3. **Numbers are the hero** — dashboard and reports lead with large, bold figures.
4. **Mobile is not an afterthought** — the front desk tablet/phone experience is designed first, desktop is the expanded version.

---

## 2. Color Palette

Light-first UI (front-desk visibility, fluorescent lighting, quick glances) with a dark-charcoal option for low-light front desks. All accent colors meet WCAG AA against their intended backgrounds.

### Core palette

| Token | Hex | Usage |
|---|---|---|
| `--charge-500` (primary) | `#FF5A1F` | Primary buttons, active nav, key CTAs ("Pay Now", "Check In") |
| `--charge-600` (hover/pressed) | `#E64A0F` | Button hover/active state |
| `--charge-100` (tint) | `#FFE7DA` | Selected rows, highlighted cards, badge backgrounds |
| `--grow-500` (secondary) | `#1E8E5A` | Success states, "Active" membership, growth metrics |
| `--grow-100` (tint) | `#DFF5E9` | Success badge backgrounds |
| `--ink-900` (text primary) | `#1A1D1F` | Headings, primary text |
| `--ink-600` (text secondary) | `#5B6168` | Secondary/meta text |
| `--ink-300` (borders) | `#E1E4E8` | Dividers, input borders, card borders |
| `--surface-0` (page bg) | `#F7F7F5` | App background (warm off-white, not clinical white) |
| `--surface-1` (card bg) | `#FFFFFF` | Cards, panels, modals |
| `--surface-dark` (dark mode bg) | `#15171A` | Optional dark theme for evening front-desk shifts |

### Status colors (used only for badges/pills — never as large fills)

| State | Color | Example |
|---|---|---|
| Active / Paid / Present | `#1E8E5A` on `#DFF5E9` | Membership active, payment completed |
| Expiring / Pending | `#B8790A` on `#FCEFD6` | Membership expiring ≤7 days, payment pending |
| Expired / Overdue / Absent | `#C43D3D` on `#FBE2E2` | Membership expired, payment overdue |
| Neutral / Draft | `#5B6168` on `#EDEEF0` | Inactive plan, draft state |

**Why not the expected "gym red/black"**: pure red-and-black reads as *alarm* and *masculine gym-bro*, which fights against clear data-reading and excludes half the member base. Ember orange keeps the energy without the aggression, and green does double duty as both "money in" and "membership healthy."

---

## 3. Typography

Two-font system: a geometric grotesk for numbers/UI (clarity at a glance) and a warmer humanist sans for body copy.

| Role | Font | Weight | Size (desktop / mobile) |
|---|---|---|---|
| Display (dashboard big numbers) | **Space Grotesk** | 700 | 40px / 32px |
| H1 (screen title) | Space Grotesk | 600 | 28px / 22px |
| H2 (section title) | Space Grotesk | 600 | 20px / 18px |
| Body | **Inter** | 400 | 16px / 15px |
| Body small / meta | Inter | 400 | 13px / 13px |
| Button label | Inter | 600 | 15px / 15px |
| Table numerals | Space Grotesk (tabular-nums) | 500 | 15px / 14px |

Numeric data (pesos, dates, counts) always uses `Space Grotesk` with `font-variant-numeric: tabular-nums` so columns of numbers align — critical for payment tables.

---

## 4. Layout & Navigation

### Breakpoints
- **Mobile**: < 640px — single column, bottom tab bar
- **Tablet**: 640–1024px — collapsible sidebar (icon-only by default), the primary target (front-desk tablets)
- **Desktop**: > 1024px — full sidebar + content, optional secondary panel

### Navigation pattern
- **Mobile (<640px)**: fixed **bottom nav bar**, 5 slots max: Dashboard, Members, Payments, Attendance, More (sheet with Memberships/Reports/Logout). Thumb-reachable, 56px tall, icon + 11px label.
- **Tablet/Desktop (≥640px)**: **left sidebar**, 240px expanded / 72px collapsed (icon rail). Sidebar always shows the 8 modules grouped:
  - Overview: Dashboard
  - Operations: Members, Attendance
  - Money: Payments, Payment Monitoring, Memberships
  - Insights: Reports
  - Account: Admin profile / Logout (bottom-pinned)
- A persistent **top bar** (56px) holds: screen title, global search (member lookup by name/ID), and the admin's avatar/name — present on every breakpoint.

### Grid & spacing
- 8px base spacing unit (`4, 8, 12, 16, 24, 32, 48, 64`).
- Content max-width 1200px on desktop, centered, with 24px gutters; 16px gutters on mobile.
- Cards use 16px internal padding on mobile, 24px on desktop; 12px corner radius throughout (16px for modals) — soft enough to feel modern, not so round it feels toy-like.

---

## 5. Core Components

### Buttons
- **Primary** (`--charge-500` fill, white text, 8px radius): one per screen — "Add Member," "Process Payment," "Check In."
- **Secondary** (white fill, `--ink-300` border, `--ink-900` text): "Cancel," "Export," "Filter."
- **Destructive** (`#C43D3D` text, transparent fill, fills red on hover): "Delete Member" — always requires a confirmation dialog.
- Minimum tap target: **44×44px** everywhere, no exceptions — this is a touch-first UI.

### Status badge / pill
Pill shape, 4px vertical / 10px horizontal padding, 12px semibold text, colored per the status table in §2. Always paired with a small dot or icon (not color alone) — e.g. ● Active, ▲ Expiring, ✕ Expired — for colorblind accessibility.

### Cards
- **Stat card** (dashboard): icon top-left, big number (Space Grotesk 32–40px), label below, optional small trend indicator (▲12% this month in `--grow-500`).
- **List/record card** (mobile member/payment rows): avatar-initial circle, name + meta on left, status pill + chevron on right — replaces dense tables on small screens.
- **Data table** (tablet/desktop): used for Payment Monitoring, Attendance, Reports. Sticky header, zebra-free (use `--ink-300` 1px row dividers instead — cleaner at scale), status column always rendered as a pill, row hover = `--surface-0`.

### Forms
- Labels always above the field (never placeholder-as-label).
- Field height 48px (touch-friendly), 8px radius, `--ink-300` border, `--charge-500` border + subtle glow on focus.
- Inline validation below the field in red (`#C43D3D`), appears on blur, never on first render.
- Required fields marked with a subtle asterisk, not color alone.

### Empty / loading / error states
Every list screen (Members, Payments, Attendance, Reports) defines all three — never leave a blank white panel:
- **Empty**: friendly icon + one-line message + primary action ("No members yet — Add your first member").
- **Loading**: skeleton rows (shimmer), never a blocking spinner over the whole screen.
- **No results** (search/filter): "No records match your filters" + a "Clear filters" link.

---

## 6. Screen-by-Screen Specs

### 6.1 Login
Centered card (max 400px) on `--surface-0` background, subtle radial gradient in `--charge-100` behind the card for warmth. Fields: username, password (show/hide toggle). Primary button full-width. Error banner (red, `--charge` not used here to avoid confusing "error" with "brand") appears above the form on invalid credentials, per FR-01's alternative flow. Logo/wordmark top of card.

### 6.2 Dashboard (FR-07)
Mobile: vertical stack of stat cards, swipeable. Desktop: 4-column stat grid at top —
`Total Members` · `Payments Today (₱)` · `Checked In Today` · `Expiring This Week`
— followed by two panels side-by-side (stack on mobile): a **recent activity feed** (last payments/check-ins, timestamped) and a **membership status breakdown** (simple donut: Active / Expiring / Expired using the status palette). This is the only screen that uses a chart — kept to one, so it stays the "big picture" view rather than competing with Reports.

### 6.3 Member Management (FR-02)
List view (cards on mobile, table on desktop) with a persistent search bar and a floating "+ Add Member" primary button (bottom-right FAB on mobile, top-right button on desktop). Tapping a member opens a **detail sheet/drawer** (not a new page) showing profile, membership status pill, payment history snippet, and Edit/Delete actions — keeps the admin from losing their place in the list.

### 6.4 Process Payment (FR-03)
A focused, single-task screen: member search/select (autocomplete) → membership plan auto-fills amount → payment method selector (segmented control: Cash / Card / Other) → large primary "Confirm Payment" button. On success, a full-screen confirmation state with a receipt summary and "Print/Share Receipt" + "Done" — this is the closest thing to a "moment of delight" in the app and should feel satisfying (checkmark animation in `--grow-500`).

### 6.5 Payment Monitoring (FR-04)
Data table (card list on mobile) with filter chips above it: Date range, Status (Paid/Pending/Overdue), Member. Each row: member name, plan, amount (tabular numerals), date, status pill. Tapping a row opens read-only detail — this screen is for *review*, so no destructive actions live here.

### 6.6 Membership Management (FR-05)
Simple plan list (Monthly / Annual / any custom plans) as cards showing plan name, price, duration, and member-count using it. "+ Add Plan" primary action. Editing a plan warns if members are currently on it ("12 members are on this plan — changes apply going forward only").

### 6.7 Attendance (FR-06)
Optimized for speed — this is used dozens of times a day at the front desk. Large member search/select, then one big toggle: **Check In / Check Out** (segmented, `--charge-500` for check-in, `--grow-500` for check-out). Below it, today's attendance list in real time. On mobile this screen should be reachable in ≤2 taps from anywhere (bottom nav).

### 6.8 Reports (FR-08)
Report type selector (segmented or dropdown: Revenue, Membership, Attendance) + date range picker, then a "Generate" primary button. Results show as a summary stat row + a table, with "Export (CSV/PDF)" as a secondary action top-right. Reports reuse the same table component as Payment Monitoring for consistency.

---

## 7. Iconography & Imagery
- Icon set: **Lucide** (rounded-friendly, consistent stroke weight, matches the soft-modern tone) at 20px (nav) / 24px (buttons/cards).
- No stock "gym bro lifting weights" photography — use abstract, editorial photography of real gym environments (space, equipment, community) sparingly, only on Login and empty states, never as dashboard decoration.

## 8. Accessibility
- Text contrast minimum 4.5:1 for body text, 3:1 for large text/icons.
- Status never conveyed by color alone (icon/label always paired, §5).
- All interactive elements keyboard-navigable with a visible focus ring (`2px solid var(--charge-500)`, 2px offset).
- Touch targets ≥44×44px; form fields ≥48px tall.

## 9. Motion
Minimal and functional only: 150ms ease-out for hover/press states, 200ms for sheet/drawer open, a single satisfying check animation on payment success (§6.4). No decorative motion elsewhere — this is a working tool, not a marketing site.

---

*This document defines the visual and interaction language for FitPay implementation. It should be read alongside the functional requirements (FR-01–FR-08) and ERD in the project manuscript — this file governs *how it looks and feels*, the manuscript governs *what it does*.*


do the login and register, and logout, create 2 dashboard(admin and memeber), use middleware, create seeder(1 admin, 1 member). for the design, use chadcn tailwind and lucide, please refer to the themes.md