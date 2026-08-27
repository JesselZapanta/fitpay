# FitPay: Charge and Grow — Gym Management System

## Manuscript Scan & Full-Stack Development Specification

> **Source Document:** `Final Revised Manuscript (1).docx` (1,947,688 bytes)  
> **Scan Date:** 2026-08-27  
> **Scanned From:** `D:\Downloads\Final Revised Manuscript (1).docx`  
> **Original Contents:** 585 paragraphs, 19 tables, 23 figures (diagrams), 3 appendices  
> **Project Folder:** `D:\Jessel Zapanta\CODES\LARAVEL_REACT_INERTIA\fitpay\`  
> **Status:** Empty scaffold — ready for `Laravel + React (Inertia) + Tailwind + shadcn/ui` implementation  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Background & Problem Statement](#2-background--problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Scope and Delimitation](#4-scope-and-delimitation)
5. [System Overview](#5-system-overview)
6. [Actors & Roles](#6-actors--roles)
7. [Functional Requirements (FR-01 to FR-08)](#7-functional-requirements-fr-01-to-fr-08)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Hardware & Software Specifications](#9-hardware--software-specifications)
10. [Design Pattern Traceability Matrix](#10-design-pattern-traceability-matrix)
11. [System Architecture](#11-system-architecture)
12. [Data Flow Diagrams (DFD)](#12-data-flow-diagrams-dfd)
13. [Use Case Model](#13-use-case-model)
14. [Sequence Diagrams](#14-sequence-diagrams)
15. [Activity Diagrams](#15-activity-diagrams)
16. [Entity-Relationship Diagram (ERD) & Database Design](#16-entity-relationship-diagram-erd--database-design)
17. [API Design (Laravel REST)](#17-api-design-laravel-rest)
18. [Frontend — Pages & Components (React + Inertia)](#18-frontend--pages--components-react--inertia)
19. [Validation & Business Rules](#19-validation--business-rules)
20. [Reporting Module](#20-reporting-module)
21. [SDLC — Waterfall Model](#21-sdlc--waterfall-model)
22. [Preliminary Schedule & Budget](#22-preliminary-schedule--budget)
23. [Implementation Notes — Manuscript Tech vs Proposed Stack](#23-implementation-notes--manuscript-tech-vs-proposed-stack)
24. [Definition of Terms](#24-definition-of-terms)
25. [References](#25-references)
26. [Development Checklist](#26-development-checklist)
27. [Appendix — Full Table Dumps](#27-appendix--full-table-dumps)

---

## 1. Executive Summary

**FitPay: Charge and Grow Gym Management System** is a **centralized, web-based platform** for small-scale / local fitness centers. It replaces manual logbooks and scattered spreadsheets with a single database that manages:

- Gym **member records** (CRUD)
- **Membership plans** — monthly & annual — with expiration tracking
- **Payment** processing & monitoring (paid / unpaid / expired)
- **Attendance** (check-in / check-out / history)
- **Dashboard** — consolidated KPIs
- **Reports** — generated / exported from stored data

Access is **admin-only** via secure login. All features share one centralized database. The manuscript explicitly marks the system as *small-gym scope* and *requires survey/interview validation* before adding any unconfirmed processes.

> **Purpose of this MD:** This file is a faithful scan + structured extraction of the Final Revised Manuscript, reorganized as an actionable dev spec for building the app with **Laravel (API) + React (Inertia/JSX) + Tailwind + shadcn/ui**. It preserves every requirement, diagram narrative, and table from the manuscript so you can implement without reopening the `.docx`.

---

## 2. Background & Problem Statement

### Existing Process (Manual / Semi-Digital)

- Member info recorded in **logbooks or spreadsheets**
- Payments and attendance recorded **separately** — no central link
- Reports prepared by **manual review** of scattered records

### Pain Points

| Problem | Impact |
|---------|--------|
| Inaccurate / incomplete records | Data integrity risk |
| Difficulty monitoring payment & membership status | Revenue leakage, expired members undetected |
| Repetitive manual work | Staff time wasted |
| No centralization | Hard to search, update, consolidate |

### Proposed Solution

FitPay centralizes all four domains (members, memberships, payments, attendance) around one database, adds validation on every write, provides dashboard & report generation, and restricts access to authenticated admin users. The design is grounded in MIS literature (Laudon & Laudon 2020; O'Brien & Marakas 2011) and SE lifecycle principles (Pressman & Maxim 2020; Sommerville 2016).

---

## 3. Project Objectives

### General Objective

> Develop **FitPay: Charge and Grow Gym Management System** as a centralized platform for managing gym member records, membership information, payments, attendance, and reports in an organized, accurate, and efficient manner.

### Specific Objectives

1. Develop a centralized system for **gym member registration and record management**.
2. Implement **management and tracking of monthly and annual membership payments**.
3. **Monitor membership information and expiration status**.
4. **Record and manage gym attendance** efficiently.
5. Provide a **dashboard** that summarizes important gym information.
6. **Generate accurate reports** for operational and financial monitoring.
7. Provide **authorized administrative access with secure login authentication**.

---

## 4. Scope and Delimitation

### Project Scope (IN)

- Member registration, viewing, updating, deletion
- Monthly & annual membership management
- Processing & monitoring membership payment records
- Recording & viewing gym attendance records
- Dashboard for summarized system information
- Generation & export of reports from stored data
- Secure admin login and controlled access
- Centralized storage & retrieval of all records

### Project Delimitation (OUT — v1)

- **Small-scale / local fitness centers only** (not enterprise chains)
- **Admin-only access** — no self-service member portal in this revision
- **No separate mobile app** (web-based only in this phase)
- **No long-term deployment / post-implementation evaluation** — dev + basic testing only
- **No unconfirmed gym processes** — anything not validated via planned survey/interview is excluded as a final requirement

> **Requirement elicitation note:** Interviews, observation, and document analysis are planned. Findings will be used to validate existing requirements and decide whether extra processes are added. Unconfirmed requirements are **not final** until validated.

---

## 5. System Overview

```
                 ┌─────────────────────────────────────┐
                 │           FITPAY SYSTEM             │
  Admin ──Login─▶│  Member Mgmt  Membership Mgmt      │◀── all read/write ──┐
                 │  Payment Proc  Payment Monitor     │                     │
                 │  Attendance    Dashboard           │              ┌──────┴──────┐
                 │  Report Gen                        │─────────────▶│  DATABASE   │
                 └─────────────────────────────────────┘              │ Members     │
                        ▲  dashboard, lists, receipts                 │ Memberships │
                        │  reports, no-data messages                  │ Plans       │
                        └─────────────────────────────────────────────│ Payments    │
                                                                      │ Attendance  │
                                                                      │ Users       │
                                                                      └─────────────┘
