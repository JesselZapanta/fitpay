# Audit: Add QR Code Payment Dialog for Membership Plans

**Date**: 2026-08-28 20:43:35
**Task**: if i click on the btn there should be a qr code that pops up for the payment

## Files Changed
| File | Changes |
|------|---------|
| `frontend/package.json` | Added `qrcode.react` dependency |
| `frontend/src/pages/Member/Membership.jsx` | Added `PaymentQRDialog` component with QR code, GCash number copy, payment summary; wired all "Get Plan" buttons to open dialog |

## Summary
Clicking any "Get Plan" button now opens a payment QR dialog:

```
┌─────────────────────────┐
│  ▓▓ Gradient Header ▓▓  │
│  Monthly Plan           │
│  ₱300 / per month       │
├─────────────────────────┤
│      ┌───────────┐      │
│      │  QR CODE  │      │
│      │  (180px)  │      │
│      └───────────┘      │
│                         │
│  Or send via GCash      │
│  ┌─────────────────┐    │
│  │ 📋 09123456789  │    │
│  └─────────────────┘    │
│                         │
│  Amount   ₱300          │
│  Plan     Monthly Plan  │
│  Reference MON-xxxxx    │
│                         │
│  ⏱ Activated in 5 min  │
└─────────────────────────┘
```

## Notes
- QR encodes `FITPAY|MONTHLY|300|{timestamp}`
- GCash number copyable via clipboard
- Reference number: `{PLAN_ID}-{timestamp}`
- Dialog uses gradient header matching plan color
- Build verified: `vite build` 591k js, 78k css ✓
