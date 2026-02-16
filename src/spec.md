# Specification

## Summary
**Goal:** Prevent duplicate line items when adding the same catalog item multiple times by incrementing the existing line item quantity instead.

**Planned changes:**
- Update the Quick Add Items “Add” behavior to detect an existing matching line item by label (case-insensitive, trimmed) and increment its quantity by 1 rather than creating a new line item.
- Keep current behavior when no match exists: create a new line item with quantity = 1 and unitPrice from the catalog item.
- Ensure out-of-stock catalog items remain blocked from being added (no quantity increment and no new line item).
- Keep the catalog’s per-item added-count badge accurate as quantities are incremented via repeated Add clicks.

**User-visible outcome:** Clicking “Add” on a catalog item that’s already on the bill increases that line item’s quantity, avoiding duplicate rows, while out-of-stock items still cannot be added and the added-count badge stays correct.
