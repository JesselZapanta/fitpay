# Audit: Members Management — Migration-First Fix + Photo + Polish

**Date**: 2026-08-27 23:02:00
**Task**: update the Members Management form and module, check the migration first then implement

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_08_27_141300_create_members_table.php` | **Fixed** — restored `enum status active/inactive/expired default active + index(status)` that was dropped when `name` was removed. Now 1 file creates exactly: `id, member_code unique, user_id FK cascadeOnDelete, phone, address, birthdate, gender(male/female/other), photo, status, timestamps` + indexes on member_code/status. 1 file per table. |
| `backend/app/Http/Controllers/Api/MemberController.php` | **Edited** — `index` now `with('user')` to eager load (fixes N+1, resource needs user for name/email); `store`/`show`/`update` `load('user')`; `index` joins `users` only when `sort_by=name`; kept `search` via `whereHas(user)`, `status`/`gender` scopes, pagination meta. |
| `frontend/src/pages/Members/Index.jsx` | **Rewrote** — migration-accurate. Added `Avatar` (photo → img else initials with charge-100) used in table + mobile cards + view header; added `photo` URL field with preview in `MemberForm`; form header documents `MEM-0001` + `users.name/email` vs `members.phone/address/birthdate/gender/photo/status`; added `photo` to view dialog (large preview, fallback initials); table: Code / Member (avatar+name+birthdate) / Contact (mail+phone) / Gender / Status / Actions; mobile cards: avatar, code, name, email·phone, gender·birthdate, address, status; filters (search debounced 500ms, status/gender, perPage, Clear) + meta `from–to` + pagination (Prev/Next + 5 pages desktop, `x / y` mobile); dialogs: create/edit (560px, sticky header, `min-h-11` touch), view (520px with user vs member mapping), delete (note cascade). All buttons `cursor-pointer`, responsive `sm:` grids, `min-w-0`/`truncate` guards. |
| `audit/20260827-230200-members-management-migration-photo-polish.md` | This audit log |
| `audit/README.md` | Updated — newest at top (descending). |

## Summary
Checked migration first — found `status` column was deleted together with `name` in the previous dedup, leaving `index('status')` on a missing column. Restored `enum status`. Verified DB `members` cols `id,member_code,user_id,phone,address,birthdate,gender,photo,status,created_at,updated_at`. Controller now eager loads `user` for `MemberResource` name/email accessors. Frontend Members Management was rebuilt to be 1:1 with migration: `users.name/email` (virtual `name`/`email` accessors) + `members.phone/address/birthdate/gender/photo/status` + auto `member_code`. Added photo URL with avatar preview (initials fallback), wired search (code/name/email via user/phone), status/gender filter, sort by `users.name`, paginated. Verified `migrate:fresh --seed` (26 users / 25 members), API `POST /members` with photo → 201 `MEM-0026` photo saved, `search=Photo` → 1, `vite build` 507kB ✓.

## Notes
- **Single source**: `members.name` removed — `Member::getNameAttribute()` returns `user.name`, `getEmailAttribute()` returns `user.email`; `StoreMemberRequest` `name required_without:user_id` auto-creates `role:member` user with random password; `update` syncs name/email to user.
- **Mobile-first**: Table `hidden sm:block` + Cards `sm:hidden`; form `grid-cols-1 sm:grid-cols-3`; dialogs `max-h-[92vh] overflow-y-auto`; touch `min-h-11`; `Filter` icon hidden on mobile.
