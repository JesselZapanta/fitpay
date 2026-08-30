# Audit: Membership start/end date tracking by plan

**Date**: 2026-08-29 10:30:00
**Task**: When admin approves at http://localhost:5173/admin/membership-requests/2, memberships at http://localhost:5173/admin/memberships start and end should track 1 day / 1 month / 1 year correctly

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/MembershipRequestController.php` | Changed membership creation from `addDays(1/30/365)` to calendar-accurate `match` : `daily`→`addDay()`, `monthly`→`addMonth()`, `yearly`→`addYear()` from `Carbon::today()`. `start_date = today`, `end_date = start + duration` now yields e.g. `2026-08-29 → 2026-08-30` daily, `2026-08-29 → 2026-09-29` monthly, `2026-08-29 → 2027-08-29` yearly. |
| `backend/app/Http/Controllers/Api/Member/DashboardController.php` | Fallback path (when no `memberships` row, using `MembershipRequest` approved) now uses same `match` with `addDay`/`addMonth`/`addYear` and recomputes `$days = diffInDays(approvedAt, expiresAt)` for progress/daysLeft, instead of hardcoded 30. Membership-based path already used actual `start_date`/`end_date` diff, so now consistent. |
| `audit/README.md` | Regenerated descending index |

## Summary
Approved request now creates `memberships` with true calendar durations. Tested by approving `id 2` (Alex Member, monthly, ref 3434): created `membership id 2` `start 2026-08-29 end 2026-09-29` (31 days, 1 month) vs old 30-day `2026-09-28`. Existing `id 1` (monthly, 2026-08-29 → 2026-09-28) remains as before (now expired via status edit), but all future approvals at `/admin/membership-requests/:id` will use correct 1-day/1-month/1-year tracking visible at `/admin/memberships`. Verified via tinker and `route:list`, dashboard `progress/daysLeft` now calendar-correct.

## Notes
- `start_date` is approval date (`Carbon::today()`); `end_date` is inclusive calendar addition. Daily = tomorrow, monthly = same day next month (handles 31/28), yearly = same day next year.
- `Member` status set to `active` on approve remains; `MemberDashboardController` progress now uses actual `diffInDays` for accurate % when months vary (28-31 days).
- No frontend change; `/admin/memberships` already shows `start_date`/`end_date` mono and status; dates now reflect calendar months.
