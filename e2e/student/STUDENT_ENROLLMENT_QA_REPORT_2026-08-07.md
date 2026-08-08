# Student Enrollment QA report — 2026-08-07

## Current release recommendation

**Release-candidate sign-off is pending the final aligned frontend deployment and live browser smoke.** The backend fixes are deployed and their focused stage APIs now pass. The frontend candidate passes 65 Student Enrollment test files with 439 tests, the production build, and the staged settings/exam/public-form/paper-registration workflows. The remaining live re-test is intentionally limited to UI changes that are not yet present in the deployed frontend: terminal applicant presentation, My Work dirty-form navigation, the public-form default template, and issued-registration confirmation.

Current-main integration worktrees:

- Frontend: `.worktrees/student-enrollment-fe-current`, branch `codex/student-enrollment-qa-current` from `origin/main`.
- Backend: `.worktrees/student-enrollment-be-current`, branch `codex/student-enrollment-qa-current` from `origin/main`.
- The original dirty frontend and backend working copies were not rebased, reset, or overwritten.

## Latest focused execution — 2026-08-08

| Finding | Severity | Status | Evidence and prevention |
| --- | --- | --- | --- |
| `ENR-W02` My Work returned HTTP 500 for realistic assigned leads | P1 | Backend deployed; stage API pass | EF selected span-based `Contains` overloads for three `Guid[]` filters. All lead, standard, and owner ID collections are now `List<Guid>`. The HTTP regression creates a class-scoped assigned task and asserts both target class and owner display name. |
| `ENR-P20` published public inquiries failed with `InvalidIntendedRouteDefinition` | P1 | Backend deployed; public E2E pass | Route-type-only intake persisted a route-name snapshot without a definition ID/version. The service now stores no definition snapshot unless a definition resolves; the public HTTP regression covers the invariant. |
| `ENR-R22` default public inquiry form omitted mandatory guardian and target class fields | P1 | Frontend fixed; deployment pending | The default builder now includes required guardian name and a target-standard select populated from the published operational standards. A pure builder regression verifies both required fields and option labels. |
| `ENR-W03` Activity & Audit bypassed the unsaved-change guard | P1 | Frontend fixed; deployment pending | The context rail now opens activity through the workspace transition guard. The contract test prevents direct state changes that would discard notes or registration edits. |
| `ENR-P21` archived applicants displayed an active pipeline state | P2 | Frontend fixed; deployment pending | Closed applicants now show lifecycle status and explicit outcome and suppress the stale active pipeline chip/action. A workspace regression locks the terminal-state presentation. |
| `ENR-R23` an issued form number disappeared when focus returned to the exam gate | P2 | Frontend fixed; deployment pending | The applicant summary now keeps `Registration <form number>` visible independently of the selected journey operation; the registration-before-exam flow still verifies persistence and timeline audit. |

Stage cannot safely reveal OTP values to a remote browser runner. The E2E therefore keeps the full parent OTP/save/submit path for local or explicitly reverse-tunneled webhook environments. On remote stage it validates the real OTP challenge/delivery response, then completes the identical registration and document lifecycle through the authenticated staff UI. Backend HTTP tests continue to cover OTP verification, expiry, cooldown, lockout, tampering, and public save/submit without introducing an OTP bypass.

The complete 74-case scope and release gates are in [STUDENT_ENROLLMENT_E2E_TEST_PLAN.md](./STUDENT_ENROLLMENT_E2E_TEST_PLAN.md). The evidence status of every case is in [STUDENT_ENROLLMENT_E2E_EXECUTION_MATRIX_2026-08-07.md](./STUDENT_ENROLLMENT_E2E_EXECUTION_MATRIX_2026-08-07.md).

## Environment and synthetic data

| Item | Value |
| --- | --- |
| Application | `https://app.gyanmirai.in` |
| API | `https://stage-api.gyanmirai.in` |
| Tenant / role | DDVS / seeded Principal test user |
| Academic context | 2026–2027 / CBSE / English |
| Academic year ID | `3a22dd9c-d90c-4df5-8b3c-8a3d526ee487` |
| Applicant | `E2EAug07P01 Regression` |
| Applicant ID | `3a22f1ce-6132-aa57-e266-0dbe6881d62e` |
| Test contact | `9999900807` / `e2e.student.20260807@example.com` |
| Registration | `DDVS-REG-00006` |
| Cleanup | No destructive cleanup action was available; the record remains clearly synthetic and auditable in stage. |

## Live golden-path evidence

