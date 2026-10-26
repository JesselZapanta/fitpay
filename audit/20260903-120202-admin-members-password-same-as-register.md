# Audit: Admin Members Password — Same User/Member Columns as Register

**Date**: 2026-09-03 12:02:02 +08:00
**Task**: where is the password? on member? this is the same for registration there is a user col and member col — admin http://localhost:5173/admin/members member form should have same design as register

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Requests/Admin/StoreMemberRequest.php` | Added `use Password`, added `password` rule `required_without:user_id nullable string confirmed Password::min(8)` (mirrors `AuthController@register`). |
| `backend/app/Http/Requests/Admin/UpdateMemberRequest.php` | Added `use Password`, added `password` `nullable string confirmed Password::min(8)` for edit. |
| `backend/app/Http/Controllers/Api/Admin/MemberController.php` | `resolveUser`: now `password => isset(password) ? Hash::make(password) : random`, plus update `if (!empty(password)) $user->password = Hash::make(password)`; `update()`: added `if (!empty(password)) $user->password = Hash::make(password)` before save. Ensures user col password is set/hashed. |
| `frontend/src/pages/Admin/Members.jsx` | **MemberForm now same User/Member columns as Register**: imports added `EyeOff, User, Lock, Check, ArrowLeft, ArrowRight` (kept `Eye`). State added `password, password_confirmation, show` + `setShow(false)` on open. `validateStep` step 1 now checks password (required for create, optional for edit, min 8, confirm). `submit` appends `password` + `password_confirmation` to `FormData`, error mapping includes `password` → step 1. **UI** step 1 `Account` now has photo+`name*`/email + **password grid** `sm:grid-cols-2 gap-2.5` with `Lock` icon, `h-11 rounded-lg text-[14px]`, `pr-9` + `Eye/EyeOff size-3.5` toggle `size-7`, helper `Min. 8` / `Leave blank to keep`, `*` only for create (`!initial`). Step 1 now user col (name, email, password) + photo, Steps 2–3 member col (phone/address, birthdate/gender/status) — same split as Register (user: name/email/password, member: phone/address/birthdate/gender). Kept `h-11` large, `w-32 h-11` right-aligned buttons, stepper `size-7`, styled scrollbar. |
| `audit/20260903-120202-admin-members-password-same-as-register.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Added missing **password (user col)** to `admin/members` form so it mirrors registration’s `users` vs `members` split. `Store` now requires password when creating new user (like `POST /api/register`), `Update` allows optional password change. Frontend `MemberForm` Step 1 Account now shows `Password*` + `Confirm*` (create) / `Password` + `Confirm` (edit, leave blank) with `h-11` large inputs, `Lock` icon, eye toggle, same `14px`/`rounded-lg` style as Register’s Security step. Admin can now set member login password directly (previously random). Build verified `vite build` ✓ 2214 modules.

## Notes
- For `user_id` reuse (existing user), password remains optional (no `required_without` trigger).
- Password hashing uses `Hash::make` (HS256 JWT unchanged).
- If admin wants email required like Register, change `email` rule to `required_without:user_id` in `StoreMemberRequest` (currently nullable auto-generates).
