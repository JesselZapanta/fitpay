# Audit: Cursor Pointer on All Buttons

**Date**: 2026-08-27 21:41:36
**Task**: all the btns must have a cursor pointer

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/ui/button.jsx` | **Edited** — `buttonVariants` base `cva` string now `inline-flex cursor-pointer shrink-0 ...` (added `cursor-pointer` first token, so every `shadcn` Button — default/outline/ghost etc. — shows hand). Keeps `disabled:pointer-events-none disabled:opacity-50`. |
| `frontend/src/index.css` | **Edited** — `@layer base` added `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }` so *all* native `<button>` and Radix `role="button"` (SelectTrigger, SheetTrigger, Dropdown) get pointer without per-file edits, even custom `<button>` not using `Button` component. |
| `frontend/src/pages/Auth/Login.jsx` | **Edited** — show/hide eye button `inline-flex size-9` → `inline-flex size-9 cursor-pointer`; demo admin/member buttons `group flex` → `group flex cursor-pointer` (both admin + member). Prevents `cursor: default` on those custom `<button type="button">` that previously relied only on global reset. |
| `frontend/src/pages/Auth/Register.jsx` | **Edited** — eye toggle `inline-flex size-9` → `inline-flex size-9 cursor-pointer`; `SelectTrigger` `h-12 rounded-lg ...` → `h-12 cursor-pointer rounded-lg ...` so role select shows hand. |
| `audit/20260827-214136-cursor-pointer-all-btns.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Made every button show `cursor: pointer` per request. Primary fix is in the **shadcn `Button` primitive** (`buttonVariants` base) + a **global base layer** (`button:not(:disabled), [role="button"]:not(:disabled) {cursor:pointer}`) in `src/index.css`, so *all* current and future buttons (including Radix `SelectTrigger`, `SheetTrigger`, `DropdownMenu` etc.) automatically get the hand without touching each file. Also patched the two custom `<button>` patterns in `Login` (eye toggle + demo admin/member) and `Register` (eye toggle + `SelectTrigger`) with explicit `cursor-pointer` for immediate visual, while `AppLayout` nav, dashboard `Button`s, `Sheet` etc. inherit via the `Button` primitive/global rule. Build verified: `vite build` ✓ 1991 modules, 464kB JS, 70.34kB CSS.

## Notes
- **Disabled stays default**: `disabled:pointer-events-none` + `:not(:disabled)` guard keeps disabled buttons from showing pointer (correct a11y).
- **No per-file sweep needed**: global `button` rule covers any future `frontend/src/pages/*` buttons that use plain `<button>`; `Button` component covers all shadcn usage.
- **Tailwind v4**: `cursor-pointer` is `cursor: pointer` — no custom CSS needed beyond the base layer.
