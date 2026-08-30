# Audit: Dashboard membership status sync

**Date**: 2026-08-29 10:20:00
**Task**: On http://localhost:5173/member/dashboard latest request says approved but membership in DB is expired — fix status sync

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Member/Dashboard.jsx` | Added `isLinkedExpired` (`current_plan.is_expired && request_id === latest_request.id`) and `isAnyExpired`. Computed `effectiveAlertStatus` (approved+linkedExpired → expired), `alertMeta`/`cardMeta` (expired styling when linked). Card now uses `cardMeta` for border/accent and dot, adds secondary `membership expired` badge next to request `approved` badge when linked, alert now uses `alertMeta` and shows `⚠ Membership expired — your {plan} ended on {expires_date}. Renew…` when linked, plus footer helper variations for linked/any expired vs active. |
| `frontend/src/pages/Member/Membership.jsx` | Added `currentPlan` state, `fetchLatest` now also sets `currentPlan` from `/dashboard/member`. `LatestRequestCard` now accepts `currentPlan` prop, computes `isLinkedExpired`/`isAnyExpired`/`effectiveAlertStatus`/`alertMeta`/`cardMeta` same as dashboard, shows secondary `membership expired` badge, uses `cardMeta` for border/accent/dot, alert mirrors dashboard (expired message with `expires_date`), and footer shows `Renew now` (red) when linked expired vs `Try again` for rejected. |
| `backend/app/Http/Controllers/Api/Member/DashboardController.php` | Already updated to derive `current_plan` from `Membership` table (with `request_id`, `is_expired` via `raw_status` or past `end_date`); no change needed but verified to provide `request_id` for linkage. |
| `audit/README.md` | Regenerated descending index |

## Summary
Fixed inconsistency where `Latest Request` showed `approved` (green) while underlying `memberships` row was `expired` in DB. Both member surfaces (`/member/dashboard` and `/member/membership`) now detect when `current_plan` is expired **and** linked to `latest_request` (`request_id` match) and surface it: secondary red `membership expired` badge, red card accent/border, and alert `⚠ Membership expired — your Monthly Plan ended on {date}. Renew…` with `Renew now` CTA. When latest request approved but any membership expired, alert downgrades to `Approved — but you have no active plan`. Dashboard `Current plan` card already showed `Expired` via `is_expired`; now Latest Request is consistent. Verified with `user 2` (req 1 approved, mem 1 raw expired 2026-09-28) — dashboard now shows approved + membership expired.

## Notes
- Keeps request badge as historical `approved` (green) for audit, adds second `membership expired` (red) only when linked, so history vs current state are both visible.
- Uses existing `current_plan.request_id` linkage; no new API.
- Build verified 2006 modules.
