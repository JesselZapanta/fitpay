# Audit: Membership status edit on admin/memberships

**Date**: 2026-08-29 10:15:00
**Task**: I can edit the status on http://localhost:5173/admin/memberships

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/MembershipController.php` | Added `update` method: validates `status` in:active,expired only (no dates), updates `status` column, syncs `Member` status, returns computed + raw status. |
| `backend/routes/api.php` | Added `PUT /memberships/{membership}` inside `role:admin` group pointing to `MembershipController@update`. |
| `frontend/src/pages/Admin/Memberships.jsx` | Added imports `Label`, `Dialog`, `Pencil`, `Loader2`, `Save`, `toast`. Added edit state (`editOpen`, `selected`, `editForm:{status}`, `saving`), `openEdit` and `handleSave` (PUT `/memberships/:id` with `{status}`, toast, refresh). Desktop table: added `Actions` header, colSpan 7, edit `Pencil` button per row. Mobile card: added `Edit status` button. Added `Dialog` with member header + `StatusBadge` preview and `Status` Select only (active/expired). Simplified per request: only status is editable, start/end dates remain read-only. |

## Summary
`/admin/memberships` now supports status-only editing. Admin clicks Pencil (desktop) or "Edit status" (mobile) → dialog pre-filled with `raw_status` → change to `active`/`expired` → `PUT /api/memberships/{id}` `{status}` → toast + refresh. Start/end dates are display-only. Build verified 2006 modules.

## Notes
- Per latest request, only `status` is editable — start/end dates are read-only on the membership card/table.
- Editing syncs `members.status` for consistency.
- Dialog shows member name/plan for context; existing filters/pagination/search unchanged.
