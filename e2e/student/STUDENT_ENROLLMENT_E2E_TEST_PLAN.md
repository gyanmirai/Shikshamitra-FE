# Student Enrollment end-to-end test plan

## Objective

Validate the staff and applicant journey from inquiry pipeline through entrance exam and registration/document readiness. The release gate is no open P0-P2 defect, regression coverage for every fixed defect, and a final Codex in-app-browser smoke test against `https://app.gyanmirai.in`.

## Scope and safety

- In scope: authenticated pipeline, applicant workspace, entrance exams, registrations/documents, public inquiry/status/OTP paths reachable from those workflows, permissions, tenant/scope boundaries, accessibility, responsive behavior, concurrency, and recovery from API failures.
- Follow-through checks: offers/seat or activation handoff only far enough to prove that registration readiness produces the correct downstream state.
- Out of scope without separate approval: real payment settlement, real communication-provider delivery, destructive bulk deletion, production role changes, or modifying another tenant's configuration.
- Use synthetic applicants prefixed `E2E-<date>-<case-id>` and non-routable/test contact data. Record created IDs. Archive or otherwise clean up only when the product provides a safe audited action.
- Run read-only and negative tests first. Run mutations against the explicitly supplied test tenant and user permissions.

## Environments and personas

| Dimension | Coverage |
| --- | --- |
| Target | `https://app.gyanmirai.in` in the Codex in-app browser |
| Staff personas | Principal/full access; receptionist/capture; counselor/process; approver/decision; restricted/no CRM access when credentials exist |
| Applicant | Public status/registration user behind OTP when a test-safe delivery path exists |
| Viewports | Desktop 1440x900; small laptop 1280x720; tablet 768x1024; mobile 390x844 for applicant pages |
| Data | Active admission cycle, inactive/historical cycle, empty cycle if available, exam slot with capacity, full slot, published registration template, document checklist |

## Release gates

- P0: cross-tenant disclosure, authentication bypass, unrecoverable corruption, or widespread outage. Stop mutation testing immediately.
- P1: core pipeline/exam/registration journey cannot complete, permission bypass, duplicate admission/student creation, or silent data loss.
- P2: wrong state transition, validation bypass, stale UI causing a harmful action, inaccessible critical control, or major responsive failure.
- P3/P4: localized usability, copy, alignment, feedback, or low-risk consistency issue.
- Every fix starts with a failing automated test at the lowest useful layer, then focused FE/BE tests, `git diff --check`, and a browser re-test of the original reproduction plus its nearest neighboring path.

## Test cases

### A. Access, cycle selection, and workspace foundation

| ID | Scenario | Expected result | Priority |
| --- | --- | --- | --- |
| ENR-A01 | Anonymous direct navigation to pipeline, exams, registrations, and applicant workspace | Redirect/sign-in; no protected data appears in HTML or API response | P0 |
| ENR-A02 | Restricted user opens each workspace and calls a protected mutation | Menu/actions hidden as defense in depth; backend returns 401/403 | P0 |
| ENR-A03 | User with view-only permission opens workspaces | Data is readable; create/edit/decision actions are absent or disabled | P1 |
| ENR-A04 | Switch active admission cycle | URL, headings, counts, filters, and rows all update to the selected cycle | P1 |
| ENR-A05 | Refresh/deep-link with cycle and filters | State restores without mixing data from another cycle | P1 |
| ENR-A06 | Missing, malformed, inactive, and unknown cycle IDs | Safe empty/error state; no fallback mutation into a different cycle | P1 |
| ENR-A07 | Back navigation from applicant workspace | Returns to exact list/board state without exposing search text in URL | P2 |
| ENR-A08 | API 401, 403, 404, 409, 422/validation, and 500 presentation | Specific, actionable feedback; no blank screen or false success | P2 |
| ENR-A09 | Slow/duplicated requests and rapid route changes | Loading state is scoped; stale response cannot overwrite current cycle | P1 |
| ENR-A10 | Keyboard-only navigation and automated accessibility scan | Critical tasks have labels, focus order, visible focus, names, and no serious/critical violations | P2 |

### B. Pipeline and inquiry capture

