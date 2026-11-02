# Audit: Normalize Member & Membership Statuses to Active / Inactive

**Date**: 2026-11-02 13:26:28
**Task**: Only two statuses across the system — `active` / `inactive` (remove `expired` everywhere for members and memberships).

## Files Changed

| File | Changes |
|------|---------|
| `backend/database/migrations/2026_11_02_000000_normalize_member_membership_statuses.php` | **New** — widens `memberships.status` enum to include `inactive` first (MySQL would truncate otherwise), converts `members.expired → inactive` and `memberships.expired → inactive`, then tightens both enums to `active,inactive`. SQLite is skipped (no enum change needed). `down()` re-adds `expired` to both enums. |
| `backend/app/Models/Membership.php` | `computed_status` now maps date-expiry to `inactive`; added `scopeInactive()` (`inactive` OR `end_date < today`); kept `scopeExpired()` as a backwards-compatible alias of `scopeInactive()`. |
| `backend/app/Http/Requests/Admin/StoreMemberRequest.php` | `status` rule `in:active,inactive`. |
| `backend/app/Http/Requests/Admin/UpdateMemberRequest.php` | `status` rule `in:active,inactive`. |
| `backend/app/Http/Controllers/Api/Admin/MemberController.php` | `status` / `membership` filters accept `all,active,inactive` only. |
| `backend/app/Http/Controllers/Api/Admin/MembershipController.php` | `status` filter `inactive` → `status=inactive OR end_date < today`; computed row status maps past dates to `inactive`; `update()` validates `in:active,inactive` and syncs the member row to `active/inactive`; response `raw_status` + `is_expired` unchanged. |
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | `status` validation tightened to `in:all,active,inactive`; `membership_status` validation `all,active,inactive`. Members report derives `status = inactive` when there is no membership, the latest membership is `inactive`, or its `end_date` is past; summary now `{total, active, inactive}` (no `no_plan`/`expired`). Memberships report + general report summaries/rows use `active/inactive`. |
| `backend/app/Http/Controllers/Api/Admin/DashboardController.php` | Dropped `expired` member/membership counters and donut slice; KPIs expose only `{total, active, inactive}` (members and memberships) and `member_status_donut` is `{active, inactive}`; recent memberships compute `inactive` from status/date. |
| `backend/app/Http/Controllers/Api/Member/DashboardController.php` | `current_plan.status` and history/plan mapping use `inactive` instead of `expired`; `is_expired` boolean kept. |
| `backend/app/Http/Controllers/Api/Member/HistoryController.php` | Computed status maps past membership to `inactive`. |
| `backend/app/Http/Controllers/Api/Member/ReportController.php` | Membership report rows + `summary` use `active/inactive` (`memberships_inactive`). |
| `backend/database/factories/MemberFactory.php` | Random statuses `active/inactive`; added `inactive()` state, `expired()` kept as alias. |
| `frontend/src/pages/Admin/Reports.jsx` | Status options Active/Inactive (no Expired/No plan); `StatusPill` and KPI grid reduced to 3 cards; PDF export cards `MEMBERS / ACTIVE / INACTIVE`, removed amber palette + red expired cell styling; PDF status column prints raw `active/inactive`; removed unused `ShieldCheck` import. |
| `frontend/src/pages/Admin/Members.jsx` | Status filter options and create/edit Select only Active/Inactive; badge map uses green/gray. |
| `frontend/src/pages/Admin/Memberships.jsx` | Status options Active/Inactive; badge icons green/gray; `inactiveCount` replaces `expiredCount`; legend and edit-dialog helper text now say Inactive. |
| `frontend/src/pages/Admin/Dashboard.jsx` | Donut is two-segment Active/Inactive; KPI subtext `N active · N inactive`; removed `CheckCircle2` import. |
| `frontend/src/pages/Member/Dashboard.jsx` | `statusMeta.inactive` (gray) replaces `expired`; linked/expired plan badges and alerts resolve to `inactive`. |
| `frontend/src/pages/Member/Membership.jsx` | `statusMeta.inactive` (gray) replaces `expired`; computed alert/card meta use `inactive`. |
| `frontend/src/pages/Member/History.jsx` | Status badge map/icon `inactive` instead of `expired`. |
| `frontend/src/pages/Admin/Attendance.jsx` | Member status pill two-state (active green / inactive gray). |
| `frontend/src/pages/Attendance/Index.jsx` | Same two-state member status pill. |
| `frontend/src/pages/Profile/Index.jsx` | Member status dot two-state (active green / inactive gray). |
| `schema.sql` | `members.status` and `memberships.status` enums → `('active','inactive')`. |
| `schema.dbml` | `status` enum notes → `active | inactive` for both tables. |
| `ERD.md` | Enum declarations → `active|inactive` for members and memberships. |
| `FITPAY-SPEC.md` | Schema snippets enums → `active,inactive`; scheduled-job note and dashboard/report bullets no longer reference `expired`. |
| `design.md` | Status palette: `Rejected / Overdue / Absent` red, `Neutral / Inactive` gray; donut/pill examples updated. |
| `themes.md`, `frontend/themes.md` | Status pill docs: `Rejected/Overdue` red, `Neutral/Inactive` gray. |
| `AGENTS.md` | Design-token status-pill line: rejected red, inactive gray (no expired). |

## Summary

Members and memberships now have exactly two statuses system-wide: `active` and `inactive`. A data migration rewrote legacy `expired` rows (MySQL: 22 active / 14 inactive members, 6 active / 3 inactive membership rows before computed expiry) and tightened the enums. Date-based expiry is still derived from `end_date`, but now surfaces as `inactive` on every read path (models, admin/member dashboards, memberships list, history, reports). Membership-request workflow states (`pending`, `approved`, `rejected`) were intentionally left unchanged.

Verified end to end against local MySQL with `php artisan serve --port=8130`:
- `GET /api/reports?type=members` → rows only `active|inactive`, summary `{total:36, active:1, inactive:35}`.
- `status=active` / `status=inactive` filter correctly; `from/to + inactive` works.
- `status=expired` now returns **422** on `/reports`, `/members`, and `/members?membership=…`.
- `GET /api/memberships?status=active|inactive` and `GET /api/members?membership=inactive` return computed statuses.
- Admin dashboard donut `{active:61, inactive:39}`, KPIs `members {22 active / 14 inactive}`, `memberships {1 active / 8 inactive}`.
- Member dashboard/history/reports for `member@fitpay.test` return `active/inactive` only.
- `npm run build` ✓ (2215 modules); `php artisan test` ✓ (2 passed); `php -l` clean on touched PHP; oxlint reports only pre-existing warnings.

## Notes

- MySQL requires widening the `memberships` enum before updating rows — the first migration attempt failed with `SQLSTATE[01000] Data truncated for column 'status'`; the committed migration handles this ordering.
- `is_expired` booleans and `isLinkedExpired`/`isAnyExpired` frontend variables were kept because they represent date math, not status labels.
- Members without any membership are reported as `inactive` (previously `no_plan`), so the reports filter only offers Active/Inactive.
- Historical `audit/*.md` files still mention `expired` — they are records of previous work and were intentionally not rewritten.
- Role/auth unrelated 500s seen during curl testing were caused by missing `Accept: application/json` (Laravel redirecting to a non-existent `login` route), not by these changes.