| Step | Result | Evidence |
| --- | --- | --- |
| Authentication and protected-route access | Pass | Anonymous protected UI/API requests did not disclose enrollment data; authenticated Principal reached all three workspaces. |
| Quick inquiry required fields | Pass | Empty submission produced inline errors for student, guardian, contact, board, medium, and standard. |
| Inquiry creation | Pass | One synthetic lead created, owner auto-assigned, initial score 60/Warm, and applicant workspace opened. |
| Duplicate inquiry guard | Pass | Reusing the same phone/email produced one likely-duplicate warning; “Create Anyway” focused the mandatory reason and no duplicate was created without it. |
| Pipeline search and return state | Pass | Search narrowed 11 leads to the synthetic lead; applicant Back restored the search and list view without putting search text in the URL. |
| Exam scheduling | Pass | Morning A slot reserved; applicant moved to Exam Pending. |
| Attendance | Pass | Present persisted with success feedback. |
| Result boundary protection | Partial | Backend rejected 101/100, but stage UI allowed the invalid attempt. Fixed locally as `ENR-E08`. |
| Valid result | Pass | 85/100 persisted as Pass, Eligible, merit rank 1; applicant score became 80. |
| Registration issuance | Pass | Eligible result auto-issued `DDVS-REG-00006`; applicant moved to Registration Pending. |
| Registration prefill and progress | Fail on stage | Known CRM values did not match template system fields by case; fixed locally as `ENR-R06/R07`. |
| Empty registration submit | Fail on stage | Only a generic business-rule toast appeared; fixed locally as `ENR-R09`. |
| Draft persistence | Pass | First name, guardian, and phone saved and survived reload; completion became 75%. |
| Readiness gate before submission | Pass | Enabling override did not enable Confirm Readiness while registration remained incomplete/unverified. |
| Registration worklist tabs | Fail on stage | Eligible and Registration done accepted focus but did not change the pressed tab or pending dataset. Recorded as `ENR-R21`. |
| My Work search/filter return state | Fail on stage | Search remained private but cleared after navigating away and back; the applicant column-filter path used non-canonical URL state. Fixed locally as `ENR-W01`. |
| Submit and verify registration | Pass | DOB was entered as `2016-08-07`; the 100%-complete form submitted, became Submitted, and was verified as `DDVS-REG-00006`. |
| Document waiver and readiness | Pass | Blank waiver actions stayed disabled. Both required synthetic document requirements were waived with explicit reasons; completeness reached 100%, readiness moved from 0/1 to 1/1, and the registration became Admission ready. |
| Auditability | Pass | Activity & Audit recorded form issuance, draft saves, submission, verification, both waiver reasons, and readiness confirmation with actor and timestamp. |
| Admissions persona permissions | Pass | Read-only stage checks passed for receptionist, counselor, and approver; each received the intended granted and denied CRM policies. |
| Principal board isolation | Fail on stage | The seeded GSEB principal reported `hasFullBoardAccess=true` and could access CBSE enrollment scope. Fixed locally as `ENR-S01`; stage remains exposed until the backend repair is deployed and seeders are rerun. |
| Release viewports | Pass | The guarded responsive sweep passed across all configured enrollment workspace and settings routes. |
| Automated accessibility | Fail on stage | Pipeline “Registration Done” chip has 4.37:1 contrast at 11.2px; WCAG AA requires 4.5:1. Recorded as `ENR-A10`. |
| Keyboard skip navigation | Pass on 2026-08-08 re-test | Playwright keyboard activation moved focus into the workspace. The checked-out source still adds deterministic click focus/scroll behavior and a focused component regression as `ENR-A11`. |
| Registration document control names | Fail on stage | Both file inputs and both waiver-reason inputs exposed identical accessible names, so assistive-technology users could not identify the target requirement. Fixed locally as `ENR-A12`. |
| Deterministic 25,000-lead board | Pass after corrected 2026-08-08 gate | List stayed bounded at 50. Board issued distinct bounded `pipelineColumn` requests and rendered column-specific applicants without duplicated fixture identities. The original failure checked obsolete `stage` parameters. |
| Settings request ownership | Pass | Inquiry-form settings requested only their owned form-template configuration; unrelated cycle, pipeline, message, source, and staff requests were absent. |
| Current-source navigation contracts on stage | Blocked by version mismatch | Stage lacks the current `/exams` workspace link and `/settings/journey` domain link. This corroborates the already-recorded deployed/current-source mismatch rather than establishing an independent workflow defect. |

## Stage release-gate re-test — 2026-08-08

