# Audit: Add Membership Payment Submission with Receipt Upload

**Date**: 2026-08-28 21:00:32
**Task**: after payment, add a btn for membership, that allow user to send the receipt, input reference and receipt (status is pending by default it needs admin approval)

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_08_28_125141_create_membership_requests_table.php` | **NEW** — membership_requests table: user_id, plan_type, amount, reference_number, receipt_path, status (pending/approved/rejected), admin_note |
| `backend/app/Models/MembershipRequest.php` | **NEW** — model with user relationship, receipt_url accessor |
| `backend/app/Http/Controllers/Api/MembershipRequestController.php` | **NEW** — store (member submit), index (admin list), update (admin approve/reject) |
| `backend/routes/api.php` | Added routes: POST `/membership-requests` (member), GET + PUT `/membership-requests` (admin) |
| `frontend/src/pages/Member/Membership.jsx` | Added "Submit Payment" button to QR dialog → opens PaymentSubmitDialog with reference input + receipt upload + success state |

## Summary

### Flow
1. Member clicks "Get Plan" → QR code dialog opens
2. Member clicks "Submit Payment" → receipt upload dialog opens
3. Member enters reference number + uploads receipt image → submits
4. Status is `pending` by default → admin reviews and approves/rejects
5. Success state shows "Waiting for admin approval" with status badge

### Backend
- **Migration**: `membership_requests` table with foreign key to users, plan_type enum, amount, reference_number, receipt_path, status enum
- **Model**: `MembershipRequest` with user() BelongsTo, receipt_url accessor via Storage disk
- **Controller**: `store()` validates + stores receipt on `public/receipts` disk, `index()` paginated list with status filter, `update()` approve/reject with admin_note
- **Routes**: member can POST, admin can GET + PUT

### Frontend
- **PaymentQRDialog**: Added "Submit Payment" button with ArrowRight icon
- **PaymentSubmitDialog**: Reference number input, receipt file upload with preview, submit → API call → success state with pending status badge

## Notes
- Receipt stored on `public` disk at `receipts/` path
- Status enum: pending → approved/rejected
- Build verified: `vite build` 598k js, 81k css ✓
