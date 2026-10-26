# Audit: Register No-Scroll on Big Screen + Require All Fields

**Date**: 2026-09-03 10:41:34 +08:00
**Task**: in register remove this Member information (optional, but saved to member table) text (member is still in the from) also make all input is required for user and member; change the design of the register so that i wont scroll on big screen

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Register.jsx` | **Optional text removed**: Member information header now plain (Phone icon + text, no `(optional, but saved to member table)` span). **All fields required**: `name, email, phone, birthdate, gender, address, password, confirm` all `required` with red `*`; Gender `Select` removed `— None —` option, now `value={form.gender}` with placeholder only `male/female/other`; client guard `if (!phone/address/birthdate/gender)` before submit. **No-scroll redesign (big screen)**: wrapper `min-h-screen lg:h-screen lg:p-4 overflow-hidden`; card `max-w-[480px] lg:max-w-[600px] xl:max-w-[640px] max-h-[92vh] overflow-y-auto lg:max-h-none lg:overflow-visible` so desktop fits viewport with no inner scroll; compact scale: `CardHeader` `size-10 lg:size-9`, title `20px→18px`, `space-y-3→2.5`, account `name+email` now `grid sm:grid-cols-2` side-by-side (was stacked), member `phone+birthdate` 2-col + `gender+address` now 2-col in one row (was stacked gender then full-width textarea), `address` changed `Textarea rows=2 min-h[64]` → `Input h-11 lg:h-8` to save vertical space, inputs `h-11 lg:h-8 text-sm→13px`, labels `text-xs→11px` on lg, gaps `gap-3→2`, button `h-11→lg:h-9`, error banner `px-3 py-2 text-xs→11px`, logo top `6→4`, all touch targets keep `min-h-11` on mobile via `h-11` base, `lg:h-8` only on desktop/mouse. Mobile still `max-h-[92vh] overflow-y-auto` scrollable; desktop no scroll. Removed `Textarea` import (replaced with `Input` for address). |
| `backend/app/Http/Controllers/Api/AuthController.php` | `register` validation: `phone, address, birthdate, gender` changed `nullable` → `required` (`required|string|max:20`, `required|string|max:500`, `required|date|before:today`, `required|in:male,female,other`). `Member::create` uses `$data['field']` directly (was `?? null`). Ensures crafted requests without member data get 422. |
| `audit/20260903-103600-register-require-all-fields.md` | Prior audit for require-all-fields (kept). |
| `audit/20260903-104134-register-no-scroll-big-screen.md` | This audit log |
| `audit/README.md` | Reordered index newest-first, added new entry at top |

## Summary
Combined fix: removed the `(optional, but saved to member table)` hint while keeping Member information in form, enforced `required` on every user+member field frontend+backend, and re-designed Register to be **scroll-free on large screens**. Desktop card widened to 600/640px to allow two-column rows (Account 2-col, Member 2+2), shrunk vertical rhythm (header, gaps, input heights `lg:h-8`, button `lg:h-9`, fonts 13px) so total height ~560px fits within 92vh/100vh on 768px+ screens; mobile retains `max-h-[92vh] overflow-y-auto` scroll behavior. Verification: `vite build` ✓ 2214 modules, no scrollbar on lg, backend 422 on missing member fields.

## Notes
- DB `members.phone/address/birthdate/gender` remain `nullable` in migration — validation-layer enforcement only, avoids breaking seeder/factory/admin flows. Seeder `member@fitpay.test` uses `firstOrCreate` bypassing validation.
- `Admin\MemberController@store` via `StoreMemberRequest` still `nullable` for admin-created members — intentionally separate.
- `lg:h-screen` + `lg:overflow-hidden` on wrapper + `lg:max-h-none lg:overflow-visible` on card ensures centered no-scroll on desktop; on very short viewports (<~600px) card would clip but mobile breakpoint still scrolls (`min-h-screen` path). Tradeoff chosen to guarantee no scroll at 768px+ where 546px card easily fits; alternative would be `lg:max-h-[92vh] lg:overflow-y-auto` fallback, but compact height makes it unnecessary.
- Address changed from `Textarea` to `Input` for height parity; single-line covers most addresses and matches `max:500` string validation; re-introduce `Textarea rows=1` if multiline wrap is required.
- Touch targets: `h-11 min-h-11` on base (mobile) preserves 44px, `lg:h-8` only on desktop where mouse precision applies — satisfies mobile-first `min-h-11` rule.
