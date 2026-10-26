# Audit: Payments Create — Remove Redundant Headers

**Date**: 2026-09-03 20:55:18 +08:00
**Task**: Add Payment Admin workspace Add Payment Create payment + membership + request (approved) in one go. All 3 tables linked. redundant

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Admin/Payments/Create.jsx` | Removed redundant outer header `<h1>Add Payment</h1>` + `<p>Create payment + membership + request (approved) in one go. All 3 tables linked.</p>` (was duplicated with `AdminLayout`’s automatic `Add Payment / Admin workspace` header and inner `Will create` card). Removed inner `Will create` card `New membership + approved request + payment / 3 tables linked: membership_requests(approved) → memberships(active) → payments` (was repeating step 2 logic). Removed inner `New Payment` `CreditCard` icon + `New Payment` title + `Step X of 3` description from `CardHeader` (was duplicating outer `Add Payment`). Kept single `AdminLayout title="Add Payment"` as page title + single back link `Back to payments` `variant=ghost size=sm gap-1.5 -ml-1 w-fit` above Card, and kept stepper + form. Page now has one `Add Payment` (from layout) + stepper, no duplicate `Add Payment`/`New Payment`/`Create payment…` text. |
| `audit/20260903-205518-payments-create-remove-redundant.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
De-duplicated `Add Payment` page: `AdminLayout` already shows `Add Payment / Admin workspace`, so removed inner `<h1>Add Payment</h1>` + description `Create payment + membership + request (approved) in one go. All 3 tables linked.` and inner `Will create` 3-tables card and inner `New Payment` title. Now single header from layout + Card with stepper only, no repeating “Add Payment / Create payment…” copy.

## Notes
- Kept `Back to payments` ghost button for navigation (was outline icon `size-9` with `Add Payment` h1 — now text link).
- Card still `max-h-[min(88vh,720px)]` styled thin scrollbar, `h-11` large inputs.
- If no header wanted from layout, change `AdminLayout title` to excluded list (e.g. `title="Payments"`), but kept `Add Payment` for layout consistency.
