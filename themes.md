# FitPay — Themes & Design Tokens

Source: `design.md` · Single source of truth for Tailwind + shadcn/ui + lucide styling.
Import via `src/index.css` (`@theme inline` + CSS variables). No separate `themes.md` existed — this file bridges `design.md` to Tailwind.

---

## 1. Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
--font-display: "Space Grotesk", sans-serif;
--font-body: "Inter", sans-serif;
```

- **Space Grotesk 700** — dashboard big numbers (40px/32px), tabular-nums
- **Space Grotesk 600** — H1 (28/22), H2 (20/18)
- **Inter 400/600** — body (16/15), buttons (15/15, 600), meta (13)

Apply: `font-display` on numbers/headings, `font-body` on body/buttons. Use `font-variant-numeric: tabular-nums` for pesos/dates/counts.

---

## 2. Color Tokens (Light default)

> **2026-08-27 update:** Orange `#FF5A1F` → **Teal `#0F766E`** (user feedback: orange looked cheap). New teal is WCAG AA on white, calm under fluorescent front-desk light, premium alongside `grow` green.

| Token | Hex | Tailwind / CSS var | Usage |
|-------|-----|-------------------|-------|
| `--charge-500` | `#0F766E` | `var(--charge-500)` / `bg-[var(--charge-500)]` / `text-[var(--charge-500)]` | Primary CTA, active nav, `@theme --color-primary` — deep teal |
| `--charge-600` | `#115E59` | hover/pressed | `hover:bg-[var(--charge-600)]` — darker teal |
| `--charge-100` | `#CCFBF1` | tint | selected row, badge bg — teal-100 |
| `--grow-500` | `#1E8E5A` | success/secondary | `bg-[var(--grow-500)]`, `@theme --color-secondary` |
| `--grow-100` | `#DFF5E9` | success tint | Active badge |
| `--ink-900` | `#1A1D1F` | `foreground` | headings, primary text |
| `--ink-600` | `#5B6168` | `muted-foreground` | secondary text |
| `--ink-300` | `#E1E4E8` | `border` / `input` | dividers, borders |
| `--surface-0` | `#F7F7F5` | `background` | page bg |
| `--surface-1` | `#FFFFFF` | `card` | cards/modals |
| `--surface-dark` | `#15171A` | `background` dark | dark mode bg |

**shadcn mapping** (`src/index.css` `@theme inline`):
```css
--color-primary: var(--charge-500);
--color-primary-foreground: #FFFFFF;
--color-secondary: var(--grow-500);
--color-secondary-foreground: #FFFFFF;
--color-background: var(--surface-0);
--color-card: var(--surface-1);
--color-foreground: var(--ink-900);
--color-muted-foreground: var(--ink-600);
--color-border: var(--ink-300);
--color-ring: var(--charge-500);
```

**Status pills (never large fills)**:
- Active/Paid: `bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20`
- Expiring/Pending: `bg-[#FCEFD6] text-[#B8790A]`
- Expired/Overdue: `bg-[#FBE2E2] text-[#C43D3D]`
- Neutral: `bg-[#EDEEF0] text-[#5B6168]`

Focus ring: `2px solid var(--charge-500)` + 2px offset.

---

## 3. Layout

- **Breakpoints**: `<640 mobile` (bottom tab bar 56px, 5 slots), `640–1024 tablet` (collapsible sidebar 72→240px), `>1024 desktop` (full sidebar + top bar 56px)
- **Spacing**: 8px base (4,8,12,16,24,32,48,64)
- **Container**: `max-w-[1200px] mx-auto`, gutters `px-4 sm:px-6` (16/24), card padding `p-4 sm:p-6`, radius `rounded-xl` (12px), modal `rounded-2xl` (16px)
- **Top bar** (56px): title + search + avatar
- **Bottom bar** (mobile): `fixed bottom-0 h-14 grid grid-cols-5`

---

## 4. Components (shadcn/ui)

- **Button primary**: `bg-[var(--charge-500)] text-white hover:bg-[var(--charge-600)] h-11 rounded-lg` (44px min), secondary `bg-white border border-[var(--ink-300)]`, destructive `text-[#C43D3D]`
- **Badge pill**: `rounded-full px-2.5 py-1 text-xs font-semibold` + dot/icon for a11y
- **Card stat**: icon 20-24 lucide, number `font-display text-2xl sm:text-[32px] font-bold tabular-nums`, label `text-xs text-[var(--ink-600)]`, trend `text-[var(--grow-500)]`
- **Input**: `h-12 rounded-lg border-[var(--ink-300)] focus:border-[var(--charge-500)] focus:ring-[var(--charge-500)]/20`
- **Table**: sticky header, `border-b border-[var(--ink-300)]`, row hover `bg-[var(--surface-0)]`, status as pill
- **Skeleton**: shimmer, never full-screen spinner; empty: icon + message + primary CTA

---

## 5. Motion

- 150ms ease-out hover/press, 200ms sheet/drawer, single check animation on payment success. No decorative motion.

---

## 6. Usage Notes

- Tailwind v4 via `@tailwindcss/vite`, theme via CSS vars in `src/index.css` (no `tailwind.config.js`)
- lucide `20px` nav, `24px` buttons/cards
- Mobile-first: base 375px → `sm:` → `lg:`; tables `overflow-x-auto` desktop + card stack `sm:hidden`
- Dark mode optional: `:root.dark` uses `--surface-dark` + adjusted ink/charge tints; toggle via `class="dark"` on html

> This file is read by the frontend `src/index.css` and `shadcn` components — keep `design.md` as narrative and `themes.md` as the code-faced token reference.
