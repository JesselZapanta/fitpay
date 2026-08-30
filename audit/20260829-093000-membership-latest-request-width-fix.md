# Audit: Membership Latest Request - width fix

**Date**: 2026-08-29 09:30:00
**Task**: Fix Admin note + alert width on Membership Latest Request card — make them full card width

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Member/Membership.jsx` | `LatestRequestCard`: moved admin-note and status alert out of inset `CardContent` to full-bleed sections (`border-t`, `px-4 sm:px-5`, no `rounded-xl`). Card now `p-0 gap-0` with `h-1` accent, header+metrics in `p-4 sm:p-5`, admin note as `border-t bg-[var(--surface-0)]` with header `bg-white border-b`, alert as `border-t px-4 sm:px-5 py-3.5` using `meta.alert*`, and rejected footer as `px-4 sm:px-5 py-3.5 border-t bg-white`. This makes Admin note + alert exactly equal to card outer width (edge-to-edge), fixing the reported inset mismatch. |
| `audit/README.md` | Added newest entry, kept descending order |

## Summary
User reported admin note + `✕ Request was rejected...` were inset/narrower than the outer Latest Request card (rounded inset inside `CardContent`). Fixed by restructuring `LatestRequestCard` to full-bleed layout: header/metrics stay inset, but admin note and alert now render as `border-t` full-width strips (`w-full`, no rounded, `px-4 sm:px-5`) directly on the `Card` (`p-0 gap-0`). Build verified `vite build` 2005 modules.

## Notes
- No API change; visual only — matches card's outer border exactly.
- Keeps mobile-first, `rounded-2xl` outer card, `h-1` accent, and status tints.
