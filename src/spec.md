# Specification

## Summary
**Goal:** Add a predefined item catalog with fixed prices to the calculator so users can quickly add common items to the cart/line items.

**Planned changes:**
- Add a new catalog section on the main calculator page showing predefined item names and their fixed unit prices.
- Provide an “Add” action per catalog item that inserts a new line item row with label and unit price prefilled and a default quantity (e.g., 1).
- Add a simple search/filter input to quickly find catalog items by name.
- Ensure catalog prices use the app’s existing currency formatting and the new UI remains responsive across mobile/desktop layouts.

**User-visible outcome:** Users can browse or search a predefined list of items and add them to the cart with one click, immediately updating subtotal and total using the existing calculation logic.
