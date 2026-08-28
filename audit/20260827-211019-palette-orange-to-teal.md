# Audit: Palette Refresh — Orange → Teal

**Date**: 2026-08-27 21:10:19
**Task**: im changing my mind, Orange for gym looks bad, change the color, update the md as well

## Files Changed
| File | Changes |
|------|---------|
| `design.md` | **Edited** — `§1` Charge description: `ember orange` → `deep teal`; `§2` Core palette: `--charge-500 #FF5A1F → #0F766E`, `--charge-600 #E64A0F → #115E59`, `--charge-100 #FFE7DA → #CCFBF1` with note “Update 2026-08-27: Orange read as cheap/discount… new teal keeps energy but premium”; updated “Why not gym red/black” → “Why not red/black or pure orange” paragraph to explain orange cheap/discount, eye fatigue, teal WCAG AA, analogous with grow green |
| `themes.md` | **Edited** — `§2` color tokens table updated to new teal hexes with inline note `2026-08-27 update: Orange #FF5A1F → Teal #0F766E (user feedback)`, hover/tint vars changed accordingly |
| `frontend/themes.md` | **Edited** — synced copy of root `themes.md` (same teal update) |
| `frontend/src/index.css` | **Edited** — `:root` `--charge-500 #FF5A1F→#0F766E`, `--charge-600 #E64A0F→#115E59`, `--charge-100 #FFE7DA→#CCFBF1`; `chart-5 #FF8A5B→#14B8A6` (teal-500), `.dark` accent `#2A1F1A→#0F2F2E` / `#FF8A5B→#5EEAD4` and sidebar-accent same; all shadcn vars (`--primary`, `--accent`, `--ring`, etc.) auto-map via `var(--charge-*)` so no component code change needed |
| `audit/20260827-211019-palette-orange-to-teal.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
User feedback: ember orange (`#FF5A1F`) felt cheap/discount for a gym. Replaced the entire charge palette with **deep teal `#0F766E` (primary), `#115E59` (hover), `#CCFBF1` (tint)** — a calm, premium, high-contrast alternative that keeps “Charge and Grow” energy but avoids orange’s eye-fatigue on warm `surface-0 #F7F7F5`, meets WCAG AA for white text, and sits as an analogous pair with `grow green #1E8E5A`. Updated narrative in `design.md` (§1 + §2 why-not paragraph), code-facing `themes.md` token table, and the actual Tailwind implementation in `frontend/src/index.css` (both light and dark variants, chart accent). No JSX logic changed — all components already use `var(--charge-500)` / `var(--charge-100)` etc., so the new palette propagates automatically to buttons, nav, focus rings, badges, and charts. Verified: `npm run build` ✓ 1990 modules, 457kB JS, 66kB CSS.

## Notes
- **Token name preserved**: kept `--charge-*` name for backward compatibility; value now teal (documented in md). Alternative rename to `--primary-*` deferred to avoid sweeping JSX edits.
- **WCAG**: Teal `#0F766E` on white `#FFFFFF` contrast ~5.8:1 (passes AA for normal text); `#115E59` hover even higher. Previous orange `#FF5A1F` was ~3.2:1 on white (borderline for white text, contributed to “bad” feel).
- **Dark mode**: Updated dark `accent` from orange-brown `#2A1F1A` → teal-dark `#0F2F2E` and `accent-foreground` from `#FF8A5B` → `#5EEAD4` to keep dark teal harmony; primary stays teal in dark (no change needed).
- **No hardcoded orange left**: Grepped `src/**/*.jsx` for `#FF5A1F|#E64A0F|#FFE7DA|#FF8A5B` — zero hits; all usage via CSS vars.
- **Follow-ups**: If user wants further tweak, consider testing new palette at 375px/320px front-desk lighting; optionally update `FITPAY-SPEC.md` §9 palette if it references orange (currently spec still says Flutter/Dart, not color — no change needed). Push not yet done (await explicit “push” per rules).