| Gate | Result | Evidence |
| --- | --- | --- |
| Authentication and enrollment pipeline | Pass | The seeded DDVS Principal authenticated and the 2026–2027 CBSE/English pipeline loaded 11 records. |
| Skip navigation | Pass | A dedicated Playwright keyboard test focused `#student-enrollment-content`; the earlier synthetic off-screen click was not treated as a real pointer-user path. |
| Registration worklist switching (`ENR-R21`) | Fail | Selecting Eligible left `queue=21`, Registration pending stayed pressed, and the two pending rows did not change. The new current-source release gate also failed because the deployed page has no `Queue` combobox. |
| Deterministic 25,000-lead board (`ENR-P11/X10`) | Pass after test correction | The deployed board made multiple distinct `pipelineColumn` requests with a maximum page size of 25 and displayed `Column 0`, `Column 1`, and `Column 2` fixture applicants in their respective columns. The first failure was a stale-fixture false positive. |
| Pipeline chip contrast (`ENR-A10`) | Fail | `Registration Done` still renders as `#00838f` at approximately 11.2px on `#fbfbfc`, retaining the 4.37:1 WCAG AA failure. |
| My Work search/filter persistence (`ENR-W01`) | Fail | A private sentinel was absent from the URL as required, but the search value was empty after navigating to Pipeline and returning to My Work. The new column-filter return-state assertion is covered by the same read-only gate. |
| Checked-out frontend against stage API | Environment blocked | Local login succeeded, but the stage API rejected the localhost origin, leaving the UI at No permission with `Failed to fetch`; this run is not a product verdict. |

## Defects

### ENR-S01 — Board-scoped principals receive cross-board UserScope

- Severity: P0
- Reproducibility: 100% with the seeded `principal-gseb` account
- Actual: the GSEB principal hierarchy reported full-board access and the enrollment isolation regression could read CBSE-scoped data.
- Expected: explicitly named GSEB/CBSE principal and teacher test accounts may receive stages only from their configured board; revoking an Academic Permission must revoke its derived UserScope.
- Root cause: three HR/Academic Permission seeding paths treated every `Principal` as a broad-access role before considering the account's named board. `AcademicPermissionUserScopeSyncer` inserted derived assignments but never deactivated assignments whose source permission was removed.
- Fix: one shared seeded-account board policy is used by all three assignment paths; a seed rerun removes only wrong-board organization assignments and stage permissions for explicitly scoped accounts. The UserScope sync now deactivates obsolete derived assignments, invalidates affected caches, and preserves manual scopes and same-board permissions.
- Regression: two domain policy tests cover GSEB, CBSE, and generic administrator behavior; six UserScope sync tests pass, including permission removal and manual-scope preservation.

### ENR-P04 — Malformed contact data can be persisted

- Severity: P2
- Discovery: deterministic UI-to-DTO-to-domain audit after a malformed phone was accepted and reduced to one digit.
- Actual: values such as `abc1` could reach lead or person persistence because normalization removed non-digits without first validating the input.
- Expected: optional phone and email values must be valid when present; phone formatting may be international but must contain 7–15 ASCII digits, and identity dates cannot be in the future.
- Fix: one shared backend contact rule is enforced by lead/person aggregates and DTO validation. Quick inquiry, direct registration, and guardian identity UI now share inline phone/email boundaries and length limits.
- Regression: ten lead contact-domain cases, person/DTO validation cases, and the frontend phone matrix pass.

### ENR-P07/X04 — Public inquiry retries can create duplicate leads

- Severity: P1
- Discovery: source audit of double-click, timeout, refresh, and confirmed-success retry paths.
- Actual: the public form had only render-time button disabling. A timeout followed by retry could create another lead; a key retained after confirmed success could also cause a genuinely new inquiry to resolve to the old result.
- Expected: uncertain retries return the original outcome without another lead, while a confirmed success ends that idempotency window so a later inquiry is new.
- Fix: immediate in-flight guard, unguessable session retry key, backend submission-key persistence, unique tenant/template/key index, original lead/status result recovery, and key cleanup only after confirmed success. Quick inquiry and direct registration also re-run duplicate preview after ambiguous failure.
- Regression: frontend contract covers key reuse and post-success cleanup; EF model and generated migration SQL are verified; the public HTTP test posts the same request twice and receives the same lead and status token.

### ENR-A08/E13 — Mutation failures are generic and bulk row failures are hidden

