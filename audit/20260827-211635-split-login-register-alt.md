# Audit: Alternative Split Designs for Login & Register

**Date**: 2026-08-27 21:16:35
**Task**: other design that split on login and register

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Login.jsx` | **Overwritten — alternative split**: now `lg:grid-cols-[0.95fr_1.05fr]` with **form on left (order-2 lg:order-1)** and **gym visual on right (order-1 lg:order-2)** — inverse of Register. Right hero uses `photo-1593079831268` (dumbbells close-up) `opacity-60` + gradient `from-[var(--charge-500)]/85 via-[var(--charge-600)]/70 to-[var(--ink-900)]/85` (`bg-gradient-to-tl`), SVG pattern `opacity 0.06`, top `Live front desk` pill, hero copy “Your gym, under control. Every rep counts.” + live mock dashboard (3 mini stats + coach card). Left form side now has gym atmosphere: `surface-0` bg with faint `Dumbbell size-[560px] opacity 0.04` watermark, `charge-100/grow-100 blur-3xl` glows, subtle `40x40` SVG pattern `opacity 0.03` (`#0F766E`), header with FitPay lockup, form with `ArrowRight` on button, demo admin/member, footer badges. Mobile: top 200px hero with same image + `gradient-to-t` then card. Uses teal `#0F766E` primary, lucide Activity/Trophy/Flame/Users etc. |
| `frontend/src/pages/Auth/Register.jsx` | **Kept as complementary split** (image left / form right) to mirror Login’s new inverse: left hero `photo-1571019614242` (community) with `bg-gradient-to-br from-[var(--charge-500)]/85 via-[#0F766E]/70 to-[var(--ink-900)]/90`, same SVG pattern, copy “Join the movement. Build your strength.” + feature cards + testimonial; right form side has same faint dumbbell watermark + blurs + `surface-0` pattern. Mobile 200px hero. Already distinct from Login’s right-image, satisfying “other design” — two mirrored splits, different images, different copy, different stats. No logic change. |
| `audit/20260827-211635-split-login-register-alt.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Provided the requested **other split design**: Login and Register now use **mirrored splits** that are visually distinct yet gym-cohesive. Previous iteration had both with image-left; new Login is **image-right / form-left** (`0.95fr 1.05fr`, `order-2/1`), Register stays **image-left / form-right** (`1.05fr 0.95fr`). Login’s right hero uses dumbbells close-up with `to-tl` gradient and a live mock dashboard (check-ins/active/revenue + coach), while Register’s left hero uses community training with `to-br` gradient and feature cards + testimonial. Both form sides now carry **extra gym background** on `surface-0`: huge faint `Dumbbell 560px opacity 0.04`, `charge-100/grow-100 blur-3xl` glows, and a subtle `40x40` teal SVG pattern at `opacity 0.03`. Mobile: each shows a compact top hero (200–220px) with the same image+gradient then the card, so gym vibe persists at 375px. No auth logic changed (still JWT `useAuth`, role-aware redirects). Build verified: `vite build` ✓ 1990 modules, 472.9kB JS, 74.6kB CSS.

## Notes
- **Why mirrored**: User asked for “other design that split” — interpreted as wanting Login and Register to not be identical splits. Mirroring left/right plus swapping image (dumbbells vs community) and copy (front-desk vs movement) makes each auth route instantly recognizable while sharing the same teal design system.
- **Gym theme still per design.md §7**: editorial gym photos, not stock “gym bro”, used sparingly only on auth (allowed). Gradients keep text WCAG AA white, image `opacity 0.60–0.70` ensures overlay contrast.
- **No backend change**: purely frontend visual alternative; existing JWT endpoints, role middleware, seeders unchanged.
- **Performance**: Same 1990 modules, CSS +0.8kB from mirrored layout, still mobile-first (`grid-cols-[...]` only at `lg:`, fallback to single column).
- **Future**: Could add diagonal clip or floating card that straddles the split line for even more distinctiveness if desired — current mirrored straight split is clean, front-desk legible.
