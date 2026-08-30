# Audit: Make Member Profile Fields Editable

**Date**: 2026-08-28 10:11:35
**Task**: member profile fields (Phone, Birthdate, Gender, Address) should be editable

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Requests/UpdateProfileRequest.php` | Added `phone` (nullable, max:20), `address` (nullable, max:500), `birthdate` (nullable, date, before:today), `gender` (nullable, in:male/female/other) — only validated when user role is `member` |
| `backend/app/Http/Controllers/Api/ProfileController.php` | `update()` now saves member fields via `Member::firstOrNew(['user_id' => $user->id])`; extracted `getMemberData()` helper to avoid duplication between `show()` and `update()` |
| `frontend/src/pages/Profile/Index.jsx` | Added `memberForm` state; imported `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` from shadcn; member card now has editable `Input` fields for phone, birthdate (date input), address, and a `Select` for gender; FormData submission includes member fields when role is member; Reset button restores member fields |

## Summary
Member profile fields are now fully editable end-to-end:

| Field | Type | Validation | Input |
|-------|------|------------|-------|
| Phone | string | nullable, max 20 | Text input, placeholder `09123456789` |
| Birthdate | date | nullable, before today | Date picker (`type="date"`) |
| Gender | enum | nullable, male/female/other | shadcn Select dropdown |
| Address | string | nullable, max 500 | Text input |

Member code and membership status remain read-only (managed by admins).

## Notes
- Backend uses `Member::firstOrNew()` — creates member record if none exists for the user
- `getMemberData()` helper extracted to avoid duplicating member formatting in `show()` and `update()`
- Build verified: `vite build` 562k js, 75k css ✓
