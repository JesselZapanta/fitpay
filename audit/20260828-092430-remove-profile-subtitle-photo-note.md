# Audit: Remove Profile Subtitle & Photo Storage Note

**Date**: 2026-08-28 09:24:30
**Task**: remove this Profile Admin workspace • role-based access via role:admin middleware / remove this Photo is stored on users.photo.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/Layout/AdminLayout.jsx` | Hid subtitle `Admin workspace • role-based access via role:admin` when `title === "Profile"` (conditional render), prevents duplicate header on Profile page; keeps H1, removes P for Profile only |
| `frontend/src/pages/Profile/Index.jsx` | Removed `Photo is stored on users.photo.` from subtitle `Manage your account — email is read-only.` |
| `frontend/src/pages/Members/Index.jsx` | Removed `Stored on users.photo.` from upload helper, now `Upload JPG/PNG/WebP, max 5MB.` only |

## Summary
Cleaned UI copy per request: Profile page no longer shows admin workspace middleware note (layout hides `<p>` for Profile), and photo storage implementation detail (`users.photo`) removed from both Profile and Members upload helpers.

## Notes
- AdminLayout keeps subtitle for all other admin pages; only Profile suppresses it — avoids duplicate H1 (layout H1 + Profile H1) and meets "remove this Profile Admin workspace..." request precisely.
- MemberLayout subtitle unchanged for member Profile (already minimal).
- No backend change; storage still `users.photo` via `public/photos`, just not surfaced in UI.
- Build verified: `vite build` 557.54k js / 77.25k css.

