---
module: hr
domain: setup-review
content_type: Reference
status: canonical
updated_on: 2026-11-24
owner: frontend-team
audience: humans-and-agents
---

# Policies & Rules overview integration

The guarded `/hr/policies` overview introduces Work Calendars first, then Attendance and Payroll Policies, followed by Leave Policies.
Policy Assignments supports optional effective-dated exceptions for staff or groups.
Links require the existing destination navigation and owning read grants and remain available before a year is selected and during evidence loading or failure.
The individual policy tables link back to the overview through their breadcrumbs.

## Review evidence

`src/redux/hr/hr-setup-review-api.ts` injects the [existing review GET and POST endpoints](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/references/setup-review.md) into the shared `api`.
`HRPolicyOverview` mounts one `HRSetupReviewChecklist` for the selected academic year.
Review School Policies and Check Policies for One Staff Member both start closed, and each starts its own reads on first expansion.
The school review loads authorized calendar, attendance, payroll, and leave sections independently.
The automatic sample checks one staff member and date and requires both policy and leave View grants, plus assignments navigation.
Opened sections retain their evidence when collapsed, and changing the academic year resets the disclosures.
The server controls record availability through `canReview` and checks permission on every write.
`currentData` prevents prior-year results from appearing in a new year.
Matching data stays visible during refresh.
Policy, leave-policy, and employee cache tags refresh evidence after owning mutations.
Refresh review also rechecks evidence.
Failed saves retain an inline message and refresh evidence for inspection without automatically submitting a replacement fingerprint.
An acknowledgement already submitted for a previous year can finish for that year, while the new screen receives only its current query data.
Zero-allocation notices remain visible after acknowledgement.
Stale reviews retain the previous reviewer and time.
No-staff and deferred samples stay incomplete.
When a staff member is available, change the sample date and select Check date to resolve the same staff member on that day.
The date must be inside the selected academic year.
Recording is available after the displayed result matches the selected date.
Run sample again is available when the check has no staff member or the year bounds are unavailable.
Recording a review is optional and works independently of policy editing, staff activation, leave, and payroll.

## Validation

- `npm test -- src/screens/hr/policies/HRPolicyOverview.test.tsx src/screens/hr/policies/components/HRSetupReviewChecklist.test.tsx src/screens/hr/policies/HRPolicyWorkspace.setup-review.test.tsx`.
- `npm run ts` and focused ESLint/Prettier on API, component and tests.
- Synthetic browser fixture: `node node_modules/vite/bin/vite.js --config tests/browser/hr-setup-review-fixture/vite.config.mjs`.
  The fixture replaces API/router only for UI inspection and has no backend connection.
  It supports valid, stale, missing, no staff, loading, error, conflict and saving states.

The fixture checks the overview with synthetic responses.
Use the component tests for year isolation and delayed acknowledgements, and the workspace integration test for table and policy drawer behavior.
