# Audit: Member QR Unified GCash Payload

**Date**: 2026-09-13 20:24:44 +08:00
**Task**: check the qr code on member side, i want you to change the content of the 3 qr codes with this 00020101021127830012com.p2pqrpay0111GXCHPHM2XXX02089996440303152170200000006560417DWQM4TK3JDO66TLWS5204601653036085802PH5911E** CA*L A.6006Maloro610412346304E8B3

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/pages/Member/Membership.jsx` | `PaymentQRDialog`: replaced dynamic `paymentData = FITPAY|${plan.id.toUpperCase()}|${plan.amount}|${Date.now()}` with unified static GCash EMV payload `00020101021127830012com.p2pqrpay0111GXCHPHM2XXX02089996440303152170200000006560417DWQM4TK3JDO66TLWS5204601653036085802PH5911E** CA*L A.6006Maloro610412346304E8B3` for all 3 plans (daily/monthly/yearly). `QRCodeSVG` now renders same QR for any plan; `gcashNumber` display stays `09123456789`. |
| `audit/20260913-202444-member-qr-unified-gcash.md` | This audit log |
| `audit/README.md` | Re-indexed newest-first |

## Summary
Member `PaymentQRDialog` previously generated per-plan `FITPAY|PLAN|AMOUNT|timestamp`. Now all 3 plan QRs (Daily/Monthly/Yearly) encode the single GCash P2P payload supplied by user. Same `QRCodeSVG` value for any `plan`, gradient/price UI still varies per plan but QR content is unified. Build verified `vite build` ✓ 2215 modules.

## Notes
- Payload kept verbatim including space `E** CA*L A.` (EMV merchant name) and masked `**`/`XXX` as provided. If GCash updates the real merchant ID, replace the string in `PaymentQRDialog` `paymentData` constant.
- `gcashNumber` display not changed; if it should match QR-embedded `0111GXCHPHM2XXX...`, update `gcashNumber` constant alongside `paymentData`.
- QR size 180 / level M unchanged — long payload (~132 chars) still fits. If scan fails on low-res devices, bump `size` to 200 or `level` to `Q`.
