# AGENTS.md — FitPay (Laravel + React)

Monorepo `fitpay/` — **not** a single Inertia app. Backend is decoupled JWT JSON API, frontend is Vite SPA with `react-router-dom` + `axios`. Docs mention `Inertia` (`FITPAY-SPEC.md §18/23`) but code does **not** use it — do not add it.

## Structure
- `backend/` — Laravel 12, PHP ^8.2, `tymon/jwt-auth`. Routes: `routes/api.php`. Controllers: `app/Http/Controllers/Api/` (`Auth`, `Admin/*`, `Member/*`, `MembershipRequest`, `Profile`). Models: `app/Models/` (`User` JWTSubject, `Member`, `Membership`, `MembershipRequest`, `Payment`, `Attendance`).
- `frontend/` — React 19 JSX, Vite 8, Tailwind v4 (`@tailwindcss/vite`), shadcn `new-york` JSX, `lucide-react`, `react-router-dom`. Entrypoints: `src/main.jsx`, `src/App.jsx` (role-prefixed `/admin/*` + `/member/*` with redirects), `src/lib/api.js`. Alias `@/*` → `src/*` (`jsconfig.json` + `vite.config.js`).
- `design.md` / `themes.md` / `src/index.css` / `schema.sql` + `schema.dbml` — design system + DB source of truth. `FITPAY-SPEC.md` — full functional spec / API contract.
- `audit/` — timestamped logs `YYYYMMDD-HHMMSS-<slug>.md` + `audit/README.md` newest-first (mandatory after every task).

## Setup & Commands

### Backend (`backend/`)
```bash
composer install
copy .env.example .env        # or cp .env.example .env
php artisan key:generate
php artisan jwt:secret        # fills JWT_SECRET (already set in committed .env)
php artisan migrate           # requires MySQL per .env.example (DB_CONNECTION=mysql) — tests use sqlite :memory:
php artisan storage:link      # required for receipt/photo /storage URLs
php artisan serve             # → http://localhost:8000
composer dev                  # concurrently: serve + queue:listen --tries=1 + npm run dev (frontend)
composer test                 # artisan config:clear + artisan test
./vendor/bin/pint             # formatter (laravel/pint)
./vendor/bin/pest --filter=Name  # single test; phpunit.xml forces sqlite :memory:
```
`composer setup` runs `install` + `key:generate` + `migrate --force` + `npm install` + `npm run build`.

### Frontend (`frontend/`)
```bash
npm install
cp .env.example .env
npm run dev     # → http://localhost:5173, proxies /api + /storage to VITE_API_URL
npm run build   # vite build (verify: ~2215 modules)
npm run lint    # oxlint (not eslint)
npx shadcn@latest add <component>  # JSX, style new-york, css src/index.css, iconLibrary lucide
```

## Env & Auth (gotchas)
- Backend `.env`: `APP_URL=http://localhost:8000`, `APP_TIMEZONE=Asia/Manila` (config `app.timezone` defaults to `Asia/Manila` — attendance `today()`/`now()` must use `Carbon::today('Asia/Manila')`/`Carbon::now('Asia/Manila')`), `FRONTEND_URL=http://localhost:5173`, `JWT_SECRET`, `JWT_TTL=60`, `JWT_REFRESH_TTL=20160`, `JWT_ALGO=HS256`. Frontend `.env`: `VITE_API_URL=http://localhost:8000/api` (must end with `/api`), `VITE_APP_URL=http://localhost:5173`.
- Auth guard is `api` driver `jwt` (`config/auth.php`). Login `POST /api/login` → Bearer token. Frontend stores `fitpay_token` + `fitpay_user` in `localStorage`; `src/lib/api.js` injects `Authorization: Bearer` and deletes `Content-Type` for `FormData`, and clears storage on 401. `GET /api/me`, `POST /api/logout|refresh`.
- Roles via `role` middleware: `admin` / `member`. Member dashboard `GET /dashboard/member` returns `latest_request` + `current_plan` (expiry/progress computed in Manila time). Admin routes under `role:admin` (`/members` apiResource, `/membership-requests` index/show/update, `POST /payments` creates `membership_requests(approved)` → `memberships(active)` → `payments` in one `DB::transaction`). Member store `POST /membership-requests` expects `plan_type daily|monthly|yearly`, `amount`, `reference_number`, `receipt` (image jpeg/png/jpg/webp ≤5MB → `storage/app/public/receipts`).
- Photos: `User.photo` + `Member.photo` accessors return `/storage/...`; frontend `vite.config.js` proxies `/storage` to backend base URL. Always ensure `storage:link` exists.

