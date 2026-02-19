# Specification

## Summary
**Goal:** Exclude the print view page from displaying or triggering any screenshot functionality.

**Planned changes:**
- Ensure PrintViewPage.tsx does not display or trigger screenshot capture when rendering bills
- Maintain classic text-only receipt format in print view without any image generation

**User-visible outcome:** When users access the print view, bills will render in traditional receipt-style text format only, without any screenshot features appearing or being triggered.
