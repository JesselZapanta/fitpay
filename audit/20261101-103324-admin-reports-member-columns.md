# Audit: Admin Reports — Member Columns (Code, Name, Start, End, Plan)

**Date**: 2026-11-01 10:33:24 +08:00
**Task**: in http://localhost:5173/admin/reports update the report col, it should be member code, name, membership start, membership end, plan

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | `generalReport()` `$recentMembers` map now loads each member's latest `Membership` (`with('membershipRequest')`, `latest('end_date')`) and returns `member_code`, `name`, `email`, `membership_start` (`start_date` Y-m-d), `membership_end` (`end_date` Y-m-d), `plan_type`, `plan_label` (Daily Pass / Monthly Plan / Yearly Plan / No plan). Removed `status` + `created_at` from the member payload. |
| `frontend/src/pages/Admin/Reports.jsx` | Members table columns changed from `Code / Member / Status / Created` → **`Member code / Name / Membership start / Membership end / Plan`** (`font-mono` dates, `plan_label` text, `colSpan={5}` empty state). PDF export section header changed from `["Code", "Member", "Status", "Created", "Plan"]` → `["Member Code", "Name", "Membership Start", "Membership End", "Plan"]` with `membership_start` / `membership_end` / `plan_label` row values. |
| `audit/20261101-103324-admin-reports-member-columns.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
The admin Reports page “Members — recent 5” table now shows **member code, name, membership start, membership end, plan** — pulled from each member's latest membership (via `membershipRequest`), both in the on-screen table and the exported PDF. Members without a membership render `—` for dates and `No plan` for plan.

## Notes
- `latest('end_date')` picks the most recent membership; a member with multiple memberships shows the newest end date.
- Dates come straight from `memberships.start_date` / `end_date` (`Y-m-d`), consistent with the Manila-timezone membership creation logic.
- Other report sections (Memberships, Payments, Attendance) and summary cards unchanged.
- Verified `php -l` clean + `vite build` ✓ 2215 modules.