```

- **Primary actor:** Admin (single role in v1)
- **Core principle:** Every module reads/writes the same centralized DB — no isolated spreadsheets.
- **Validation:** Every create/update is validated before saving.
- **Target users:** Non-technical gym staff — UI must be simple, no advanced training required.

---

## 6. Actors & Roles

| Actor | Description | Access |
|-------|-------------|--------|
| **Admin** | Authorized gym administrator / staff. Manages all modules. | Full — all 8 use cases |

> Future roles (Member self-service, Staff limited, Owner analytics) are **not in scope** for this revision — see Delimitation.

---

## 7. Functional Requirements (FR-01 to FR-08)

> Direct basis for Use Case, Sequence, and Activity diagrams. Each FR lists inputs, processing, and expected outputs as documented in the manuscript.

### FR-01 — Login

| Item | Detail |
|------|--------|
| **ID** | FR-01 |
| **Name** | Login |
| **Input** | `username`, `password` |
| **Processing** | Validate credentials against stored authorized account(s). Create authenticated session on success. |
| **Output (valid)** | Grant access → redirect to Dashboard |
| **Output (invalid)** | Error message → return to credential entry |
| **Post-condition** | Admin authenticated and can access protected functions |

### FR-02 — Manage Members

| Item | Detail |
|------|--------|
| **ID** | FR-02 |
| **Name** | Manage Members |
| **Input** | New member info OR selected existing record + action (`Add` / `Update` / `Delete` / `View`) |
| **Processing** | Display member list → selected operation → validate (add/update) → create/update/delete/retrieve via DB |
| **Output** | Updated member list or member details; error + correction loop on invalid/incomplete input |
| **Includes** | `Add Member`, `Update Member`, `Delete Member`, `View Member Details` via `<<include>>` |

### FR-03 — Process Payment

| Item | Detail |
|------|--------|
| **ID** | FR-03 |
| **Name** | Process Payment |
| **Input** | Selected registered member + payment details (amount, plan, method, date) |
| **Processing** | Validate payment info → store transaction in DB |
| **Output** | Success: payment result / receipt. Failure: error → correct & resubmit |
| **Distinction** | FR-03 **creates** a transaction; FR-04 **reviews** existing ones |

### FR-04 — Monitor Payments

| Item | Detail |
|------|--------|
| **ID** | FR-04 |
| **Name** | Monitor Payments |
| **Input** | Optional search / filter criteria (member name, date, status) |
| **Processing** | Retrieve matching payment records from DB |
| **Output** | Matching list **or** `no-data` message. No DB mutation. |
| **Read-only** | Yes |

### FR-05 — Manage Memberships

| Item | Detail |
|------|--------|
| **ID** | FR-05 |
| **Name** | Manage Memberships (Plans) |
| **Input** | Plan details for add/update; selected plan for delete/view |
| **Processing** | View existing plans → selected operation → validate (add/update) → persist |
| **Output** | Updated plan list or plan details |
| **Includes** | `Add Membership Plan`, `Update Membership Plan`, `Delete Membership Plan`, `View Membership Plan` |

### FR-06 — Record Attendance

| Item | Detail |
|------|--------|
| **ID** | FR-06 |
| **Name** | Record Attendance |
| **Input** | Selected registered member + action (`Check-In` / `Check-Out` / `View History`) |
| **Processing** | Store new attendance record OR retrieve history from DB |
| **Output** | Updated attendance record or attendance history; error on invalid member/action |

### FR-07 — View Dashboard

| Item | Detail |
|------|--------|
| **ID** | FR-07 |
| **Name** | View Dashboard |
| **Input** | Dashboard open request (implicit: admin session) |
| **Processing** | Query & aggregate member, payment, attendance, and related summary data from DB → process into dashboard view |
| **Output** | Consolidated summary cards / charts; error + retry on load failure |

### FR-08 — Generate Reports

| Item | Detail |
|------|--------|
| **ID** | FR-08 |
| **Name** | Generate Reports |
| **Input** | Report type + criteria/filters (e.g., date range, membership type) |
| **Processing** | Validate selection → retrieve required records → process → generate report |
| **Output** | Report displayed **or exported** (PDF/Excel/CSV per implementation). Invalid selection → error → re-select |

**Full manuscript wording preserved in Appendix — Table 0.**

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Respond to normal user actions within **~3 seconds** under expected load |
| **Security** | Secure admin authentication; restrict all functions to authorized users |
| **Usability** | Simple, understandable UI — operable with minimal training |
| **Reliability** | Consistent processing/storage; minimize failures during normal operation |
| **Availability** | Accessible during intended operating periods; maintenance in controlled windows |
| **Maintainability** | Allow future updates/corrections/enhancements without full redevelopment |
| **Compatibility** | Operate in supported web/app environment and platform identified in specs |
| **Data Integrity** | Member / membership / payment / attendance records stay accurate & consistent |
| **Backup & Recovery** | Appropriate backup/recovery procedures during implementation |

---

## 9. Hardware & Software Specifications

*(Manuscript Table — exact values)*

| Category | Specification | Purpose |
|----------|---------------|---------|
| Hardware | Intel Core i3 or equivalent | Normal dev & operation |
| Hardware | ≥ 4 GB RAM | App execution & dev tools |
| Hardware | 500 GB HDD or 128 GB SSD | Software, DB, project files |
| Hardware | Monitor, keyboard, mouse | User interaction |
| Software | Windows 10 or higher | OS environment |
| Software | **Dart + Flutter framework** | Dev technology per manuscript |
| Software | Visual Studio Code | Dev environment |
| Software | SQLite **or** MySQL | Data storage |
| Software | Google Chrome or compatible browser | Testing / browser access |

> **Adaptation note for this repo:** The `fitpay/` folder lives under `LARAVEL_REACT_INERTIA`, so this spec maps the manuscript's Flutter/SQLite design to **Laravel 11 + React (Inertia/JSX) + MySQL/SQLite** — see §23.

---

## 10. Design Pattern Traceability Matrix

*Per manuscript format — verify against final source code during review.*

| Functional Req | Design Pattern | Purpose | Application in System | Justification |
|----------------|----------------|---------|-----------------------|---------------|
| **FR-01 Login** | MVC; Singleton | MVC separates interface & auth flow; Singleton ensures single session manager | Login interface, auth controller/service, session manager | Organized auth, no duplicate session instances |
| **FR-02 Manage Members** | MVC; Repository | MVC separates interface/processing; Repository centralizes data access | Member interface, member service/controller, Member Repository | Separation of concerns, centralized DB ops |
| **FR-03 Process Payment** | MVC; Repository | Separate payment UI/processing; centralize transaction storage | Payment interface, payment service/controller, Payment Repository | Maintainable payment flow, consistent storage |
| **FR-04 Monitor Payments** | MVC; Repository | Organize search/filter interaction; Repository handles retrieval | Payment monitoring interface, Payment Repository | Organized retrieval, DRY DB logic |
| **FR-05 Manage Memberships** | MVC; Repository | Separate membership UI/processing; centralize data access | Membership interface, Membership Repository | Maintainable plan operations |
| **FR-06 Record Attendance** | MVC; Repository | Separate attendance UI/processing; Repository for records | Attendance interface, Attendance Repository | Consistent attendance storage/retrieval |
| **FR-07 View Dashboard** | MVC; Repository | Separate dashboard presentation/processing; repos for aggregates | Dashboard interface, data-access components | Modular dashboard, organized summary retrieval |
| **FR-08 Generate Reports** | MVC; Repository | Separate report presentation/processing; repos provide data | Report interface, report service, data repos | Maintainable report gen, data reuse |

**Laravel mapping:** MVC → Controllers/Resources; Repository → Eloquent Repositories/Services; Singleton → `Auth` / session service binding.

---

## 11. System Architecture

### Manuscript Architecture (as documented)

- **Participants (Sequence):** `Admin` → `FitPay System` → `Database` (3 participants, consistent across all sequence diagrams)
- **Style:** Centralized DB; each FR interacts with DB for store/retrieve
- **Validation:** System validates before every write

### Proposed Implementation Architecture (for this repo)

```
React (Inertia/JSX)  ←→  Laravel Controllers  ←→  Services / Repositories  ←→  Eloquent Models  ←→  MySQL
   Tailwind + shadcn/ui        API Resources             Form Requests / Policies
