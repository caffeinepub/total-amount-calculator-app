# Specification

## Summary
**Goal:** Lock the Optimize Bill “Print Location Address” to a fixed, branch-specific value for the branch usernames `bachupally` and `nezampat`.

**Planned changes:**
- Detect when the authenticated branch username is exactly `bachupally` or `nezampat`, and force the app’s bill print location address value to the matching fixed string regardless of any existing localStorage or backend profile value.
- Update the Optimize Bill UI so the Print Location Address input is disabled/read-only for `bachupally` and `nezampat`, with an English helper/indicator that the value is fixed for that branch.
- Adjust sync and save-defaults behavior so backend-to-local syncing cannot overwrite the fixed value, and saving defaults always persists the fixed value to localStorage and (when applicable) the backend user profile billPrintLocation.

**User-visible outcome:** When logged in as `bachupally` or `nezampat`, the Print Location Address is automatically set to that branch name, cannot be edited, and remains consistent across syncing and saving defaults; other users can still edit the field as before.
