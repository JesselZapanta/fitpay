# Audit: Member & Admin Layouts (Separate)

**Date**: 2026-08-27 21:55:14
**Task**: make member layout and and admin layout

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/Layout/AdminLayout.jsx` | **Created** — admin-dedicated layout: Top bar `h-14` white with `charge-500` Dumbbell, `ADMIN` badge teal, search `hidden lg:flex`, Bell, avatar + email, logout, mobile Sheet. Sidebar `w-[240px] hidden md:flex` grouped Overview (Dashboard) / Operations (Members, Attendance) / Money (Payments, Memberships) / Insights (Reports) + Settings, active `bg-[var(--charge-500)] text-white`, `role:admin` filtered nav. Bottom `md:hidden` 5-col `grid-cols-5 h-14` (Dashboard/Members/Payments/Attendance + More Sheet). Uses `shadcn` Sheet/Avatar/Badge/Button + `lucide` (Dumbbell, LayoutDashboard, Users, CreditCard, CalendarCheck, Layers, BarChart3, etc.), teal primary, `cursor-pointer` buttons, mobile-first. |
| `frontend/src/components/Layout/MemberLayout.jsx` | **Created** — member-dedicated layout: Top bar white/90 backdrop-blur with `grow-500` Dumbbell, `MEMBER` badge `grow-100`, `5-day streak` pill `grow-100`, avatar `grow-500`, logout. Sidebar `w-[220px] hidden md:flex` with gradient `from-[var(--grow-500)] to-[#0F766E]` progress card (68% bar), nav `memberNav` (Home/Schedule/History/Billing/Profile) active `bg-[var(--grow-500)]`, help card `Heart`, bottom `md:hidden` 5-col `grid-cols-5` with `grow` active. Uses `lucide` Heart/Flame/Trophy, `grow` secondary, warm `#FCFCF9` bg, member motivational tone. |
| `frontend/src/pages/Dashboard/Admin.jsx` | **Edited** — `import AdminLayout` instead of `AppLayout`; all three returns (`loading`, `error`, main) now `<AdminLayout title="Admin Dashboard">` (was `AppLayout`). Keeps `StatCard` teal/grow tones, recent feed, donut. |
| `frontend/src/pages/Dashboard/Member.jsx` | **Edited** — `import MemberLayout` instead of `AppLayout`; returns now `<MemberLayout title="My Dashboard">` (was `AppLayout`). Keeps `grow`/`charge` stats, schedule, membership card, streak. Fixed closing tag `</MemberLayout>`. |
| `frontend/src/components/Layout/AppLayout.jsx` | **Kept** — legacy generic layout (still available for shared pages, not used by dashboards now). |
| `audit/20260827-215514-member-and-admin-layout.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Split the previous single `AppLayout` (role-filtered) into **two distinct, role-specific layouts** per request. `AdminLayout` is management-focused (240px sidebar, 6 admin nav items grouped Overview/Operations/Money/Insights, `charge-500` teal active, search + ADMIN badge, `charge-100` mobile bottom) while `MemberLayout` is personal/motivational (220px sidebar, 5 member nav items Home/Schedule/History/Billing/Profile, `grow-500` green active, `grow-100` MEMBER badge + 5-day streak pill, gradient progress card, `#FCFCF9` warm bg, green bottom nav). Both are mobile-first (`hidden md:flex` sidebar + `md:hidden` bottom `grid-cols-5 h-14`, `Sheet` drawer on mobile, `h-14` top bar, `cursor-pointer` buttons, `lucide` + `shadcn` Sheet/Avatar/Badge). Dashboards now import their own layout (`AdminDashboard → AdminLayout`, `MemberDashboard → MemberLayout`), so `admin` and `member` have visually distinct workspaces (teal vs green) while sharing the same design tokens (`charge-500 #0F766E`, `grow-500 #1E8E5A`, `surface-0 #F7F7F5`). Build verified: `vite build` ✓ 1991 modules, 414kB JS (was 407k, +7k for extra layout), 72kB CSS.

## Notes
- **Distinct by design**: Admin = `charge` teal (action, management), Member = `grow` green (progress, personal) — per `design.md` Charge vs Grow. Admin has more nav (6 vs 5) and data-dense (sidebar 240 vs 220, groups vs flat list).
- **Shared logic**: Both use `useAuth` for `user` + `logout` → `/login`, `useLocation` for `isActive`, same `GymAnimatedBg` not used inside dashboards (white `surface-0` bg), same `ProtectedRoute` role gate (`role:admin` vs `role:member`).
- **Mobile**: Both have `md:hidden` bottom nav + `Sheet` “More” on admin (extra items) — member has 5 fixed (no sheet needed beyond mobile menu).
- **Future**: `AppLayout` can be deprecated or kept for generic pages (e.g., `/attendance` shared). Next step could add `Admin` pages (Members CRUD) under `AdminLayout` and `Member` pages (My Attendance) under `MemberLayout`.
