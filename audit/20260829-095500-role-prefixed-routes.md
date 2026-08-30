# Audit: Role-prefixed routes - admin/* and member/*

**Date**: 2026-08-29 09:55:00
**Task**: In all routes add the user like admin/admin/dashboard, admin/members — do the same for member

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/App.jsx` | Rewrote all routes to be role-prefixed. `PublicRoute`/`RootRedirect` now redirect to `/admin/dashboard` or `/member/dashboard`. Admin: `/admin/dashboard` (was `/admin`), `/admin/members` (was `/members`), `/admin/membership-requests`, `/admin/membership-requests/:id`, `/admin/profile` (was `/profile` generic), plus new placeholder routes `/admin/attendance`, `/admin/payments`, `/admin/memberships`, `/admin/reports` wrapped in `ProtectedRoute` + `AdminPlaceholder` (Card with coming-soon). Member: `/member/dashboard` (was `/member`), `/member/membership`, `/member/profile`, plus new `/member/schedule`, `/member/history`, `/member/billing` with `MemberPlaceholder`. Added legacy redirects: `/admin`→`/admin/dashboard`, `/member`→`/member/dashboard`, `/members`→`/admin/members`, `/attendance`→`/admin/attendance`, `/payments`→`/admin/payments`, `/memberships`→`/admin/memberships`, `/reports`→`/admin/reports`. Kept generic `/profile` as alias via `ProtectedRoute` (ProfilePage auto-picks layout by role). Added `AdminLayout`/`MemberLayout`/`Card` imports and `AdminPlaceholder`/`MemberPlaceholder` helpers. |
| `frontend/src/components/Layout/Admin/AdminLayout.jsx` | `adminNav` hrefs now prefixed: `Dashboard /admin/dashboard` (was `/admin`), `Members /admin/members` (was `/members`), `Attendance /admin/attendance` (was `/attendance`), `Payments /admin/payments`, `Memberships /admin/memberships`, `Reports /admin/reports`. `isActive` now handles `/admin/dashboard` exact (was `/admin`). Profile links `to="/admin/profile"` (was `/profile`) in header and sidebar. |
| `frontend/src/components/Layout/Member/MemberLayout.jsx` | `memberNav` hrefs now prefixed: `Dashboard /member/dashboard` (was `/member`), `Profile /member/profile` (was `/profile`). Others already prefixed (`/member/membership`, `/member/schedule` etc. kept). `isActive` now exact for `/member/dashboard` (was `/member`). Profile links `to="/member/profile"` in header and sidebar. |
| `frontend/src/components/Layout/AppLayout.jsx` | `navItems` hrefs prefixed: `admin/dashboard` and `member/dashboard`, `admin/members`, `admin/payments`, `admin/attendance` split by role, etc. Handles future use of this generic layout. |
| `frontend/src/components/ProtectedRoute.jsx` | Fallback now `"/admin/dashboard"` or `"/member/dashboard"` (was `"/admin"`/`"/member"`). |
| `frontend/src/pages/Auth/Login.jsx` | Post-login navigate to `"/admin/dashboard"` or `"/member/dashboard"` (was `"/admin"`/`"/member"`). |
| `frontend/src/pages/Auth/Register.jsx` | Post-register navigate to `"/admin/dashboard"` or `"/member/dashboard"` (was `"/admin"`/`"/member"`). |
| `audit/README.md` | Added newest entry at top, kept descending order |

## Summary
All frontend routes are now strictly role-prefixed: admin under `/admin/*` and member under `/member/*` as requested. Existing unprefixed routes remain as `Navigate` redirects so old links/bookmarks don't break. Added `AdminPlaceholder`/`MemberPlaceholder` for nav items that had no page yet (attendance/payments/memberships/reports/schedule/history/billing) so navigation no longer 404s. Updated every `href`/`to`/`navigate`/`isActive` reference in layouts, `ProtectedRoute` fallback, and auth flows. Build verified 2005 modules, `oxlint` only pre-existing warnings.

## Notes
- `Profile` route: both `/admin/profile` and `/member/profile` are canonical; generic `/profile` kept as alias (renders `ProfilePage` which picks layout by `user.role`) to avoid breaking external links.
- `AppLayout` was legacy/unused in current `App.jsx` but updated for consistency if re-used.
- Placeholder routes are protected by `role:admin`/`role:member` so role isolation stays enforced.
- `isActive` for dashboard now requires exact match to prevent dashboard staying active on sub-routes.
