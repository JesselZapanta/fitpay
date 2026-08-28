# Audit: Members — Remove Help Texts, Move Photo to Users + Upload

**Date**: 2026-08-27 23:03:00
**Task**: remove this MEM-0001 ... and How it's stored ... and upload photo not a link, the photo is on the user table now

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/migrations/0001_01_01_000000_create_users_table.php` | Already had `photo string nullable` after `status` — kept (photo lives on users). |
| `backend/database/migrations/2026_08_27_141300_create_members_table.php` | **Edited** — removed `photo` column (`string photo nullable` + index). Now `members` is 1 file: `id, member_code unique, user_id FK cascade, phone, address, birthdate, gender, status, timestamps` + indexes on member_code/status. `photo` lives only on `users.photo`. |
| `backend/app/Models/User.php` | **Edited** — `fillable` added `status, photo`; added `getPhotoUrlAttribute()` (`/storage/...` full URL handling) to serve uploaded photos. |
| `backend/app/Models/Member.php` | **Edited** — `fillable` removed `photo`; added `getPhotoAttribute()` (`$user?->photo`) and `getPhotoUrlAttribute()` (`$user?->photo_url`) so `Member::photo/photo_url` resolves via user; no `photo` column on members. |
| `backend/app/Http/Resources/MemberResource.php` | **Edited** — returns `photo` + `photo_url` from member accessors (now from user). |
| `backend/app/Http/Requests/StoreMemberRequest.php` | **Edited** — `photo` rule changed from `string|max:255` to `nullable|image|mimes:jpeg,jpg,png,webp|max:2048`. |
| `backend/app/Http/Requests/UpdateMemberRequest.php` | **Edited** — same `photo` image rule. |
| `backend/app/Http/Controllers/Api/MemberController.php` | **Edited** — `resolveUser()` and `update()` now handle file upload: `if ($request->hasFile('photo')) { delete old Storage::disk('public')->delete, store `photos` on `public` disk, set `$user->photo = $request->file('photo')->store('photos','public') }`; `store`/`update` no longer set `photo` on member, only on user; `index`/`store`/`show`/`update` eager `load('user')`. Added `Storage` facade. |
| `backend/database/factories/UserFactory.php` | **Edited** — `definition` now includes `role member, status active/inactive, photo null` + `admin()` state. |
| `backend/database/factories/MemberFactory.php` | Unchanged — still creates user via `User::factory()` then member with phone/address/birthdate/gender/status (photo now on user). |
| `frontend/src/pages/Members/Index.jsx` | **Rewrote MemberForm + helpers** — removed `DialogDescription MEM-0001 ...` (now `sr-only`) and the entire `How it's stored: users holds...` box. `Avatar` now `resolvePhotoUrl(photo, photoUrl)` (handles blob/http//storage prefix with `VITE_API_URL`). `MemberForm` changed `photo` from Text `photo URL` to `<Input type="file" accept="image/*">` with `fileRef`, `photoFile`/`photoPreview` (`URL.createObjectURL`), clear button (`Trash`), `Upload` hint “JPG/PNG/WebP max 2MB — users.photo”. Submit builds `FormData` (name,email,phone,address,birthdate,gender,status + `photo` file) and calls `onSubmit(fd)`. Parent `handleCreate/handleUpdate` now `api.post` with `FormData` (no manual Content-Type, axios sets boundary; update sends `_method=PUT`). View dialog shows `resolvePhotoUrl` image or “No photo — initials”. Table/mobile cards use `photo/photo_url` via `Avatar`. |
| `frontend/vite.config.js` | **Edited** — added `/storage` proxy to `VITE_API_URL` (or localhost:8000) so `/storage/photos/...` resolves to backend in dev. |
| `audit/20260827-230300-members-upload-photo-to-users.md` | This audit log |
| `audit/README.md` | Updated — newest at top (descending). |

## Summary
Removed the two help texts the user flagged and moved photo storage from `members.photo` (string link) to `users.photo` (file upload). Migration now 1 file per table: `users` holds `photo`, `members` no longer has it. Requests validate `image|max:2MB`, controller stores to `storage/app/public/photos` and deletes old on update, resource exposes `photo`+`photo_url` via user accessors. Frontend Members form now uses `<input type="file">` with preview (blob → `Avatar`), builds `FormData` and posts multipart, no manual `MEM-0001` or “How it’s stored” notes. Verified `migrate:fresh --seed` → members `id,member_code,user_id,phone,address,birthdate,gender,status` (no photo), users `...status,photo` (yes), `POST /members` with `CURLFile` → 201 `photo: photos/...` `photo_url: /storage/photos/...`, proxy `/storage` and `vite build` 504kB ✓.

## Notes
- **Upload flow**: `MemberForm` sends `FormData`; create `POST /members`, update `POST /members/{id}` with `_method=PUT` (PUT multipart via POST spoof, Laravel resolves to PUT). Backend deletes old photo on update.
- **URL**: `User::photo_url` returns `/storage/...`; frontend `resolvePhotoUrl` prefixes `VITE_API_URL` when needed and handles blob/preview; dev needs `php artisan storage:link` (ran) and Vite `/storage` proxy.
- **Clean**: Removed test upload `MEM-0026 Photo Upload Test` and its file; back to 25 members / 26 users.
