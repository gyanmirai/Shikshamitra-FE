# Student Enrollment E2E execution matrix — 2026-08-07

This matrix records the evidence obtained against the 74 cases in `STUDENT_ENROLLMENT_E2E_TEST_PLAN.md`. A passing local automated check is not represented as a deployed-stage pass. "Partial" means at least one important variant in the case still requires stage execution. Additional defects found while executing the matrix retain their own issue IDs below.

## Status definitions

| Status | Meaning |
| --- | --- |
| Live pass | The expected behavior was observed in `app.gyanmirai.in` with stage APIs. |
| Automated pass | Focused frontend, application, or domain coverage passed locally; deploy re-test may still be required. |
| Partial | Some variants passed, but the full matrix was not safely executable or remains automated-only. |
| Fixed locally | A defect was reproduced or found by source audit, fixed, and covered by regression tests; stage still has the old build. |
| Backend stage pass | The backend repair is deployed and the affected stage API or browser workflow passed; an aligned frontend re-test may still remain. |
| Open | A deployed defect remains and cannot be safely patched until stage/source versions align. |
| Environment unavailable | The required second tenant or executable HTTP test host is unavailable. |

## A. Access, cycle selection, and workspace foundation

| ID | Status | Evidence / remaining gap |
| --- | --- | --- |
| ENR-A01 | Live pass | Anonymous protected routes and API calls did not disclose enrollment records; authenticated access succeeded. |
| ENR-A02 | Automated pass | Receptionist, counselor, and approver stage policy checks passed. A focused HTTP matrix also returned 403 for 15 sensitive CRM reads/mutations with no granted CRM permissions. |
| ENR-A03 | Live pass | Read-only persona controls matched the granted/denied stage policy matrix. |
| ENR-A04 | Partial | Cycle context and URL-scoped reload behavior passed; a second populated admission cycle was not available for row/count parity. |
| ENR-A05 | Live pass | Deep link, reload, and applicant Back restored cycle, board, medium, view, and search state without putting search text in the URL. |
| ENR-A06 | Live pass | Unknown and malformed cycle IDs retained the requested context and rendered a safe zero-row table without mutation fallback or console errors. |
| ENR-A07 | Live pass | Applicant Back returned to the exact searched pipeline state; search remained out of the URL. |
| ENR-A08 | Fixed locally | A shared safe error reader now maps known CRM conflicts plus 401/403/404/409/422/500 recovery copy without exposing raw server details; focused regressions pass and stage re-test remains. |
| ENR-A09 | Automated pass | Workspace request/state contracts cover cycle-keyed state and stale request isolation; no live race failure was observed. |
| ENR-A10 | Open + fixed locally | Stage axe scan and 2026-08-08 re-test found the open 4.37:1 chip contrast defect. The dedicated keyboard skip-link re-test now passes; deterministic focus/scroll behavior and unique registration document names remain fixed with regressions locally. |

Additional finding: `ENR-W01` is open on stage and fixed locally. The read-only gate proves My Work search stays out of the URL but clears after navigating away and back. My Work and Registration now use tenant/user/year/workspace-scoped session state for applicant-entered search and text filters while retaining structural URL state.

Latest findings: `ENR-W02` (My Work class/owner lookup HTTP 500) and `ENR-P20` (public route-snapshot invariant) are backend stage passes. `ENR-W03` protects unsaved applicant work when opening Activity & Audit, and `ENR-P21` replaces stale active-pipeline presentation for archived applicants; both frontend stage workflows now pass.

## B. Pipeline and inquiry capture