```

- **Frontend:** `React (JSX)` + `Inertia` + `Tailwind CSS` + `shadcn/ui` + `lucide-react`
- **Backend:** `Laravel` REST/JSON API — `routes/api.php`, `app/Http/Controllers`, `app/Models`, `app/Http/Resources`, `app/Http/Requests`
- **Auth:** Laravel `Auth` (sanctum/session), middleware protects all `/admin` routes
- **DB:** MySQL (or SQLite for dev) — migrations in `database/migrations`

---

## 12. Data Flow Diagrams (DFD)

### Figure 4 — Current System (Manual/Semi-Digital)

```
Gym Admin/Staff ── member/payment/attendance info ──▶  Manual Records
                                                        (logbooks, spreadsheets)
Admin/Staff ◀── manual review & retrieval ◀────────────  Manual Records
Admin/Staff ──▶  prepares required reports  ──────────  (from scattered records)
```

- Highlights **separate** recording/retrieval, difficulty updating/searching/consolidating.

### Figure 5 — Proposed System (FitPay Centralized)

```
Admin ── Login / Member / Membership / Payment / Attendance / Report inputs ──▶ FitPay System
FitPay System ◀── store / retrieve ──▶  Centralized Database
FitPay System ── outputs (saved records, payment info, attendance, dashboard, reports) ──▶ Admin
```

- All major functions share the same centralized data — single source of truth.

---

## 13. Use Case Model

### Figure 6 — Use Case Diagram (Admin as sole actor)

**8 Major Use Cases (direct association with Admin):**

1. Login
2. Manage Members
3. Process Payment
4. Monitor Payments
5. Manage Memberships
6. Record Attendance
7. View Dashboard
8. Generate Reports

**`<<include>>` Decomposition:**

```
Manage Members ──<<include>>──▶ Add Member
               ──<<include>>──▶ Update Member
               ──<<include>>──▶ Delete Member
               ──<<include>>──▶ View Member Details

Manage Memberships ──<<include>>──▶ Add Membership Plan
                   ──<<include>>──▶ Update Membership Plan
                   ──<<include>>──▶ Delete Membership Plan
                   ──<<include>>──▶ View Membership Plan
