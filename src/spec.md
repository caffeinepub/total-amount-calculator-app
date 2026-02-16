# Specification

## Summary
**Goal:** Update the calculator to use Indian Rupees (₹/INR) and swap the predefined catalog to common Indian food items with basic runtime catalog management.

**Planned changes:**
- Change all currency formatting and currency-related labels from USD to INR (₹) across line totals and all subtotal/tax/discount/final total breakdown UI, including fixed-discount labels.
- Replace the existing predefined catalog items with a categorized list of common Indian food items (English names) with reasonable default unit prices in INR.
- Add UI controls to add new catalog items (name, unit price, optional category) and delete existing catalog items during runtime (no persistence required).
- Add an “Out of stock” toggle/status per catalog item and block/disable adding out-of-stock items to the cart/line items.

**User-visible outcome:** All prices display in ₹ (INR). Users see a catalog of common Indian foods, can add/delete catalog items during the session, and can mark items out of stock so they can’t be added to the calculator.
