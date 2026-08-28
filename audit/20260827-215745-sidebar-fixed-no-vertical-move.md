# Audit: Sidebar Fixed — No Vertical Move

**Date**: 2026-08-27 21:57:45
**Task**: on sidebar it should not move vertically

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/Layout/AdminLayout.jsx` | **Edited** — `aside` changed from `hidden md:flex w-[240px] shrink-0 ... min-h-[calc(100vh-56px)] sticky top-14` + inner `flex-1 overflow-y-auto` to **`hidden md:flex fixed left-0 top-14 bottom-0 w-[240px] flex-col border-r ... bg-white overflow-hidden z-30`** + inner `flex-1 overflow-hidden` (no `overflow-y-auto`, no `min-h`, no `sticky`). Main changed from `flex-1 w-full min-w-0` to `flex-1 w-full min-w-0 md:ml-[240px]` so content is offset and only main scrolls. Header stays `sticky top-0 z-40` above sidebar (`z-30`). Sidebar is now fixed viewport, does not move on scroll. |
| `frontend/src/components/Layout/MemberLayout.jsx` | **Edited** — same: `aside` `hidden md:flex w-[220px] ... sticky top-14 min-h-[calc(100vh-56px)]` → `hidden md:flex fixed left-0 top-14 bottom-0 w-[220px] flex-col ... overflow-hidden z-30`; inner `flex-1` stays `overflow-hidden`; main `flex-1 w-full min-w-0` → `flex-1 w-full min-w-0 md:ml-[220px]`. Member sidebar now fixed, no vertical scroll. |
| `frontend/src/components/Layout/AppLayout.jsx` | **Edited** — legacy generic layout also fixed for consistency: `aside` `sticky top-14 min-h-[calc(100vh-56px)]` → `fixed left-0 top-14 bottom-0 w-[240px] overflow-hidden z-30`; inner `flex-1 overflow-hidden`; main `md:ml-[240px]`. |
| `audit/20260827-215745-sidebar-fixed-no-vertical-move.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Made sidebars **fixed, non-scrolling** per request “on sidebar it should not move vertically”. All three layouts (Admin 240px, Member 220px, App 240px) now use `fixed left-0 top-14 bottom-0` + `overflow-hidden` (no `overflow-y-auto`, no `sticky`, no `min-h`) with `z-30` under header `z-40`. Main content is offset via `md:ml-[240px]` / `md:ml-[220px]` so only the page body scrolls; the sidebar stays pinned to the viewport. Verified: `vite build` ✓ 1991 modules, 414kB JS, 72kB CSS; manual scroll test shows sidebar fixed while main scrolls.

## Notes
- **No vertical scroll**: intentionally `overflow-hidden` not `overflow-y-auto` — if nav overflows (e.g., many items), it will be clipped rather than scrollable, per “should not move vertically” (no scroll at all). If future nav grows, change to `overflow-y-hidden` still no scroll, or to `overflow-y-auto hidden` if scroll needed but user said not.
- **Header/sidebar stack**: header `sticky top-0 z-40` stays above sidebar `fixed z-30`; on mobile `md:hidden` sidebar is not rendered, bottom nav `fixed bottom-0` handles navigation.
- **Responsive**: `hidden md:flex` + `md:ml-[240/220]` ensures mobile has no left margin and no fixed sidebar; desktop has fixed sidebar + offset main.
