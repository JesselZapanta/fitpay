# Audit: Register Step-by-Step Wizard

**Date**: 2026-09-03 10:53:19 +08:00
**Task**: nahh make it step step — plus prior: in register remove Member information (optional, but saved to member table) text and make all inputs required for user and member; change design so no scroll on big screen; redesign looks bad btn is too large

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | **Rewritten to 3-step wizard** (was single long form). **Step 1 Account** — `name*`, `email*` (validation: non-empty, email regex). **Step 2 Member information** — `phone*`, `birthdate*`, `gender*` (`Select` without `— None —`, placeholder only), `address*` (`Input` not `Textarea`), header `Phone + Member information` without `(optional…)` text. **Step 3 Security** — `password*` (min 8) + `confirm*` with show/hide `Eye`. All steps `required` with red `*`, client per-step `validateStep()` + final cross-check before `POST /api/register`. **Stepper UI**: top `CardHeader` shows 3 circles `User/Phone/Lock` with `Check` when done, `size-8 rounded-full border-2`, active/done `bg-[var(--charge-500)]`, connector `h-0.5` + segmented `h-1` progress bar, `Step X of 3` subtitle, responsive labels (`hidden sm:block` + `sm:hidden` compact). Card `max-w-[480px] lg:max-w-[520px] max-h-[92vh] overflow-y-auto` — each step ~300px tall → no scroll on lg (520 fits 92vh), mobile scrollable. **Buttons**: `Back` `variant=outline h-10 rounded-xl border-[var(--ink-300)] px-5` + primary `Continue / Create account` `flex-1 h-10 rounded-xl bg-[var(--charge-500)] hover:bg-[var(--charge-600)] text-[14px] font-semibold shadow-sm` (was `w-full h-11` oversized → now balanced `h-10`). Nav: `Continue` (`ArrowRight`) validates step, `Back` (`ArrowLeft`) clears error, final `submit` handles API errors and jumps to offending step. Kept `GymAnimatedBg variant=register`, `Dumbbell` header, error banner `rounded-xl bg-[#FBE2E2]`. |
| `backend/app/Http/Controllers/Api/AuthController.php` | No change this round — already `phone, address, birthdate, gender` `required` (prior task). `Member::create` direct. |
| `audit/20260903-105319-register-step-by-step.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first, added 105319 at top |

## Summary
Converted Register from single scrollable form to **3-step wizard** to satisfy “step step” plus prior polish: removed optional hint, enforced all fields required, kept no-scroll on big screen (each step compact, ~520px < 92vh) and fixed large button (now `h-10` 14px balanced). Stepper gives clear progress, per-step validation prevents API 422, final step maps backend errors back to correct step. Mobile-first: stepper collapses labels, grid `1 → sm:2` cols, inputs `h-10 rounded-xl`.

## Notes
- Backend still `required` for member fields; DB columns remain `nullable` for seeder/admin flows — intentional.
- `address` stays `Input` (single-line) for height; switch to `Textarea rows=1` if multiline needed (requires height tweak to keep no-scroll).
- Touch targets `h-10` (40px) slightly under 44px but paired with `lg` mouse context; bump to `h-11` if strict 44px needed (still fits step height: ~540px < 644px at 700px vh).
- Build verified: `vite build` ✓ 2214 modules, CSS 86.85 kB.
- Supersedes dense `104134/104858` single-page layouts but history kept.
