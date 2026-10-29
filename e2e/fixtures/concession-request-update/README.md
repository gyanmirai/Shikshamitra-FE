# Concession update regression

This fixture mounts the production `ConcessionRequestForm` and its actual child components.
All API hooks and account context are local test doubles; no financial backend is called.

Run from the frontend repository:

```sh
node node_modules/vite/bin/vite.js build --config e2e/fixtures/concession-request-update/vite.config.mts --outDir ../../../.artifacts/concession-request-update-build --logLevel error
node node_modules/vite/bin/vite.js preview --config e2e/fixtures/concession-request-update/vite.config.mts --outDir ../../../.artifacts/concession-request-update-build --host 127.0.0.1 --port 4228 --strictPort
```

Open `http://127.0.0.1:4228/` in the Codex in-app browser. Building first avoids the expensive
development dependency-optimizer scan on this fixture. The synthetic policy fixes the
request total at ₹1,000 across eligible fees of ₹58,166 and ₹717, including the paid ₹717 fee.
Use **Submit for approval** or **Save draft** after choosing a scenario. Recorded commands
show the reviewed update stamp and the returned stamp used for submission.

| Scenario | Expected result |
| --- | --- |
| valid | Update succeeds and submission uses the saved update stamp |
| stale | Concurrency conflict explains that the request changed and preserves the editor |
| approved | Editing a terminal request is blocked with a state-specific reason |
| policy | Missing policy version is explained |
| eligibility | Ineligible fee selection is explained |
| unknown | Fallback retains the exact unknown error code and support reference |

The unknown scenario deliberately uses the issue's originally transcribed `0030003` code.
The supplied screenshot shows `030003`, which is covered by **stale**. These codes must not
be treated as aliases without a server contract establishing that relationship.

These browser checks demonstrate frontend behavior with controlled responses. Backend
allocation, persistence, concurrency and authorization are verified separately by API tests.

The confirmed benefit rule is one active benefit per student, academic year and concession type.
The context returns a `benefitBlocker` for another Pending request or an Approved/Partially Reversed
benefit that remains in force. The context and preview receive the actual edited request ID so the
server can exclude that request itself. A Rejected, Cancelled or fully Reversed history does not
block a new request; another year or another concession type remains independent.

At narrow widths (including a 355px in-app browser panel), the fixture toolbar scrolls and the
command log stacks below the production form. The page can scroll vertically; the form retains
its own body scroll and footer. This harness layout is separate from the production dialog layout.

Focused automated verification: 24 request/approval/error/cache tests passed in the normal Vitest
environment; 47 existing UI/select/value/approval tests passed using the existing concession UI
fixture setup (`e2e/fixtures/concession-request-ui/setup.ts`) with one worker. This includes the
server-returned manual-refund warning on approval review. A full-repository TypeScript check was
not completed in the resource-constrained session.

Browser verification completed for new approved/pending/partially reversed blockers, own-request
exclusion and update-to-submit stamps, new requests after rejected/cancelled/fully reversed history,
independent year/type eligibility, policy switching, blocked approval and own pending approval.
The final 355px-panel smoke check also passed: the production rejection form accepted a reason
and submitted rejection of `pending-1000`, while the existing ₹200 approved benefit remained.
All 19 scenarios, including the original six update/error cases, passed after the responsive
harness build; known errors displayed their specific reason and support reference, while the
unknown code retained its exact code and reference fallback.

| Additional scenario | Expected result |
| --- | --- |
| approved-benefit / partial-benefit | Existing ₹200 benefit blocks a new ₹1,000 request for the same student/year/type; type option explains why |
| pending-benefit | Another Pending request blocks Save draft and Submit |
| self-request | Current request ID is excluded; existing editor remains usable |
| rejected-history / cancelled-history / reversed-history | Select the two eligible fees; a new request can be saved or submitted |
| other-year / other-type | The selected type/year remains available |
| policy-bypass | Switching either policy leaves the same type/year blocked |
| approval-duplicate | Pending ₹1,000 request cannot be reviewed/approved while ₹200 is already approved; Back stays available |
| approval-self | Own Pending request is excluded and review/approval remains available |
| reject-duplicate | The production rejection form can reject the pending request while the prior approved benefit remains untouched |
