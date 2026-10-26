# Audit: Register Polish — No Large Button, Premium No-Scroll Layout

**Date**: 2026-09-03 10:48:58 +08:00
**Task**: redesign, looks bad, btn is too large — plus prior: remove Member information (optional, but saved to member table) text and make all inputs required, change design so no scroll on big screen

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | **Redesigned premium layout (fixed “looks bad” + large btn)**: kept `max-w-[480px] lg:max-w-[560px]` (reverted from 600/640 → less wide → btn not stretched), `max-h-[92vh] overflow-y-auto` so mobile scrolls but desktop content ~520px fits 90vh → no scroll on lg. Inputs/select all `h-10 rounded-xl text-[14px]` (was `h-11 lg:h-8 text-[15px]→13px` tiny/cramped → now balanced `h-10` everywhere, `11px→13px` labels). Account `name+email` side-by-side `sm:grid-cols-2 gap-3`, Member `phone+birthdate` + `gender+address` each `grid sm:grid-cols-2 gap-3` (address `Input` single-line, not `Textarea 64px` → saves height without cramping). Header `size-11 title 22px` restored (was `size-9/18px` too small), `CardContent space-y-5` airy (was `2.5` dense), sections `space-y-3 pt-4 border-t`. **Button**: `h-10 rounded-xl font-semibold text-[14px] shadow-sm hover:shadow-md` (was `h-11 lg:h-9` full-width 44/36px + small font felt off; now 40px compact, not too large, `transition-all`). Removed `lg:h-screen lg:max-h-none lg:overflow-visible` hack and `lg:size-9` shrinkage → consistent sizing. Error banner `rounded-xl px-3.5 py-2.5`. Retained: no `(optional…)` text, gender `Select` without `— None —`, `required` + `*` on all, client guard for missing member fields. |
| `backend/app/Http/Controllers/Api/AuthController.php` | Unchanged from prior — `phone, address, birthdate, gender` remain `required` (already enforced). Kept `Member::create` direct. |
| `audit/20260903-104858-register-polish-no-large-btn.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Fixed “looks bad + btn too large” by widening less (560 not 640), restoring airy spacing and proper 40px `h-10` controls (instead of cramped `lg:h-8`), and downsizing CTA to `h-10` 14px `rounded-xl` — premium, not oversized, still full-width but proportionate to 480/560 card. Two-column grids keep total height ~520px → fits `92vh` on 768px+ screens → no scroll on big screen, scroll only on mobile where `max-h-[92vh] overflow-y-auto` remains. Visual hierarchy restored: header bold, sections `User/Phone` uppercase, inputs `rounded-xl` focus `charge-500`, button `charge-500→600` hover.

## Notes
- No DB migration change; `members` columns stay `nullable` — validation enforces required on `POST /api/register`.
- Mobile touch targets: `h-10` (40px) is 4px shy of 44px ideal but acceptable for balanced aesthetics; if strict 44px needed, bump to `h-11` and accept ~20px extra height (still fits 92vh at 560 width: ~540px < 644px at 700px viewport).
- Build verified: `vite build` ✓ 2214 modules, CSS 86.10kB (was 87.32kB, -1.2kB from smaller lg overrides).
- Previous audit `104134` described compact `lg:h-8` dense layout — superseded by this polished version but kept for history.
