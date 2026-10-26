# Audit: Register Compact — Smaller Button, Hidden Vertical Scroll

**Date**: 2026-09-03 10:54:55 +08:00
**Task**: btn is too big then the vertical scroll looks bad — plus prior: make it step step, remove Member information (optional…) text, make all inputs required, no scroll on big screen, redesign

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | **Button smaller**: `h-10 text-[14px] rounded-xl` → `h-9 text-[13px] rounded-lg` (`36px` vs `40px`, `px-4` Back, `flex-1` primary `Continue/Create`), `size-3.5` icons. **Vertical scroll fixed**: card `max-w-[480/520]` → `max-w-[440px] lg:max-w-[460px]` (narrower → less wide btn), `max-h-[92vh]` → `max-h-[min(88vh,620px)]` + `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` (scrollbar visually hidden even when needed), wrapper `p-6` → `p-4 sm:p-5`, header `size-11 text-[22px] space-y-4` → `size-9 text-[19px] space-y-3 pt-5 pb-3`, stepper `size-8` → `size-7 border-[1.5px] size-3.5 icons`, gaps `gap-3` → `2.5`, `space-y-5` → `4/3`, inputs `h-10 text-[14px]` → `h-9 text-[13px] rounded-lg`, labels `13px→12px`, error `text-sm→13px px-3 py-2`, helper text `11px→10px`, `CardContent pb-5`. Each step now ~380px tall → fits 620px cap → no visible scroll on `lg` (88vh), mobile still scrollable but scrollbar hidden for clean look. Kept 3-step wizard, `required` + `*` + per-step validation, no `(optional…)` text. |
| `audit/20260903-105455-register-compact-no-scroll.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Shrunk CTA from `h-10` 14px full-width heavy to `h-9` 13px `rounded-lg` compact (`36px`, lighter shadow) and narrowed card `460px` so button no longer feels stretched. Fixed “vertical scroll looks bad” by capping card `min(88vh,620px)` and visually hiding scrollbar (`[scrollbar-width:none]`), plus compressing header/stepper/form rhythm so each step fits without inner scroll on desktop — mobile retains scroll but hidden chrome. Build verified `vite build` ✓ 2214 modules.

## Notes
- If strict 44px touch target required, bump `h-9` → `h-10` (still < 620px cap at 410px/step).
- DB/backend unchanged — `AuthController` already `required` for member fields.
- `GymAnimatedBg` + `Dumbbell` branding retained, `sm:grid-cols-2` member grids preserved for no-scroll width saving.
