---
module: hr
domain: setup-review
content_type: Reference
status: canonical
updated_on: 2026-11-24
owner: frontend-team
audience: humans-and-agents
---

# Policy Setup Guide integration

`HRPolicyWorkspace` mounts `HRSetupReviewChecklist` above the policy tables when an academic year is selected and its policy drawer is closed.
The shared accordion starts closed.
The guide introduces Work Calendars first, then Attendance and Payroll Policies, followed by Leave Policies and optional Policy Assignments.
Links require the existing destination navigation and owning read grants and remain available during evidence loading or failure.
The staff and date check is the last evidence section and covers a single policy resolution.

## Review evidence

`src/redux/hr/hr-setup-review-api.ts` injects the [existing review GET and POST endpoints](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/references/setup-review.md) into the shared `api`.
Each authorized evidence section loads independently, including when the guide is collapsed.
The sample requires both policy and leave View grants, plus assignments navigation.
The server controls record availability through `canReview` and checks permission on every write.
`currentData` prevents prior-year results from appearing in a new year.
Matching data stays visible during refresh.
Policy, leave-policy, and employee cache tags refresh evidence after owning mutations.
Refresh review also rechecks evidence.
Failed saves retain an inline message and refresh evidence for inspection without automatically submitting a replacement fingerprint.
Zero-allocation notices remain visible after acknowledgement.
Stale reviews retain the previous reviewer and time.
No-staff and deferred samples stay incomplete.
Run sample again requests the current authorized default sample, which can return the same staff member and date.
Recording a review is optional and works independently of policy editing, staff activation, leave, and payroll.

## Validation

- `npm test -- src/screens/hr/policies/components/HRSetupReviewChecklist.test.tsx src/screens/hr/policies/HRPolicyWorkspace.setup-review.test.tsx`.
- `npm run ts` and focused ESLint/Prettier on API, component and tests.
- Synthetic browser fixture: `node node_modules/vite/bin/vite.js --config tests/browser/hr-setup-review-fixture/vite.config.mjs`.
  The fixture replaces API/router only for UI inspection and has no backend connection.
  It supports valid, stale, missing, no staff, loading, error, conflict and saving states.

The fixture checks the mounted component with synthetic responses.
Use the workspace integration test for selected-year, table, and policy drawer behavior.