| ID | Status | Evidence / remaining gap |
| --- | --- | --- |
| ENR-P01 | Live pass | One synthetic inquiry was created once, auto-assigned, scored, shown in the pipeline, and recorded in activity history. |
| ENR-P02 | Live pass | Empty quick inquiry showed inline errors for student, guardian, contact, board, medium, and standard. |
| ENR-P03 | Automated pass | Domain and UI contracts cover trimming, apostrophes, hyphens, Gujarati/Hindi Unicode names, the 100-character boundary, and overflow rejection without proliferating stage records. |
| ENR-P04 | Fixed locally | Source/API audit found arbitrary text could be stripped into a one-digit phone and persisted. Shared UI, DTO, and aggregate rules now enforce 7–15 ASCII digits with safe international formatting plus valid email/future-DOB boundaries; 10 contact-domain cases and DTO/UI regressions pass. |
| ENR-P05 | Automated pass | Same phone/email passed live. Five executed HTTP cases cover contact, parent/class, DOB/class, internal-only public duplicate recording, and cross-tenant non-disclosure. |
| ENR-P06 | Live pass | Create Anyway focused the mandatory reason; no duplicate was created without a reason. |
| ENR-P07 | Fixed locally | Immediate in-flight guards protect quick/direct registration. Public inquiry now uses a durable tenant/template-scoped idempotency key, a unique database index, same-result retry behavior, and post-success key cleanup; the focused HTTP retry test passes. |
| ENR-P08 | Automated pass | Inquiry-source utilities distinguish active choices from historical inactive values. |
| ENR-P09 | Live pass | The synthetic lead used cycle-configured board, medium, and standard values and persisted them correctly. |
| ENR-P10 | Automated pass | Applicant search, clear/return state, pagination bounds, and empty behavior passed live. Server-filter/state contracts cover stage, channel, owner, class, score, and priority filters plus clear-all behavior. |
| ENR-P11 | Stage pass after test correction | The original fixture watched obsolete `stage` requests and manufactured duplicate IDs. The corrected gate verifies distinct bounded `pipelineColumn` requests and column-specific identities; it passed against stage in 33.8 seconds. |
| ENR-P12 | Automated pass | Auto-assignment and actor history passed live. Executed HTTP workflows cover assign, clear, reassign, archive/reopen, and create/list/complete follow-up tasks. |
| ENR-P13 | Live pass | The synthetic applicant retained distinct score (60 then 80) and Warm priority presentation. |
| ENR-P14 | Live pass | Golden-path movements occurred once and produced downstream exam/registration activity. |
| ENR-P15 | Automated pass | Domain/API governance tests cover invalid, backward, terminal, and governed transitions. The Governance HTTP class passes 3/3 and the complete bounded Admission CRM HTTP inventory passes 151/151. |
| ENR-P16 | Automated pass | Concurrency/domain contracts cover protected updates; no silent stage overwrite was intentionally induced on the synthetic record. |
| ENR-P17 | Automated pass | Terminal-state and downstream-eligibility rules are covered by governance/final-admission tests. |
| ENR-P18 | Automated pass | Dirty-context regressions cover navigation protection and retaining the applicant draft/context. |
| ENR-P19 | Fixed locally + HTTP pass | A published admission-year setup allowed a route type without a selected definition, but lead creation populated only the definition-name snapshot and the domain rejected the inconsistent triple. Route name is now stored only with a resolved definition; the workflow asserts null ID/version/name for route-type-only intake and Configuration Safety passes 12/12. |
| ENR-P20 | Backend stage pass | Public form submission against a published route-type-only setup now succeeds after removing the inconsistent definition-name snapshot. The focused public browser workflow passes through lead creation, status path, and OTP challenge. |
| ENR-P21 | Live pass | Closed applicants show the archived lifecycle state and closed outcome instead of a stale active pipeline column; terminal actions remain suppressed. |

## C. Entrance exam lifecycle

| ID | Status | Evidence / remaining gap |
| --- | --- | --- |
| ENR-E01 | Live pass | The eligible synthetic applicant was scheduled once into the available Morning A slot. |
| ENR-E02 | Automated pass | Scheduling prerequisite and registration-before-exam policies are covered by backend governance tests. |
| ENR-E03 | Fixed locally + HTTP pass | Source audit found inactive/started slots were not guarded. The aggregate now rejects them; slot-domain cases pass and the server-side inactive-slot HTTP regression executed successfully. |
| ENR-E04 | Fixed locally + HTTP pass | The last-seat race lacked a shared concurrency write. The shared slot aggregate is now marked updated in the reservation unit of work so ABP/EF advances the loaded concurrency token; the real two-request HTTP race passed with exactly one winner and one persisted reservation. |
| ENR-E05 | Automated pass | Active-assignment uniqueness and guarded submit behavior are covered by backend/contract tests. |
| ENR-E06 | Automated pass | Cancellation/reschedule capacity and retained-record behavior are covered by exam record/API tests. |
| ENR-E07 | Fixed locally + HTTP pass | Audit found No-show/Excused were missing and the edit selector offered backend-invalid Not Marked. Distinct states, non-attendance result blocking, invalid-enum rejection, filters, labels, and bulk actions are implemented; 12 domain cases and the focused HTTP workflow pass. |
| ENR-E08 | Fixed locally | Stage allowed 101/100 to reach the API and returned a generic error. Shared validation now blocks invalid single/bulk marks and explains the boundary. |
| ENR-E09 | Automated pass | Entrance exam aggregate tests cover component totals and deterministic calculated outcomes. |
| ENR-E10 | Live pass | 85/100 persisted as Pass and Eligible; boundary policies have backend coverage. |
| ENR-E11 | Automated pass | Override permission/reason/audit invariants are covered by governance and exam tests. |
| ENR-E12 | Automated pass | Result/eligibility consistency invariants are covered by the exam aggregate and API contract suite. |
| ENR-E13 | Fixed locally + automated pass | The UI now retains failed rows and shows applicant-specific failure reasons while explaining that successful rows were saved. Three HTTP bulk tests pass, proving intentional partial-success semantics and isolated attendance/result failures. |
| ENR-E14 | Automated pass | Applicant deep-link, cycle scope, exact table return state, server filter/sort mapping, pagination bounds, and empty-state contracts pass without multiplying stage exam records. |

