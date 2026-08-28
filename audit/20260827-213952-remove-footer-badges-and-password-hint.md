# Audit: Remove Footer Badges & Password Hint

**Date**: 2026-08-27 21:39:52
**Task**: Gym-ready Mobile-first Secure JWT remove this / remove this password: password

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Auth/Login.jsx` | **Edited** — removed footer `Gym-ready | Mobile-first | Secure JWT` (`flex items-center justify-center gap-4 pt-2 text-[11px] border-t`) and removed demo password hint `password: password` (`<p>password: <span>password</span></p>`). Demo admin/member buttons retained. Cleaned imports (removed `Trophy, Flame, Activity, Users, Zap` already, kept `ShieldCheck, User`). |
| `frontend/src/pages/Auth/Register.jsx` | **Edited** — removed footer `Free to start | Encrypted` (`flex items-center justify-center gap-3 pt-2 border-t` with `Sparkles`/`ShieldCheck`). Login parity: no footer badges. Removed unused imports `Sparkles, ShieldCheck` (kept `Dumbbell, Eye, EyeOff, Loader2, AlertCircle`). |
| `audit/20260827-213952-remove-footer-badges-and-password-hint.md` | This audit log |
| `audit/README.md` | **Updated** — added newest audit at top (descending) |

## Summary
Removed the small footer badge rows and the demo password caption per user request. Login previously showed `Gym-ready • Mobile-first • Secure JWT` + `password: password` below demo buttons; Register showed `Free to start • Encrypted`. Both footers and the `password: password` hint are now gone — cards end at “No account? Create one” / “Already have an account? Sign in” with no extra badge row. Demo buttons still fill `password` implicitly on click, but the plaintext hint is no longer displayed. Build verified: `vite build` ✓ 1991 modules, 464kB JS (was 465k), 70.2kB CSS.

## Notes
- **Demo still works**: `fillDemo("admin"/"member")` still sets `password` to `password` in state, just not shown. User can still click Admin/Member to autofill.
- **No backend change**: Auth still expects `password` `password` for seeded accounts.
- **Imports cleaned**: `Login` kept `ShieldCheck, User` for demo buttons; `Register` removed `Sparkles, ShieldCheck` (footer only). Unused icon tree-shaking reduced JS slightly.
