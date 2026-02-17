# Specification

## Summary
**Goal:** Add an “Optimize Bill” area to configure and persist default bill/receipt settings (payment scan, print location address, receipt style) and ensure each printed/saved bill captures a unique bill code and a snapshot of the format used at print time.

**Planned changes:**
- Add a new top-level navigation option “Optimize Bill” that routes to a dedicated Optimize Bill screen.
- On the Optimize Bill screen, add: (1) an image upload for a payment scan (reject non-image uploads with a clear error), and (2) a text field for print location address; do not include any name field.
- Add a “bill look” selector (at least two receipt styles) on Optimize Bill and apply the selected style to the printed receipt layout.
- Persist Optimize Bill settings (payment scan image, print location address, and selected receipt style) as the default bill format in browser localStorage and auto-apply them to future prints until changed.
- Automatically generate a unique bill code at print time, save it with the bill record, and display it on the printed receipt view.
- Update the save/print flow so each saved bill record stores a snapshot of the bill format used at print time (including bill code, and payment scan/address if set), and ensure the print tab renders the saved snapshot even if defaults change later.

**User-visible outcome:** Users can open “Optimize Bill” to upload a payment scan, set a print location address, and choose a receipt style; these defaults persist and are applied to new prints. Each printed bill shows a unique bill code, and previously saved bills continue to print with the original format snapshot even after defaults are updated.
