# Audit: Revert to Original Split Design

**Date**: 2026-08-27 21:21:34
**Task**: go back to split / go back to the original slit design

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Login.jsx` | **Reverted** — from gym-hero split (`lg:grid-cols-[1.05fr_0.95fr]` with `photo-1534438327276` + teal gradient + stats) back to **original centered card** (`min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--surface-0)]` + radial `charge-100` glow + `max-w-[400px]` Card with Dumbbell header, error banner, h-12 inputs, demo admin/member buttons). Kept teal palette (`#0F766E`). |
| `frontend/src/pages/Auth/Register.jsx` | **Reverted** — from gym-hero split (`photo-1571019614242` + Sparkles testimonial) back to **original centered card** (`max-w-[440px]` on `surface-0` + radial glow, name/email/password/confirm/Select role, h-12, teal primary). Kept teal. |
| `audit/20260827-212134-revert-to-original-split.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
User requested “go back to the original slit/split design” after the gym-photo split. Reverted both auth pages from the **gym-image split layout** (211414) to the **original centered-card design** (pre-gym, teal palette 211019): `min-h-screen` centered, `radial-gradient(ellipse_at_top, var(--charge-100))` + blur glow, `max-w-[400px]/[440px]` Card, Dumbbell header, `h-12` inputs, demo admin/member buttons, `bg-[var(--charge-500)]` primary. No change to backend, palette stays teal `#0F766E` / `#115E59` / `#CCFBF1` (not orange). Verified: `npm run build` ✓ 1990 modules, 457kB JS, 66kB CSS (same as pre-gym).

## Notes
- “slit” interpreted as “split” typo — user wanted original clean design without the extra gym hero image. If they actually wanted a different split (e.g., flat teal left hero without photo), that can be re-added as `B flat` variant.
- Gym photo split remains in git history (audit 211414) for easy restore via `git checkout` or re-apply.
- Palette remains teal (orange still removed per 211019) — no md/css palette change in this revert.
- No backend, index.css, or themes.md change in this step.
