# Audit: Remove Redundant Member Columns (first_name/last_name/email)

**Date**: 2026-08-27 22:36:27
**Task**: Remove redundant columns from members table — use single `name` instead of `first_name`/`last_name`, drop `email` (comes from linked `users` account), make `user_id` required.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_08_27_141300_create_members_table.php` | **Rewritten** — removed `first_name`, `last_name`, `email` columns; added single `name` string; changed `user_id` from `nullable()->constrained()->nullOnDelete()` to `constrained()->cascadeOnDelete()` (required, every member links to a user); removed composite index `[first_name, last_name]` and `email` index; added `name` index. |
| `backend/app/Models/Member.php` | **Rewritten** — `fillable` now `['member_code','user_id','name','phone','address','birthdate','gender','photo','status']`; removed `getFullNameAttribute()` accessor (no longer needed, `name` is direct); `scopeSearch` now searches `member_code`, `name`, `phone` only (removed `email`, `first_name`, `last_name`, CONCAT); kept `scopeStatus`, `scopeGender`, `user()` BelongsTo. |
| `backend/app/Http/Resources/MemberResource.php` | **Rewritten** — returns `name` directly; `email` now derived from `$this->user?->email` (linked user); removed `full_name` accessor usage. |
| `backend/app/Http/Requests/StoreMemberRequest.php` | **Rewritten** — rules: `user_id required|exists:users,id`, `name required|string|max:255`, `phone/address/birthdate/gender/photo/status` unchanged; removed `email/first_name/last_name` rules; added custom messages for `user_id` and `name`. |
| `backend/app/Http/Requests/UpdateMemberRequest.php` | **Rewritten** — rules: `user_id sometimes|required|exists:users,id`, `name sometimes|required|string|max:255`; removed `email/first_name/last_name` rules. |
| `backend/app/Http/Controllers/MemberController.php` | **Edited** — `sort_by` validation changed from `id,member_code,first_name,last_name,email,created_at,status` to `id,member_code,name,created_at,status`. |
| `backend/database/factories/MemberFactory.php` | **Rewritten** — `definition()` now creates a `User::factory()->create(['role'=>'member'])` per member, sets `user_id=$user->id`, `name=$user->name`; removed `first_name/last_name/email`; kept `phone/address/birthdate/gender/status`; added `active()` and `expired()` states. |
| `backend/database/seeders/DatabaseSeeder.php` | **Rewritten** — creates admin + `member@fitpay.test` user, links member via `Member::firstOrCreate(['user_id'=>$memberUser->id], ['name'=>$memberUser->name,...])`, then `Member::factory()->count(24)->create()` (each creates its own user). Total: 26 users (2 named + 24 factory), 25 members (1 named + 24 factory), all `user_id` set. |
| `frontend/src/pages/Members/Index.jsx` | **Rewritten** — `MemberForm` state: single `name` field (removed `first_name/last_name/email`); form has one `name` input + phone/gender/status/birthdate/address; table displays `m.name` (not `m.full_name`); mobile card displays `m.name`; view dialog shows `name`; delete dialog shows `name`; search placeholder "code, name, phone". |
| `frontend/src/components/MemberCard.jsx` | **Edited** — `{member.first_name} {member.last_name}` → `{member.name}`. |
| `audit/20260827-223627-remove-redundant-member-columns.md` | This audit log |
| `audit/README.md` | **Updated** — newest audit at top (descending). |

## Summary
Simplified `members` table by removing redundant columns. `first_name` + `last_name` → single `name`. `email` dropped (email now comes from linked `users` account via `user_id`). `user_id` is now **required** (not nullable) — every member must have a linked user account. Removed `getFullNameAttribute()` accessor (no longer needed). `MemberResource` returns `email` from `$this->user?->email`. Factory creates a user per member. Seeder creates 2 named users + 24 factory users, links 25 members. Verified: `migrate:fresh --seed` → 26 users, 25 members (all `user_id` set), `GET /members` returns `name` + `email` from user. Frontend build ✓ `492kB JS`.

## Notes
- **Cascade delete**: `user_id` uses `cascadeOnDelete()` — deleting a user deletes their member record. This is intentional: the member IS the user in this system.
- **Email source**: `email` is no longer stored on `members` table; `MemberResource` derives it from `$this->user?->email`. If a user is deleted, `email` returns null (member also deleted via cascade).
- **No walk-ins**: Every member now requires a `users` account (`role:member`). Walk-in members without login are not supported in this schema — would need to re-add `user_id nullable` if walk-ins are needed later.