| ID | Scenario | Expected result | Priority |
| --- | --- | --- | --- |
| ENR-P01 | Create a minimal valid quick inquiry | One lead is created, visible in pipeline, and has audit/timeline evidence | P1 |
| ENR-P02 | Required fields empty/whitespace-only | Inline validation prevents submission and focuses the first error | P2 |
| ENR-P03 | Names with apostrophe, hyphen, Unicode, leading/trailing spaces, and maximum lengths | Valid text is preserved/trimmed predictably; overflow is rejected | P2 |
| ENR-P04 | Phone/email invalid formats and boundary lengths | Invalid values rejected consistently by UI and API | P2 |
| ENR-P05 | Duplicate contact, email, parent, DOB, and combined-match signals | Warning explains matched fields without leaking excess personal data | P1 |
| ENR-P06 | Continue after duplicate warning without and with reason | Reason is mandatory; justified continuation creates only one lead and is audited | P1 |
| ENR-P07 | Double-click submit / slow create response / browser refresh | Idempotent outcome or guarded UI; never creates duplicate leads | P1 |
| ENR-P08 | Active versus disabled inquiry channel/source | Active choice works; disabled choice cannot create a new lead; historical value remains readable | P1 |
| ENR-P09 | Direct registration pathway and configured academic options | Only valid configured options appear and persisted values match the selected cycle | P1 |
| ENR-P10 | Search by applicant/contact; stage/channel/owner/class/score/priority filters | Correct results, clear-all behavior, pagination, and empty state | P2 |
| ENR-P11 | Board/list parity and large-result pagination | Same scoped dataset; bounded pages; no missing/duplicated rows | P2 |
| ENR-P12 | Assign/change/clear owner and create/complete task | Correct permissions, UI refresh, workload refresh, and timeline actor evidence | P1 |
| ENR-P13 | Manual priority and calculated score | Values remain distinct and filters reflect the correct field | P2 |
| ENR-P14 | Valid allowed stage movement with required reason | Exactly one transition, timeline event, and downstream automation | P1 |
| ENR-P15 | Skipped, backward, disabled, terminal, exam-governed, or otherwise disallowed stage movement | Blocked server-side with unchanged lead state | P1 |
| ENR-P16 | Concurrent edits from two tabs/users | Conflict is detected or latest-state confirmation is required; no silent overwrite | P1 |
| ENR-P17 | Archive/terminal lead then attempt new task, exam, or registration action | Terminal state cannot unlock new work; read-only history remains | P1 |
| ENR-P18 | Unsaved applicant edit followed by navigation, Back, or My Work | Warning protects changes; cancel keeps draft and context | P2 |

### C. Entrance exam lifecycle

| ID | Scenario | Expected result | Priority |
| --- | --- | --- | --- |
| ENR-E01 | Schedule eligible lead into available active slot | Exam record appears once with applicant, slot, and current status | P1 |
| ENR-E02 | Missing prerequisites or registration-before-exam gate | Scheduling blocked with exact missing requirement and a recovery action | P1 |
| ENR-E03 | Inactive, past, unknown, or full slot | Server rejects assignment; capacity never goes negative | P1 |
| ENR-E04 | Last available seat scheduled concurrently by two applicants | Only one succeeds; loser receives conflict and refreshed capacity | P0 |
| ENR-E05 | Duplicate scheduling and rapid double-submit | One active assignment; no duplicate exam records | P1 |
| ENR-E06 | Reschedule/cancel where permitted | Capacity is released/reallocated correctly and timeline retains history | P1 |
| ENR-E07 | Attendance Present, Absent, No-show, Excused and invalid transition order | Only allowed transitions persist; timestamp and actor audited | P1 |
| ENR-E08 | Marks at minimum, maximum, decimal policy, just below/above boundary, negative, text, and blank | Accepted boundaries calculate correctly; invalid input rejected by UI and API | P1 |
| ENR-E09 | Multiple assessment components and total calculation | Component constraints and total/percentage/grade are deterministic | P1 |
| ENR-E10 | Pass/fail/conditional/pending eligibility around exact cut-off | Correct decision at each boundary with no rounding mismatch | P1 |
| ENR-E11 | Manual eligibility override | Permission and reason required; original result and override retained in audit history | P1 |
| ENR-E12 | Edit marks after eligibility decision | Blocked or decision invalidated/recalculated according to policy; never silently inconsistent | P0 |
| ENR-E13 | Bulk attendance/marks with one invalid row | Clear atomic/partial semantics and per-row errors; no hidden partial corruption | P1 |
| ENR-E14 | Exam filters, pagination, empty state, and applicant deep-link | Results stay cycle-scoped and action returns to exact table state | P2 |

