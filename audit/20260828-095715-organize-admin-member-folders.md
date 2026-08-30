# Audit: Organize Backend & Frontend into Admin/Member Folders

**Date**: 2026-08-28 09:57:15
**Task**: organize the file on backend and frontend, there should be admin and member folder for their specific module

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/MemberController.php` | **MOVED** from `Controllers/Api/MemberController.php` → namespace `Api\Admin`, imports `Admin\StoreMemberRequest`, `Admin\UpdateMemberRequest`, `Admin\MemberResource` |
| `backend/app/Http/Controllers/Api/Admin/DashboardController.php` | **NEW** (split from `DashboardController.php`) → single `__invoke()` method for admin stats, namespace `Api\Admin` |
| `backend/app/Http/Controllers/Api/Member/DashboardController.php` | **NEW** (split from `DashboardController.php`) → single `__invoke()` method for member schedule, namespace `Api\Member` |
| `backend/app/Http/Requests/Admin/StoreMemberRequest.php` | **MOVED** from `Requests/StoreMemberRequest.php` → namespace `Requests\Admin` |
| `backend/app/Http/Requests/Admin/UpdateMemberRequest.php` | **MOVED** from `Requests/UpdateMemberRequest.php` → namespace `Requests\Admin` |
| `backend/app/Http/Resources/Admin/MemberResource.php` | **MOVED** from `Resources/MemberResource.php` → namespace `Resources\Admin` |
| `backend/app/Http/Controllers/Api/AuthController.php` | Unchanged (shared) |
| `backend/app/Http/Controllers/Api/ProfileController.php` | Unchanged (shared) |
| `backend/app/Http/Requests/UpdateProfileRequest.php` | Unchanged (shared) |
| `backend/routes/api.php` | Updated imports: `Admin\DashboardController as AdminDashboardController`, `Admin\MemberController`, `Member\DashboardController as MemberDashboardController`; routes use `::class` for invokable controllers |
| `frontend/src/pages/Admin/Dashboard.jsx` | **MOVED** from `Dashboard/Admin.jsx` → import `@/components/Layout/Admin/AdminLayout` |
| `frontend/src/pages/Admin/Members.jsx` | **MOVED** from `Members/Index.jsx` → import `@/components/Layout/Admin/AdminLayout` |
| `frontend/src/pages/Member/Dashboard.jsx` | **MOVED** from `Dashboard/Member.jsx` → import `@/components/Layout/Member/MemberLayout` |
| `frontend/src/components/Layout/Admin/AdminLayout.jsx` | **MOVED** from `Layout/AdminLayout.jsx` (no import changes needed) |
| `frontend/src/components/Layout/Member/MemberLayout.jsx` | **MOVED** from `Layout/MemberLayout.jsx` (no import changes needed) |
| `frontend/src/pages/Profile/Index.jsx` | Updated imports to `@/components/Layout/Admin/AdminLayout` and `@/components/Layout/Member/MemberLayout` |
| `frontend/src/App.jsx` | Updated imports: `@/pages/Admin/Dashboard`, `@/pages/Member/Dashboard`, `@/pages/Admin/Members` |
| Old files deleted | `Controllers/Api/MemberController.php`, `Controllers/Api/DashboardController.php`, `Requests/StoreMemberRequest.php`, `Requests/UpdateMemberRequest.php`, `Resources/MemberResource.php`, `pages/Dashboard/Admin.jsx`, `pages/Dashboard/Member.jsx`, `pages/Dashboard/Index.jsx`, `pages/Members/Index.jsx`, `Layout/AdminLayout.jsx`, `Layout/MemberLayout.jsx` |

## Summary
Reorganized codebase into role-based folder structure:

**Backend:**
```
Controllers/Api/
├── AuthController.php          (shared)
├── ProfileController.php       (shared)
├── Admin/
│   ├── DashboardController.php (admin stats)
│   └── MemberController.php    (CRUD members)
└── Member/
    └── DashboardController.php (member schedule)

Requests/
├── UpdateProfileRequest.php    (shared)
└── Admin/
    ├── StoreMemberRequest.php
    └── UpdateMemberRequest.php

Resources/
└── Admin/
    └── MemberResource.php
```

**Frontend:**
```
pages/
├── Auth/         (shared: Login, Register)
├── Profile/      (shared)
├── Admin/
│   ├── Dashboard.jsx
│   └── Members.jsx
└── Member/
    └── Dashboard.jsx

components/Layout/
├── AppLayout.jsx       (shared)
├── Admin/
│   └── AdminLayout.jsx
└── Member/
    └── MemberLayout.jsx
```

## Notes
- DashboardController was split into two invokable controllers (`Admin\DashboardController::__invoke()` and `Member\DashboardController::__invoke()`) since each role has completely different dashboard logic
- Routes use `::class` syntax for invokable controllers: `AdminDashboardController::class`
- Shared controllers (`AuthController`, `ProfileController`) remain at `Controllers/Api/` root
- Build verified: `vite build` 557k js, 76k css ✓
- PHP syntax clean on all new files ✓
- `php artisan route:list` confirms all routes pointing to correct namespaced controllers ✓