## D. Registration and documents

| ID | Status | Evidence / remaining gap |
| --- | --- | --- |
| ENR-R01 | Live pass | The applicable published template issued one unique registration, `DDVS-REG-00006`, with audit evidence. |
| ENR-R02 | Automated pass | Missing/draft/inactive/ambiguous template applicability is covered by registration policy and platform-setup tests. |
| ENR-R03 | Automated pass | Automatic issuance and no duplicate active form passed live. The executed secure HTTP workflow rejects repeat issue, revokes and reissues the same application/form number, rotates the applicant status path, and completes the replacement-link journey. |
| ENR-R04 | Automated pass | Five focused OTP/status tests pass for expiry, cooldown, five-attempt lock, tampering, and reissue invalidation; deployed re-test remains. |
| ENR-R05 | Automated pass | Expired, revoked/reissued, and tampered token behavior is covered by focused status/API tests without exposing raw tokens. |
| ENR-R06 | Fixed locally | Stage prefill lookup was case-sensitive. UI and backend now resolve system fields case-insensitively and lock configured fields consistently. |
| ENR-R07 | Fixed locally + live pass | Draft values survived reload and completion reached 75%; the case-insensitive effective-progress defect is fixed locally. Multi-session conflict protection is covered by ENR-R10. |
| ENR-R08 | Automated pass | Conditional visibility, clearing, required-field, and effective-value rules are covered by registration validation tests. |
| ENR-R09 | Fixed locally | Empty stage submission returned only a generic business error. Inline field validation, summary, and focus behavior now prevent the request. |
| ENR-R10 | Fixed locally + HTTP pass | Save/submit had no loaded-version contract. Staff and applicant paths now compare the loaded token while ABP/EF owns persisted token advancement. The complete secure registration HTTP flow passes, including first save and deliberate stale-save rejection. |
| ENR-R11 | Automated pass | Correction/resubmission history and field-preservation behavior are covered by registration API/domain tests. |
| ENR-R12 | Automated pass | Live readiness stayed blocked without required evidence. Finance-owned payment/waiver/zero/already-paid invariants pass domain tests, and the HTTP workflow proves offer/readiness stays blocked until Finance confirms the configured gate. |
| ENR-R13 | Live pass | Two required synthetic document requirements controlled completeness and readiness using the assigned checklist. |
| ENR-R14 | Fixed locally | Source audit found extension-only trust. Exact size, safe name/extension, magic bytes, MIME, validity, and legacy signatures now have nine passing application cases. |
| ENR-R15 | Automated pass | Versioned replacement/history rules are covered by document checklist/API tests; no user file was uploaded to stage. |
| ENR-R16 | Live pass | Blank reasons disabled actions; two explicit waivers persisted with actor, time, and reason. Verify/reject/original-seen permission variants remain automated. |
| ENR-R17 | Automated pass | Two document-expiry reminder policy tests cover the reminder boundary and expiry behavior. |
| ENR-R18 | Automated pass | One-approver readiness passed live; the distinct two-approver/same-user rejection and second-approver completion pass domain coverage. Deployed two-person confirmation remains in the stage re-test list. |
| ENR-R19 | Live pass | Registration completeness alone did not unlock readiness while document/verification blockers remained. |
| ENR-R20 | Live pass | Completed registration, waivers, approval, and readiness produced one stable Admission ready state with audit history. |
| ENR-R22 | Deployed + automated pass | The default public template includes required guardian and target-standard fields populated from published operational standards; builder regressions pass. |
| ENR-R23 | Live pass | The issued form number remains visible in the applicant summary when the required-exam gate becomes current. The stage flow verifies persistence, timeline audit, and subsequent exam scheduling. |

## E. Cross-cutting resilience, privacy, and UX

