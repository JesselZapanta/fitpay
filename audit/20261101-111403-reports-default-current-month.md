# Audit: Admin Reports — Default Range = Current Month

**Date**: 2026-11-01 11:14:03 +08:00
**Task**: by default the filter should cover 1 month on the current month

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/Reports.jsx` | Added `pad2()` + `getCurrentMonthRange()` helper that anchors on **Asia/Manila** (`Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" })`) and returns `{ start: YYYY-MM-01, end: YYYY-MM-<lastDay> }` (days-in-month via `new Date(year, month, 0).getDate()`). `from` / `to` state now initialize to that range instead of `""`, so the first render + initial `fetchReport()` load the current month. `fetchReport(range)` now accepts an optional `{ from, to }` override (used by the reset action). Added `handleThisMonth()` that resets both dates and immediately re-fetches. Added a compact **“This month”** ghost button beside the hint text. Hint copy changed to “Defaults to the current month — change the dates and press Generate. Clear both dates for all time.” |
| `audit/20261101-111403-reports-default-current-month.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Reports now opens scoped to the current month (e.g. `2026-11-01 → 2026-11-30`) rather than all time, for both summary cards and the report tables. Users can still pick any range and press **Generate**, clear both dates for all time, or press **This month** to jump back to the default range.

## Verification
- Helper output check: `today 2026-11-01 → range 2026-11-01 to 2026-11-30` (Node, Asia/Manila anchor).
- Backend range filtering already verified end-to-end (summaries + rows, invalid ranges 422).
- `vite build` ✓ 2215 modules; `oxlint` clean apart from pre-existing warnings (unused `CardDescription`, effect deps).

## Notes
- Manila anchoring keeps the default month consistent with the server’s reporting timezone even if the browser is set to another zone.
- Range is inclusive on both ends (`whereDate <= to`), so the last day of the month is included.
