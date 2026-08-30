# Audit: Membership Requests Detail Page (Replace Dialog)

**Date**: 2026-08-28 21:44:58
**Task**: in Membership Requests instead of dialog, put that to other page, show the information of the user and member as well

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/MembershipRequestController.php` | Added `Member` import, added `show()` method returning request + `user` + `member` (full profile), added search handling to `index()` |
| `backend/routes/api.php` | Added `GET /membership-requests/{membershipRequest}` (admin) for detail page |
| `backend/app/Models/MembershipRequest.php` | Added `protected $appends = ['receipt_url']` to include receipt URL in list |
| `frontend/src/pages/Admin/MembershipRequests.jsx` | **REWRITTEN** to navigate to detail page instead of dialogs — removed view/action dialogs, `useNavigate` to `/admin/membership-requests/:id` |
| `frontend/src/pages/Admin/MembershipRequestShow.jsx` | **NEW** — detail page with back button, member/user card (photo, member_code, phone, address, birthdate, gender, status), payment details card (plan, amount, status, reference, receipt image full preview, admin note), approve/reject inline form + confirmation dialog |
| `frontend/src/App.jsx` | Added `AdminMembershipRequestShow` import and `/admin/membership-requests/:id` route |
| `frontend/src/components/Layout/Admin/AdminLayout.jsx` | Hide layout header also for `Request Details` |

## Summary
Membership request review moved from modal dialog to dedicated page at `/admin/membership-requests/:id`:

- **Left column**: Member Information card — avatar, name, email, role badge, member_code, member status, phone, birthdate, gender, address
- **Right column**: Payment Details card — plan (color dot), amount, status, reference, receipt image (click to full size), admin note, inline approve/reject with note textarea or status banner if already decided

List page now only shows **View** → navigates to detail; approve/reject only on detail after reviewing receipt + member info.

## Notes
- Backend `show()` eagers `user` and fetches `Member::where(user_id)` for full profile
- `index()` now also supports `search` on reference/plan/user name/email and returns `meta` correctly (fixes 0 total)
- `isActive` already handles Requests staying active on detail (`startsWith`); Dashboard fix keeps `/admin` exact
- Build verified: `vite build` 621k js ✓
