---
module: hr
domain: setup-review
content_type: Reference
status: canonical
updated_on: 2026-10-26
owner: frontend-team
audience: humans-and-agents
---

# School HR setup review integration

`src/screens/hr/policies/components/HRSetupReviewChecklist.tsx` exports the standalone `HRSetupReviewChecklist`.
It is intentionally not mounted by this change: policy workspace integration is owned by the lead task.

```tsx
import { HRSetupReviewChecklist } from './components/HRSetupReviewChecklist';

// In the workspace year-selected region, outside policy drawers:
<HRSetupReviewChecklist academicYearId={academicYearId} />
```

The sole prop is the selected academic-year ID. It reads existing auth Redux permissions and shared RTK Query API.
Mount only after the [additive backend contract](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/modules/hr/references/setup-review.md) is available.
No change to the existing workspace hook, drawers or mutation services is required.

The native disclosure starts closed. Sections link to their exact existing HR settings destinations and are filtered by action View grants
and existing navigation visibility. The sample also requires leave View. Server `canReview` controls record availability;
the server rechecks permissions on every write. This advisory state does not control activation, leave or payroll actions.

`src/redux/hr/hr-setup-review-api.ts` injects GET/POST into shared `api`. Each visible section loads independently.
`currentData` prevents previous-year results from appearing in a new year; matching data remains visible during refresh.
Policy, leave-policy and employee cache tags refresh evidence after owning mutations; explicit Refresh review also rechecks it.
Failed saves retain an inline message and refresh for inspection without automatically submitting a replacement fingerprint.
Links retain existing route navigation and draft guards. Zero-allocation notices remain visible without changing allocations;
actor/time remains visible when stale. No-staff and deferred samples never look completed.
Run new sample deliberately selects a new authorized staff/date check when the recorded sample is no longer applicable; completion still requires Record review.

## Validation

- `npm test -- src/screens/hr/policies/components/HRSetupReviewChecklist.test.tsx`.
- `npm run ts` and focused ESLint/Prettier on API, component and tests.
- Synthetic browser fixture: `node node_modules/vite/bin/vite.js --config tests/browser/hr-setup-review-fixture/vite.config.mjs`.
  The fixture replaces API/router only for UI inspection and has no backend connection.
  It supports valid, stale, missing, no staff, loading, error, conflict and saving states.

The in-app browser attempt timed out at `http://127.0.0.1:4329`; inspecting the resulting error tab was denied by Browser Use's URL policy for its `data:` error-page URL.
Browser actions stopped at that denial. Visual, keyboard, narrow-screen and dark-theme smoke verification remains incomplete.
Unit tests cover disclosure structure, links, loading/error/conflict behavior and scoped query suppression; they do not replace the browser smoke check.
