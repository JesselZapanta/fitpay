# Audit: Reports — Explicit “All Time” Range Option

**Date**: 2026-11-01 19:43:55 +08:00
**Task**: there should be a report for all? no date filter

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/Reports.jsx` | Added `mode` state (`month` \| `all` \| `custom`). Filter card now starts with a segmented **Range** control: **This month** / **All time** (active pill `charge-500`). `handleThisMonth()` sets mode `month` + current-month dates and refetches; new `handleAllTime()` sets mode `all`, clears `from`/`to`, and refetches with no date params. Editing either date input switches mode to `custom` (shows a “Custom range” label). In `all` mode the date inputs are replaced by an **“All records — no date filter”** panel with its own Generate button; the filter-basis panel shows “No date filter — all members, memberships, payments and attendance records are included.” `Export PDF` moved into the card header row (full-width on mobile). Empty-state card now distinguishes all-time (“No records yet”) from a range (“No records in this range … switch to All time”). Hint text updated per mode. |
| `audit/20261101-194355-reports-all-time-option.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Reports page now has an explicit **All time** option with no date filter, alongside the default current month and custom ranges. Switching to All time immediately reloads the report with every member, membership, payment and attendance record; the PDF export header shows `Range: All time`.

## Verification
- Backend already supported no-date mode (`GET /api/reports?type=general` → 36 members / 8 memberships / 8 payments / 5 attendance on `fitpaydb`).
- `vite build` ✓ 2215 modules; oxlint only pre-existing warnings.
- No backend changes required.

## Notes
- Mode resets to `month` when pressing **This month**; any manual date edit becomes `custom`.
- Export PDF stays disabled when the current result set is empty.
