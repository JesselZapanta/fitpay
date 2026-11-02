# Audit: Admin Reports — Membership Status Filter

**Date**: 2026-11-02 11:48:22 +08:00
**Task**: in http://localhost:5173/admin/reports add new filter for membership status

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | Added validation `'membership_status' => ['nullable', 'in:all,active,expired']`. `generalReport()` reads `membership_status` and applies a shared `$applyMembershipStatus` closure to **both** the memberships summary query and the memberships row query: `active` → `status = active AND end_date >= asOf`; `expired` → `status = expired OR end_date < asOf` (asOf = `To` or today in Asia/Manila). Row `status` is now computed against the range end (`end_date < asOf`) instead of `isPast()` so past ranges report correctly. Summary `memberships_active`/`memberships_expired` derive from the filtered set. |
| `frontend/src/pages/Admin/Reports.jsx` | Imported shadcn `Select`. Added `membershipStatus` state (`all` default) shown as a **Membership** select in the filter toolbar (All statuses / Active only / Expired only, `h-11 sm:h-9`). `fetchReport()` accepts a `membershipStatus` override and sends `membership_status` when not `all`; changing the select refetches immediately via `handleMembershipStatusChange`. Filter-basis panel mentions the active membership-status constraint. Memberships table title reflects the filter (`Memberships — active|expired|all`). PDF export section title also includes the status. |
| `audit/20261102-114822-reports-membership-status-filter.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Reports can now be filtered by membership status. The filter applies to the Memberships section (table + summary counts) and works together with the date range or the all-time mode; it does not affect Members, Payments or Attendance sections.

## Verification (live API, admin JWT, port 8125)
| Query | Summary | Rows |
|---|---|---|
| `membership_status=all` | mems=8 · active=0 · expired=8 | 8 |
| `membership_status=active` (today) | mems=0 · active=0 · expired=0 | 0 |
| `membership_status=expired` | mems=8 · active=0 · expired=8 | 8 |
| `2026-09-01→2026-09-30` + `active` | mems=5 · active=5 · expired=0 | 5 |
| `2026-09-01→2026-09-30` + `expired` | mems=3 · active=0 · expired=3 | 3 |
| `membership_status=bogus` | HTTP **422** validation error | — |

- Sept active (5) + expired (3) = 8 total, consistent with the unfiltered Sept range.
- `php -l` clean; `vite build` ✓ 2215 modules; oxlint only pre-existing warnings.
- Temp server on port 8125 stopped.

## Notes
- "Active" is evaluated against the range end (`To`) or today when no range is set, matching the membership status shown in each row.
- Existing `status` query param remains for the type-specific member report; the new param is `membership_status` to avoid collision.