```

### Use Case Descriptions (Tables 1–16)

#### Table 1 — Login

| Field | Detail |
|-------|--------|
| Actor | Admin |
| Description | Access FitPay with valid credentials |
| Pre-condition | Registered authorized account exists |
| Assumptions | Admin has authorized account |
| Normal Flow | 1. Open login page → 2. Enter username/password → 3. Submit → 4. System validates → 5. Grant access & open dashboard |
| Alternative | Invalid credentials → error → re-enter |
| Post-condition | Authenticated, can access protected functions |

#### Table 2 — Manage Members

| Field | Detail |
|-------|--------|
| Actor | Admin |
| Normal Flow | 1. Open Manage Members → 2. Display list → 3. Select Add/Update/Delete/View → 4. Provide/select info → 5. Validate (add/update) → 6. Perform operation → 7. Display result |
| Alternative | Incomplete/invalid info → error → correct & resubmit |

#### Table 3 — Process Payment

| Field | Detail |
|-------|--------|
| Pre-condition | Logged in + member exists |
| Normal Flow | 1. Open payment module → 2. Select member → 3. Enter details → 4. Validate → 5. Store transaction → 6. Display receipt/output |
| Alternative | Invalid/incomplete → error → correct |

#### Table 4 — Monitor Payments

| Field | Detail |
|-------|--------|
| Normal Flow | 1. Open Monitor Payments → 2. Display records → 3. Enter search/filter → 4. Retrieve → 5. Display matching |
| Alternative | No match → `no-data` message → change criteria |
| Post-condition | Records reviewed, no mutation |

#### Table 5 — Manage Memberships

| Field | Detail |
|-------|--------|
| Normal Flow | 1. Open Membership Management → 2. Display plans → 3. Select Add/Update/Delete/View → 4. Provide/select info → 5. Validate (add/update) → 6. Perform → 7. Display result |

#### Table 6 — Record Attendance

| Field | Detail |
|-------|--------|
| Pre-condition | Logged in + member registered |
| Normal Flow | 1. Open Attendance → 2. Select member → 3. Select Check-In / Check-Out / View History → 4. Store or retrieve → 5. Display |
| Alternative | Invalid member/info → error → correct |

#### Table 7 — View Dashboard

| Field | Detail |
|-------|--------|
| Normal Flow | 1. Open dashboard → 2. System requests summary data → 3. DB returns member/payment/attendance aggregates → 4. Process → 5. Display summary |
| Alternative | Load failed → error → retry |

#### Table 8 — Generate Reports

| Field | Detail |
|-------|--------|
| Normal Flow | 1. Open Reports → 2. Select type → 3. Enter criteria → 4. Validate → 5. Retrieve records → 6. Process & generate → 7. View/export |
| Alternative | Invalid type/criteria → error → re-select |

#### Tables 9–16 — Included Sub-Use Cases

| Use Case | Action | Key Flow |
|----------|--------|----------|
| **Add Member** | Create new member | Select Add → enter info → validate → save → show updated list |
| **Update Member** | Edit existing | Select member → edit → validate → save → show updated |
| **Delete Member** | Remove | Select record → delete → update list |
| **View Member Details** | Display | Select record → retrieve → display; not found → error |
| **Add Membership Plan** | Create plan | Enter details → validate → save → show updated plans |
| **Update Membership Plan** | Edit plan | Select plan → edit → validate → save |
| **Delete Membership Plan** | Remove plan | Select → delete → update list |
| **View Membership Plan** | Display plan | Select → retrieve → display; not found → error |

> Every <<include>> case requires **Admin logged in**; add/update require **validation** before persistence.

---

## 14. Sequence Diagrams

> **Participants (all diagrams):** `Admin` (actor) → `FitPay System` (processing) → `Database` (storage). Messages top-to-bottom in time order.

#### Figure 7 — Login Sequence

`Admin submits username/password` → Interface forwards to Auth process → Auth queries DB → DB returns validation → [valid] create session → redirect Dashboard; [invalid] → error to login UI.

#### Figure 8 — Manage Members Sequence

`Admin opens module` → System requests records → DB returns list → display → Admin chooses operation → [change] validate → send create/update/delete → DB confirms → display updated info.

#### Figure 9 — Process Payment Sequence

`Admin selects member + enters payment` → System validates → send to DB → DB stores & confirms → display receipt/output. Invalid → error.

#### Figure 10 — Monitor Payments Sequence

`Admin opens monitoring` → display records + filter controls → Admin submits criteria → System queries DB → DB returns matches → display; no match → `no-data`.

#### Figure 11 — Manage Memberships Sequence

`Admin opens membership management` → System retrieves plans → display → Admin selects operation → [add/update] validate → send to DB → confirm → display updated plans.

#### Figure 12 — Record Attendance Sequence

`Admin opens attendance + selects member` → choose Check-In / Check-Out / View History → [check-in/out] store in DB; [history] query DB → DB returns confirmation/history → display.

#### Figure 13 — View Dashboard Sequence

`Admin requests dashboard` → System requests aggregates (members, payments, attendance, etc.) → DB returns data → System processes → present consolidated summary. Failure → error + retry.

#### Figure 14 — Generate Reports Sequence

`Admin selects report type + criteria` → System → data-access process → query DB → DB returns records → System processes per report type → display/export. Invalid → error.

---

## 15. Activity Diagrams

> Conventions (per manuscript revision): Start node → action nodes → decision diamonds with **`[guard]` labels beside the outgoing flows** (not inside diamond) → merge nodes where alternatives rejoin → end node. No fork/join bars for ordinary choices — only decision/merge.

#### Figure 15 — Login Activity

`Enter username/password` → `Validate credentials` → Decision: `[valid]` → Open Dashboard → End; `[invalid]` → Display error → loop to entry.

#### Figure 16 — Manage Members Activity

`Open module + display list` → Decision `Select Operation` → branches: Add / Update / Delete / View → Add & Update: `Validate` → `[invalid]` correct loop; `[valid]` → `Save Changes` → Merge → End. Delete/View go directly to Merge → End. Merge reunites exclusive choices.

#### Figure 17 — Process Payment Activity

`Open module → Select member → Enter details` → `Validate` → `[invalid]` → back to entry; `[valid]` → `Save payment` → Display receipt → End.

#### Figure 18 — Monitor Payments Activity

`Open monitoring → View records → Enter criteria → Search` → Decision: `Matches exist?` `[yes]` → Display matching; `[no]` → `no-data` message → Merge → End.

#### Figure 19 — Manage Memberships Activity

`Open & view plans` → Decision branches: Add / Update / Delete / View → Add/Update via `Validate` with invalid loop → Save; Delete/View direct → Merge → End.

#### Figure 20 — Record Attendance Activity

`Open attendance → Select member` → Decision: `Check-In` / `Check-Out` / `View History` → Check-in/out → Save record; History → Retrieve & display → Merge → End.

#### Figure 21 — View Dashboard Activity

`Open dashboard → Load summary data` → Decision: `Loaded?` `[yes]` → Display summary → End; `[no]` → Error → Retry → back to load.

#### Figure 22 — Generate Reports Activity

`Open Reports → Select type & criteria` → `Validate` → Decision: `[invalid]` → error → back to selection; `[valid]` → Retrieve data → Generate → Display/export → End.

---

## 16. Entity-Relationship Diagram (ERD) & Database Design

### Figure 23 — ERD (Logical)

> Exact attributes & final cardinalities to be verified against DB implementation + survey/interview results before deployment (per manuscript).

```
  ┌──────────────┐         ┌──────────────────┐
  │   MEMBER     │1      N │   ATTENDANCE     │
  │──────────────│─────────▶│──────────────────│
  │ PK member_id │         │ PK attendance_id │
  │    ...       │         │ FK member_id     │
  └──────┬───────┘         │    date/time     │
         │ 1               │    type (in/out) │
         │                 └──────────────────┘
         │ N
  ┌──────▼───────┐         ┌──────────────────┐
  │ MEMBERSHIP   │N      1 │ MEMBERSHIP_PLAN  │
  │──────────────│◀────────│──────────────────│
  │ PK membership_id        │ PK plan_id       │
  │ FK member_id │         │    name          │
  │ FK plan_id   │         │    duration      │
  └──────┬───────┘         │    price         │
         │ 1               └──────────────────┘
         │ N
  ┌──────▼───────┐
  │   PAYMENT    │
  │──────────────│
  │ PK payment_id│
  │ FK membership_id
  │    amount    │
  │    date      │
  │    status    │
  └──────────────┘
```

**Relationships (manuscript wording):**

- **Member (1) → Membership (N)** — a member can have many membership records
- **Member (1) → Attendance (N)** — each attendance row identifies one member
- **Membership Plan (1) → Membership (N)** — each membership uses a selected plan; a plan serves many memberships
- **Membership (1) → Payment (N)** — payments linked to a membership record

### Proposed Relational Schema (Laravel migrations)

> Maps ERD to Eloquent. Add to `database/migrations/` and validate against spec.

```php
// users — admin authentication (extends manuscript's admin concept)
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('username')->unique();
    $table->string('email')->unique()->nullable();
    $table->string('password');
    $table->rememberToken();
    $table->timestamps();
});

