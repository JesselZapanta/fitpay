# Audit: Remove ADMIN Badge from Topbar

**Date**: 2026-08-27 22:05:23
**Task**: remove this on ADMIN tag on topbar

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/Layout/AdminLayout.jsx` | **Edited** — header left: removed `Badge` `ADMIN` (`hidden md:inline-flex bg-[var(--charge-500)] text-white text-[10px] ml-1`). Left now only `FitPay` logo + `Admin • Charge and Grow` text. Removed `Badge` from imports (no longer used in header; still kept `Avatar` for top/side `FitPay Admin` cards). Header remains `sticky top-0 h-14` with logo + top `FitPay Admin` card (from 220357) + mobile `Menu` Sheet. |
| `audit/20260827-220523-remove-admin-badge-topbar.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Removed the **ADMIN** teal badge (`Badge` `ADMIN`) from the topbar per request. Header left now shows only `FitPay` lockup (`Dumbbell` + `FitPay` + `Admin • Charge and Grow` subtext) without the pill badge; the `FitPay Admin admin@fitpay.test` card (added in 220357) remains on both top (`hidden sm:flex` header right) and sidebar bottom, so admin identity is still visible. Build verified: `vite build` ✓ 1991 modules, 413.9kB JS (was 414k, -0.15k from removed Badge), 72.21kB CSS.

## Notes
- **Badge import removed**: `Badge` no longer used in `AdminLayout` header; kept `Avatar` for the `FitPay Admin` cards (top + side).
- **No other layout affected**: `MemberLayout` still shows `MEMBER` badge (green) as before; `AppLayout` not used for dashboards.
