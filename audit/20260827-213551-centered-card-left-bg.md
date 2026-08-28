# Audit: Centered Card with Left Background

**Date**: 2026-08-27 21:35:51
**Task**: redesign it the the card is in the center then the backgound is on the left side

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Login.jsx` | **Redesigned** — from `lg:grid lg:grid-cols-[1.05fr_0.95fr]` split (left hero + right form) to **centered card over left background**: `min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-[var(--surface-0)] overflow-hidden` + `absolute inset-y-0 left-0 w-full lg:w-[44%]` containing `GymAnimatedBg variant="login"` + `bg-gradient-to-r to-[var(--surface-0)]` fade on desktop + full-screen `GymAnimatedBg` with `bg-[var(--surface-0)]/70` blur on mobile, `absolute -top/-bottom blur-3xl` glows + faint `Dumbbell 560px opacity 0.035` watermark, top-left `FitPay` lockup `absolute top-6 left-6 hidden lg:flex` (outside card), card `relative z-10 w-full max-w-[420px] shadow-2xl border-[var(--ink-300)] bg-white/95 backdrop-blur` centered via flex, `h-12` teal inputs, demo admin/member, no left-hero text (already minimal). |
| `frontend/src/pages/Auth/Register.jsx` | **Redesigned** — same centered-card + left-bg pattern: `absolute inset-y-0 left-0 w-full lg:w-[44%]` with `GymAnimatedBg variant="register"`, same gradient fade, same blurs/watermark, top-left lockup, card `max-w-[440px]` centered, form with `Select` role, `h-12` teal, no left-hero extra text. Both now share identical centered-card architecture (card in center, gym background on left side per request). |
| `audit/20260827-213551-centered-card-left-bg.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Redesigned auth per “card is in the center then the background is on the left side”. Replaced the previous `grid` split (left hero column vs right form column) with a **single centered card** (`flex items-center justify-center`, `max-w-[420/440px]`, `shadow-2xl`, `bg-white/95 backdrop-blur`) that floats in the middle of the viewport. The gym theme (`GymAnimatedBg` animated SVG — teal `charge-500→charge-600→ink-900`, grid, floating dumbbells, heartbeat, bokeh, `CHARGE`/`GROW` wordmark) now lives as a **left-side background panel** (`absolute inset-y-0 left-0 w-full lg:w-[44%] overflow-hidden` with `GymAnimatedBg` + `to-[var(--surface-0)]` fade on desktop, and full-cover with `70%` surface blur on mobile), so the background is visibly anchored to the left while the card remains perfectly centered. Kept teal `#0F766E` palette, `shadcn` Card/Input/Button, `lucide` Dumbbell, `h-12` teal focus, JWT logic unchanged. Build verified: `vite build` ✓ 1991 modules, 468kB JS, 71kB CSS.

## Notes
- **Left background**: `w-full` on mobile (covers whole screen behind card with 70% blur) → `lg:w-[44%]` on desktop (left strip, fades to `surface-0` on right edge so card doesn’t compete). Card stays centered via outer `flex` regardless of background width.
- **Top-left lockup**: `absolute top-6 left-6 hidden lg:flex` outside the card keeps FitPay branding on the gym side without cluttering the card.
- **No left text**: Left hero headline removed in previous step (213248) — left is now pure animated background, card holds all form text. If headline on left is wanted again, it can be re-added as `absolute` text on the left panel without moving the card.
- **No image**: Still `GymAnimatedBg` SVG (no Unsplash), offline-safe, SMIL animations.
