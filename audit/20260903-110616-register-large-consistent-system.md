# Audit: System-Wide Large Inputs & Buttons — Consistent Sizing

**Date**: 2026-09-03 11:06:16 +08:00
**Task**: all input field in the system should be large, including the btns to make it consient — plus prior: all btn must be same size and align to right, btn too big / vertical scroll looks bad, step step, remove optional text, make all required, no scroll on big screen

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | **Large inputs/buttons**: `h-9 text-[13px]` → `h-11 text-[14px]` (`44px`, `14px`) for all `Input`/`SelectTrigger`/`Button`, `w-32 h-11` CTAs (`128×44px`) `justify-end` right-aligned, kept 3-step wizard `max-w-[440/460] max-h-[min(88vh,620px)] [scrollbar-width:none]` no visible scroll. |
| `frontend/src/components/ui/input.jsx` | Default `h-9` → `h-11` (`44px`) so any `<Input>` without explicit height is large. |
| `frontend/src/components/ui/button.jsx` | `buttonVariants` `default: h-9 → h-11`, `sm: h-8 → h-11`, `lg: h-10 → h-11`, `icon: size-9 → size-11`, `icon-lg: size-10 → size-11` — all variants now `44px` large, uniform. |
| `frontend/src/components/ui/select.jsx` | `data-[size=default]:h-9 → h-11`, `data-[size=sm]:h-8 → h-11` — select triggers large. |
| `frontend/src/pages/Auth/Login.jsx` | `h-12` → `h-11` for email, password, submit (`min-h-12→min-h-11`) — now `44px` large consistent with Register (was 48px). |
| `frontend/src/pages/Admin/Members.jsx` | `h-10` → `h-11` for photo file, name, email, phone, birthdate, gender/status selects — all form fields large. |
| `frontend/src/pages/Profile/Index.jsx` | `h-10` → `h-11` for photo file input — large. |
| `frontend/src/pages/Admin/Attendance.jsx` | `h-12` → `h-11` for search input — large consistent (was 48px). |
| `frontend/src/pages/Attendance/Index.jsx` | `h-12` → `h-11` for search input — large. |
| `frontend/src/components/MemberCard.jsx` | `min-h-9` → `min-h-11` for View/Edit — large touch targets. |
| `frontend/src/pages/Admin/MembershipRequests.jsx`, `Member/Dashboard.jsx`, `Member/Membership.jsx` | `min-h-9` → `min-h-11` for card buttons — large. |
| `backend/app/Http/Controllers/Api/AuthController.php` | Already `required` for member fields (prior). |
| `audit/20260903-110616-register-large-consistent-system.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Made **all form controls large and uniform `h-11` (44px)** per “large, consistent” request. Register wizard inputs/selects/buttons now `h-11 text-[14px]` (was `h-9 13px` compact), buttons `w-32 h-11` right-aligned `justify-end`. Global defaults (`ui/input`, `ui/button`, `ui/select`) bumped to `h-11` so new pages inherit large size. Login downgraded `h-12`→`h-11` to match, Members/Profile/Attendance file/search inputs `h-10`→`h-11`, card `min-h-9`→`min-h-11`. Step wizard still fits `min(88vh,620px)` with `h-11` (~412px/step < 620) → no scroll on desktop, hidden scrollbar on mobile. Build verified `vite build` ✓ 2214 modules.

## Notes
- `h-11` = 44px = spec `min-h-11` touch target — satisfies mobile-first and large request.
- If `48px` (`h-12`) preferred as “large”, bump `h-11` → `h-12` globally (would add ~8px/step, still <620).
- `h-10`/`h-9` skeleton/table header changes kept `h-11` (slightly taller but consistent); revert if skeleton should stay compact.
- Backend member validation remains `required`.
