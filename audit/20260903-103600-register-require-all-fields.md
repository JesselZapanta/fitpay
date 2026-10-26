# Audit: Register — Require All User & Member Fields, Remove Optional Text

**Date**: 2026-09-03 10:36:00 +08:00
**Task**: in register remove this Member information (optional, but saved to member table) text (member is still in the form) also make all input is required for user and member

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | Removed `(optional, but saved to member table)` span from Member information header (kept header + Phone icon). Added `required` + red `*` to Phone, Birthdate, Gender, Address labels/inputs. Phone/Birthdate `Input` and Address `Textarea` now `required`. Gender `Select` changed from `value={form.gender || "none"}` with `— None —` option to `value={form.gender}` with only male/female/other + placeholder, label now has `*`. Added client-side guard in `handleSubmit`: if `phone/address/birthdate/gender` missing → `setError("Please fill in all member information fields.")`. User fields (name, email, password, confirm) already required unchanged. |
| `backend/app/Http/Controllers/Api/AuthController.php` | `register` validation changed from `nullable` to `required` for `phone` (`required|string|max:20`), `address` (`required|string|max:500`), `birthdate` (`required|date|before:today`), `gender` (`required|in:male,female,other`). `Member::create` now uses `$data['phone']` etc. directly (was `?? null`). |
| `audit/20260903-103600-register-require-all-fields.md` | This audit log |
| `audit/README.md` | Reordered index newest-first |

## Summary
Made registration strictly require **all** user + member fields. Frontend no longer shows the optional hint; member section stays in the form but every field is now mandatory with visual `*` and HTML `required` plus JS pre-check. Backend enforces the same via `required` validation so crafted requests without member data get 422. Member row creation now expects supplied values.

## Notes
- DB `members` columns remain `nullable` in migration (`2026_08_27_141300_create_members_table.php`) — not changed to avoid breaking existing seeded/factory rows; enforcement is at validation layer. If strict DB NOT NULL is desired, add a follow-up migration to alter columns.
- Seeder `member@fitpay.test` still creates a Member with only `phone` — works because it bypasses `AuthController` validation (direct `firstOrCreate`). Factory uses `fake()->optional()` for phone/address/birthdate but `gender` is always present — unchanged; acceptable for admin-created members but could be aligned later.
- `Admin\MemberController@store` via `StoreMemberRequest` still `nullable` for member fields (admin flow) — intentional separate flow; only public `POST /api/register` now requires all.
- Gender `Select` has no native `required` attribute (shadcn); requirement enforced via JS check + backend 422. Placeholder “Select gender” forces explicit choice.
- Build verified: `vite build` ✓ 2214 modules (was 2214), no errors. No existing Pest tests touch register.
