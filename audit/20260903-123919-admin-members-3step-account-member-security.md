# Audit: Admin Members 3-Step — Account → Member → Security

**Date**: 2026-09-03 12:39:19 +08:00
**Task**: 3 step, accout, member then security — admin http://localhost:5173/admin/members member form same as register (user col + member col)

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/Members.jsx` | **Reordered to 3-step Account → Member → Security** (was Account → Contact → Details with password in Account). `STEPS` changed `Contact/Phone, Details/Calendar` → `Member/Phone, Security/Lock` (now `Account(User), Member(Phone), Security(Lock)` matching Register `Account, Member, Security`). Moved `password`+`confirm` from `step 1 Account` to `step 3 Security` with `Lock` header, `h-11` large `Eye/EyeOff` toggle, `*` only for create (`!initial`), helper `Min. 8` / `Leave blank`. `step 1 Account` now only `photo + name* + email` (user col without password). `step 2 Member` now holds all member col fields in one step: `phone + address` `grid sm:grid-cols-2` + `birthdate + gender + status` `grid-cols-3` (was split Contact/Details). `validateStep` moved password check from `s===1` to `s===3` (required for create, optional for edit). Buttons still `h-11 w-32` right-aligned (`justify-end`). |
| `audit/20260903-123919-admin-members-3step-account-member-security.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Aligned admin member wizard to requested `3 step, account, member then security` — identical flow to Register: **Step 1 Account** = user (`photo`, `name*`, `email`), **Step 2 Member** = member (`phone`, `address`, `birthdate`, `gender`, `status`), **Step 3 Security** = user password (`password*`, `confirm*` with eye, `h-11` large). Previously password was in Account and member fields split Contact/Details; now consolidated Member step and password last. Large `h-11` + `w-32` right buttons + thin styled scrollbar preserved.

## Notes
- Backend `StoreMemberRequest`/`UpdateMemberRequest` already handle `password` (`required_without:user_id` + `confirmed` + min 8) and `MemberController` hashes — no change needed.
- Edit keeps password optional (blank = keep), create requires it (like `POST /api/register`).
- If admin wants email required, set `email` to `required_without:user_id` in `StoreMemberRequest`.