- Severity: P2 (`ENR-E13` remains a P1 test-plan risk because hidden partial persistence can mislead staff)
- Discovery: invalid exam result and bulk-operation response-path audit.
- Actual: several workspaces fell back to generic retry messages, and bulk exam failures did not identify the affected applicant or make partial-success semantics clear.
- Expected: known conflicts and HTTP failure classes have safe actionable copy; bulk successes remain saved while each failed row stays selected with its own reason.
- Fix: shared safe API error mapping, slot refresh after schedule conflict, and applicant-specific bulk failure mapping/presentation.
- Regression: focused frontend error/bulk tests pass, and three HTTP bulk tests prove isolated item failures with successful rows persisted.

### ENR-E07 — No-show and excused attendance are not representable

- Severity: P1
- Discovery: test-plan-to-domain/UI contract audit.
- Actual: only Present and Absent existed. Staff could not distinguish a no-show from an excused absence, while the single-record selector offered Not Marked even though the backend rejects that value.
- Expected: Present, Absent, No-show, and Excused remain distinct and filterable; only valid staff actions are editable; results cannot be recorded for non-attendance; undefined values are rejected server-side.
- Fix: stable enum values for No-show/Excused, aggregate invariants, analytics/queue/automation/public-status handling, UI labels/colors/filters, and single/bulk actions that exclude Not Marked.
- Regression: 12 focused domain cases, two frontend contract cases, and the executed HTTP workflow preserving both new states while rejecting value `999`.

### ENR-E08 — Invalid exam marks are not stopped in the UI

- Severity: P2
- Reproducibility: 100%
- Actual: with total marks 100, obtained marks 101 left Save Result enabled. The server rejected the mutation and the UI showed only a generic retry toast.
- Expected: obtained and passing marks must remain within 0–total; invalid fields should explain the boundary and the request must not be sent.
- Fix: shared single/bulk mark validator, inline helper text, numeric min/max/step attributes, and disabled invalid submission.
- Regression: `exam-result-validation.test.ts` covers valid boundaries, above-total values, zero/negative/non-numeric values, and non-integer merit rank.

### ENR-E03 — Inactive or already-started exam slots accept scheduling attempts

- Severity: P1
- Discovery: deterministic backend source audit; the live golden path used an active future slot.
- Actual: the scheduling service checked capacity but did not enforce the slot's active flag or start time.
- Expected: inactive, past/started, unknown, and full slots are rejected server-side without consuming capacity.
- Fix: the slot aggregate now owns `EnsureCanAcceptReservation`; scheduling calls it before the capacity reservation.
- Regression: five exam-slot domain tests pass, including inactive and already-started slots; HTTP regressions cover server-side inactive-slot rejection.

### ENR-E04 — Concurrent last-seat scheduling can overbook a slot

- Severity: P0
- Discovery: deterministic backend source audit of the count-then-insert path.
- Actual: two requests could both observe one remaining seat and insert separate exam records because no shared concurrency token was advanced.
- Expected: exactly one last-seat request succeeds; the competing request receives a conflict/full response and persisted reservations never exceed capacity.
- Fix: scheduling marks the shared slot aggregate updated inside the same unit of work as the capacity count and exam insertion. ABP/EF advances the loaded concurrency token; code does not replace the predicate manually. A competing transaction loses the optimistic concurrency race.
- Regression: slot concurrency-token metadata plus the executed HTTP race: two simultaneous requests produced exactly one success and one persisted reservation.

### ENR-R09 — Registration submit does not identify invalid fields

- Severity: P2
- Reproducibility: 100%
- Actual: empty Submit registration showed “One or more business rules were violated.” No field was marked invalid and no actionable message appeared.
- Expected: visible required or malformed fields are marked inline, summarized once, and focused/readable through assistive technology before any API call.
- Fix: client validation for required, conditional visibility, length, regex, email, phone, date, number, select, and multi-select rules; error summary and MUI field errors.
- Regression: `registration-response-validation.test.ts` covers required fields and an impossible calendar date.

### ENR-R06/R07 — Registration prefill lookup is case-sensitive

- Severity: P2
- Reproducibility: 100%
- Actual: stored prefill keys such as `firstName` and `primaryContactNo` did not match template system fields such as `FirstName` and `PrimaryContactNo`. Known applicant values appeared blank and progress began at 0%.
- Expected: configured system fields resolve prefill without casing differences; UI and backend completion use the same effective values.
- Root cause: JavaScript object lookup and the backend deserialized `Dictionary` both used case-sensitive key comparison for this path.
- Fix: case-insensitive frontend lookup and backend `StringComparer.OrdinalIgnoreCase`; UI progress is calculated from effective visible values.
- Regression: frontend prefill/progress test and backend `Should_Match_Camel_Case_Prefill_To_Pascal_Case_System_Fields`.

