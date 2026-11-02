# Audit: Reports — Date + “This Month” Filter on Combined Report

**Date**: 2026-11-02 12:53:56 +08:00
**Task**: add the date and this month filter

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Http/Controllers/Api/Admin/ReportController.php` | `membersReport()` now accepts `from` / `to` and filters rows by **membership period overlap** of the latest membership: includes a member when `start_date <= To` and `end_date >= From`; members with no membership are excluded while a range is active. Status filtering (`active`/`expired`/`no_plan`) is applied after the range filter, and summary counts reflect the combined filters. |
| `frontend/src/pages/Admin/Reports.jsx` | Restored date controls on the combined report: `mode` state (`month`/`all`/`custom`), `getCurrentMonthRange()` (Asia/Manila), defaulting to the current month. Filter card now has **Range** segmented (`This month` / `All time`) + **From/To** date inputs (disabled in All time) + **Status**; controls auto-refetch (page reset to 1) and `from > to` triggers a toast instead of a request. Hero and applied-filter chips show range + status; helper text explains the overlap rule. `handleExport` sends `from`/`to`; the landscape PDF header/meta now include the range (`Range: … • Status: …`) and slim continuation header shows both. |
| `audit/20261102-125356-reports-date-this-month-filter.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
The combined Members & Memberships report has date filtering again: it defaults to the current month, offers `This month` / `All time` shortcuts, and accepts a custom `From`/`To`. A member appears when their latest membership period overlaps the range; status filtering still applies on top. The landscape PDF includes the range.

## Verification (live API, admin JWT, port 8129)
| Query | Rows | Total | Summary |
|---|---|---|---|
| no dates (all time) | 15 | 36 | active 1 · expired 4 · no_plan 31 |
| `2026-11-01 → 2026-11-30` | 1 | 1 | active 1 |
| `2026-09-01 → 2026-09-30` | 4 | 4 | expired 4 |
| `2026-09-01 → 2026-09-30` + `expired` | 4 | 4 | expired 4 |
| `2026-09-01 → 2026-09-30` + `no_plan` | 0 | 0 | — (no-plan members have no period to overlap) |
| `2026-10-01 → 2026-10-31` | 4 | 4 | expired 4 |

- `php -l` clean; `vite build` ✓ 2215 modules; oxlint only the two pre-existing effect warnings.
- Temp server on port 8129 stopped.

## Notes
- Range filtering uses the **latest** membership per member (the one displayed in the table); earlier memberships don’t qualify a row.
- `no_plan` rows only appear in All time mode, since they have no period.
- PDF still fetches up to 5000 filtered rows for the selected range/status.
