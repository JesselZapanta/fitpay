# Audit: Add Member Information to Profile Page

**Date**: 2026-08-28 10:05:05
**Task**: in http://localhost:5173/profile there is other datas on member there is a migration for members with all the information, add this if the user role is member

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/ProfileController.php` | `show()` and `update()` now include `member` data (`member_code`, `phone`, `address`, `birthdate`, `gender`, `status`) when user role is `member` via `Member::where('user_id', $user->id)` |
| `frontend/src/pages/Profile/Index.jsx` | Added `Phone`, `MapPin`, `CalendarDays`, `BadgeCheck` lucide icons; added **Member information** card (conditionally rendered when `profile?.member` exists) showing member_code, membership status, phone, birthdate, gender, address as read-only cards |

## Summary
When user role is `member`, the Profile page now shows:
- **Member code** — e.g. `MEM-0001`
- **Membership status** — active/expired/inactive with color indicator
- **Phone** — from `members.phone`
- **Birthdate** — formatted as "Month Day, Year"
- **Gender** — capitalized
- **Address** — full width card

All member fields are read-only (managed by admins). Admins see no extra card.

## Notes
- Backend includes `member` key in `formatUser()` response only when `$user->role === 'member'`
- Frontend conditionally renders the member card with `{profile?.member && ...}`
- Build verified: `vite build` 561k js, 75k css ✓