### ENR-R10 — Stale registration tabs can silently overwrite newer responses

- Severity: P0
- Discovery: deterministic API-contract audit of public and staff save/submit requests.
- Actual: requests carried only response values. A tab loaded before a newer save could later overwrite that save; sequential stale writes were not distinguishable from current writes.
- Expected: every save/submit presents the version it loaded; a successful mutation returns a new version; stale edits and competing double-submits are rejected without losing the user's local entries.
- Fix: optimistic-lock version added to staff and applicant DTOs, aggregate guard, EF-owned token advancement, RTK/public request bodies, and friendly English/Gujarati/Hindi conflict recovery copy. The staff editor retains the newest returned version between actions.
- Regression: domain matching/missing/mismatched-token tests, EF metadata, public request contract/UI coverage, and the executed secure HTTP workflow covering first save plus stale-save rejection. Competing staff submit remains covered by the compiled HTTP regression and deploy re-test matrix.

### ENR-R14 — Registration documents trust filename extension without validating content

- Severity: P0
- Discovery: deterministic backend source audit of the applicant upload path.
- Actual: a file named `.pdf` could pass with arbitrary bytes; declared MIME, actual length, unsafe checklist extensions, and path-bearing names were not cross-checked in the owning service.
- Expected: empty/mismatched/oversize/unsafe files are rejected before blob creation; accepted files have a globally safe extension, matching magic bytes and MIME, exact size, safe filename, and valid expiry metadata.
- Fix: one upload validator now enforces size, safe filename, checklist and global extension allowlists, magic bytes, MIME mapping, and validity dates. Legacy DOC/XLS signatures are checked even for short content.
- Regression: nine application cases cover valid PDF, spoofed bytes, MIME mismatch, unsafe/path/oversized names, size/limit mismatch, and the short legacy Office bypass. Existing HTTP upload fixtures now contain valid PDF signatures.

### ENR-R21 — Registration worklist tabs do not change the dataset

- Severity: P2
- Reproducibility: 100% with semantic click and coordinate click
- Actual: Registration pending remains `aria-pressed=true` after clicking Eligible or Registration done; the same three pending rows remain visible and there is no empty/loading explanation.
- Expected: the selected tab becomes pressed and loads its matching scoped dataset or a clear empty state.
- Root cause: current `ApplicantWorklistWorkspace` read and wrote an unknown `worklist` query parameter. `EnrollmentWorkspaceProvider` canonicalizes the supported state and removed that parameter immediately, preserving the unrelated legacy `queue=21` value and reverting the pressed tab.
- Fix: worklists now read and write the canonical `column` parameter, which maps directly to `AdmissionCrmPipelineColumnKey` and the API's `pipelineColumn` filter.
- Regression: a source contract prevents `worklist` from returning, and the read-only Playwright gate selects Eligible (`column=4`) and Registration done (`column=6`) while requiring matching scoped lead requests. Stage still fails until this frontend change is deployed.

### ENR-W01 — My Work and Registration table state is lost across navigation

- Severity: P2
- Reproducibility: 100% in the read-only stage gate
- Actual: My Work search is kept out of the URL, but navigating to Pipeline and back clears it. Applicant and target-class column filters were written as unsupported URL parameters and were immediately removed by workspace canonicalization. Registration worklist search used the same route-local pattern and did not survive workspace navigation.
- Expected: applicant-entered search/filter text remains private, is isolated by tenant, user, admission year, and workspace, and survives in-session navigation without leaking into browser history or copied URLs.
- Root cause: `EnrollmentOverviewWorkspace` and `ApplicantWorklistWorkspace` owned private table state through URL parameters, while `EnrollmentWorkspaceProvider` serializes only the canonical workspace-state schema.
- Fix: both workspaces now use the existing tenant/user/year-scoped session table-state hook for applicant-entered search and text filters. Page, sort, urgency, priority, and worklist column remain canonical structural URL state.
- Regression: focused route contracts require session state and forbid direct applicant-search URL reads; the session-state hook isolation/persistence suite passes; the read-only Playwright gate verifies URL privacy plus My Work return-state persistence. Stage retains the old behavior until deployment.

### ENR-P19 — Admission-year intake rejects a valid route-type-only lead

