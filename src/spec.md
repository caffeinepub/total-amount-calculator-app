# Specification

## Summary
**Goal:** Fix the blank white-screen crash by ensuring components using `useBranchAuth()` are properly wrapped in `BranchAuthProvider`.

**Planned changes:**
- Wrap the app content (e.g., `AppContent` in `frontend/src/App.tsx`) with `BranchAuthProvider` so `useBranchAuth()` consumers render without context errors.
- Verify unauthenticated users can reach and render `AuthGatePage` without triggering a white-screen crash.
- Confirm branch login flow (`BranchLoginForm`) can authenticate and unlock the main app view without the provider error.

**User-visible outcome:** Loading the app no longer shows a blank white page; unauthenticated users see the auth gate, and branch-authenticated users can log in and access the main app view.
