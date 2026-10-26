# Audit: Payments Create — Remove Use Existing Option (Step 2)

**Date**: 2026-09-03 20:58:57 +08:00
**Task**: in step 2 http://localhost:5173/admin/payments/create, remove the use existing option

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/Payments/Create.jsx` | **Step 2 Membership simplified**: removed toggle `Create new` / `Use existing` (`Button` pair `CalendarDays`/`Receipt`), removed `memberships`, `membershipsLoading`, `selectedMembership`, `createNewMembership` states, removed `fetchMemberships` callback + `useEffect` for memberships, removed `Select` for existing membership list (`rounded-xl border max-h-[220px]` + `Skeleton` + `Check` selection). Now Step 2 shows only `Plan type` `Select` (`daily/monthly/yearly` `h-11`) with helper text. `validateStep(2)` now only checks `plan_type` existence (was `if (!createNewMembership && !selectedMembership)`). `handleSelectUser` no longer resets membership states. `handleSubmit` always appends `plan_type` (never `membership_id`), always creates new `membership_requests(approved)` → `memberships(active)` → `payments`. Removed imports `CalendarDays, Receipt` where not needed (kept `ShieldCheck` for step icon). Summary now `New {plan_type} → membership (active) + request (approved)` only. |
| `audit/20260903-205857-payments-remove-use-existing.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Removed “Use existing” membership path from `/admin/payments/create` Step 2 per request. Now Step 2 is create-only: just `Plan type` select. Payment creation always does `POST /payments` with `user_id, plan_type, amount, reference_number, receipt` → backend creates approved request + active membership + payment (3 tables). No `membership_id` branch needed.

## Notes
- Backend still supports `membership_id` if needed (for future), but frontend no longer sends it — always creates new.
- If user has many memberships, no longer shown; page is faster (no `GET /memberships?user_id` call).
- Build verified `vite build` ✓ 2215 modules.