- Severity: P1
- Discovery: configuration-safety HTTP workflow using a published admission-year setup.
- Actual: when the setup allowed a route type without requiring a versioned route-definition ID, lead creation supplied a fallback route-name snapshot while leaving definition ID/version empty. The domain correctly rejected this half-populated snapshot as `AdmissionCrm:InvalidIntendedRouteDefinition`.
- Expected: route type alone remains valid when the published admission-year setup allows it; definition ID, version, and name snapshot must either all describe a selected definition or all remain empty.
- Fix: lead creation stores the route-name snapshot only when an actual route definition was resolved.
- Regression: the versioned admission-year workflow now explicitly creates its required source/type configuration, creates a Fresh route-type-only lead, and asserts null definition ID/version/name snapshot. Configuration Safety passes 12/12.

### ENR-A10 — Pipeline stage chip does not meet WCAG AA color contrast

- Severity: P2
- Reproducibility: 100% in the automated stage accessibility scan
- Actual: the small `Registration Done` chip renders `#00838f` text on `#fbfbfc`, producing 4.37:1 contrast at approximately 11.2px. Axe classifies this as a serious WCAG 2 AA `color-contrast` violation.
- Expected: normal-size text must meet at least 4.5:1 contrast.
- Root cause: current `PipelineStageColumn` applied each column accent color to the small chip text as well as its border. Registration Done uses `#00838f`, which is too light as normal-size foreground text on the neutral surface.
- Fix: keep the accent-colored border/top rule while using theme `text.primary` for the chip label.
- Regression: the enrollment route contract asserts the accessible foreground rule; the stage axe gate remains required after deployment.

### ENR-A11 — Enrollment skip link does not move focus to the workspace

- Severity: P2
- Original observation: a synthetic in-app-browser click left focus outside the workspace and did not update the hash or scroll/focus destination.
- Expected: keyboard and pointer activation move focus to the main enrollment workspace so keyboard and screen-reader users can bypass repeated navigation.
- Fix: the shell now prevents default anchor handling, focuses the existing workspace target without forcing an initial scroll jump, and scrolls it into view.
- Regression: `enrollment-shell.test.tsx` verifies the target receives focus and `scrollIntoView`; a dedicated 2026-08-08 Playwright keyboard test also passes on stage. This item remains a deterministic local enhancement awaiting deployment, not one of the three open deployed defects.

### ENR-A12 — Registration document controls have ambiguous accessible names

- Severity: P2
- Reproducibility: 100% on the synthetic registration containing two document requirements
- Actual: both upload inputs were announced as “Choose File” and both reason fields as “Decision or waiver reason”; upload/review buttons were also generic.
- Expected: every document action names its requirement so assistive-technology and voice-control users can select the correct record.
- Fix: upload input, validity date, reason, upload, verify, reject, original-seen, and waive controls now include the document requirement name in their accessible label.
- Regression: the applicant workspace contract test asserts requirement-specific labels for upload, review, and waiver actions.

### ENR-X11 — Activation preview stalls after a Student exists in the division

- Severity: P1
- Discovery: complete AdmissionCrm HTTP-suite execution after eliminating orphaned test hosts.
- Actual: the first activation could complete, but a later preview in the same division consumed a CPU core indefinitely while loading a Student aggregate with all configured automatic collection includes merely to count occupancy and find a roll number.
- Expected: activation preview must use bounded database count/exists operations and remain responsive regardless of existing Student aggregate detail volume.
- Fix: placement validation now uses the repository's no-auto-include query and executes tenant/year/division-scoped `Count` and `Any` queries without materializing Student graphs.
- Regression: the governed-route HTTP test seeds a preexisting inactive Student and gives preview a 10-second request deadline. The current-main Activation HTTP class passes 4/4 in 1m53s. The larger current-main `AdmissionCrm` aggregate exceeded the 15-minute validation ceiling and is not claimed as a pass or failure.

### ENR-X12 — Existing guardian reuse is rejected as if creating a new guardian

- Severity: P1
- Discovery: complete AdmissionCrm HTTP-suite execution.
- Actual: a request containing `ExistingGuardianPersonId` but no new `Guardian` body failed validation because the DTO instantiated an empty nested person and required its first name.
- Expected: existing-person reuse must validate the referenced tenant-scoped person and relationship only; new-person fields are required only when an existing guardian is not selected.
- Fix: guardian input is optional when an existing guardian ID is present, conditionally required otherwise, and guarded again in the application service. The frontend no longer sends a fabricated `firstName: "Existing"` payload for reuse.
- Regression: the HTTP sibling workflow proves missing new-person details return 400 while existing household/guardian reuse succeeds without creating another person; the frontend contract prevents the placeholder payload from returning.

### ENR-X13 — Configuration impact preview can stall while rebuilding the academic hierarchy

