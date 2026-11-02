# Audit: Admin Reports — Report Type Buttons + Consolidated

**Date**: 2026-11-02 11:58:14 +08:00
**Task**: add btns as well for the type of report, (add consolidated as well)

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | `type` validation now accepts `consolidated`; dispatched to `generalReport()` (alias of `general`). `membersReport()` now filters roster as of `To` (`created_at <= to` only, matching the consolidated members basis). `membershipsReport()` uses overlap semantics (`end_date >= from`, `start_date <= to`) and honours `membership_status` (falls back to legacy `status`) evaluated as of the range end (`$asOf`); row `status` computed against `$asOf`. |
| `frontend/src/pages/Admin/Reports.jsx` | Added `REPORT_TYPES` (Consolidated, Members, Memberships, Payments, Attendance) + `TYPE_LABELS`, `StatusPill`, `TypeSummary`, `TypeTable` helpers. New **Report type** button row (horizontal-scroll on mobile, `h-11`, active = `charge-500`). `reportType`, `rows`, `meta`, `page` state; `fetchReport()` sends `type` (`consolidated`→`general`) and `page`/`per_page=15` for non-consolidated types, storing `res.meta`. `handleTypeChange` resets to page 1 and refetches; `handlePageChange` paginates. Non-consolidated render shows type summary cards, filtered table, empty state and Prev/Next pagination. Export PDF now uses the selected type: type-specific title/header, matching KPI cards, single type section (members/memberships/payments/attendance) with totals for payments. Export button disabled when the current type has no rows. |
| `audit/20261102-115814-reports-type-buttons-consolidated.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Reports page now has selectable report types with **Consolidated** (all four modules) as the default, plus Members, Memberships, Payments and Attendance. Each type returns only its own table with matching KPIs, pagination, and a matching PDF export. Date range, `This month`/`All time` modes and the `membership_status` filter continue to work across types.

## Verification (live API, admin JWT, port 8126; range 2026-09-01 → 2026-09-30)
| Type | Result |
|---|---|
| `consolidated` | mem=36 · mems=8 · pay=5 · att=4 |
| `members` | rows=15, total=36, page 1/3, summary `{total:36, active:22, expired:8, inactive:6}` |
| `memberships` | rows=8, total=8, summary `{total:8, active:5, expired:3}` |
| `payments` | rows=5, total=5, revenue `1500` |
| `attendance` | rows=4, total=4, `{present:1, completed:3}` |
| `memberships` + `membership_status=active` | total=5, active=5, expired=0 |
| `memberships` + `membership_status=expired` | total=3, active=0, expired=3 |
| Pagination `members&per_page=5&page=2` | rows=5, total=36, page 2/8 |

- `php -l` clean; `vite build` ✓ 2215 modules; oxlint only pre-existing warnings.
- Temp server on port 8126 stopped.

## Notes
- Type-specific PDF export contains the current page of rows (server-side pagination, 15/page); Consolidated still exports every row.
- `membership_status` only affects the Memberships type and the consolidated Memberships section.
