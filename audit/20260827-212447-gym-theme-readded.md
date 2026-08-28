# Audit: Gym Theme Re-added to Login & Register

**Date**: 2026-08-27 21:24:47
**Task**: add gym theme design on the register and login

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Login.jsx` | **Overwritten** — re-added gym-hero split (`lg:grid-cols-[1.05fr_0.95fr]`): left `hidden lg:flex` with `photo-1534438327276` gym equipment `cover opacity-70` + teal gradient `from-[var(--charge-500)]/85 via-[var(--charge-600)]/75 to-[var(--ink-900)]/90` + SVG pattern `0.07`, hero copy “Charge your potential. Grow your community.” + 3 stats (1,248/98%/4.9★) + live front-desk card; right form on `surface-0` with faint `Dumbbell 520px opacity 0.03` + blur glows, same logic, teal `#0F766E` primary, `lucide` icons. Mobile `h-[220px]` hero top. |
| `frontend/src/pages/Auth/Register.jsx` | **Overwritten** — re-added gym-hero split with `photo-1571019614242` community training, same teal gradient, copy “Join the movement. Build your strength.” + feature cards + testimonial, right form `max-w-[440px]` with `Dumbbell` watermark/blurs. Mobile `h-[200px]` hero. |
| `audit/20260827-212447-gym-theme-readded.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Re-added gym-themed split backgrounds to auth per user request (after revert to original centered). Both Login and Register now use desktop split `lg:grid-cols-[1.05fr_0.95fr]` with left hero real gym photos (Unsplash editorial, per `design.md` §7), teal `charge-500/600 → ink-900` gradient + SVG pattern, storytelling copy and stats, plus right form side on warm `surface-0` with faint `Dumbbell` watermark and teal/grow blurs. Mobile shows compact top hero (200–220px) with same image+gradient then card, preserving gym vibe at 375px. No backend/logic change (still JWT `useAuth`), just visual wrapper. Build verified: `vite build` ✓ 1990 modules, 472kB JS, 73kB CSS (same as previous gym theme).

## Notes
- Re-add after `212134` revert — effectively restores `211414` gym theme (left hero for both) per user “add gym theme again”. Alternative mirrored split `211635` remains available if user wants Login image-right variant.
- Images `loading="eager"`, `object-cover`, `opacity-70` with gradient ensures WCAG AA white text; fallback `bg-[var(--ink-900)]` if offline.
- Teal palette `#0F766E` retained (no orange).
- No change to `themes.md`/`design.md`/`index.css` in this step (already teal).