### D. Registration and documents

| ID | Scenario | Expected result | Priority |
| --- | --- | --- | --- |
| ENR-R01 | Issue the applicable published registration template | Unique form number and secure applicant link created once | P1 |
| ENR-R02 | No matching template, draft template, inactive template, or ambiguous applicability | Issue is blocked with actionable configuration feedback | P1 |
| ENR-R03 | Automatic/manual issue gate and repeat issue | Policy enforced; repeat uses supported reissue flow rather than duplicate active forms | P1 |
| ENR-R04 | Applicant OTP valid, invalid, expired, resend cooldown, retry limit, and locked challenge | Secure state-specific response without account/token enumeration | P0 |
| ENR-R05 | Expired, revoked, reissued, or tampered registration/status token | Access denied safely; replacement link works; no applicant data leak | P0 |
| ENR-R06 | CRM-prefilled locked versus editable fields | Locked fields cannot be changed client-side or by direct API; allowed edits persist | P1 |
| ENR-R07 | Partial save, refresh, logout/re-authentication, and multi-section resume | Latest authorized draft persists without losing earlier sections | P1 |
| ENR-R08 | Required/conditional fields hidden, shown, cleared, and re-shown | Validation follows current visibility and preserves/clears data only by explicit rule | P1 |
| ENR-R09 | Field types, Unicode, max lengths, dates, future DOB, and boundary ages | Consistent UI/API validation with no locale/date shift | P1 |
| ENR-R10 | Double-submit registration and concurrent applicant/staff edit | Single submission; conflict handled; submitted snapshot immutable/auditable | P0 |
| ENR-R11 | Request correction with reason, correct, and resubmit | Prior submission retained, requested fields clear, unrelated answers preserved | P1 |
| ENR-R12 | Fee-required, waiver, zero fee, invalid reference, and already-paid states | Readiness follows Finance-owned evidence; UI cannot forge settlement | P0 |
| ENR-R13 | Required/optional/conditional document checklist | Completeness and blockers match the assigned versioned checklist | P1 |
| ENR-R14 | File type, MIME/content mismatch, empty file, oversize file, long/Unicode filename, and duplicate upload | Unsafe/invalid files rejected; valid metadata safe; no duplicate current version | P0 |
| ENR-R15 | Replace rejected document | Old version remains in history; only latest valid version is current | P1 |
| ENR-R16 | Verify/reject/waive/original-seen actions | Permission and reason rules enforced; actor/time/history visible | P1 |
| ENR-R17 | Document expires at, before, and after reminder boundary | Correct reminder/readiness behavior with timezone-safe dates | P1 |
| ENR-R18 | One- and two-approver readiness, including same-user second approval | Distinct approver policy enforced; blockers and overrides explicit | P0 |
| ENR-R19 | Registration complete but document/fee/exam blocker remains | Downstream admission handoff stays blocked with exact unmet conditions | P1 |
| ENR-R20 | All requirements complete, approve readiness, and hand off | One auditable downstream handoff; refresh shows stable completed state | P1 |

### E. Cross-cutting resilience, privacy, and UX

