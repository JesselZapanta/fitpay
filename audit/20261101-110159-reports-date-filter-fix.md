# Audit: Admin Reports — From/To Filter Fixed for All Rows

**Date**: 2026-11-01 11:01:59 +08:00
**Task**: please check if the from to filter works

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | **Bug fix** — `generalReport()` previously applied `from`/`to` only to the summary queries; the returned `members` / `memberships` / `payments` / `attendances` arrays ignored the range. Now each row query applies the same filters: members by `created_at`, memberships by `start_date`, payments by `created_at`, attendances by `attendance_date`. Also replaced the per-member membership lookup (N+1) with one grouped query `Membership::with('membershipRequest')->orderBy('end_date')->get()->groupBy('user_id')` then `->last()`. |
| `audit/20261101-110159-reports-date-filter-fix.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
The From/To controls now affect **both** the summary cards and the report tables (previously tables always showed all-time data). Verified end-to-end against the running API (admin JWT, `Accept: application/json`) with the live `fitpaydb` data.

## Verification
| Request | Summary | Rows |
|---|---|---|
| no range (all time) | mem=36 mems=8 pay=8 att=5 | mem=36 mems=8 pay=8 att=5 |
| `from=2020-01-01&to=2020-12-31` | all 0 | all 0 |
| `from=2026-09-01&to=2026-09-30` | mem=10 mems=5 pay=5 att=4 | mem=10 mems=5 pay=5 att=4 |
| `from=2026-09-05` (open end) | mem=1 mems=1 pay=1 att=2 | mem=1 mems=1 pay=1 att=2 |
| `from=2026-05-01&to=2026-01-01` | `422` — "The to field must be a date after or equal to from." | — |

- DB parity check passed: row counts equal direct Eloquent counts for the same range.
- Row count always equals summary total for the same range.
- Member sample rows now include `membership_start` / `membership_end` / `plan_label` (e.g. `MEM-0037` → `2026-09-08` → `2026-10-08` · Monthly Plan); members without memberships show `No plan`.

## Notes
- Without `Accept: application/json`, Laravel validation failures return a 302 redirect; axios sets the header, so the UI receives 422 correctly.
- Temporary verification scripts (`report_filter_check.php`, `report_sample_check.php`) and the `artisan serve --port=8123` process were removed/stopped.
- `php -l` clean; frontend unchanged (already sends `from`/`to` only when set).