## Backend Conventions
- Routes in `routes/api.php` with `apiResource` + route model binding. Controllers return JSON with `data` wrapper (Resources). Validation via Form Requests (when present) — do not inline in controllers.
- Member create/update is 3-step wizard `Account → Member → Security` (user cols `name/email/password/photo` → member cols `phone/address/birthdate/gender/status` → `password` last). `StoreMemberRequest` requires `password` (`required_without:user_id`), `UpdateMemberRequest` optional.
- `boost.json` enables skills: `infer-conventions`, `laravel-best-practices`, `testing-best-practices`, `tailwindcss-development`.

## Frontend Conventions
- **Mobile-first mandatory**: base = 375px, then `sm:`/`md:`/`lg:` (`flex-col md:flex-row`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, `p-4 sm:p-6`, `text-sm sm:text-base`). No fixed pixel containers (`container mx-auto`, `w-full`, `min-w-0`). Tables: `overflow-x-auto` wrapper or card stack (`hidden sm:block` / `sm:hidden`). Modals: `Dialog` defaults to `max-h-[min(88vh,640px)] overflow-y-auto` with thin styled scrollbar; nav hamburger via `Sheet`. Touch targets `min-h-11`/`h-11` large consistent, no horizontal scroll — verify at 375px & 320px (`break-words`, `min-w-0`).
- Tailwind v4 via `@tailwindcss/vite` — **no `tailwind.config.js`**; tokens live in `src/index.css` (`@theme inline`, `:root` CSS vars). Use `bg-[var(--charge-500)]` etc., not hardcoded hex.
- shadcn config: `components.json` — `tsx: false`, `style: new-york`, `baseColor: neutral`, `cssVariables: true`, `iconLibrary: lucide`, `css: src/index.css`.
- Icons: `lucide-react` only. No emoji/inline SVGs where a lucide exists.
- API base from `import.meta.env.VITE_API_URL`, never hardcoded. QR on member side is static unified GCash payload (`0002010102112783...`), not per-plan dynamic.

## Design Tokens (`src/index.css` / `themes.md`)
`--charge-500 #0F766E` primary, `--charge-600 #115E59` hover, `--charge-100 #CCFBF1`, `--grow-500 #1E8E5A` success, `--grow-100 #DFF5E9`, `--ink-900 #1A1D1F`, `--ink-600 #5B6168`, `--ink-300 #E1E4E8`, `--surface-0 #F7F7F5` bg, `--surface-1 #FFFFFF` card. Status pills: pending `#B8790A` on `#FEF3C7`/`#FCEFD6`, approved/active `#1E8E5A` on `#DFF5E9`, rejected `#C43D3D` on `#FBE2E2`, inactive `#5B6168` on `#EDEEF0`. Fonts: `Space Grotesk` display/tabuluar-nums, `Inter` body.

## Testing
- Pest 3 + `pest-plugin-laravel` (`tests/Pest.php` extends `Tests\TestCase`, `Feature` lacks `RefreshDatabase` by default — add `->use(RefreshDatabase::class)` per-file if needed). `phpunit.xml` forces `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `CACHE_STORE=array`, `QUEUE_CONNECTION=sync`, `BCRYPT_ROUNDS=4`. No external services needed. Run single: `php artisan test --filter=TestName` / `./vendor/bin/pest --filter=TestName`.

## References
- Spec: `FITPAY-SPEC.md` (FR-01..08, ERD, API table). Design: `design.md` + `themes.md` (token→Tailwind). DB: `schema.sql` / `schema.dbml` / `ERD.md`. Frontend docs: `frontend/README.md`. `backend/boost.json` for skill routing.