- Severity: P1
- Discovery: bounded quick-inquiry route/options HTTP regression; the channel-settings update remained inside impact preview for more than three minutes and consumed a test-host CPU core.
- Actual: the snapshot reader queried board, medium, medium stage, standard, and division separately even though each parent query auto-included the same descendants. EF repeatedly materialized and fixed up overlapping hierarchy graphs before computing a fingerprint.
- Expected: configuration preview/fingerprint/clone reads the hierarchy once and completes within a bounded request window.
- Fix: load the tenant/year board hierarchy once, then flatten its already-loaded descendants with tenant checks instead of re-querying every nested level.
- Regression: the formerly hanging route/options test has labelled 30-second operation deadlines and passes in 1m23s including host startup; the complete Configuration Safety class passes 12/12 after the optimization.

### ENR-X14 — Stale and SLA automation endpoints return 500 in the supported HTTP harness

- Severity: P1
- Discovery: full general Admission CRM HTTP execution.
- Actual: stale/archive and SLA reminder queries ordered `DateTimeOffset` values inside SQL. SQLite, used by the repository's HTTP integration harness, supports equality but cannot translate those comparisons; manual and background automation paths returned 500, breaking five workflows.
- Expected: tenant/user scope remains server-side, cutoff evaluation is provider-portable, and only cutoff-matching leads are materialized for mutation.
- Fix: both automations first project scoped active lead IDs plus activity timestamps, evaluate the cutoff over that small projection, then load full entities only for matching IDs. No tenant or UserScope predicate is moved client-side.
- Regression: ten combined checklist/OTP/task/stale/SLA cases pass, including manual runs, background entry points, reminder deduplication, owner notification, stage-specific SLA, and pause/resume audit history.

### ENR-P11/X10 — Corrected test contract confirms scoped board columns at scale

- Classification: test defect / false positive; product gate now passes.
- Original mistake: the fixture read only `stage`, generated the same IDs for every request, and asserted that the application sent a legacy `stage` query parameter.
- Actual contract: `PipelineStageColumn` sends `pipelineColumn: column.key`; the API request builder preserves it unchanged.
- Correction: fixture IDs, names, and DTO `pipelineColumn` values are column-specific. The gate requires multiple distinct `pipelineColumn` requests, a maximum column page size of 25, no duplicate fixture identities, and card/column alignment when the deployed build exposes the current test hooks.
- 2026-08-08 evidence: the corrected read-only stage gate passed in 33.8 seconds. The deployed UI visibly rendered Column 0 applicants under New Inquiry, Column 1 under Follow-up, and Column 2 under Exam Pending.

## Automated validation

