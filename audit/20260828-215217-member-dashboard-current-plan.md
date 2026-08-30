# Audit: Show Current Plan and Latest Request on Member Dashboard

**Date**: 2026-08-28 21:52:17
**Task**: in http://localhost:5173/member dashboard, show the current plan if theres any, show the membership request status as well

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Member/DashboardController.php` | Now returns `current_plan` (latest approved request with expiry, progress, days_left) and `latest_request` (most recent submission with status, admin_note). Expiry calculated as approved_at + 1/30/365 days. Stats updated to reflect real plan. |
| `frontend/src/pages/Member/Dashboard.jsx` | Membership card now dynamic: shows active plan + progress bar + expiry if approved, otherwise “No active plan” with CTA. Added **Latest Request** card below showing plan, amount, reference, admin note, and status banner (pending/approved/rejected). |

## Summary
Member dashboard (`/member`) now displays:

- **Current plan** (if approved):
  ```
  Monthly · ₱300
  [Active] Expires 2026-09-27
  ████████░░ 68% · 10 days left
  ```
  Expired plans show red “Expired” badge. No plan shows dashed card with “View Plans” button.

- **Latest Request** (if any submission):
  ```
  Monthly Plan [pending]
  Amount: ₱300 · Ref: GC123 · Submitted: 8/28/2026
  ⏳ Waiting for admin approval
  Admin note: “...”
  ```
  Color-coded badge (yellow pending, green approved, red rejected) + contextual banner.

## Notes
- Expiry = `updated_at` (approval time) + 1 day (daily), 30 days (monthly), 365 days (yearly)
- `current_plan` = latest `approved` request; `latest_request` = latest overall
- Build verified: `vite build` 627k js ✓
