-- =============================================================================
-- FitPay — Full SQL Schema (MySQL 8 / InnoDB / utf8mb4)
-- Generated from Laravel migrations (2026-09-08) for ERD tools
-- Import: mysql -u root -p < schema.sql  or  php artisan migrate
-- ERD: Import this file in MySQL Workbench / dbdiagram.io (via DBML) / draw.io
-- Timezone: Asia/Manila (APP_TIMEZONE=Asia/Manila)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 1) users — auth (JWT), role-based (admin/member)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `attendances`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `memberships`;
DROP TABLE IF EXISTS `membership_requests`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','member') NOT NULL DEFAULT 'member' COMMENT 'admin = owner, member = gym client',
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `photo` VARCHAR(255) NULL COMMENT 'storage/photos/... (users.photo)',
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2) password_reset_tokens + sessions (Laravel auth scaffolding)
-- ---------------------------------------------------------------------------
CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3) cache / cache_locks + jobs (framework)
-- ---------------------------------------------------------------------------
CREATE TABLE `cache` (
  `key` VARCHAR(255) NOT NULL,
  `value` MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache_locks` (
  `key` VARCHAR(255) NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: older Laravel cache_locks has 3 cols; this dump uses 3.

CREATE TABLE `jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL,
  `reserved_at` INT UNSIGNED NULL,
  `available_at` INT UNSIGNED NOT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_batches` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `total_jobs` INT NOT NULL,
  `pending_jobs` INT NOT NULL,
  `failed_jobs` INT NOT NULL,
  `failed_job_ids` LONGTEXT NOT NULL,
  `options` MEDIUMTEXT NULL,
  `cancelled_at` INT NULL,
  `created_at` INT NOT NULL,
  `finished_at` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `failed_jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(255) NOT NULL,
  `connection` TEXT NOT NULL,
  `queue` TEXT NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `exception` LONGTEXT NOT NULL,
  `failed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4) members — extended profile for users with role=member
--     1:1 with users (members.user_id → users.id)
-- ---------------------------------------------------------------------------
CREATE TABLE `members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_code` VARCHAR(255) NOT NULL COMMENT 'MEM-0001 auto-generated (Member::generateMemberCode)',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `phone` VARCHAR(255) NULL,
  `address` VARCHAR(255) NULL COMMENT 'Laravel migration uses string(255), app allows 500 via validation',
  `birthdate` DATE NULL,
  `gender` ENUM('male','female','other') NULL,
  `status` ENUM('active','inactive','expired') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `members_member_code_unique` (`member_code`),
  KEY `members_member_code_index` (`member_code`),
  KEY `members_status_index` (`status`),
  KEY `members_user_id_foreign` (`user_id`),
  CONSTRAINT `members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5) membership_requests — member submits plan + payment receipt (pending → approved/rejected)
--     N:1 with users
-- ---------------------------------------------------------------------------
CREATE TABLE `membership_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `plan_type` ENUM('daily','monthly','yearly') NOT NULL COMMENT 'daily=₱25, monthly=₱300, yearly=₱2000',
  `amount` DECIMAL(10,2) NOT NULL,
  `reference_number` VARCHAR(255) NOT NULL,
  `receipt_path` VARCHAR(255) NOT NULL COMMENT 'storage/app/public/receipts/...',
  `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `membership_requests_status_index` (`status`),
  KEY `membership_requests_plan_type_index` (`plan_type`),
  KEY `membership_requests_user_id_foreign` (`user_id`),
  CONSTRAINT `membership_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6) memberships — created when request is approved (1:1 with request)
--     N:1 with users, 1:1 with membership_requests
-- ---------------------------------------------------------------------------
CREATE TABLE `memberships` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `membership_request_id` BIGINT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL COMMENT 'Asia/Manila today on approval',
  `end_date` DATE NOT NULL COMMENT 'daily +1 day, monthly +1 month, yearly +1 year',
  `status` ENUM('active','expired') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `memberships_status_index` (`status`),
  KEY `memberships_user_id_status_index` (`user_id`,`status`),
  KEY `memberships_end_date_index` (`end_date`),
  KEY `memberships_user_id_foreign` (`user_id`),
  KEY `memberships_membership_request_id_foreign` (`membership_request_id`),
  CONSTRAINT `memberships_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `memberships_membership_request_id_foreign` FOREIGN KEY (`membership_request_id`) REFERENCES `membership_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7) payments — created when membership is activated (1:1 or 1:N with memberships)
--     N:1 with users, N:1 with memberships
-- ---------------------------------------------------------------------------
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `membership_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_user_id_index` (`user_id`),
  KEY `payments_membership_id_index` (`membership_id`),
  KEY `payments_user_id_foreign` (`user_id`),
  KEY `payments_membership_id_foreign` (`membership_id`),
  CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_membership_id_foreign` FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8) attendances — check-in / check-out per member per day (Manila time)
--     N:1 with members, N:1 with users (nullable)
-- ---------------------------------------------------------------------------
CREATE TABLE `attendances` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `attendance_date` DATE NOT NULL COMMENT 'Asia/Manila today (Y-m-d)',
  `check_in` TIME NULL COMMENT 'Asia/Manila H:i:s on check-in',
  `check_out` TIME NULL COMMENT 'Asia/Manila H:i:s on check-out',
  `remarks` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendances_member_id_attendance_date_unique` (`member_id`,`attendance_date`),
  KEY `attendances_attendance_date_index` (`attendance_date`),
  KEY `attendances_user_id_index` (`user_id`),
  KEY `attendances_member_id_foreign` (`member_id`),
  KEY `attendances_user_id_foreign` (`user_id`),
  CONSTRAINT `attendances_member_id_foreign` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- Seed helpers (optional)
-- =============================================================================
-- Admin (from DatabaseSeeder):
--   admin@fitpay.test / password / role admin / member_code n/a
-- Member:
--   member@fitpay.test / password / role member / member_code MEM-0001
--   + 24 factory members (Member::factory()->count(24))
-- Storage link required for receipt/photo URLs:
--   php artisan storage:link   →  /storage → storage/app/public

-- =============================================================================
-- ERD Summary (see ERD.md / schema.dbml)
-- =============================================================================
-- users 1 ── 1 members (members.user_id → users.id)
-- users 1 ── N membership_requests (membership_requests.user_id → users.id)
-- users 1 ── N memberships (memberships.user_id → users.id)
-- membership_requests 1 ── 1 memberships (memberships.membership_request_id → membership_requests.id)
-- users 1 ── N payments (payments.user_id → users.id)
-- memberships 1 ── N payments (payments.membership_id → memberships.id)
-- members 1 ── N attendances (attendances.member_id → members.id)
-- users 1 ── N attendances (attendances.user_id → users.id, nullable)
-- users 1 ── N sessions (sessions.user_id → users.id)
