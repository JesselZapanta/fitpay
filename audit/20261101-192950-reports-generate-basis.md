# Audit: Reports — Generate Feedback + Filter Basis Clarified

**Date**: 2026-11-01 19:29:50 +08:00
**Task**: http://localhost:5173/admin/reports generate not working, what was the basis of the from and to?

## Root cause
`Generate` was working (it re-fetched), but the **default current-month range (Nov 2026) genuinely has no activity** in `fitpaydb` — members/memberships/payments/attendance data ends `2026-10-08` — so the page looked unchanged after every click. Additionally, `Members` filtered by `created_at >= from`, so an ongoing roster disappeared, and `Memberships` used `start_date` only, so memberships that were still running during the range were excluded.

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | `generalReport()` filter basis redefined and documented in a header comment: **Members** = roster as of range end (`created_at <= to`, no lower bound); **Memberships** = spans overlapping the range (`start_date <= to AND end_date >= from`); **Payments** = `created_at` inside range (unchanged); **Attendance** = `attendance_date` inside range (unchanged). Applied identically to summary queries and returned rows. `memberships_active` now means active as of the range end (`status = active AND end_date >= to ?? today`) instead of "active right now". |
| `frontend/src/pages/Admin/Reports.jsx` | `fetchReport()` now returns `{ total, from, to }`. `handleGenerate` is async and shows sonner feedback: `toast.success("N records found", { description: "from → to" })` or `toast.info("No records in this range", …)`. Added a **Filter basis** panel under the date inputs listing exactly which column each section uses. Added an explicit “No records in this range” card when all four tables are empty (with range + suggestion). |
| `audit/20261101-192950-reports-generate-basis.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Every Generate click now gives visible feedback and states the applied range, and the UI documents the date basis. Filter semantics were corrected so ongoing members and memberships appear in the current month instead of vanishing.

## Verification (live API, admin JWT, port 8124)
| Range | Summary | Rows |
|---|---|---|
| `2026-11-01 → 2026-11-30` (default) | mem=36 active=22 · mems=0 · pay=0 · att=0 | 36 / 0 / 0 / 0 |
| `2026-09-01 → 2026-09-30` | mem=36 · mems=8 (active 5) · pay=5 · att=4 | 36 / 8 / 5 / 4 |
| `2026-10-01 → 2026-10-31` | mem=36 · mems=5 (active 0) · pay=0 · att=0 | 36 / 5 / 0 / 0 |
| no range (all time) | mem=36 · mems=8 · pay=8 · att=5 | 36 / 8 / 8 / 5 |

- DB dates confirmed: members `2026-08-27 → 2026-09-08`, memberships `2026-08-29 → 2026-10-08`, payments `2026-08-30 → 2026-09-08`, attendance `2026-08-30 → 2026-09-08`.
- `php -l` clean; `vite build` ✓ 2215 modules; oxlint only pre-existing warnings.
- Temp server on port 8124 stopped.

## Notes
- If a month with no activity is selected, the page now says so explicitly instead of silently repeating the old numbers.
- Clearing both dates keeps the previous all-time behaviour.
