# Audit: Attendance — Manila Timezone (Asia/Manila)

**Date**: 2026-09-04 10:45:18 +08:00
**Task**: for attendance check the time use, manila timezone

## Files Changed
| File | Changes |
|------|---------|
| `backend/config/app.php` | `timezone => 'UTC'` → `timezone => env('APP_TIMEZONE', 'Asia/Manila')` — app defaults to Manila, overridable via `.env`. |
| `backend/.env` / `backend/.env.example` | Added `APP_TIMEZONE=Asia/Manila` after `APP_URL` (mirrors `config/app.php`). |
| `backend/app/Http/Controllers/Api/Admin/AttendanceController.php` | **Manila everywhere**: `index` initial `whereHas` now uses `Carbon::today('Asia/Manila')` via `$manilaTodayForQuery`; stats `today` / `activeScope` now `Carbon::today('Asia/Manila')` + `$manilaToday` string for `end_date >=`; map now `Carbon::parse(...)->timezone('Asia/Manila')->format('H:i')` for `check_in/out` + `check_in_full/out_full`; `checkIn` now `Carbon::today('Asia/Manila')` for `$manilaToday` active check, `$date = Carbon::today('Asia/Manila')`, `$now = Carbon::now('Asia/Manila')`; `checkOut` same (`today`/`now` Manila) and response `check_in/out` via `->timezone('Asia/Manila')`. |
| `backend/app/Http/Controllers/Api/Member/AttendanceController.php` | `index` map `Carbon::parse(...)->timezone('Asia/Manila')` for `check_in/out/full`; stats `manilaNow = Carbon::now('Asia/Manila')`, `manilaToday = Carbon::today('Asia/Manila')` for `whereMonth/Year`, `where attendance_date = manilaToday`, `hasActive` `>= manilaToday`; `checkIn`/`checkOut` now `manilaToday`/`manilaNow` for `hasActive`, `$date`, `$now`, and response `Carbon::parse(...)->timezone('Asia/Manila')`. |
| `backend/app/Http/Controllers/Api/Admin/DashboardController.php` | `manilaToday = Carbon::today('Asia/Manila')`, `manilaNow = Carbon::now('Asia/Manila')` for `activeMemberships` (`end_date >=`), `paymentsLast6Months` (uses `manilaNow` for month loop), `attendance` today stats (`Attendance::where attendance_date = manilaToday`), `attendanceLast7` (uses `manilaNow`), `recentAttendances` `check_in/out` parsed with `->timezone('Asia/Manila')`, recent `time` now `manilaNow->format('M d')`. |
| `backend/app/Http/Controllers/Api/Member/DashboardController.php` | `start/expiresAt` parsed with `->timezone('Asia/Manila')`, `now = Carbon::now('Asia/Manila')` for progress/daysLeft, `approvedAt` also `->timezone('Asia/Manila')`, `expiresAt` also Manila. |
| `backend/app/Models/Attendance.php` | `scopeToday` now `Carbon::today('Asia/Manila')->toDateString()` (was `today()` UTC). |
| `backend/app/Http/Controllers/Api/Admin/PaymentController.php` | `store` `start = Carbon::today('Asia/Manila')` (was `today()`) for membership `start_date`/`end_date` calc. |
| `backend/app/Http/Controllers/Api/MembershipRequestController.php` | `store`/`update` membership creation `start = Carbon::today('Asia/Manila')` (was `today()`). |
| `audit/20260904-104518-attendance-manila-timezone.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Switched entire attendance time handling to **Asia/Manila** (PHT, UTC+8). App timezone now defaults to `Asia/Manila` via `APP_TIMEZONE` env, verified `config('app.timezone') = Asia/Manila` and `now() = Asia/Manila`. All attendance `today()`/`now()`/`whereMonth`/`whereYear`/`end_date >=` checks, `check_in/out` storage (`H:i:s` via `Carbon::now('Asia/Manila')`) and display (`H:i` via `->timezone('Asia/Manila')`) now consistently Manila. Dashboard and member stats also use Manila for `today`/`now` and expiry. Payments/membership creation start dates also Manila.

## Notes
- No frontend change needed: backend sends `H:i` already in Manila; browser `toLocaleString` for Philippines also Manila, so display matches.
- If DB stores `attendance_date` as `date` (no timezone), ensure server OS is Manila or app timezone is respected — now `attendance_date` is `Y-m-d` in Manila.
- Verify via `php artisan tinker --execute="echo now()->timezoneName"` → `Asia/Manila` and check-in at 02:00 UTC will correctly show 10:00 PHT.
- Tested `php artisan config:clear` + `route:list` + `vite build` ✓ 2215 modules.
