# Audit: Sidebar Nav Scroll (Overview/Operations/Money/Insights)

**Date**: 2026-08-27 21:59:02
**Task**: this one should move Overview Dashboard Operations Members Attendance Money Payments Memberships Insights Reports

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/Layout/AdminLayout.jsx` | **Edited** — inner nav container `div class="p-3 space-y-5 flex-1 overflow-hidden"` → `flex-1 min-h-0 overflow-y-auto overscroll-contain` so the grouped nav (Overview: Dashboard, Operations: Members/Attendance, Money: Payments/Memberships, Insights: Reports) scrolls vertically *inside* the fixed sidebar while the sidebar itself stays `fixed left-0 top-14 bottom-0` (no page scroll). Bottom `Settings` + `Log out` stays pinned (outside scroll). |
| `frontend/src/components/Layout/MemberLayout.jsx` | **Edited** — `nav class="p-3 space-y-1 flex-1"` → `flex-1 min-h-0 overflow-y-auto overscroll-contain` for `Home/Schedule/History/Billing/Profile` (consistency; member nav now also scrolls if overflow, though 5 items rarely overflow). Top progress card and bottom help stay fixed. |
| `audit/20260827-215902-sidebar-nav-scroll.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Made the **sidebar nav groups scrollable** per “this one should move …”. After `215745` fixed the sidebar to `fixed` with `overflow-hidden` (no vertical move at all), the grouped nav (Overview/Dashboard, Operations/Members/Attendance, Money/Payments/Memberships, Insights/Reports) was also frozen. Now the **sidebar chrome stays fixed** (`fixed left-0 top-14 bottom-0` + `overflow-hidden` on aside) but the **inner nav list** (`flex-1 min-h-0 overflow-y-auto overscroll-contain`) scrolls independently when its content exceeds viewport (e.g., many members or future nav items), while header `sticky top-0` and bottom `Settings/Log out` remain pinned. Member layout mirrored for consistency. Build verified: `vite build` ✓ 1991 modules, 415kB JS, 72kB CSS.

## Notes
- **Fixed vs scroll**: Sidebar container `fixed` (no page scroll) + inner `overflow-y-auto` (inner scroll) = best of both: sidebar doesn’t move with main page, but nav groups do move *inside* sidebar when needed.
- **Overscroll**: `overscroll-contain` prevents scroll chaining to main page when nav hits top/bottom.
- **No scrollbar plugin needed**: native `overflow-y-auto` only; custom scrollbar styles deferred.
