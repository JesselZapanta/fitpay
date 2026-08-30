# Audit: Member Layout Matched to Admin Layout Design

**Date**: 2026-08-28 10:01:07
**Task**: member layout should have the same design on admin layout, there is a profile update as well

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/Layout/Member/MemberLayout.jsx` | **REWRITTEN** to match AdminLayout structure: header with pill-style profile link (avatar + name + email, `hover:border-[var(--grow-500)]/30`), sidebar with grouped nav (sections: Overview, Personal, Account), clickable user card at bottom (`Link to="/profile"` with avatar + name + email), `w-[240px]` sidebar width, `bg-[var(--surface-0)]` background, `isActive` prefix match, bottom nav with 4 items + "More" sheet, removed streak badge + separate logout button + "Need help?" card + flat nav |

## Summary
MemberLayout now mirrors AdminLayout's design pattern:
- **Header**: Clean logo + pill-style profile link (avatar, name, email) — no extra badges/buttons
- **Sidebar**: Grouped nav with section headers, clickable user card at bottom → `/profile`, 240px width
- **Bottom nav**: 4 items + "More" bottom sheet (was showing all 5)
- **isActive**: Prefix match (`startsWith`) instead of exact match
- **Background**: `var(--surface-0)` instead of hardcoded `#FCFCF9`
- Accent color remains `var(--grow-500)` (member theme)

## Notes
- Profile link in both header pill and sidebar user card navigates to `/profile` with `title="Go to profile — email is read-only"`
- `title !== "Profile"` conditional hides layout header when on Profile page
- Build verified: `vite build` 557k js, 75k css ✓
