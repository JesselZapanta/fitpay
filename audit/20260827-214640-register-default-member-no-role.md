# Audit: Register Defaults to Member (Role Removed)

**Date**: 2026-08-27 21:46:40
**Task**: on register the default user is memeber / on register remove the role, the default user is memeber

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | **Edited** — removed `Select` import and role UI: `useState` no longer includes `role`, removed entire `Role Select` block (`SelectTrigger` + `SelectItem` member/admin + helper text). `handleSubmit` now `register({ ...form, role: "member" })` (explicit member, but backend ignores). Button added `cursor-pointer`. Imports cleaned (`Select` removed, kept `Dumbbell, Eye, EyeOff, Loader2, AlertCircle`). |
| `backend/app/Http/Controllers/Api/AuthController.php` | **Edited** — `register` validation removed `role` rule (`sometimes in:admin,member`), creation now hardcodes `'role' => 'member'` instead of `$data['role'] ?? 'member'`. Prevents privilege escalation via public API; admin only via seeder. |
| `audit/20260827-214640-register-default-member-no-role.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Made public registration **member-only** per request. Frontend no longer shows a Role dropdown; the form collects only `name`, `email`, `password` + `password_confirmation` and submits with `role: "member"` (backend ignores and forces member). Backend `AuthController@register` now validates only name/email/password and always creates `role = member`, even if a crafted request sends `role: admin`. Verified via `artisan serve` + `Invoke-RestMethod`: `POST /api/register` with `role: admin` → response `user.role: member` (PASS), without role → `member` (PASS). Seeder still creates `admin@fitpay.test` (admin) + `member@fitpay.test` (member). Build verified: `vite build` ✓ 1990 modules, 407kB JS (was 464k, -57k from removed Select), 70.34kB CSS.

## Notes
- **Security**: Public `POST /api/register` can no longer create admin; admin creation is seeder-only (or future protected admin endpoint with `role:admin` middleware).
- **Frontend**: `AuthContext.register` still accepts `role` param but Register page no longer exposes it; login/register redirect still `u.role === "admin" ? "/admin" : "/member"` (new users always go `/member`).
- **Validation**: Password still `confirmed` + `min:8`; email `unique`; name `required`.
- **No UI regression**: Card remains `max-w-[440px]` centered over full `GymAnimatedBg`, `h-12` teal inputs, `cursor-pointer` buttons.