// membership_plans — monthly / annual templates
Schema::create('membership_plans', function (Blueprint $table) {
    $table->id();
    $table->string('name');               // e.g., Monthly, Annual
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->decimal('price', 10, 2);
    $table->enum('duration_type', ['monthly','annual','custom']);
    $table->integer('duration_days');     // 30, 365, etc.
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// members — gym members
Schema::create('members', function (Blueprint $table) {
    $table->id();
    $table->string('member_code')->unique(); // e.g., MEM-0001
    $table->string('first_name');
    $table->string('last_name');
    $table->string('email')->nullable();
    $table->string('phone')->nullable();
    $table->string('address')->nullable();
    $table->date('birthdate')->nullable();
    $table->enum('gender', ['male','female','other'])->nullable();
    $table->string('photo')->nullable();
    $table->enum('status', ['active','inactive','expired'])->default('active');
    $table->timestamps();
});

// memberships — links member to a plan + tracks expiration
Schema::create('memberships', function (Blueprint $table) {
    $table->id();
    $table->foreignId('member_id')->constrained()->cascadeOnDelete();
    $table->foreignId('membership_plan_id')->constrained()->cascadeOnDelete();
    $table->date('start_date');
    $table->date('end_date');             // = start_date + duration
    $table->enum('status', ['active','expired','cancelled'])->default('active');
    $table->timestamps();
});

// payments — linked to membership (per manuscript ERD)
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('membership_id')->constrained()->cascadeOnDelete();
    $table->foreignId('member_id')->constrained()->cascadeOnDelete(); // denormalize for quick monitor
    $table->decimal('amount', 10, 2);
    $table->date('payment_date');
    $table->string('payment_method')->default('cash'); // cash, gcash, bank, etc.
    $table->string('reference_no')->nullable();
    $table->enum('status', ['paid','pending','failed'])->default('paid');
    $table->text('remarks')->nullable();
    $table->timestamps();
});

// attendances — check-in / check-out / history
Schema::create('attendances', function (Blueprint $table) {
    $table->id();
    $table->foreignId('member_id')->constrained()->cascadeOnDelete();
    $table->date('attendance_date');
    $table->time('check_in')->nullable();
    $table->time('check_out')->nullable();
    $table->enum('type', ['check_in','check_out'])->default('check_in');
    $table->text('remarks')->nullable();
    $table->timestamps();
    $table->index(['member_id','attendance_date']);
});
```

**Key indexes & constraints to add:** unique `member_code`, composite `member_id + attendance_date` where needed, foreign keys with `cascadeOnDelete` for cleanup, and a scheduled job that marks `memberships` + `members` as `expired` when `end_date < today()`.

---

## 17. API Design (Laravel REST)

> Base URL from `.env` — e.g., `VITE_API_URL` or `APP_URL`. All routes protected by `auth` middleware except `POST /login`. JSON-only, `data` wrapper via API Resources.

| Method | Endpoint | Controller Action | Description | FR |
|--------|----------|-------------------|-------------|-----|
| POST | `/api/login` | `AuthController@login` | Authenticate admin, return token/session | FR-01 |
| POST | `/api/logout` | `AuthController@logout` | Invalidate session | FR-01 |
| GET | `/api/dashboard` | `DashboardController@index` | Aggregated stats (members, payments, attendance, recent) | FR-07 |
| **Members** | | | | FR-02 |
| GET | `/api/members` | `MemberController@index` | List + search/filter + pagination | FR-02 |
| POST | `/api/members` | `MemberController@store` | Create member | FR-02 |
| GET | `/api/members/{member}` | `MemberController@show` | Member details | FR-02 |
| PUT | `/api/members/{member}` | `MemberController@update` | Update member | FR-02 |
| DELETE | `/api/members/{member}` | `MemberController@destroy` | Delete member | FR-02 |
| **Membership Plans** | | | | FR-05 |
| GET | `/api/membership-plans` | `MembershipPlanController@index` | List plans | FR-05 |
| POST | `/api/membership-plans` | `MembershipPlanController@store` | Add plan | FR-05 |
| GET | `/api/membership-plans/{plan}` | `MembershipPlanController@show` | View plan | FR-05 |
| PUT | `/api/membership-plans/{plan}` | `MembershipPlanController@update` | Update plan | FR-05 |
| DELETE | `/api/membership-plans/{plan}` | `MembershipPlanController@destroy` | Delete plan | FR-05 |
| **Memberships** | | | | FR-05 |
| GET | `/api/memberships` | `MembershipController@index` | List memberships (join member+plan) | FR-05 |
| POST | `/api/memberships` | `MembershipController@store` | Assign plan to member | FR-05 |
| PUT | `/api/memberships/{membership}` | `MembershipController@update` | Extend/change plan | FR-05 |
| **Payments** | | | | FR-03/04 |
| POST | `/api/payments` | `PaymentController@store` | Process payment | FR-03 |
| GET | `/api/payments` | `PaymentController@index` | Monitor — search/filter (read-only) | FR-04 |
| GET | `/api/payments/{payment}` | `PaymentController@show` | Single payment receipt | FR-03 |
| **Attendance** | | | | FR-06 |
| POST | `/api/attendances/check-in` | `AttendanceController@checkIn` | Record check-in | FR-06 |
| POST | `/api/attendances/check-out` | `AttendanceController@checkOut` | Record check-out | FR-06 |
| GET | `/api/attendances` | `AttendanceController@index` | History + filter by member/date | FR-06 |
| **Reports** | | | | FR-08 |
| GET | `/api/reports/members` | `ReportController@members` | Member report by criteria | FR-08 |
| GET | `/api/reports/payments` | `ReportController@payments` | Payment/financial report | FR-08 |
| GET | `/api/reports/attendance` | `ReportController@attendance` | Attendance report | FR-08 |
| GET | `/api/reports/memberships` | `ReportController@memberships` | Membership/expiration report | FR-08 |

**Conventions to follow (Stack Rules):**

- Routes in `routes/api.php` — use `apiResource` + route model binding
- Controllers in `app/Http/Controllers`
- Models in `app/Models` with Eloquent relationships
- Resources in `app/Http/Resources` (wrap with `data`)
- Form Requests in `app/Http/Requests` for validation
- JSON-only responses, versioned if needed (`/api/v1/...`)

**Example Resource shape:**

```json
{
  "data": {
    "id": 1,
    "member_code": "MEM-0001",
    "name": "Juan Dela Cruz",
    "membership": { "plan": "Annual", "end_date": "2027-08-27", "status": "active" }
  }
}
```

---

## 18. Frontend — Pages & Components (React + Inertia)

> **Stack:** React (JSX), Inertia, Tailwind CSS, shadcn/ui, lucide-react. **Mobile-first is MANDATORY** — see guidelines at end.

### Screens (Per § Graphical User Interface in manuscript)

| Screen | Route (Inertia) | Purpose | Key shadcn/ui components |
|--------|-----------------|---------|--------------------------|
| **Login** | `/login` | username + password auth | `Card`, `Input`, `Button`, `Form`, `Alert` |
| **Dashboard** | `/dashboard` | Summary: total members, active/expired, today's attendance, revenue, recent payments, expiring soon | `Card`, `Badge`, `Table`, `Chart` (recharts), `Skeleton` |
| **Member Management** | `/members` | List + search, Add / Edit / Delete / View details | `Table` (with `overflow-x-auto` OR card stack on mobile), `Dialog`/`Drawer`, `Input`, `Select`, `Button`, `Badge` |
| **Membership Management** | `/membership-plans` | Plan list, Add / Edit / Delete / View | `Table`, `Dialog`, `Input`, `Form` |
| **Payment — Process** | `/payments/create` | Select member → enter amount/method → receipt | `Combobox` (member search), `Input`, `Select`, `Card`, `Button` |
| **Payment — Monitor** | `/payments` | Display records + search/filter, no-data state | `Table`, `Input` (search), `Select` (filters), `Badge` (status) |
| **Attendance** | `/attendance` | Select member → Check-In / Check-Out / View History | `Combobox`, `Button` (large touch targets `min-h-11`), `Table`, `Calendar` |
| **Reports** | `/reports` | Select type + criteria → display / export | `Select`, `Calendar` (date range), `Table`, `Button` (Export PDF/Excel) |

### Mobile-First Layout Rules (MANDATORY)

- Base = mobile (~375px). Add `sm:` / `md:` / `lg:` progressively. Never desktop-first.
- `flex-col md:flex-row`, `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, `p-4 sm:p-6`, `text-sm sm:text-base`
- Containers: `container mx-auto` + responsive padding — no fixed pixel widths
- Tables: `overflow-x-auto` wrapper OR card layout on mobile; `min-w-0` + `break-words` at 320px
- Modals: `Drawer` (bottom sheet) on mobile, `Dialog` on desktop; Sheets for nav hamburger at `md:`
- Touch targets: `min-h-11` (~44px), generous gap between tappables, primary actions in thumb zones (bottom)
- No horizontal scroll; verify at 375px and 320px in devtools

