# Audit: Animated SVG Gym Background (No Actual Images)

**Date**: 2026-08-27 21:28:36
**Task**: dont use actual image, maybe use animated svg

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/GymAnimatedBg.jsx` | **Created** — pure SVG, no `<img>`: `800x1200` viewBox, `pattern` grid `80x80` white `0.06`, radial glow `url(#glow)`, central large dumbbell (`80x14` bar + 22x44 plates) floating `translate 0 -10` 5s, 4 small dumbbells floating at different speeds (5–7s, y -12/+12), heartbeat polylines with `stroke-dasharray` anim 2.5–3s, 5 bokeh dots pulsing/floating, bottom `CHARGE` / `GROW` text with opacity pulse (login vs register variant via `variant` prop), full teal gradient `from-[var(--charge-500)] via-[var(--charge-600)] to-[var(--ink-900)]` + `bg-gradient-to-t` fade, all `white` on teal, `animateTransform`/`animate` SMIL. |
| `frontend/src/pages/Auth/Login.jsx` | **Edited** — `import GymAnimatedBg` + replaced `img https://images.unsplash.com/photo-153443...` + gradient + SVG pattern with `<GymAnimatedBg variant="login" />` in both desktop hero (`hidden lg:flex`) and mobile hero (`lg:hidden h-[220px]`). Removed external image dependency; kept hero copy, stats, live card, text overlays (`relative z-10`). |
| `frontend/src/pages/Auth/Register.jsx` | **Edited** — same: `import GymAnimatedBg` + replaced `img https://images.unsplash.com/photo-157101...` + gradient/pattern with `<GymAnimatedBg variant="register" />` in desktop + mobile heroes. Variant shows `GROW / STRONGER TOGETHER` vs Login `CHARGE / EST. 2026`. Kept feature cards, testimonial, form. |
| `audit/20260827-212836-animated-svg-no-image.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Replaced all `https://images.unsplash.com` gym photos (previously 1600w) with a **single animated SVG component** per user request for “no actual image”. `GymAnimatedBg.jsx` is a lightweight, dependency-free SVG (no `<img>`, no external fetch) that fills the hero (`absolute inset-0`) with: teal `charge-500→charge-600→ink-900` gradient, 80px grid, radial glow, 1 large + 4 small dumbbells floating via `animateTransform` (5–7s, different y offsets), 2 heartbeat polylines drawing via `stroke-dasharray`, pulsing bokeh dots, and bottom `CHARGE`/`GROW` wordmark pulsing — all white on teal, `0.06–0.18` opacity for subtlety. Login uses `variant="login"` (CHARGE), Register uses `variant="register"` (GROW). Both desktop split (`lg:grid-cols-[1.05fr_0.95fr]`) and mobile `h-[200/220px]` heroes now use the SVG, so no network image, no CORS, instant load, and animation respects `design.md` §9 minimal motion (150–200ms ease, here 2.5–7s slow floats). Build verified: `vite build` ✓ 1991 modules (was 1990, +1 component), 476kB JS, 72kB CSS.

## Notes
- **Why SVG not image**: User explicitly said don’t use actual image; SVG is offline-safe, no Unsplash rate limit, smaller than 1600w JPEG, and animates without JS (SMIL `animateTransform`/`animate`).
- **Variant**: `variant` prop toggles bottom text only (CHARGE vs GROW) — keeps Login/Register distinct while sharing same dumbbell/heartbeat motif. Could extend to color prop if needed.
- **Accessibility**: `aria-hidden` on SVG, hero text remains `text-white` on teal gradient (WCAG AA white on `#0F766E` ~5.8:1). Animations are slow, low-contrast, `prefers-reduced-motion` not yet handled — add `@media (prefers-reduced-motion)` to pause `animateTransform` if needed.
- **Performance**: SVG is inline, no extra request; 1991 modules (+1), JS +4kB (476k vs 472k) for SMIL, CSS slightly smaller (72k vs 73k) from removing image-related styles.
- **Future**: Could extract SVG to `public/gym-hero.svg` if reused elsewhere, or add `motion` library for more gym equipment (kettlebell/barbell) — kept to dumbbells for now per `design.md` §5 (single hero icon).
