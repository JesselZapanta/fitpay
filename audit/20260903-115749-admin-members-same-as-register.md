# Audit: Admin Members Form — Same Design as Register (Step Wizard)

**Date**: 2026-09-03 11:57:49 +08:00
**Task**: in admin http://localhost:5173/admin/members for the member form i want the same design same as on the register page

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/Members.jsx` | **MemberForm redesigned to match Register wizard**: imports added `User, Lock, Check, ArrowLeft, ArrowRight` (kept `Users, Phone, Calendar, Mail, MapPin` etc). Replaced single-page form (photo+name/email stacked, phone, address textarea, 3-col birthdate/gender/status, Cancel/Create footer) with **3-step wizard** identical to `Auth/Register.jsx`: `STEPS = [Account (User), Contact (Phone), Details (Calendar)]`, state `step 1→3`, `validateStep` (name required), `handleNext/Back`, `submit` (step guard + FormData). **Header** `DialogHeader text-center space-y-3` with `size-9 rounded-xl bg-[var(--charge-500)] text-white` (was `size-8 charge-100`), title `19px` + `Step X of 3 — label` description, **stepper** `size-7 rounded-full border-[1.5px]` circles + `h-0.5` connectors + `h-1` progress bars (identical to Register). **Body** `px-4 sm:px-6 py-4 space-y-4` with `text-[10px] uppercase` section headers (`User/Account`, `Phone/Contact`, `Calendar/Details`), `gap-4` avatar+photo row, `h-11 rounded-lg text-[14px]` inputs/selects, labels `text-[13px]`, photo `size-11` clear button, helpers `11px`. **Footer** `flex justify-end gap-2.5 pt-2` with `h-11 w-32 rounded-lg` `Back` (`outline`) + `Continue/Create` (`bg-[var(--charge-500)]`) same size right-aligned (Register parity). Dialog `sm:max-w-[560px] max-h-[92vh] overflow-y-auto [scrollbar-width:thin] …` kept styled. Kept `Avatar`, `resolvePhotoUrl`, `FormData` logic (name/email/phone/address/birthdate/gender/status/photo). |
| `audit/20260903-115749-admin-members-same-as-register.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Mirrored Register’s step-by-step premium UX in `http://localhost:5173/admin/members` → `Add/Edit member` dialog now has same centered header, 3-step `Account → Contact → Details` stepper (size-7 circles, h-0.5 connectors, h-1 bars), same `h-11` large inputs (`14px`, `rounded-lg`, `focus:charge-500`), same `h-11 w-32` right-aligned Back/Continue/Create buttons, same thin styled scrollbar. Photo, name, email remain in Step 1 (Account), phone+address in Step 2 (Contact), birthdate+gender+status in Step 3 (Details) — all data preserved, just stepped. Build verified `vite build` ✓ 2214 modules.

## Notes
- Register has `Security` as step 3 (password); admin has `Details` (birthdate/gender/status) + `status` extra — visual parity kept (icon `Calendar` vs `Lock`, label `Details` vs `Security`).
- Validation: Register requires all member fields; admin keeps name-only required (phone/address/birthdate optional) to respect existing `nullable` admin rules — stepper shows `*` only on name.
- Photo upload kept in Step 1 with `Avatar lg` preview and `h-11` file input + `size-11` trash button, matching Register’s single-file UX.
- If admin wants email required or address textarea, swap `Input` → `Textarea` in Step 2 (currently `Input` single-line to save height, like Register’s address).
