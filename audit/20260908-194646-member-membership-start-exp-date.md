# Audit: Member Membership — Add Start & Expiration Date

**Date**: 2026-09-08 19:46:46 +08:00
**Task**: in http://localhost:5173/member/membership - add the start and exp date

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Member/Membership.jsx` | `LatestRequestCard` grid `grid-cols-2 lg:grid-cols-4` (Plan, Amount, Reference, Submitted) → `grid-cols-2 lg:grid-cols-3` with 6 cards adding **Start** (`CalendarDays` + `currentPlan?.start_date` → `toLocaleDateString()`) and **Expires** (`CalendarCheck` + `currentPlan?.expires_date || expires_at` → `toLocaleDateString()` + `days_left` helper). Keeps Plan/Amount/Reference/Submitted, adds two new white cards `Start date` / `Expiration`. Uses `currentPlan?.start_date` and `expires_date||expires_at` from `GET /dashboard/member` (`current_plan`). Fallback `—` when no active membership. |
| `audit/20260908-194646-member-membership-start-exp-date.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
On `/member/membership`, `Latest Request` card now shows **Start date** and **Expiration date** (from `currentPlan`) alongside Plan/Amount/Reference/Submitted. Uses `currentPlan.start_date` / `expires_date` (or `expires_at`) with `toLocaleDateString()` and `days_left` badge. Grid now `2 cols mobile / 3 cols desktop` for 6 cards, fits without extra scroll.

## Notes
- If `latestRequest` is pending and `currentPlan` is from previous membership, dates reflect active membership (not pending request). When no `currentPlan` (no membership), shows `—`.
- Dates are from `GET /dashboard/member` `current_plan` which is computed in Manila timezone (`Asia/Manila`) per prior attendance fix.
- Build verified `vite build` ✓ 2215 modules.
