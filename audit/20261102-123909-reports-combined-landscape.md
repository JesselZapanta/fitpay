# Audit: Reports — Single Combined Members + Memberships Report (Landscape PDF)

**Date**: 2026-11-02 12:39:09 +08:00
**Task**: i think members and membership is just 1 report — combined this 1 table only (make the report landscape) member information, then the membership, add the start and end (period), and the plan, amount ref, status

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | `membersReport()` rewritten as the combined report. Loads members with `user` plus one grouped memberships query (`Membership::with('membershipRequest')->orderBy('end_date')->groupBy('user_id')`), then builds rows with member info (`member_code`, `name`, `email`, `phone`, `gender`, `birthdate`, `member_status`, `created_at`) **and** the latest membership (`membership_id`, `start_date`, `end_date`, `plan_type`, `plan_label`, `amount`, `reference_number`, computed `status` = `active` / `expired` / `no_plan` as of today Asia/Manila). `status` (or `membership_status`) filters by membership status — `active`, `expired`, `no_plan`; summary returns `{total, active, expired, no_plan}`. Manual `LengthAwarePaginator` on the filtered collection so the computed status can be filtered/sorted. `search` still supported. |
| `frontend/src/pages/Admin/Reports.jsx` | Rewritten as **one combined report** (no report-type switcher). Single table columns: **Member code · Member (name+email) · Phone · Period (start → end) · Plan · Amount · Reference · Status**. KPI cards: Members / Active / Expired / No plan. One **Status** select (All / Active / Expired / No plan) that refetches immediately; pagination 15/page. **PDF is landscape A4** with branded header, 4 KPI cards, and the single combined table (8 columns, status colouring, repeating header, page footer); export fetches up to 5000 filtered rows so the PDF covers the whole dataset (`fitpay-members-report-<date>.pdf`). |
| `audit/20261102-123909-reports-combined-landscape.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Members and memberships are now a single report and a single table, with member info alongside the latest membership period, plan, amount, reference and status. The exported PDF is landscape to fit all eight columns.

## Verification (live API, admin JWT, port 8128)
| Status filter | Rows | Total | Summary |
|---|---|---|---|
| all | 15 | 36 | `{total:36, active:1, expired:4, no_plan:31}` |
| active | 1 | 1 | `{total:1, active:1}` |
| expired | 4 | 4 | `{total:4, expired:4}` |
| no_plan | 15 | 31 | `{total:31, no_plan:31}` |

Sample row: `MEM-0037 · carl abadilla · 09452212505 · 2026-09-08 → 2026-10-08 · Monthly Plan · 300.00 · 7689479 · expired`.

- Landscape PDF layout exercised headlessly (8 columns, 120 rows → 5 pages, no API errors).
- `php -l` clean; `vite build` ✓ 2215 modules; oxlint only the two pre-existing effect warnings.

## Notes
- “Active” is evaluated against today in Asia/Manila; members without a membership are reported as `No plan`.
- Backend still exposes the old `memberships`, `payments`, `attendance`, `general`, `consolidated` report types for API consumers; the UI now uses `type=members` only.
- PDF export forces `per_page=5000` so it is not limited to the on-screen page.
