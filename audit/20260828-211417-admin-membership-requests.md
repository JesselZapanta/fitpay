# Audit: Add Admin Membership Requests Page

**Date**: 2026-08-28 21:14:17
**Task**: on admin side do the membership requests page — backend, frontend, similar design as the rest on the system

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/MembershipRequests.jsx` | **NEW** — Admin membership requests page with search, status filter, desktop table, mobile cards, view dialog (receipt preview), approve/reject action dialog with admin note |
| `frontend/src/App.jsx` | Added `AdminMembershipRequests` import and `/admin/membership-requests` route (admin-only) |
| `frontend/src/components/Layout/Admin/AdminLayout.jsx` | Added `Receipt` icon import and "Requests" nav item under Operations group → `/admin/membership-requests` |

## Summary
Admin can now manage membership requests at `/admin/membership-requests`:

### Features
- **Header card** — title + total count (matches Members design)
- **Search** — by member name, email, or reference number
- **Status filter** — All / Pending / Approved / Rejected
- **Desktop table** — Member, Plan, Amount, Reference, Status, Date, Actions
- **Mobile cards** — responsive card layout with approve/reject buttons
- **View dialog** — receipt image preview, status badge, amount, reference, admin note
- **Approve/Reject dialog** — optional admin note textarea, confirmation

### Status badges
| Status | Color | Icon |
|--------|-------|------|
| Pending | Yellow | Clock |
| Approved | Green | CheckCircle2 |
| Rejected | Red | XCircle |

## Notes
- Same design patterns as Members page (Card header, search/filter bar, table + mobile cards, pagination)
- Nav link added under "Operations" group with Receipt icon
- Build verified: `vite build` 615k js, 82k css ✓
