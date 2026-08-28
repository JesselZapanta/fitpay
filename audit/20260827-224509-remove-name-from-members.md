# Audit: Remove `name` Column from Members (Name Lives on Users)

**Date**: 2026-08-27 22:45:09
**Task**: remove the name on member there is name on user migration

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_08_27_141300_create_members_table.php` | **Rewritten** — removed `name` column entirely. `members` now has: `id, member_code, user_id (FK required), phone, address, birthdate, gender, photo, status, timestamps`. Indexes on `member_code`, `status`. |
| `backend/app/Models/Member.php` | **Rewritten** — `fillable` no longer includes `name`; added `getNameAttribute()` accessor returning `$this->user?->name` and `getEmailAttribute()` returning `$this->user?->email`; `scopeSearch` now searches `member_code`, `phone`, and `whereHas('user', name/email)` (no member name column). |
| `backend/app/Http/Resources/MemberResource.php` | **Rewritten** — `name` and `email` now come from accessors (`$this->name`, `$this->email`), which resolve from the linked `user`. |
| `backend/app/Http/Requests/StoreMemberRequest.php` | **Rewritten** — `user_id` nullable (auto-create user if absent); `name` `required_without:user_id`; `email` `nullable|email|unique:users,email`. |
| `backend/app/Http/Requests/UpdateMemberRequest.php` | **Rewritten** — `name`/`email` nullable, `email` unique on `users` ignoring current member's user. |
| `backend/app/Http/Controllers/Api/MemberController.php` | **Rewritten** — `index` joins `users` when `sort_by=name` and orders by `users.name`; `store` uses `resolveUser()` private method: if `user_id` given, load that user, else create a new `User` (`role:member`, random password, email from `email` or `@fitpay.local` fallback) then apply `name`/`email`; `update` syncs `name`/`email` to the linked user; `destroy` cascades. |
| `backend/database/factories/MemberFactory.php` | **Edited** — removed `name` from definition (member name comes from the auto-created `User`). |
| `backend/database/seeders/DatabaseSeeder.php` | **Edited** — `Member::firstOrCreate` for `member@fitpay.test` no longer sets `name` on member (name is on the user). |
| `frontend/src/pages/Members/Index.jsx` | **Edited** — `MemberForm` state includes `name` + `email` (sent to user); form has Full name (required) + Email inputs; submit sends `name`/`email` to API which persists to `users`. Table/cards/view display `m.name` / `m.email` (resolved from user). |
| `audit/20260827-224509-remove-name-from-members.md` | This audit log |
| `audit/README.md` | **Updated** — newest audit at top (descending). |

## Summary
Fully removed the `name` column from `members` table — member name now lives only on `users.name` (as the user requested: "there is name on user migration"). Member model exposes `name`/`email` accessors that resolve from the linked `user`. The `StoreMemberRequest`/`UpdateMemberRequest` accept `name`/`email` and the controller applies them to the linked `User` (auto-creating a `role:member` user when `user_id` is not supplied). Search and sort-by-name now operate via the `users` relationship (join). Verified: `migrate:fresh --seed` → 26 users / 25 members, `members` columns confirm no `name`; API `POST /members` with `name`+`email` returns 201 with correct name/email, `sort_by=name` orders by user name, `search=Juan` finds 1. Frontend build ✓.

## Notes
- **Cascade**: `user_id` uses `cascadeOnDelete()` — deleting a user deletes the member too (member IS the user).
- **Auto-create**: When adding a member from the UI without a `user_id`, the controller creates a new `users` row (`role:member`, random password, email falls back to `@fitpay.local` if blank). The created user cannot log in (random password) unless an email is provided and password reset is done — acceptable for admin-created members.
- **Accessors**: `Member::$name` / `$email` are virtual (from `user`), so `MemberResource` returns them transparently; frontend needs no change to field names (`m.name` still works).
