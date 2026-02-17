# Specification

## Summary
**Goal:** Persist and display daily total revenue for each calendar day across sessions.

**Planned changes:**
- On “Print Bill”, write/update a per-day (YYYY-MM-DD, local date) daily-summary record in browser storage that tracks cumulative total revenue for that day.
- Ensure multiple bills printed on the same day increment that day’s stored total without affecting other days.
- Update the Daily Totals page to read totals from persisted daily-summary records for the selected day and format the value in INR.
- Add fallback behavior: if a selected day lacks a stored daily-summary record, compute the total from that day’s ledger entries, display it, and persist it for future loads.

**User-visible outcome:** Daily totals are saved for every day with printed bills and remain available after refresh/browser restart; the Daily Totals page shows the correct persisted total for any saved day.
