# Audit: Admin Reports — Return All Rows (No 5-Row Limit)

**Date**: 2026-11-01 10:36:21 +08:00
**Task**: get all not just recent — in http://localhost:5173/admin/reports update the report col to member code, name, membership start, membership end, plan

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | `generalReport()` removed `->limit(5)` from all four recent queries: `$recentMembers` (`Member::with('user')->latest()->get()`), `$recentMemberships`, `$recentPayments`, `$recentAttendances` — now returns every row matching the date filters. Member map keeps `member_code`, `name`, `email`, `membership_start`, `membership_end`, `plan_label` from latest membership. |
| `frontend/src/pages/Admin/Reports.jsx` | Section titles + PDF export titles changed `Members/Memberships/Payments/Attendance — recent 5` → `— all` (4 CardTitle + 4 `addSection` headings). Tables render every returned row (no slicing). |
| `audit/20261101-103621-admin-reports-all-rows.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Admin Reports now shows **all** members, memberships, payments and attendance in the selected date range instead of only the latest 5, both on-screen and in the exported PDF. Member columns remain `Member code / Name / Membership start / Membership end / Plan`. Frontend titles updated from “recent 5” to “all”.

## Notes
- Date filters still apply (`from`/`to`). Empty dates = all time.
- Large datasets render all rows in one table; if this becomes slow, add client-side pagination or a `max-h` scroll container by request.
- Verified `php -l` clean + `vite build` ✓ 2215 modules.
