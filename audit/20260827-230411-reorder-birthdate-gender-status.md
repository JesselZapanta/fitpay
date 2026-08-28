# Audit: Reorder Members Form — Birthdate → Gender → Status

**Date**: 2026-08-27 23:04:11
**Task**: birtdate first then gender and status

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Members/Index.jsx` | **Edited** — `MemberForm` grid `sm:grid-cols-3` reordered from `Gender, Status, Birthdate` to `Birthdate, Gender, Status` (user request: birthdate first). No logic change; only field order in the 3-column row; `h-10`/`min-h-11` and error handling unchanged. |
| `audit/20260827-230411-reorder-birthdate-gender-status.md` | This audit log |
| `audit/README.md` | Updated — newest at top (descending). |

## Summary
Swapped the three fields in the Members Management `MemberForm` so `Birthdate` appears first, followed by `Gender` then `Status` (was Gender/Status/Birthdate). Verified `vite build` ✓ 504kB JS + 76kB CSS.

## Notes
- **Scope**: Only visual order; validation (`birthdate before:today`, `gender in:male/female/other`, `status in:active/inactive/expired`) and API payload unchanged (FormData `birthdate/gender/status`).
