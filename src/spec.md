# Specification

## Summary
**Goal:** Enforce a single hardcoded branch login (username `bachupally`, password `branch1`) and ensure the login button/form consistently authenticates and gates access to the app.

**Planned changes:**
- Update Branch Login validation to use the hardcoded credentials, trimming whitespace on both fields and matching the username case-insensitively while requiring an exact password match (aside from trimming).
- Gate the entire app so no main UI/pages render until branch login succeeds; Internet Identity login must not bypass this gate.
- Fix Branch Login submit behavior so clicking the login button or pressing Enter reliably submits once, shows clear success/failure feedback, and unlocks/locks the app immediately on login/logout.

**User-visible outcome:** Users must enter `bachupally` / `branch1` to access the app; invalid credentials show an English error, and successful login (via button or Enter) unlocks the app without refresh, while logout re-locks it.
