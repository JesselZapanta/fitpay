# Audit: Replace Settings with FitPay Admin

**Date**: 2026-08-27 22:00:00
**Task**: replace settings with FitPay Admin admin@fitpay.test

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/Layout/AdminLayout.jsx` | **Edited** — bottom `aside` `p-3 border-t` section: removed `Link` Settings (`<Settings> Settings`) and replaced with **FitPay Admin card**: `div flex items-center gap-3 rounded-lg px-3 py-3 bg-[var(--surface-0)] border border-[var(--ink-300)]` containing `Avatar` (`AvatarFallback bg-[var(--charge-500)] text-white FA`) + `FitPay Admin` (`text-xs font-bold truncate`) + `admin@fitpay.test` (`text-[11px] text-[var(--ink-600)] truncate`). Kept `Log out` button below. Removed `Settings` from `lucide-react` import (now unused). Sidebar remains `fixed left-0 top-14 bottom-0 w-[240px] overflow-hidden` with inner `overflow-y-auto` for nav scroll. |
| `audit/20260827-220000-replace-settings-with-fitpay-admin.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Replaced the **Settings** entry at the bottom of the admin sidebar with the requested **FitPay Admin • admin@fitpay.test** user card. The new card is a compact, non-clickable display (`bg-[var(--surface-0)]` + border) with avatar `FA` (teal) and two-line text, sitting directly above the `Log out` button in the pinned bottom section (`p-3 border-t`). No change to top bar, nav groups, or member layout; only admin sidebar bottom. Build verified: `vite build` ✓ 1991 modules, 414kB JS, 72.17kB CSS.

## Notes
- **Hardcoded per request**: shows literal `FitPay Admin` / `admin@fitpay.test` (matches seeder `admin@fitpay.test`), not dynamic `user?.name/email` (top bar already shows dynamic user). Could switch to dynamic if needed.
- **No vertical move**: sidebar stays `fixed` with inner `overflow-y-auto` for nav scroll (per previous audits 215745 + 215902) — this card is in the fixed bottom, not scrollable.