### Suggested Project Structure

```
fitpay/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/  (Auth, Member, MembershipPlan, Membership, Payment, Attendance, Dashboard, Report)
│   │   ├── Requests/         (StoreMemberRequest, UpdateMemberRequest, etc.)
│   │   └── Resources/        (MemberResource, PaymentResource, etc.)
│   └── Models/               (User, Member, MembershipPlan, Membership, Payment, Attendance)
├── database/migrations/
├── routes/api.php
├── resources/js/
│   ├── Pages/
│   │   ├── Auth/Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Members/Index.jsx + Create.jsx + Show.jsx + Edit.jsx
│   │   ├── MembershipPlans/Index.jsx
│   │   ├── Payments/Index.jsx + Create.jsx
│   │   ├── Attendance/Index.jsx
│   │   └── Reports/Index.jsx
│   ├── Components/
│   │   ├── ui/               (shadcn: button, card, dialog, drawer, table, input, etc.)
│   │   ├── Layout/AppLayout.jsx
│   │   ├── MemberCard.jsx    (mobile card vs desktop table row)
│   │   └── StatCard.jsx
│   ├── lib/api.js            (axios/fetch wrapper — read base URL from .env, no hardcoded URLs)
│   └── hooks/
└── .env                      (VITE_API_URL / APP_URL)
```

---

## 19. Validation & Business Rules

> Manuscript: "The system validates entered information before saving changes."

| Domain | Rules |
|--------|-------|
| **Login** | `username` required, `password` required; throttle failed attempts; hash with bcrypt |
| **Member** | `first_name`, `last_name` required; `email` valid + unique if present; `phone` unique if present; `member_code` auto-generated & unique |
| **Membership Plan** | `name` required + unique; `price` numeric ≥ 0; `duration_days` integer > 0; `duration_type` in enum |
| **Membership** | `member_id` must exist; `membership_plan_id` must exist; `start_date` ≤ `end_date`; auto-compute `end_date = start_date + plan.duration_days` if not supplied; status derived from dates |
| **Payment** | `membership_id` + `member_id` must exist & match; `amount` > 0; `payment_date` required; `payment_method` in allowed list; prevent duplicate reference_no |
| **Attendance** | `member_id` must exist; `attendance_date` required; `check_in` before `check_out` if both present; one active check-in at a time (optional rule: prevent double check-in without check-out) |
| **Reports** | `report_type` + criteria validated; date ranges coherent (`from` ≤ `to`) |

**Implementation:** Use **Form Requests** (`php artisan make:request`) — never validate in controllers directly. Return JSON `422` with `errors` object on failure.

---

## 20. Reporting Module

### Report Types (per FR-08 & manuscript)

- **Member Report** — list filtered by status, join date, membership type
- **Payment / Financial Report** — revenue by date range, per member, per plan
- **Attendance Report** — visits by member / date range, check-in/out aggregates
- **Membership / Expiration Report** — expiring soon, expired, active counts

### Criteria / Filters

- Date range (`from` / `to`), member search, membership plan, payment status, attendance date

### Output

- On-screen table + **export** (PDF, Excel, CSV — choose per implementation; manuscript says "displayed or exported according to the supported implementation")
- Suggested: `barryvdh/laravel-dompdf` for PDF, `maatwebsite/excel` for Excel

### UX

- `Reports` screen: `Select` (report type) → `Calendar` (date range) → `Button Generate` → `Table` preview → `Export` buttons. Validate before query; show `no-data` when no rows match.

---

## 21. SDLC — Waterfall Model

*Figure 1 in manuscript — strictly sequential:*

1. **Planning** — Identify gym operation problems (members, payments, attendance, reporting)
2. **Analysis** — Examine existing manual/semi-digital process, weaknesses, needs (observation + interviews)
3. **Design** — System structure, UI, DB interaction, flow → Use Case / Sequence / Activity / DFD / ERD
4. **Development** — Build per approved design & tech stack
5. **Testing** — Verify each function vs requirements; fix errors/inconsistencies; validate invalid-input handling & record consistency
6. **Implementation** — Deploy to intended environment; adjust per testing & feedback

> Waterfall = each phase completes before next begins. Requirements elicitation (interviews + surveys) is planned to confirm needs before finalizing requirements/diagrams.

---

## 22. Preliminary Schedule & Budget

> Manuscript references **Figure 2 (Budget)** and **Figure 3 (Schedule)** as images — no tabular data was extractable. Below is the intended structure; **replace with actual figures from manuscript images** before presenting.

### Schedule (suggested breakdown to map to Waterfall)

