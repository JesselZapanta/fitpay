# Audit: Member Form — Wait for Security Step Before Submit

**Date**: 2026-09-03 19:35:59 +08:00
**Task**: i got a problem in the member form im not done on the step 3 security yet the form send to server, fix it wait before i click the create or update btn — plus 3 step, account, member then security

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/Members.jsx` | **Fixed early submit**: `submit` now `if (step !==3) {handleNext(); return;}` → **only** when `step===3` does it build `FormData` and call `onSubmit`; `Continue` buttons remain `type="button"` (no submit), Enter in step 1/2 triggers `handleNext` not API. Added `validateStep(3)` check in `submit` before API (`m1 || m3`) so password errors stay on Security step. **Reordered to 3-step Account → Member → Security** (was Account→Contact→Details with password in Account): `STEPS` now `Account(User), Member(Phone), Security(Lock)`, Step 1 `Account` = `photo + name* + email` (no password), Step 2 `Member` = all member cols `phone+address` `grid sm:grid-cols-2` + `birthdate+gender+status` `grid-cols-3` (combined), Step 3 `Security` = `password(* for create) + confirm` with `h-11` `Eye/EyeOff` toggle `size-7`, `Min. 8` / `Leave blank` helper. All inputs `h-11` large, buttons `h-11 w-32` `justify-end` right-aligned, thin styled scrollbar kept. |
| `audit/20260903-193559-member-form-wait-security.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Fixed “form sends before Security done” by gating `submit` to `step===3` only; `step 1/2` Enter/Continue now just `handleNext` (validates current step) and never calls `api.post`. Final submit validates both `Account` (name*) and `Security` (password required for create, optional for edit, min 8, confirm) before `FormData` + `onSubmit`. Reordered wizard to requested `Account → Member → Security` so admin mirrors Register’s `users` (`name/email/password`) vs `members` (`phone/address/birthdate/gender/status`) split, with Security last.

## Notes
- Step 2 Member has no required validation (phone/address/birthdate optional per `StoreMemberRequest` `nullable`) — `handleNext` always passes to Security.
- Edit keeps password optional; blank = keep current hash. Create requires password (`required_without:user_id`).
- Build verified `vite build` ✓ 2214 modules.
