# FitPay — ERD & SQL Schema

**DB:** MySQL 8 / InnoDB `utf8mb4_unicode_ci` · **Timezone:** `Asia/Manila` (`APP_TIMEZONE`) · **Generated:** 2026-09-08 from `backend/database/migrations`

Import the full SQL at **`fitpay/schema.sql`** (run `mysql -u root -p < schema.sql` or `php artisan migrate`) or paste **`fitpay/schema.dbml`** at [dbdiagram.io](https://dbdiagram.io/d) for an interactive ERD.

---

## Mermaid ERD (GitHub / GitLab preview)

```mermaid
erDiagram
    users ||--o| members : "1 ── 1 (members.user_id → users.id)"
    users ||--o{ membership_requests : "1 ── N"
    users ||--o{ memberships : "1 ── N"
    membership_requests ||--|| memberships : "1 ── 1 (memberships.membership_request_id → membership_requests.id)"
    users ||--o{ payments : "1 ── N"
    memberships ||--o{ payments : "1 ── N (payments.membership_id → memberships.id)"
    members ||--o{ attendances : "1 ── N"
    users ||--o{ attendances : "1 ── N (nullable)"
    users ||--o{ sessions : "1 ── N"

    users {
        bigint id PK
        varchar name
        varchar email UK
        timestamp email_verified_at
        varchar password
        enum role "admin|member"
        enum status "active|inactive"
        varchar photo "storage/photos"
        varchar remember_token
        timestamp created_at
        timestamp updated_at
    }
    members {
        bigint id PK
        varchar member_code UK "MEM-0001"
        bigint user_id FK
        varchar phone
        varchar address
        date birthdate
        enum gender "male|female|other"
        enum status "active|inactive|expired"
        timestamp created_at
        timestamp updated_at
    }
    membership_requests {
        bigint id PK
        bigint user_id FK
        enum plan_type "daily|monthly|yearly"
        decimal amount "10,2"
        varchar reference_number
        varchar receipt_path "storage/receipts"
        enum status "pending|approved|rejected"
        text admin_note
        timestamp created_at
        timestamp updated_at
    }
    memberships {
        bigint id PK
        bigint user_id FK
        bigint membership_request_id FK
        date start_date "Manila today"
        date end_date "Manila +plan"
        enum status "active|expired"
        timestamp created_at
        timestamp updated_at
    }
    payments {
        bigint id PK
        bigint user_id FK
        bigint membership_id FK
        decimal amount "10,2"
        timestamp created_at
        timestamp updated_at
    }
    attendances {
        bigint id PK
        bigint member_id FK
        bigint user_id FK "nullable"
        date attendance_date "Manila Y-m-d, UK(member_id, date)"
        time check_in "Manila H:i:s"
        time check_out "Manila H:i:s"
        text remarks
        timestamp created_at
        timestamp updated_at
    }
    sessions {
        varchar id PK
        bigint user_id FK
        varchar ip_address
        text user_agent
        longtext payload
        int last_activity
    }
    password_reset_tokens {
        varchar email PK
        varchar token
        timestamp created_at
    }
```

### How the 3 payment tables link (the “approved by default” flow)

```
membership_requests (pending) ──admin approves──> memberships (active, start today Manila, end +plan)
        │                                              │
        │ 1 ── 1 (memberships.membership_request_id)    │ 1 ── N
        └──────────────────────────────────────────────┘
                              │
                              ▼
                          payments (user_id, membership_id, amount)
```

**`POST /api/payments` (admin)** in `PaymentController@store` does all three in one `DB::transaction`:
`MembershipRequest(approved)` → `Membership(active)` → `Member.status=active` → `Payment`.  
If `membership_id` is supplied, it just links the payment to the existing membership (verifies `user_id` matches).

### Quick import

```bash
# from fitpay/
mysql -u root -p -e "CREATE DATABASE fitpaydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p fitpaydb < schema.sql
php artisan storage:link   # for /storage receipt/photo URLs
php artisan migrate --seed # seeds admin@fitpay.test / member@fitpay.test (password) + 24 members
```

See **`schema.dbml`** for dbdiagram.io and **`schema.sql`** for MySQL Workbench / `phpMyAdmin` → *Import* → ERD auto-layout.

---

## Table counts / seed

- `admin@fitpay.test` (admin) + `member@fitpay.test` (member/MEM-0001) + 24 factory members
- All `members.status` defaults `active`, `memberships.status` `active`, `membership_requests.status` `pending`