| ID | Status | Evidence / remaining gap |
| --- | --- | --- |
| ENR-X01 | Environment unavailable | A conflicting valid tenant header could not change the authenticated DDVS tenant. The real two-tenant token/ID matrix cannot run because documented secondary stage tenants return Tenant not found. |
| ENR-X02 | Fixed locally | Stage `principal-gseb` received full-board access. Shared seed policy, wrong-board cleanup, stale derived-scope deactivation, and cache invalidation are covered locally. |
| ENR-X03 | Live pass | Each golden-path mutation was refreshed/revisited and matched persisted tables, status, and activity history. |
| ENR-X04 | Partial | Public inquiry retry is durably idempotent, registration stale writes are rejected through HTTP, and staff creates have immediate in-flight guards plus duplicate re-preview after ambiguous failure. Schedule/result/upload/approval fault injection still requires an aligned deploy. |
| ENR-X05 | Live pass | Back and reload restored pipeline context; Escape closed Quick Inquiry without submission. |
| ENR-X06 | Live pass | Guarded responsive sweep passed configured desktop/tablet/mobile enrollment routes and release viewports. |
| ENR-X07 | Automated pass | Both public language selectors expose English, Gujarati, and Hindi. Complete shell/status/action/recovery copy plus localized date, number, currency, validation/conflict, route, and status formatting pass frontend contracts; an executed HTTP workflow verifies Gujarati and `hi-IN` template, consent, field-label, and option fallback behavior. |
| ENR-X08 | Automated pass | Stage URL/toast/console checks exposed no sensitive values. Executed HTTP cases cover cross-tenant record denial, public duplicate non-disclosure, authenticated PDF download with safe filename/content type/signature, and anonymous download denial. |
| ENR-X09 | Live pass | Activity & Audit showed chronological issuance, saves, submission, verification, waiver reasons, and readiness with actor and timestamp. |
| ENR-X10 | Stage pass after test correction | List stayed bounded at 50 and board columns at 25. Distinct `pipelineColumn` requests rendered distinct Column 0/1/2 applicants; current-source hooks additionally enforce card/column alignment and reject duplicate IDs. |
| ENR-X11 | Fixed locally + HTTP pass | A second activation preview stalled after any Student aggregate existed in the target division because capacity validation loaded the full auto-included Student graph. The service now executes bounded no-include count/exists queries; a deterministic preexisting-student regression has a 10-second request deadline, the Activation HTTP class passes 4/4, and the complete bounded Admission CRM HTTP inventory passes 151/151. |
| ENR-X12 | Fixed locally + HTTP pass | Existing-guardian reuse was rejected by validation of an unused default Guardian object. The contract now conditionally requires new-person details only when no existing guardian is selected; the UI omits unused details, missing new-person data still returns 400, and the sibling household/guardian workflow passes. |
| ENR-X13 | Fixed locally + HTTP pass | Configuration impact preview repeatedly queried and rebuilt the same auto-included board/medium/stage/standard/division graph and could consume a CPU core for more than three minutes. The snapshot now loads the hierarchy once and flattens tenant-checked descendants; the former hang has labelled 30-second operation bounds and Configuration Safety passes 12/12. |
| ENR-X14 | Fixed locally + HTTP pass | Direct `DateTimeOffset` cutoff comparisons made stale/archive and SLA reminder queries untranslatable in the supported SQLite HTTP harness, returning 500 from manual and background paths. Scoped ID/timestamp projection now evaluates only the cutoff client-side and loads full matching entities; the combined automation batch passes 10/10. |

## Release interpretation

- Final aligned stage result: 27/27 executable Playwright cases passed in 13.8 minutes; the one skipped case requires a second configured tenant that stage does not provide.
- Final Codex in-app browser smoke passed Pipeline, Entrance Exams, Registration canonical worklist switching, and My Work.

- No P0 found in this pass is left unfixed in the checked-out source. The slot and registration concurrency fixes now pass real HTTP/EF workflows, but all four P0 fixes still require deployed verification.
- Three deployed UI defects remain open: `ENR-A10` contrast, `ENR-R21` worklist tabs, and `ENR-W01` private table-state persistence. `ENR-P11/X10` was a stale-test false positive and now passes the corrected stage gate.
- All 151 current-main Admission CRM HTTP executions pass through bounded class or indexed-batch runs; this is local evidence and does not replace the aligned stage re-test.
- Partial and environment-unavailable rows are not sign-off passes. They define the exact residual stage matrix after FE/BE deployment and seeder alignment.
