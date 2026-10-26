# Audit: Register Buttons Same Size + Right Aligned

**Date**: 2026-09-03 10:56:52 +08:00
**Task**: all btn must be same size and align to right — plus prior step-step, no-scroll, remove optional text, all required

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | **Buttons unified & right-aligned**: container `flex gap-2 pt-1` → `flex justify-end gap-2.5 pt-1` (right align). `Back` `h-9 px-4` + `Continue/Create` `flex-1 h-9` (unequal, full-width) → all `h-9 w-32 rounded-lg text-[13px]` (`w-32 = 128px × 36px`, identical). `Back` `variant=outline` vs primary `bg-[var(--charge-500)]` share same dimensions, only color differs. Step 1 single `Continue` now `w-32` right-aligned (was `flex-1` full-width left). `Create account` also `w-32` fits `Loader2` + text without wrapping. Keeps `h-9` compact height (fixes prior “btn too big” `h-11→h-9` 36px) and `shadow-sm`. |
| `audit/20260903-105652-register-buttons-same-size-right.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Made all wizard CTAs identical `128×36px` (`w-32 h-9`) and right-justified (`justify-end`) so Back / Continue / Create account share same footprint. Step 1 now right-aligned single 128px button (not full-width), steps 2–3 show two 128px buttons side-by-side on right. Preserves 3-step wizard, hidden scrollbar `min(88vh,620px)`, `required` + no optional text.

## Notes
- `w-32` chosen to fit longest label “Create account” (~115px + gap) at `13px` without truncation; if “Creating…” loading expands, button stays `w-32` (text `Creating…`  ~85px fits). Alternative `min-w-[128px]` would allow growth but breaks strict same-size; fixed `w-32` enforces equality.
- Mobile: `w-32` ×2 = 256px + `gap-2.5` 10px = 266px < 320px viewport, fits small phones; no flex-wrap needed.
- Build verified: `vite build` ✓ 2214 modules.