| Phase | Activities | Estimated Duration |
|-------|------------|--------------------|
| Requirements Gathering | Interviews, observation, document analysis | 2–3 weeks |
| Analysis & Design | DFD, Use Case, Sequence, Activity, ERD, UI mockups | 3–4 weeks |
| Development | Auth, Members, Memberships, Payments, Attendance, Dashboard, Reports | 6–8 weeks |
| Testing | Unit, integration, invalid-input & consistency tests | 2 weeks |
| Implementation | Deployment, UAT, adjustments | 1–2 weeks |

### Budget (categories to quantify)

| Item | Examples | Estimated Cost |
|------|----------|----------------|
| Hardware | Laptop/PC, peripherals | — |
| Software / Tools | VS Code, DB, hosting | — |
| Development | Labor / research | — |
| Documentation | Printing, binding | — |
| Contingency | 10% | — |

> **Action:** Screenshot or transcribe Figures 2 & 3 from the `.docx` into this section before final submission.

---

## 23. Implementation Notes — Manuscript Tech vs Proposed Stack

| Manuscript says | This repo (`fitpay/` under `LARAVEL_REACT_INERTIA`) proposes | Notes |
|-----------------|---------------------------------------------------------------|-------|
| **Dart + Flutter** | **Laravel (PHP) + React (JSX) via Inertia** | Manuscript targets Flutter; but folder location implies Laravel+React. Both are valid — if strict to manuscript, use Flutter + SQLite/MySQL. If using this folder, implement per Stack Rules in this spec. |
| **SQLite or MySQL** | **MySQL (prod) / SQLite (dev/test)** | Both supported; Laravel migrations handle either via `.env` |
| **VS Code** | **VS Code** | Same |
| **Windows 10+** | **Windows 10+** | Same |
| **Chrome** | **Chrome** | Same for testing |
| **Web-based** | **Web-based** | Same — responsive, mobile-first |

**Recommendation:** Keep the **data model, FRs, and diagram logic exactly as manuscript specifies**; only swap the tech layer. That way the thesis remains compliant and the actual build uses the modern Laravel+React stack your workspace expects.

If you must stay 100% faithful to the manuscript's Flutter requirement, create a separate `fitpay-flutter/` app and share the same DB/API contract documented in §17.

---

## 24. Definition of Terms

| Term | Definition |
|------|------------|
| **Admin** | Authorized user who manages the system — members, payments, reports |
| **Attendance Tracking** | Recording & monitoring member entry/visits |
| **Dashboard** | Interface showing summarized info — total members, payments, attendance |
| **Database** | Structured storage for all system data (members, transactions, etc.) |
| **FitPay System** | Proposed gym management system for memberships, payments, attendance on a centralized platform |
| **Flutter** | Framework for building UI (per manuscript) |
| **Gym Management System** | Digital system for member registration, payment tracking, attendance monitoring |
| **Login Authentication** | Verifying identity via username/password before access |
| **Member** | Registered individual enrolled in the gym |
| **Membership** | Subscription (monthly/annual) with duration & status |
| **Membership Expiration** | Date when subscription ends and needs renewal |
| **Payment Processing** | Recording/handling member payments for subscriptions |
| **Payment Monitoring** | Tracking payment status (paid / unpaid / expired) |
| **Report Generation** | Creating system-generated reports from stored data |
| **SQLite / MySQL** | Database systems for storage & management |
| **System Interface** | Visual part where users interact with features |
| **User-Friendly Interface** | Easy to use even with minimal technical knowledge |
| **Waterfall Model** | Sequential SDLC: planning → analysis → design → development → testing → implementation |

---

## 25. References

- Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner’s Approach* (9th ed.). McGraw-Hill. https://www.mheducation.com/highered/product/software-engineering-practitioner-s-approach-pressman-maxim/M9781259872976.html
- Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson. https://www.pearson.com/en-us/subject-catalog/p/software-engineering/P200000003480/9780133943030
- Laudon, K. C., & Laudon, J. P. (2020). *Management Information Systems: Managing the Digital Firm* (16th ed.). Pearson. https://www.pearson.com/en-us/subject-catalog/p/management-information-systems-managing-the-digital-firm/P200000003269/9780135192290
- O'Brien, J. A., & Marakas, G. M. (2011). *Management Information Systems* (10th ed.). McGraw-Hill. https://www.mheducation.com/highered/product/management-information-systems-obrien/M9780073376813.html
- Statista. (2023). *Fitness Industry Statistics.* https://www.statista.com/topics/1141/fitness/
- International Journal of Computer Applications. (2021). *Web-Based Management Systems for Small Businesses.* https://www.ijcaonline.org/archives/
- IEEE. (2020). *Web-Based Information Systems and Applications.* https://ieeexplore.ieee.org/

---

## 26. Development Checklist

> Use this as your build order. Check off as you ship each slice — all items trace back to an FR / diagram.

