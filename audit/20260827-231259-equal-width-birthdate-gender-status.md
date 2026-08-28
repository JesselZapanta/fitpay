# Audit: Equal Width for Birthdate/Gender/Status

**Date**: 2026-08-27 23:12:59
**Task**: brithday, gender and statas, must have the same size and widht

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Members/Index.jsx` | **Edited** — `MemberForm` grid changed from `grid-cols-1 sm:grid-cols-3 gap-3` to `grid-cols-3 gap-2 sm:gap-3` (always 3 equal columns, not stacked on mobile); each cell `min-w-0`; `Birthdate` Input `h-10 w-full min-w-0`, `Gender`/`Status` SelectTrigger `h-10 w-full` (Status was missing `w-full`, fixed). All three now identical `h-10` height and `1fr` width at every breakpoint, labels `text-xs font-medium` same size. |
| `audit/20260827-231259-equal-width-birthdate-gender-status.md` | This audit log |
| `audit/README.md` | Updated — newest at top (descending). |

## Summary
Made Birthdate, Gender, Status equal size/width: 3-column grid at all widths (`grid-cols-3`), each `min-w-0` + control `h-10 w-full`, so they share identical 1/3 width and 40px height on mobile and desktop. Previously stacked 1-col on mobile and Status lacked `w-full`. Verified `vite build` ✓ 505kB JS + 76kB CSS.

## Notes
- **Mobile**: 3 cols at 375px ≈ 110px each (vs stacked full-width before) — keeps equal width per request; if cramped, can switch back to `sm:grid-cols-3` but loses equal width on mobile.
