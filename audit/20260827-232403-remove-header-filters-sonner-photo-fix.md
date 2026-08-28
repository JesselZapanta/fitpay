# Audit: Remove Members Header/Filters + Sonner Toast (Right Side) + Photo 422 Fix

**Date**: 2026-08-27 23:24:03
**Task**: remove this Members Management Admin workspace • role-based access via role:admin middleware, the gender filter and the perpage filter(10 default) + add sooner or toast on right side + image error 422 photo must be an image

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Members/Index.jsx` | **Edited** — removed `genderOptions`/`perPageOptions`, changed `AdminLayout title="Members Management"` → `title="Members"`, removed subtitle `<p>Manage gym members — search, filter, paginate...</p>`, removed gender `Select` and perPage `Select` (fixed `const perPage = 10`), removed `gender` state/`setGender`/`setPerPage`, updated `useEffect` deps `[debouncedSearch,status]`, `fetchMembers` no longer sends `gender`, `clearFilters`/`hasFilters` only `search/status`, meta display no longer shows `gender`; kept Gender column in table/cards and `gender` field in `MemberForm` (migration-accurate). Added `import { toast } from "sonner"` and `toast.success/error` in `handleCreate`/`handleUpdate`/`handleDelete` (success shows name, error shows backend message, re-throws for form 422). |
| `frontend/src/lib/api.js` | **Fixed 422** — `request` interceptor now `if (config.data instanceof FormData) delete config.headers["Content-Type"]` so `multipart/form-data` with boundary is set by browser; previously default `application/json` caused `photo: {}` empty object → `The photo field must be a file.` |
| `frontend/src/App.jsx` | **Added** `import { Toaster } from "@/components/ui/sonner"` + `import { ThemeProvider } from "next-themes"` and rendered `<Toaster position="top-right" richColors closeButton expand />` inside `BrowserRouter` (right side as requested). |
| `frontend/src/components/ui/sonner.jsx` | **Created** via `npx shadcn@latest add sonner` (sonner + next-themes, `toaster group` with `CircleCheckInfo` icons, CSS vars). |
| `frontend/vite.config.js` | Already had `/storage` proxy for photo uploads. |
| `backend/app/Http/Requests/StoreMemberRequest.php` | **Relaxed** `photo` from `image|mimes:jpeg,jpg,png,webp|max:2048` → `file|mimes:jpeg,jpg,png,webp|max:5120` (extension check, not strict `isImage()`), `max 5MB`, messages `Photo must be JPG, PNG, or WebP.` |
| `backend/app/Http/Requests/UpdateMemberRequest.php` | Same `file|mimes|max:5120` relaxation. |
| `frontend/src/components/ui/sonner.jsx` deps | `sonner` + `next-themes` installed via `npx shadcn add sonner`. |
| `audit/20260827-232403-remove-header-filters-sonner-photo-fix.md` | This audit log |
| `audit/README.md` | Updated — newest at top (descending). |

## Summary
Removed the “Members Management / Admin workspace • role:admin” header and the two filters the user flagged: **gender** and **perPage (10 default)** — now only `search` + `status` remain, `perPage` fixed to 10, table still shows Gender. Added **Sonner** `Toaster` on the **right side** (`position="top-right" richColors closeButton expand` in `App.jsx`) and wired `toast.success/error` for Members create/update/delete (right-side popups). Fixed **image 422** (`photo: {}` + `Photo must be an image`) caused by `api.js` default `Content-Type: application/json` overriding `FormData` boundary and strict `image` rule rejecting valid PNGs (e.g., `image/x-png`, heic-renamed) — now deletes `Content-Type` for `FormData` and validates `file|mimes:jpeg,jpg,png,webp|max:5MB` with client-side `size >5MB`/`type` check. Verified `migrate:fresh` 25 members, `POST /members` with 1x1 PNG `CURLFile` → 201 `photo: photos/...`, `GET /members?search=Photo` → 1, `npm run build` ✓ 540kB.

## Notes
- **Filters**: Backend still supports `gender`/`per_page` but UI no longer exposes them; change `const perPage = 10` to state if you need user-selectable again.
- **Toast**: `sonner` `top-right` is right side as requested; `expand` shows multiple toasts; `richColors` matches charge/teal theme.
