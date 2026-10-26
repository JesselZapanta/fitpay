# Audit: All Card/Dialog Scrollable + Styled Scrollbar

**Date**: 2026-09-03 11:53:44 +08:00
**Task**: make sure all the card dialog is scrollable, then make sure the scroll looks good — plus prior: all input field in the system should be large, including the btns to make it consistent; all btn must be same size and align to right; step step; remove optional text; all required; no scroll on big screen

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | Card ` [scrollbar-width:none] hidden` → styled thin scrollbar: `[scrollbar-width:thin] [scrollbar-color:var(--ink-300)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--ink-300)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--ink-600)]` with `max-h-[min(88vh,620px)] overflow-y-auto` (was hidden, now visible styled but still fits wizard ~412px). |
| `frontend/src/components/ui/dialog.jsx` | Base `DialogContent` added `max-h-[min(88vh,640px)] overflow-y-auto [scrollbar-width:thin] …` so any Dialog without explicit max-h is scrollable with good looking thumb (6px, ink-300 → ink-600 hover, transparent track). |
| `frontend/src/components/ui/alert-dialog.jsx` | `AlertDialogContent` added `max-h-[min(88vh,560px)] overflow-y-auto` + same thin styled scrollbar (6px, rounded, hover). |
| `frontend/src/pages/Admin/Members.jsx` | 3 dialogs: `create/edit` `sm:max-w-[560px] max-h-[92vh] overflow-y-auto` + styled scroll, `view` `sm:max-w-[520px] max-h-[90vh]` + styled, `delete` `sm:max-w-[400px]` → added `max-h-[90vh] overflow-y-auto` + styled (was no scroll). |
| `frontend/src/pages/Admin/Memberships.jsx` | `sm:max-w-[440px] max-h-[92vh] overflow-y-auto` + styled thin scrollbar. |
| `frontend/src/pages/Admin/MembershipRequestShow.jsx` | `sm:max-w-[380px]` → `sm:max-w-[380px] max-h-[90vh] overflow-y-auto` + styled. |
| `frontend/src/pages/Member/Membership.jsx` | 3 QR/Submit dialogs `sm:max-w-[380px] p-0 gap-0 overflow-hidden` → `max-h-[min(88vh,640px)] overflow-y-auto` + styled thin scrollbar + `rounded-2xl` kept. |
| `frontend/src/components/ui/input.jsx`, `button.jsx`, `select.jsx`, `Auth/Login.jsx`, `Admin/Members.jsx`, `Profile/Index.jsx`, `Attendance` etc | Already large `h-11` from prior audit (kept). |
| `audit/20260903-115344-dialog-scrollable-styled.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Ensured **every Card/Dialog is scrollable** when content overflows (`max-h-[min(88vh,640px)] overflow-y-auto`) and **scroll looks premium** (thin 6px, `var(--ink-300)` thumb on transparent track, rounded-full, hover `var(--ink-600)`, `scrollbar-width:thin` + `scrollbar-color`). Register hidden scrollbar replaced with styled thin, Members create/edit/view/delete, Memberships edit, RequestShow action, Member QR/Submit all now scrollable with same thumb style. Base `Dialog`/`AlertDialog` defaults now include styled scroll so future dialogs inherit. Large `h-11` inputs/buttons system-wide preserved (prior). Build verified `vite build` ✓ 2214 modules.

## Notes
- Chose `88vh` cap (vs `92vh`) to leave 12vh breathing room for header/footer, `640px` max prevents giant dialogs on 4K.
- Thumb `ink-300 #E1E4E8` subtle, hover `ink-600 #5B6168` visible but not heavy; track transparent blends with white/dialog bg.
- `Member/Membership` dialogs previously `overflow-hidden` would clip on small phones (320px) if receipt image tall — now scrollable.
- If no scroll needed (content fits), thin scrollbar auto-hides (no track), so no visual noise on wizard steps.
