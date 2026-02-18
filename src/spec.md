# Specification

## Summary
**Goal:** Restore the calculator page “Print” (Print Bill) button to print in-place using the existing `PrintBill` receipt, without opening/navigating to a separate print view.

**Planned changes:**
- Update the calculator page Print button flow to render the existing `PrintBill` component in-page for print media and trigger printing via `window.print()` (no new tab/window and no `?print=true` navigation).
- Ensure `PrintBill` is not placed inside a container that prevents it from appearing in print preview/print output.
- Keep the current “on print” side effects intact (bill save to branch-scoped localStorage, ledger entry append, daily summary updates, and non-blocking backend daily total save attempt), changing only the print UI flow.

**User-visible outcome:** Pressing “Print” on the calculator prints the receipt using the existing `PrintBill` layout in the same page (with inputs preserved), and existing bill/daily-total updates still occur as before.