| ID | Scenario | Expected result | Priority |
| --- | --- | --- | --- |
| ENR-X01 | Attempt cross-tenant IDs/tokens in list and detail APIs | 404/403 without existence disclosure; no cross-tenant counts or documents | P0 |
| ENR-X02 | UserScope-limited class/branch/standard | Lists, counts, search, exports, actions, and deep links all honor scope | P0 |
| ENR-X03 | Refresh after every mutation and revisit from another session | Persisted backend truth matches toast/table/timeline; no optimistic false success | P1 |
| ENR-X04 | Network offline/timeout during create, schedule, result, save, upload, and approval | Retry is safe and idempotent; draft not lost; ambiguous outcome is explained | P1 |
| ENR-X05 | Browser Back/Forward and refresh while dialog/drawer is open | URL-backed state restores or closes predictably; no accidental resubmit | P2 |
| ENR-X06 | Desktop/tablet/mobile overflow, zoom 200%, and long localized text | No clipped critical controls or horizontal page overflow | P2 |
| ENR-X07 | English, Gujarati, and Hindi applicant pages | Labels, validation, dates, and numbers remain understandable and accessible | P2 |
| ENR-X08 | Sensitive values in URL, toast, console, HTML, downloaded name, and public duplicate response | No token/contact/document leakage beyond required context | P0 |
| ENR-X09 | Timeline actor/time/order after pipeline → exam → registration | Complete, chronological, tenant-local display with UTC-safe ordering | P1 |
| ENR-X10 | 25k-lead/large exam/registration fixture or equivalent bounded dataset | Pagination and selectors stay bounded; interactions remain responsive | P2 |
| ENR-X11 | Preview activation after the division already contains enrolled or inactive students | Occupancy and roll-number checks remain bounded, accurate, and free of full Student-graph loading | P1 |
| ENR-X12 | Reuse an existing household/applicant/guardian versus create a new person | Existing IDs work without unused person details; new-person details remain required; no duplicate person is created | P1 |

## Execution order

1. Preflight: authentication, permissions, active cycle, catalogs, configuration, and safe test-data capability.
2. Read-only smoke: A01-A10 plus existing data views in pipeline, exams, and registrations.
3. Golden path: P01 → P12/P14 → E01/E07-E10 → R01/R04/R07/R10/R13/R16/R18-R20.
4. Negative and boundary paths: duplicates, stage governance, capacity, score boundaries, OTP/token safety, field validation, file validation, concurrency, and network recovery.
5. Responsive/accessibility/localization pass.
6. For each defect: record issue, add failing regression, implement smallest owning-layer fix, run focused checks, and re-test in browser.

## Execution status — 2026-08-07

- Case-by-case evidence and residual gaps: [STUDENT_ENROLLMENT_E2E_EXECUTION_MATRIX_2026-08-07.md](./STUDENT_ENROLLMENT_E2E_EXECUTION_MATRIX_2026-08-07.md).
- Completed live: access smoke, inquiry/pipeline golden path and duplicates, exam scheduling/attendance/result, registration issuance/draft/submit/verify, document waivers/readiness, personas, audit timeline, responsive sweep, accessibility scan, and deterministic 25,000-lead board fixture.
- Completed local release gates: inactive/started slot rejection (`ENR-E03`), last-seat concurrency (`ENR-E04`), OTP/session/reissue safety (`ENR-R04/R05`), stale registration edits and double-submit (`ENR-R10`), and document content/MIME/size/name validation (`ENR-R14`).
- Pending environment/deployment: real second-tenant token/ID matrix; deploy both fixes, rerun seeders, and repeat every fixed/open reproduction in the Codex browser. QA sign-off remains on hold until no P0-P2 defect is open on the deployed build.

## Defect record

For each issue capture: ID, title, severity, environment/role/cycle/viewport, preconditions, synthetic record IDs, exact steps, expected, actual, reproducibility, screenshot/console/API evidence, likely FE/BE ownership, security/data impact, cleanup state, regression test to add, fix plan, and post-fix validation.

## Fix and regression strategy

- Frontend state/validation/rendering defect: add a focused Vitest/contract test; add Playwright coverage when it crosses screens or browser history.
- Backend invariant/authorization/tenant/concurrency defect: add domain or application test plus HTTP API test for the externally visible contract.
- Cross-layer defect: test the backend contract first, then client mapping/cache invalidation, then the user journey.
- UI enhancement: preserve the established MUI/table workspace pattern, keyboard behavior, responsive breakpoints, URL-backed context, and historical readability.
- Do not weaken backend validation to match an incorrect UI. Do not rely on hidden controls for security.