- [ ] **Scaffold** — `laravel new fitpay` + `inertia + react` + `tailwind` + `shadcn/ui` init; `.env` with `APP_URL` / `VITE_API_URL`
- [ ] **Auth (FR-01)** — `users` migration + `AuthController` + Login page + middleware + session/singleton pattern
- [ ] **Members (FR-02)** — migration + `Member` model/relations + `MemberController` + `MemberResource` + `Store/UpdateMemberRequest` + React CRUD pages (desktop table + mobile cards, `Dialog`/`Drawer`)
- [ ] **Membership Plans (FR-05)** — migration + model + controller + resource + plan CRUD
- [ ] **Memberships (FR-05 extension)** — `memberships` migration + assignment/renewal flow + expiration job/cron
- [ ] **Payments — Process (FR-03)** — migration + `Payment` model + `PaymentController@store` + React payment form + receipt view
- [ ] **Payments — Monitor (FR-04)** — `PaymentController@index` with search/filter + React monitor page + `no-data` state
- [ ] **Attendance (FR-06)** — migration + `Attendance` model + check-in/out endpoints + React attendance page + history table + large touch targets
- [ ] **Dashboard (FR-07)** — `DashboardController` aggregations (counts, revenue, today's attendance, expiring soon, recent lists) + React `StatCard`s + charts + skeletons + error/empty states
- [ ] **Reports (FR-08)** — `ReportController` + query per type/criteria + export (PDF/Excel) + React report UI with type select + criteria + preview + export
- [ ] **Validation coverage** — every write path uses Form Requests; test invalid/incomplete inputs per activity diagram alternative flows
- [ ] **Mobile-first QA** — verify every page at 375px & 320px; no horizontal scroll, `min-h-11` targets, thumb-zone primary actions
- [ ] **Testing** — per Waterfall testing phase: verify each FR vs use case / sequence / activity; record-consistency checks
- [ ] **Seed & Demo data** — factory for members, plans, memberships, payments, attendances
- [ ] **Transcribe Figures 2 & 3** — replace §22 placeholders with actual budget/schedule images or tables

---

## 27. Appendix — Full Table Dumps

> Verbatim extraction of all 19 tables from the `.docx` — preserved for audit traceability.

### Table 0 — Functional Requirements (Summary)

| ID | Functional Requirement | Detailed Description / Expected Behavior |
|----|------------------------|------------------------------------------|
| FR-01 | Login | Admin enters username and password. The system validates the credentials and either grants access to the dashboard or displays an error message. |
| FR-02 | Manage Members | Admin enters or updates member information and selects an action such as add, update, delete, or view. The system validates and stores the resulting member record. |
| FR-03 | Process Payment | Admin selects a member and enters payment information. The system validates the payment details, records the transaction, and provides a receipt or payment output. |
| FR-04 | Monitor Payments | Admin opens payment monitoring and may search or filter payment records. The system retrieves and displays matching payment information or a no-data message. |
| FR-05 | Manage Memberships | Admin manages membership plan information by adding, updating, deleting, or viewing plan details. The system validates and stores the changes. |
| FR-06 | Record Attendance | Admin selects a member and records the applicable attendance action, such as check-in or check-out, or views attendance history. The system stores or retrieves the attendance record. |
| FR-07 | View Dashboard | Admin opens the dashboard. The system retrieves summarized member, payment, attendance, and related information and displays the summary. |
| FR-08 | Generate Reports | Admin selects a report type and criteria. The system processes the stored data and displays or exports the generated report. |

### Table 1 — Design Pattern Traceability Matrix

| Functional Requirement | Design Pattern | Purpose | Application | Justification |
|------------------------|----------------|---------|-------------|---------------|
| FR-01 Login | MVC; Singleton | MVC separates interface/auth; Singleton single session manager | Login interface, auth controller/service, session manager | Organized auth, no duplicate session instances |
| FR-02 Manage Members | MVC; Repository | MVC separates UI/processing; Repository centralizes access | Member interface, service/controller, Member Repository | Separation of concerns, centralized DB ops |
| FR-03 Process Payment | MVC; Repository | Separate UI/processing; centralize storage | Payment interface, service/controller, Payment Repository | Maintainable payment flow |
| FR-04 Monitor Payments | MVC; Repository | Organize search/filter; Repository retrieval | Payment monitoring interface, Payment Repository | Organized retrieval, DRY |
| FR-05 Manage Memberships | MVC; Repository | Separate UI/processing; centralize access | Membership interface, Membership Repository | Maintainable plan ops |
| FR-06 Record Attendance | MVC; Repository | Separate UI/processing; handle records | Attendance interface, Attendance Repository | Consistent storage/retrieval |
| FR-07 View Dashboard | MVC; Repository | Separate presentation/processing; repos for aggregates | Dashboard interface, data-access | Modular dashboard |
| FR-08 Generate Reports | MVC; Repository | Separate presentation/processing; repos provide data | Report interface, service, repos | Maintainable report gen |

### Table 2 — Hardware & Software Specs

*See §9 — reproduced exactly.*

### Tables 3–10 — Use Case Descriptions (8 major)

| # | Use Case | Actor | Pre-condition | Normal Flow (condensed) | Alternative | Post-condition |
|---|----------|-------|---------------|-------------------------|-------------|----------------|
| 1 | Login | Admin | Registered account | Open login → enter creds → submit → validate → grant dashboard | Invalid → error → re-enter | Authenticated |
| 2 | Manage Members | Admin | Logged in | Open module → list → select Add/Update/Delete/View → provide/select → validate (add/update) → perform → display | Invalid → error → correct | Info added/updated/deleted/viewed |
| 3 | Process Payment | Admin | Logged in + member exists | Open payments → select member → enter details → validate → store → receipt | Invalid → error → correct | Transaction recorded |
| 4 | Monitor Payments | Admin | Logged in | Open monitor → display → search/filter → retrieve → display | No match → no-data → change criteria | Reviewed, no mutation |
| 5 | Manage Memberships | Admin | Logged in | Open mgmt → display plans → select op → provide/select → validate (add/update) → perform → display | Invalid → error → correct | Plan stored/updated/deleted/viewed |
| 6 | Record Attendance | Admin | Logged in + member registered | Open attendance → select member → Check-In/Out/View History → store/retrieve → display | Invalid → error → correct | Recorded/viewed |
| 7 | View Dashboard | Admin | Logged in | Open dashboard → request data → DB returns aggregates → process → display | Load fail → error → retry | Overview viewed |
| 8 | Generate Reports | Admin | Logged in | Open reports → select type → criteria → validate → retrieve → process → view/export | Invalid → error → re-select | Report generated |

### Tables 11–18 — Included Sub-Use Cases

| # | Use Case | Included by | Normal Flow | Alternative | Post-condition |
|---|----------|-------------|-------------|-------------|----------------|
| 9 | Add Member | Manage Members | Add → enter info → validate → save → updated list | Incomplete → error → correct | New record stored |
| 10 | Update Member | Manage Members | Select member → edit → validate → save → updated | Invalid → error → correct | Record updated |
| 11 | Delete Member | Manage Members | Select → delete → update list | Cannot process → error | Removed |
| 12 | View Member Details | Manage Members | Select → retrieve → display | Not found → error | Details shown |
| 13 | Add Membership Plan | Manage Memberships | Enter details → validate → save → updated list | Invalid → error → correct | Plan stored |
| 14 | Update Membership Plan | Manage Memberships | Select → edit → validate → save → updated | Invalid → error → correct | Plan updated |
| 15 | Delete Membership Plan | Manage Memberships | Select → delete → update list | Cannot process → error | Removed |
| 16 | View Membership Plan | Manage Memberships | Select → retrieve → display | Not found → error | Details shown |

---

## Scan Metadata

- **Extraction method:** `python-docx` (`Document.paragraphs` + `Document.tables`) + raw `word/document.xml` via `System.IO.Compression.ZipFile` for verification
- **Temp artifacts:** `C:\Users\User\AppData\Local\Temp\opencode\manuscript.txt` (65,247 chars), `full_text.txt` (9388 words, 483 lines), `doc.xml`
- **Source integrity:** Both `Final Revised Manuscript.docx` and `Final Revised Manuscript (1).docx` are identical (1,947,688 bytes)
- **Limitations:** Budget (Figure 2) and Schedule (Figure 3) are embedded images — not extractable as text; GUI screenshots (Figures 4–23) are diagrams/images — narratives transcribed from surrounding paragraphs

---

> **Next step:** Run `composer create-project laravel/laravel fitpay` (or scaffold inside this folder), install Inertia+React, then follow the Development Checklist (§26) in FR order. Keep this spec as `FITPAY-SPEC.md` at the project root — link it from `README.md` and update it when survey/interview validation adds or changes requirements.

