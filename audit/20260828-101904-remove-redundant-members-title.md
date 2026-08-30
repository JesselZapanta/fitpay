# Audit: Redesign Members Page Header

**Date**: 2026-08-28 10:19:04
**Task**: Members page has redundant headers — layout header + page header both say "Members". Redesign with a clean Card-based header.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/Layout/Admin/AdminLayout.jsx` | Added `title !== "Members"` to header hide condition (alongside `title !== "Profile"`) — Members page provides its own header |
| `frontend/src/pages/Admin/Members.jsx` | Replaced bare `<div>` header with a `<Card>` containing title, count in subtitle, and "Add member" button — matches Dashboard polish level |

## Summary
- AdminLayout no longer renders its own "Members" header — the page controls it
- Members page header is now a Card with: bold title, count embedded in subtitle text ("26 total — admin workspace..."), and "Add member" button aligned right
- Single header, no duplication

## Notes
- Layout `title="Members"` still used for sidebar nav highlight — just hides the layout h1
- Build verified: `vite build` 562k js, 75k css ✓
