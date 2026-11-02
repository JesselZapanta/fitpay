# Audit: Admin Reports — Simplified to Members/Memberships + Status Only

**Date**: 2026-11-02 12:29:08 +08:00
**Task**: remove all the other reports and filters, only members/membership then the status

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/Reports.jsx` | Rewritten (simplified). **Removed** report types Payments, Attendance and Consolidated; **removed** all date filters (This month / All time / custom range, From/To inputs, Generate button, filter-basis panel) and the consolidated multi-table view. **Kept**: two report types — **Members** and **Memberships** (default Members) — plus a single **Status** select that adapts options per type (Members: All/Active/Inactive/Expired; Memberships: All/Active/Expired) and refetches immediately on change. Data loads on mount and on every type/status/page change (no Generate). Retained `KpiGrid` (3 cards), `TableCard`, `StatusPill`, pagination (15/page) and the redesigned PDF export, which now fetches up to 1000 rows server-side and renders a single type section (`fitpay-<type>-report-<date>.pdf`). Hero subtitle shows type + status + record count. |
| `audit/20261102-122908-reports-members-memberships-status-only.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Reports page is now just the two requested reports with a status filter. Date-based filtering, consolidated view and the Payments/Attendance report types are gone from the UI; the backend endpoints remain available but unused by this page.

## Verification (live API, admin JWT, port 8127)
| Query | Rows | Total | Summary |
|---|---|---|---|
| `type=members` | 15 | 36 | `{total:36, active:22, expired:8, inactive:6}` |
| `type=members&status=active` | 15 | 22 | `{total:22, active:22}` |
| `type=members&status=inactive` | 6 | 6 | `{total:6, inactive:6}` |
| `type=memberships` | 9 | 9 | `{total:9, active:1, expired:8}` |
| `type=memberships&status=active` | 1 | 1 | `{total:1, active:1}` |
| `type=memberships&status=expired` | 8 | 8 | `{total:8, expired:8}` |

- `vite build` ✓ 2215 modules; oxlint only the two pre-existing effect warnings.
- Temp server on port 8127 stopped.

## Notes
- Memberships “active” is evaluated against today in Asia/Manila (server-side).
- Backend report types `payments`, `attendance`, `general`, `consolidated` still exist for API consumers; only the UI was trimmed.
- PDF export ignores the current page and pulls up to 1000 rows for the selected type/status.