| Command / check | Result |
| --- | --- |
| Current-main enrollment/public/API frontend Vitest scope | 65 files, 437 tests passed |
| Current-main backend application tests filtered to `Students.Enrollment` | 40/40 passed; post-fix `AdmissionCrm` re-run 39/39 passed |
| Current-main backend domain tests filtered to `Students.Enrollment` | 82/82 passed; post-fix `AdmissionCrm` re-run 80/80 passed |
| Exam capacity and slot-state regressions | Passed | Domain slot guards and EF concurrency metadata are green; the HTTP inactive-slot case passed and the two-request last-seat race produced one winner and one persisted reservation. |
| Applicant status OTP/token safety | 5/5 passed | Expiry, cooldown, five-attempt lock, tampered/expired sessions, and reissue invalidation. Existing HTTP coverage also checks masking and correct-OTP rejection after lock. |
| Registration optimistic concurrency | Passed | Four domain boundary tests, EF metadata, frontend version contract, and the complete secure HTTP registration workflow including first save and stale-save rejection. |
| Public inquiry idempotency | Passed | Frontend retry/success cleanup contracts, EF model index, focused HTTP same-key retry, and generated narrow migration SQL all pass. |
| Bulk attendance/result partial-success semantics | 3/3 HTTP tests passed | Successful rows persist, invalid rows fail independently, and the UI maps failures back to applicant-specific reasons. |
| Document upload content validation | 9/9 passed | Magic bytes, MIME, extension, cross-platform path and long filename rejection, exact size, maximum size, and legacy Office signature bypass. |
| Seeded board-scope policy regressions | 2/2 passed |
| Academic Permission → UserScope sync suite | 6/6 passed, including stale-scope revocation |
| Full HR seeder test class | Existing baseline failure | 21/22 passed; `student-crm-denied@ddvs.com` is seeded as a login but has no HR profile. Both new board-policy tests pass separately. |
| UserScope application guardrail class | Existing baseline failure | Seeder non-destructive check passed; the separate application-source guardrail reports 70 pre-existing direct scope-collection inspections in Dashboard and Student Records files not changed by this work. |
| Focused ESLint on all changed enrollment files | Passed |
| Stage CRM persona permission suite | 3/3 passed (receptionist, counselor, approver) |
| Stage enrollment responsive suite | Passed across configured release viewports |
| Stage automated accessibility suite | Failed on `ENR-A10`; one serious pipeline chip contrast violation |
| Deterministic 25,000-lead fixture | Passed after contract correction | List bounded at 50; board requests were bounded at 25 and scoped by distinct `pipelineColumn` values; visible fixture identities differed by column. |
| Targeted 2026-08-08 stage release gates | Board, skip, preflight, and URL privacy pass; Registration, contrast, and My Work return-state fail | Registration still ignores Eligible/Registration done; contrast remains 4.37:1; My Work search clears after leaving and returning even though the value remains out of the URL. |
| New browser regression contracts | Passed focused Vitest/lint; stage board gate passed; My Work return-state reproduced failing | Gates assert skip focus, canonical URL/request-backed Registration worklists, private session table state, distinct pipeline-column requests, card/column alignment, and no cross-column duplicate IDs. |
| Settings request-ownership test | Passed |
| Current-source URL/settings navigation tests on stage | 2 failed because legacy stage lacks the current links; recorded as deployment-alignment evidence |
| Conflicting tenant-header regression | Pass | A DDVS bearer token remained bound to the DDVS response when the request supplied the valid `SSVM` tenant code; the header could not change authenticated tenant context. The test keeps the token inside the browser session so timeout diagnostics cannot echo it. |
| Real two-tenant token/ID matrix | Environment unavailable | Stage reports Tenant not found for both documented secondary tenants (`SSVM` and `Forgot`). An environment-gated regression was added and skips cleanly until a second tenant code and admin are supplied. |
| Board-scoped principal isolation | Failed on stage; fixed locally | `principal-gseb` currently reports full-board access. The backend fix restricts seeded accounts by board, removes wrong-board seeded rows, and deactivates obsolete derived UserScope rows. |
| TypeScript (`tsc --noEmit`, 8 GB process heap) | After correcting one enrollment E2E assertion type, only three unrelated baseline request-helper errors remain in Academic, HR, and Library E2E files. |
| Complete current-main Admission CRM backend HTTP inventory | 151/151 passed in bounded class/batch runs | All general CRM, registration, activation, household identity, bulk operations, configuration safety, final admission, governance, playbook, special-route, policy-governance, and data-quality executions passed. The general class was run in indexed batches after isolating and repairing the former hang; Configuration Safety was re-run 12/12 after the snapshot optimization. |
| EF idempotency migration | Passed | EF discovers `20260808070000_AddAdmissionInquirySubmissionIdempotency`; generated SQL contains only the nullable key, unique tenant/template/key index, and migration history row. |
| Local fixed-build browser smoke | Environment blocked after login | Authentication succeeded, but the stage API rejected the localhost origin, so permissions/data did not hydrate and the page rendered No permission with `Failed to fetch`. |
| `git diff --check` | Passed in both repositories |

## Remaining sign-off work

1. Deploy both repository fixes to the stage environment through the normal release workflow.
2. Re-run the backend seeders, then re-test `ENR-S01`, `ENR-P04`, `ENR-P07/X04`, `ENR-P19`, `ENR-A08/E13`, `ENR-E07`, `ENR-E08`, `ENR-R09`, `ENR-R06/R07`, `ENR-R21`, `ENR-W01`, `ENR-A10`, `ENR-A11`, `ENR-A12`, `ENR-X11`, `ENR-X12`, `ENR-X13`, and `ENR-X14` against the aligned stage build in the Codex in-app browser. `ENR-P11/X10` already passes the corrected deployed gate.
3. Apply migration `20260808070000_AddAdmissionInquirySubmissionIdempotency`, then execute the real second-tenant token/ID matrix when a second stage tenant is supplied. Re-run slot concurrency, OTP/token, registration concurrency, finance/readiness, public retry, bulk failure isolation, and document-content cases against the deployed build. Conflicting-header isolation already passes. Distinct readiness approvers are covered by a passing domain test; the one-approver live stage path also passed.
4. Finish the keyboard, accessibility re-test, and localization pass; the configured responsive route sweep is already green.
5. Issue QA sign-off only when no P0–P2 issue remains open and the deployed regression re-test is green.
