---
module: student
domain: onboarding-readiness
content_type: Reference
status: canonical
updated_on: 2026-09-02
owner: frontend-team
audience: humans-and-agents
---

# Assess Student Onboarding readiness across school sizes

TL;DR: the current frontend is a credible configuration and workflow preview, but it is not yet a production-safe onboarding system for any school size because settings and assignment actions are not persisted. Small-school usability is promising. Growing-school rule resolution needs stronger conflict controls. Large-school release is blocked by missing transactional APIs, concurrency protection, auditability, migration tooling, and measured scale evidence.

## Evidence and scope

This assessment covers Student Setup, Readiness & Access, Identifier Series, Roll Number rules, Division rules, existing Student Management assignment clients, focused frontend tests, and an authenticated browser smoke test.
It does not treat proposed backend contracts, preview data, or UI labels as proof that a backend guarantee exists.
It does not change production code or backend behavior.

| Evidence label | Meaning                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Confirmed      | Directly verified in current source, automated tests, or the authenticated browser                       |
| Proposed       | Present in a draft contract or recommended target design, but not implemented evidence                   |
| Not verified   | Requires backend, database, security, migration, load, or tenant-isolation evidence that was unavailable |

## Executive verdict

| Required rating            | Rating | Evidence-backed verdict                                                                                                                         |
| -------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Small-school usability     | Amber  | The controls and safe previews are understandable, but a non-technical administrator cannot save, publish, or recover configuration             |
| Growing-school flexibility | Amber  | Board/Class targeting and academic-year overrides are modeled, but equally specific rules can be ambiguous and operations remain previews       |
| Large-school scalability   | Red    | The connected list is unpaged and no bulk-job, concurrency, tenant-isolation, or measured scale evidence exists                                 |
| GR governance              | Amber  | Format, range, applicability, and limited overlap checks exist in the frontend; authoritative uniqueness and allocation do not                  |
| Roll-number governance     | Amber  | Scope, ordering, preservation, locks, and mid-year policies are modeled; persisted deterministic assignment and history do not exist            |
| Division governance        | Red    | Policy controls exist, but the current operational command sends only student and Division identifiers and does not enforce the richer rules    |
| Persistence                | Red    | Settings and overrides are React session state and reset on full reload                                                                         |
| Data integrity             | Red    | There is no verified transactional commit, stale-preview check, database uniqueness, capacity lock, or compensation path                        |
| Security and privacy       | Red    | Route permissions exist, while server object authorization, tenant isolation, consent, export, retention, and audit controls are not verified   |
| Accessibility              | Amber  | Responsive layout held in the tested viewports, but first-error focus failed and the student detail action did not operate by click or keyboard |
| Academic-year rollover     | Red    | An override can be modeled in session, but clone, test run, publish, repeat run, reconciliation, and history are absent                         |
| Migration                  | Red    | There is no verified dry run, stable source-key replay, row-error correction, historical import, or reconciliation workflow                     |
| Operational support        | Red    | No job dashboard, alerts, correlation workflow, runbook, rollback, or support evidence exists                                                   |

### Release decision

The current feature should be described as **connected worklist plus configuration preview**, not complete Student Onboarding.
It is suitable for moderated product discovery and non-mutating pilot evaluation.
It should not be enabled for production assignment or activation until the P0 release gates in this document are satisfied.

## Current-state evidence map

| Capability                  | Route or screen                                 | Source file                                                                                                                               | API                                                 | Persistence                   | Permission                                                     | Existing test                                              | Status                                       | Missing evidence                                                 |
| --------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| Setup navigation            | `/student/onboarding/setup`                     | `src/constants/student-menu.ts`, onboarding App Router pages                                                                              | None                                                | Route only                    | Student permission constants and guard                         | `student-menu.permissions.test.ts`, onboarding route tests | Confirmed by source and automated test       | Backend action authorization                                     |
| Connected worklist          | Student Setup                                   | `src/screens/student/onboarding/student-setup/index.tsx`, `src/redux/student/index.ts`                                                    | `GET /students/records/list/by-scope`               | Existing Student Records rows | Query access depends on backend authorization, not proved here | Student API production test                                | Confirmed by source and browser              | Server paging, totals, stable sort, tenant-negative tests        |
| Workflow preview            | Student Setup toggle                            | `student-onboarding-preview-data.ts`, `student-onboarding-model.ts`                                                                       | None                                                | Synthetic client data only    | Same page permission                                           | Model and view tests                                       | Confirmed preview only                       | No production record evidence                                    |
| Individual readiness review | Student Setup drawer                            | `student-setup-drawer.tsx`                                                                                                                | None                                                | None                          | Same page permission                                           | Drawer UI test                                             | Source/test confirmed; browser action failed | Working browser action, live documents/accounts/approval data    |
| Readiness profiles          | `/student/onboarding/settings/readiness-access` | `src/screens/student/onboarding/setting/onboarding-policy-settings.tsx`, `src/screens/student/onboarding/onboarding-settings-context.tsx` | None                                                | Current React session         | Same settings route permission                                 | Settings and projection tests                              | Confirmed preview only                       | Persisted versions, publish, approval, audit                     |
| GR configurations           | Numbering & Placement, GR tab                   | `src/screens/student/onboarding/onboarding-settings-model.ts`, `src/screens/student/onboarding/setting/onboarding-number-settings.tsx`    | None in Onboarding                                  | Current React session         | Same settings route permission                                 | Settings, format, range, applicability tests               | Confirmed preview only                       | Allocator, uniqueness scope, concurrency, idempotency            |
| Roll configurations         | Numbering & Placement, Roll tab                 | `src/screens/student/onboarding/onboarding-settings-model.ts`, `src/screens/student/onboarding/setting/onboarding-number-settings.tsx`    | None in Onboarding                                  | Current React session         | Same settings route permission                                 | Scope, ordering, lock, mid-year tests                      | Confirmed preview only                       | Commit, stable final tie-breaker, historical trace               |
| Division configurations     | Numbering & Placement, Division tab             | `src/screens/student/onboarding/onboarding-settings-model.ts`, `src/screens/student/onboarding/setting/onboarding-number-settings.tsx`    | None in Onboarding                                  | Current React session         | Same settings route permission                                 | Capacity and projection tests                              | Confirmed preview only                       | Authoritative capacity, effective-dated move, side effects       |
| Assignment preview          | Student Setup dialogs                           | `student-assignment-dialog.tsx`                                                                                                           | None                                                | None; confirm disabled        | Same page permission                                           | Assignment dialog tests                                    | Confirmed preview only                       | Preview token, conflict response, commit endpoint                |
| Existing GR operation       | Student Management                              | `src/redux/student/studentGrNumber/student-gr-number-api.ts`                                                                              | GR projection GET and GR assignment POST            | Backend Student Records       | Existing Student Management permissions                        | Duplicate GR E2E assertions                                | Partially operational outside Onboarding     | Connection to Onboarding rule/version and concurrency proof      |
| Existing Roll operation     | Student Management                              | `src/redux/student/roll-number/roll-number-api.ts`                                                                                        | Roll projection GET and Roll assignment POST        | Backend Student Records       | Existing Student Management permissions                        | Maximum and duplicate Roll assertions                      | Partially operational outside Onboarding     | Connection to Onboarding rule/version and idempotency proof      |
| Existing Division operation | Student Management                              | `src/redux/student/index.ts`                                                                                                              | `POST /students/records/divisions`                  | Backend Student Records       | Existing Student Management permissions                        | Component/client coverage                                  | Partially operational outside Onboarding     | Reason, approval, date, capacity, Roll, and integration contract |
| Proposed Onboarding backend | No shipped route                                | `student-onboarding-backend-api-contract.md`                                                                                              | Proposed settings, preview, commit, activation APIs | Proposed                      | Proposed                                                       | Proposed test plan                                         | Proposed contract only                       | Corresponding backend source, database, responses, and tests     |

## School-size configuration matrix

Setup effort is a qualitative result because a clean first-use environment and timed moderated study were not available.

| Scenario                                                        | Required configuration                                                                                               | Setup effort                                                        | Supported today                                                          | Partially supported                                         | Missing                                                                                                  | Operational risk                                                                           | Recommended starting template                                                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Small: 300-800, one Board/Medium, one or two Divisions          | One readiness profile set, yearly GR series, Class-and-Division Roll rule, capacity-blocked Division rule            | Moderate; several detailed drawers and no guided completion measure | Session configuration, previews, academic filters, safe disabled commits | Labels, defaults, rule validation, individual/bulk surfaces | Save/publish, live commit, audit, recovery, timed usability proof                                        | High because reload discards work and no assignment is authoritative                       | Automatic GR after readiness; Roll after Division; manual Division with hard capacity; exception approval                     |
| Growing: 3,000-8,000, multiple Boards/Media and mid-year intake | School defaults, academic-year override, Board/Class exceptions, mixed assignment, approvals, migration mapping      | High without templates or impact simulation                         | Board/Class applicability and modeled year override                      | Precedence, mid-year options, range/capacity previews       | Equal-rule conflict rejection, bulk job, migration, maker-checker, explainability                        | Critical during term start because ambiguous rules and manual recovery can affect hundreds | Base school template plus published Board/Class overrides; mixed assignment; approval for manual identifiers and capacity     |
| Large: 25,000-50,000, concurrent staff, imports/integrations    | Central versioned template, school/campus overrides, async jobs, strict authorization, observability, reconciliation | Not safely measurable in the current UI-only state                  | No proven large-scale operation                                          | An unpaged connected worklist can display returned rows     | Campus model decision, paging, bounded APIs, concurrency, idempotency, load, DR, integration convergence | Release blocking due to integrity, isolation, and recovery exposure                        | No production template until architecture gates pass; then central default with explicit school exceptions and staged publish |

Campus, branch, school-group inheritance, and shared identifier series are not evidenced in the current model.
Product and data owners must decide whether these are supported scopes before backend schema or UI labels imply support.

## End-to-end journey coverage

The UI preview contains synthetic admission-route and readiness examples, but no journey can be classified as end-to-end passed without authoritative documents, approvals, accounts, activation, Student Records, and downstream responses.

| Journey                              | Frontend evidence                                  | Missing end-to-end proof                                                          | Result                                   |
| ------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| Fresh admission                      | Fresh profile and readiness preview                | Authoritative identity through activation and every consumer                      | Blocked by backend and integrations      |
| Transfer with historical identifiers | Transfer profile and preserve/manual concepts      | Historical enrollment/identifier import, collision, and correction                | Blocked by migration contract            |
| Mid-year admission                   | Mid-year profile and Roll-handling options         | Calendar-effective placement, allocation, and downstream roster change            | Blocked by backend and integrations      |
| Returning student                    | Returning profile                                  | Withdrawal/re-entry history and identity reuse                                    | Blocked by lifecycle contract            |
| Sibling/shared guardian              | Account readiness labels                           | Guardian identity linking, consent, duplicate protection, and portal provisioning | Blocked by identity contract             |
| Incomplete mandatory documents       | Required/blocking document preview                 | Document-service status, override permission, and activation denial               | Blocked by document/activation contracts |
| Manual GR exception                  | Manual mode, reason, and approval controls         | Server permission, approval, uniqueness, and audit                                | Blocked by assignment contract           |
| Over-capacity Division approval      | Capacity and approval policy controls              | Atomic final-seat decision, approval, and roster reconciliation                   | Blocked by capacity contract             |
| Move after Roll assignment           | Preserve/recalculate policy controls               | Effective-dated move and every downstream Roll consequence                        | Blocked by movement contract             |
| Activate then correct                | Correction is identified as required               | Immutable original values, approval, compensation, and consumer replay            | Blocked by correction contract           |
| Withdraw then re-enroll              | No complete Onboarding journey                     | Multiple effective-dated enrollment records and historical visibility             | Blocked by lifecycle contract            |
| Duplicate before/after activation    | Existing Student Management GR conflict assertions | Person matching, merge/link/reject, authorization, and immutable history          | Blocked by identity-resolution contract  |

## Configuration audit

### GR Number

Confirmed frontend controls include series name, Board applicability, onboarding profiles, sequence scope, reset policy, prefix, padded sequence, suffix, optional academic-year and school-code tokens, starting and maximum number, effective date, active state, manual-entry permission, reason, and approval.
The formatter requires a sequence token and validates missing format context before preview.
The drawer rejects one narrow class of overlapping active series when Board target, profiles, scope, reset, format, and numeric range align.
The preview preserves existing GR values, detects duplicate values inside the preview selection, and blocks exhausted configured ranges.

Missing production guarantees include:

- a persisted series identifier, version, state, and effective-dated history;
- a database uniqueness constraint at the agreed tenant and school boundary;
- atomic allocation under concurrent users, imports, retries, and multiple application nodes;
- idempotency keys and a replay-safe command result;
- explicit gap, cancellation, reservation, and reuse policy;
- collision handling when schools import historical identifiers;
- a dry-run impact report before activating or changing a live series;
- maker-checker approval and immutable before/after audit events;
- a migration and rollback policy when format or reset scope changes.

### Roll Number

Confirmed frontend controls include Board/Class applicability, Class or Class-and-Division sequence scope, assignment timing, mid-year handling, ordered tie-breakers, starting number, preservation, individual locks, reason, approval, and automatic/manual mode.
Existing Student Management tests reject duplicate Roll values and values above the current Division student count.

Missing production guarantees include:

- a canonical uniqueness scope for academic year, Class, and Division;
- stable ordering when multiple students have the same configured sort values;
- a documented final tie-breaker such as immutable student ID;
- persisted locks with actor, reason, time, and unlock authority;
- transaction-safe renumbering and a preview-to-commit version check;
- explicit handling for withdrawal, re-entry, transfer, promotion, repeat, late admission, and Division movement;
- print/export/report reconciliation after renumbering;
- a large-batch job with progress, partial-failure policy, cancellation boundary, and retry behavior.

### Division

Confirmed frontend controls include Board/Class applicability, automatic placement strategy, balance tolerance, capacity safeguard, over-capacity approval, reason, effective date, Roll recalculation behavior, and teacher notification.
The existing operational API only sends `studentId` and `divisionId`, so it does not prove the richer policy is enforced.

Missing production guarantees include:

- authoritative capacity and reserved-seat ownership;
- atomic seat reservation across simultaneous assignments;
- waitlist and no-capacity handling;
- teacher, timetable, room, subject, and accessibility constraints;
- effective-dated movement with historical roster preservation;
- attendance, gradebook, fee, transport, library, and identity side-effect ownership;
- approval and reason validation on the server;
- deterministic Roll preservation or recalculation as part of the same transaction;
- notification delivery status and retry evidence.

## Rule and edge-case matrix

| Area       | Case                                                                             | Current result                                                              | Evidence classification                          | Required production behavior                                                  |
| ---------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| GR         | Prefix, suffix, start, padding, maximum, and `{SEQUENCE}`                        | Validated and previewed                                                     | Confirmed by source and automated test           | Repeat validation on the server                                               |
| GR         | Academic-year and school-code tokens                                             | Preview blocks missing context                                              | Confirmed by source and automated test           | Publish-time token validation and versioned context                           |
| GR         | All Boards, selected Board, and admission profiles                               | Modeled and resolved                                                        | Confirmed by source and automated test           | Server returns rule/version explanation                                       |
| GR         | Inactive, future-effective, multiple series, and exhausted range                 | Active/effective filtering and range preview exist                          | Confirmed by source and automated test           | Transactional allocator rejects stale or exhausted series                     |
| GR         | Spaces, case, punctuation, and leading-zero normalization                        | No canonical persisted normalization rule verified                          | Not testable: backend absent                     | Product-approved canonicalization before unique comparison                    |
| GR         | Existing duplicate and duplicate request                                         | Existing Student Management E2E assertions cover readable conflict behavior | Confirmed by automated test at UI contract level | Database constraint remains final authority                                   |
| GR         | Concurrent next number and timeout retry                                         | No shipped Onboarding command                                               | Not testable: backend absent                     | Atomic allocation plus idempotent replay                                      |
| GR         | Historical import and correction                                                 | No Onboarding workflow                                                      | Not testable: migration absent                   | Stable source key, original value history, approval, reconciliation           |
| Roll       | Class and Class-plus-Division numbering                                          | Modeled                                                                     | Confirmed by source and automated test           | Persist uniqueness at the approved scope                                      |
| Roll       | Ordered tie-breakers and direction                                               | Multiple order rules modeled                                                | Confirmed by source and automated test           | Add immutable final tie-breaker and repeatability proof                       |
| Roll       | Identical or missing sort values                                                 | No authoritative final ordering proved                                      | Not testable: backend absent                     | Deterministic null ordering and immutable final tie-breaker                   |
| Roll       | Preserve and individual lock                                                     | Preview behavior modeled                                                    | Confirmed by source and automated test           | Persist actor/reason/time and enforce on commit                               |
| Roll       | Timing and mid-year modes                                                        | Assignment timing and next/preserve/recalculate/manual choices modeled      | Confirmed by source and automated test           | Effective-dated job and downstream impact report                              |
| Roll       | Transfer and recalculation                                                       | Consequences not connected to live integrations                             | Not testable: contracts absent                   | Preserve history and reconcile attendance, exams, reports, cards, and exports |
| Roll       | Simultaneous regenerate                                                          | No shipped Onboarding command                                               | Not testable: backend absent                     | One versioned job wins; stale jobs fail safely                                |
| Division   | Manual, automatic, and mixed                                                     | Modes and strategies modeled                                                | Confirmed by source and automated test           | Server selects or validates placement                                         |
| Division   | Next, count balance, tolerance, sequential, preference                           | Strategy options exist                                                      | Confirmed by source                              | Deterministic server algorithm and explanation                                |
| Division   | Missing/stale capacity, full Divisions, final seat race                          | Preview data only                                                           | Not testable: capacity contract absent           | Authoritative reservation and 409 conflict with alternatives                  |
| Division   | Over-capacity reason/approval/date                                               | Controls are modeled                                                        | Confirmed by source and automated test           | Server validates policy and approval state                                    |
| Division   | Deleted, renamed, archived after preview                                         | No stale-target command test                                                | Not testable: backend absent                     | Commit revalidates immutable target ID and active state                       |
| Division   | Future move, cancel, reject, retry, correction                                   | No effective-dated workflow                                                 | Not testable: backend absent                     | Versioned membership history and recoverable transitions                      |
| Division   | Bulk mixed outcome                                                               | UI preview only                                                             | Confirmed preview only                           | Stable succeeded/failed/skipped/preserved/approval totals and row retry       |
| Scope      | School default and academic-year override                                        | Separate session scopes and inherited/customized labels exist               | Confirmed by source, test, and browser           | Persisted scope versions and authorization                                    |
| Scope      | Reset inherited default                                                          | Removes current session override after confirmation                         | Confirmed by source and automated test           | Audited version transition, not destructive history loss                      |
| Scope      | Clone, draft, publish, retire, rollback                                          | Not modeled as persisted lifecycle                                          | Not testable: backend absent                     | Explicit state machine and impact preview                                     |
| Conflict   | Equally specific rules                                                           | Can depend on insertion order                                               | Confirmed by source                              | Reject the tie before publish; release blocker                                |
| Conflict   | Configuration changes during preview                                             | No preview fingerprint                                                      | Not testable: backend absent                     | Stale commit returns conflict and requires re-preview                         |
| Rollover   | Repeated annual run                                                              | No workflow                                                                 | Not testable: backend absent                     | Dry run, idempotent rerun, lock, reconciliation, history                      |
| Downstream | Attendance, academics, Finance, transport, LMS, reports, accounts, notifications | No end-to-end Onboarding contract verified                                  | Not testable: integration contracts absent       | Event/outbox delivery, consumer idempotency, status, and reconciliation       |

## Rule precedence and conflict model

The current settings provider separates a current-school base from an optional academic-year override.
Board is applicability within each rule rather than a second outer scope.
Roll and Division may add Class applicability.
The current applicability score prefers Class-specific rules and then selected-Board rules.
Rules with the same score rely on array order, so two equally specific eligible rules can resolve according to configuration insertion order.

The target backend must calculate one explainable winner using this order:

1. Tenant and school boundary.
2. Academic-year override before school default.
3. Active and effective-dated version.
4. Exact onboarding profile when the rule supports profiles.
5. Exact Board before All Boards.
6. Exact Class before All Classes.
7. Exact Division before Class-wide scope when applicable.
8. Explicit priority set by an authorized administrator.
9. Reject configuration if more than one rule still ties.

Every preview and commit response should return the chosen rule ID, rule version, scope path, and an explanation of why it won.
The server should reject overlapping rules at write time rather than silently depending on list order.

## Lifecycle model

The target onboarding aggregate should use explicit states instead of deriving irreversible actions from scattered nullable fields.

| State             | Entry condition                                 | Allowed next states                                  | Required evidence                                     |
| ----------------- | ----------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Draft             | Applicant admitted or imported but not prepared | Validation failed, Ready for review                  | Source record, school, academic year, admission route |
| Validation failed | One or more required facts fail                 | Draft, Ready for review                              | Field-level errors, owner, correction history         |
| Ready for review  | Required data and assignment preview pass       | Approval pending, Ready to activate                  | Snapshot version and chosen rules                     |
| Approval pending  | Policy requires a reviewer                      | Ready to activate, Rejected                          | Maker, checker, reason, decision time                 |
| Ready to activate | Required checks and approvals pass              | Activating                                           | Unexpired preview token or matching aggregate version |
| Activating        | Transaction accepted                            | Active, Activation failed                            | Idempotency key and operation ID                      |
| Active            | Student record and required side effects commit | Correction workflow, withdrawal or transfer workflow | Identifiers, placement, accounts, audit event         |
| Activation failed | Transaction rolled back or compensated          | Ready for review                                     | Safe error, technical correlation ID, retry status    |

Activation should be one idempotent server-owned operation or an orchestrated saga with documented compensation.
The UI must not infer success from the disappearance of a row.

## Target workflow and architecture

Everything in this section is a product recommendation and proposed contract until matching backend source and integration evidence exist.

### Ownership flow

Enrollment owns the applicant, admission decision, submitted guardians, consent, and pre-activation documents.
Onboarding owns the validated handoff snapshot, readiness review, GR/Roll/Division policy resolution, approvals, and activation orchestration.
Student Records owns the active student identity projection, effective-dated enrollment, identifiers, and placement after successful activation.
Attendance, Academics, Finance, transport, library, LMS, identity, and notifications consume committed Student Records events and expose reconciliation status; they do not decide onboarding truth.

### Configuration lifecycle

`Draft -> Validated -> Previewed -> Approval pending -> Published -> Retired` should be the normal lifecycle.
A rollback should publish a new version based on a prior version rather than erase history.
Every version should store scope, applicability, priority, effective interval, author, approver, reason, created time, published time, and immutable content hash.
Deleting a rule used by a student or historical event should be prohibited; retirement keeps the reference resolvable.

### Approval lifecycle

`Not required -> Approved` is automatic only when the published policy says no approval is required.
The governed path is `Requested -> Approved` or `Requested -> Rejected`, with `Cancelled` allowed before decision.
The same actor should not be maker and checker when segregation is required.
Changing the student, target, reason, or applicable rule after approval must invalidate the approval and require a new decision.

### Preview and commit protocol

1. A proposed preview request sends student IDs, requested operation, intended values, and client-known versions.
2. The server authorizes every student and target, resolves policies, checks capacity and uniqueness, and returns affected/preserved/blocked/conflicting/approval-required rows.
3. The response includes an expiring preview token bound to tenant, actor, inputs, student versions, target versions, and configuration versions.
4. A proposed commit sends the preview token and one idempotency key without trusting calculated identifiers from the browser.
5. The server reauthorizes and revalidates inside the transaction, allocates identifiers or capacity, records audit/outbox events, and returns stable totals plus row outcomes.
6. A stale token, changed configuration, moved student, used number, or lost seat returns a conflict that requires a new preview.

### Idempotency and concurrency

An idempotency key should be scoped to tenant, actor, command type, and logical request.
The first completed response should be retained long enough for safe network retries, and a different payload with the same key should be rejected.
Database uniqueness should protect the approved GR and Roll scopes.
Optimistic versions should protect settings and student aggregates, while an atomic allocator or database lock should protect sequence and capacity resources.
Bulk work should use one durable operation ID, per-row idempotency, bounded chunks, resumable progress, and deterministic totals.

### Identifier allocator

The proposed allocator owns normalization, sequence reset, next-value reservation, gap policy, exhaustion, import collision, and correction history.
It returns the display value plus series ID, series version, numeric position, allocation event ID, and normalization key.
It never uses a browser-calculated next number as authoritative input.

### Effective-dated Division membership

A Division change should close the prior membership and create a new membership with an effective timestamp rather than overwrite one field.
The transaction should validate capacity, approval, reason, Roll policy, and target state.
Past attendance and academic evidence remain attached to the historical membership, while future rosters use the new membership from its effective time.

### Audit, downstream events, and reconciliation

Each command should record actor, tenant, school, academic year, student, action, reason, before and after, rule/version, approval, idempotency key, correlation ID, result, and time.
An outbox should publish committed events so downstream delivery cannot occur without the source transaction.
Consumers should be idempotent and report pending, applied, failed, or reconciled status.
An operator-facing reconciliation view should compare source event counts with each required consumer and support safe replay.

### Error and recovery model

Validation errors should name the field or row and explain the correction.
Authorization failures should reveal no cross-tenant student detail.
Conflicts should identify the stale resource category without leaking another operator's protected values.
Rate-limit and dependency failures should provide a retry boundary and correlation ID.
Partial bulk results should never be represented as total success, and retry should target only eligible failed rows.

## Data quality, migration, and integrations

Before bulk onboarding, the system needs a non-mutating import preflight that reports duplicate students, duplicate identifiers, invalid academic mappings, capacity conflicts, missing mandatory values, and unsupported historical states.
Accepted rows need stable source identifiers so a retry updates or replays the same logical record instead of creating another student.
Historical imports must preserve prior enrollments and identifiers rather than rewriting them as current values.
The migration process needs mapping templates, saved mapping versions, row-level error export, corrected-row re-upload, reconciliation totals, and signed completion evidence.

Required integration contracts should cover:

- Admissions-to-Student handoff identity and lifecycle ownership;
- academic-year, Board, Medium, Class, Division, and calendar master data;
- documents and verification status;
- student and guardian identity/account provisioning;
- approval tasks and notifications;
- attendance, timetable, gradebook, fees, transport, library, and reporting consumers;
- outbound OneRoster or equivalent roster exchange where required;
- government identifier workflows such as PEN and APAAR when applicable.

## Security, privacy, and accessibility gates

Permission-gated routes are necessary but do not prove object-level or tenant-level authorization.
Every read, preview, assignment, approval, export, and activation endpoint must enforce tenant, school, academic-year, and student scope on the server.
Sensitive identity and document properties require allow-listed request and response fields, export permissions, masking, retention, and audit controls.
Bulk actions need rate limits, bounded request sizes, quotas, and protection against automated abuse of sensitive workflows.

For India deployments, the privacy design needs legal review against the phased Digital Personal Data Protection Act and Rules commencement schedule.
As of 2 September 2026, the [13 November 2025 commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf) makes the listed institutional provisions immediate, schedules section 6(9) and section 27(1)(d) for one year after publication, and schedules the main processing, consent, child-data, rights, and enforcement provisions listed there for eighteen months after publication.
The resulting calendar dates are 13 November 2026 and 13 May 2027 respectively; this is a planning interpretation of the notification, not legal advice, and qualified counsel should confirm applicability.
Where APAAR is used, product flows should support minor consent, PEN availability, demographic matching, correction, and resubmission without making APAAR the internal primary key.

Accessibility release checks must include labels, error identification, error suggestions, confirmation for irreversible actions, redundant-entry reduction, keyboard operation, visible focus, screen-reader announcements, and 44-pixel touch targets where applicable.
The authenticated smoke test found that invalid GR submission displayed `Enter a series name` but kept focus on the Apply button instead of moving to the Series name field.

## Test execution report

| Test ID | Scenario and preconditions                                                                  | Data size                                         | Steps                                                                      | Expected                                                      | Actual and evidence                                                                                | Result                              | Cleanup or recovery                                                       |
| ------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| AUTO-01 | Current dirty worktree; focused menu, onboarding, management, and API tests                 | Synthetic fixtures; 57 tests selected             | Run focused Vitest command including production mock guard                 | Relevant tests pass                                           | 56 passed; one unrelated mock-text guard matched `StudentSummaryPanel.tsx`                         | Fail, unrelated baseline            | No mutation; reran without unrelated guard                                |
| AUTO-02 | Same worktree; exclude unrelated mock guard                                                 | Synthetic fixtures; 56 tests                      | Run 11 focused test files/groups                                           | All pass                                                      | 11 files and 56 tests passed                                                                       | Pass                                | No cleanup needed                                                         |
| AUTO-03 | Current source                                                                              | All onboarding TypeScript plus Student menu files | Run focused ESLint with quiet output                                       | No lint errors                                                | Exit code 0                                                                                        | Pass                                | No cleanup needed                                                         |
| AUTO-04 | Current repository                                                                          | Whole TypeScript project                          | Run no-emit TypeScript check                                               | No type errors                                                | Exit code 0                                                                                        | Pass                                | Incremental compiler cache is pre-existing tooling behavior               |
| DOC-01  | Current Student docs and sibling backend repository unavailable at documented relative path | Student module                                    | Run module docs validator                                                  | No issues                                                     | Three pre-existing broken backend links remained; the new reference introduced no remaining issue  | Blocked by repository layout        | No links rewritten because ownership/path decision is outside audit scope |
| DOC-02  | Current repository docs baseline                                                            | All modules                                       | Run repository docs validator                                              | No issues                                                     | 36 pre-existing issues remained after the new reference path was corrected                         | Blocked by repository baseline      | No unrelated docs changed                                                 |
| DOC-03  | Current dirty worktree                                                                      | All diffs                                         | Run whitespace/error check                                                 | No diff errors                                                | Exit code 0 with line-ending warnings only                                                         | Pass                                | No cleanup needed                                                         |
| UI-01   | Authenticated authorized session; connected mode; current academic context selected         | API returned 0 rows                               | Open Student Setup                                                         | Truthfully distinguish connected facts from missing contracts | Alert named connected Student Records and missing documents/accounts/approval/activation contracts | Pass                                | Read-only                                                                 |
| UI-02   | Same session; safe preview enabled                                                          | Five synthetic preview students                   | Switch Readiness/GR/Roll/Division views                                    | URL and rows update without mutation                          | URL-backed view changed and preview copy stated data is not saved                                  | Pass                                | Preview toggle only                                                       |
| UI-03   | Settings page; no saved override                                                            | One default configuration set                     | Open GR/Roll/Division tabs and scope                                       | Inherited/current-session origin is clear                     | Scope and session-reset behavior were visible                                                      | Pass                                | No Apply action used successfully                                         |
| UI-04   | Settings page at 390x844, 768x1024, 1366x768, and 1440x900                                  | One page and default rules                        | Measure document client and scroll widths                                  | No document horizontal overflow                               | Client width equaled scroll width at all four viewports                                            | Pass                                | Viewport reset                                                            |
| UI-05   | GR Add drawer at 390x844                                                                    | Blank new configuration                           | Open drawer and inspect actions                                            | Drawer and actions remain reachable                           | Drawer filled width; Cancel and Apply remained visible                                             | Pass                                | Drawer closed                                                             |
| UI-06   | GR Add drawer; blank Series name                                                            | One invalid configuration                         | Select Apply                                                               | Error appears and focus moves to first invalid control        | `Enter a series name` appeared; active element remained Apply                                      | Fail, frontend accessibility        | Drawer closed without saving                                              |
| UI-07   | Student Setup preview at 390x844                                                            | Five synthetic students                           | Click and press Enter on `Open onboarding for Aanya Sharma`                | Student drawer opens                                          | No MUI drawer or dialog appeared after either action                                               | Fail, frontend behavior             | No record mutation; viewport reset                                        |
| API-01  | Persisted Onboarding APIs required                                                          | Not available                                     | Verify settings reload, logout, second session, and second user            | Same approved version returned                                | No shipped settings API                                                                            | Blocked: backend absent             | None                                                                      |
| API-02  | Concurrent GR/Roll/Division commit required                                                 | Not available                                     | Send same and competing commands from two operators                        | Unique number/seat and idempotent result                      | No shipped Onboarding commit API                                                                   | Blocked: backend absent             | None                                                                      |
| SEC-01  | Cross-tenant fixtures and backend authorization required                                    | Not available                                     | Query and mutate foreign IDs and properties                                | Every unauthorized scope rejected safely                      | No API environment/fixture evidence                                                                | Blocked: security test bed absent   | None                                                                      |
| PERF-01 | Representative 25,000/50,000 synthetic dataset required                                     | Not available                                     | Measure list, search, preview, commit, bulk, export, and clone percentiles | Approved targets met with bounded calls                       | Current connected list contract is unpaged; no dataset or commit APIs                              | Blocked: scale environment absent   | None                                                                      |
| E2E-01  | Mutation-safe seeded tenant required                                                        | Not confirmed                                     | Run full journeys through activation and downstream modules                | All lifecycle and recovery assertions pass                    | Irreversible activation was not authorized and contracts are incomplete                            | Blocked by safety and backend scope | No created students                                                       |

### Passed

| Check                                                                       | Result                                                                                                                 |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Focused Student menu, onboarding, Student Management, and Student API tests | 11 files passed, 56 tests passed                                                                                       |
| Focused onboarding and menu lint                                            | Passed with no errors                                                                                                  |
| TypeScript no-emit check                                                    | Passed                                                                                                                 |
| Authenticated settings responsiveness                                       | No document-level horizontal overflow at 390x844, 768x1024, 1366x768, or 1440x900                                      |
| Authenticated settings drawer                                               | Full-width and reachable at 390x844 with visible Cancel and Apply actions                                              |
| Connected-mode truthfulness                                                 | UI stated Student Records was connected and that documents, accounts, approval, and activation still require contracts |
| Preview safety                                                              | Workflow preview explicitly stated that sample data is not saved and confirmation remained disabled                    |

### Failed or blocked

| Check                      | Result and ownership                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Student row action         | In the authenticated 390x844 Setup preview, `Open onboarding for Aanya Sharma` did not open a drawer by click or Enter; frontend defect |
| First-error focus          | Invalid GR Apply showed the error but left focus on Apply; frontend accessibility defect                                                |
| Production mock guard      | The broad run had 56 passes and one unrelated failure because `StudentSummaryPanel.tsx` matched the repository mock-text guard          |
| Student docs validator     | Blocked by three existing links to an unavailable sibling backend-docs path in `README.md`, `clients.md`, and `routes.md`               |
| Backend contract tests     | Not available for persisted onboarding settings, preview, commit, approval, activation, idempotency, concurrency, or audit              |
| Load and resilience tests  | Not available for large data, bulk jobs, retry storms, database contention, or degraded dependencies                                    |
| Security and privacy tests | Not available for tenant isolation, object-level authorization, property authorization, exports, retention, or consent                  |

## Gap register

| ID / severity | Evidence and affected sizes                                             | User and data impact                                                                | Reproduction and actual behavior                            | Expected behavior and acceptance criteria                                                                           | Owner / dependencies / test layer                                        |
| ------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ONB-001 / P0  | Context uses `useState`; all sizes                                      | Configuration is lost and cannot be shared or audited                               | Apply an override, then fully reload; defaults return       | Approved, versioned, scoped, effective-dated settings survive reload/logout/other user and expose immutable history | Backend + product policy; data model, permissions; API/integration/E2E   |
| ONB-002 / P0  | Confirmation disabled and no Onboarding commit API; all sizes           | GR/Roll/Division cannot be safely operated                                          | Open assignment preview; commit remains unavailable         | Server preview token and idempotent transactional commit revalidate rule, student, uniqueness, and capacity         | Backend; allocator, transactions; API/concurrency/E2E                    |
| ONB-003 / P0  | Readiness/approval/activation values lack authoritative APIs; all sizes | Incomplete or contradictory active students are possible if UI assumptions are used | Connected view shows missing contract warning               | Server state machine permits activation only after required checks and emits complete audit/integration outcome     | Backend + product + integrations; API/state-machine/E2E                  |
| ONB-004 / P0  | Only frontend permission evidence; all sizes                            | Unauthorized or cross-tenant disclosure/mutation risk                               | Foreign-scope negative calls could not be run               | Every query/command enforces tenant, school, year, student, property, and function authorization                    | Security + backend; test tenants/fixtures; API security                  |
| ONB-005 / P0  | Applicability score can tie; growing/large                              | Insertion order can choose a different policy                                       | Configure equally specific eligible rules                   | Publish is rejected until one deterministic winner exists; response explains selected rule/version                  | Product + backend + frontend; precedence policy; unit/API/property tests |
| ONB-006 / P0  | No database uniqueness/capacity evidence; all sizes                     | Duplicate identifiers or overfilled Divisions under concurrency                     | Race could not be run because command API is absent         | Approved uniqueness constraints and atomic capacity reservation pass contention and retry tests                     | Backend + data; database design; integration/load tests                  |
| ONB-007 / P1  | Browser UI-07; all sizes                                                | Staff cannot open the individual readiness workflow                                 | At 390x844, click or press Enter on Aanya row action        | Drawer opens once, traps/restores focus, and works at all required viewports                                        | Frontend; table/drawer event wiring; component/browser tests             |
| ONB-008 / P1  | Browser UI-06; all sizes                                                | Users can miss validation and struggle to recover                                   | Apply blank GR series                                       | Focus moves to Series name and error is associated and announced                                                    | Frontend/accessibility; form focus utility; component/axe/browser        |
| ONB-009 / P1  | Connected response is an unpaged array; growing/large                   | Slow memory-heavy lists and unsafe select-all semantics                             | Inspect Student Records lookup contract                     | Server paging, stable sort/filter, totals, bounded selection, and query cancellation are documented and tested      | Backend + frontend; paged DTO; API/performance/browser                   |
| ONB-010 / P1  | No durable bulk operation; growing/large                                | Term-start failures cannot be resumed or reconciled                                 | Bulk UI is preview-only                                     | Durable job reports stable row totals, progress, safe cancel, error export, and targeted retry                      | Backend + operations + frontend; job service; integration/resilience/E2E |
| ONB-011 / P1  | No migration workflow; all legacy adopters                              | Imports can duplicate identity or lose history                                      | Historical GR/import scenario unavailable                   | Dry run, stable source keys, row correction, replay, history, and signed reconciliation pass                        | Data/migration + backend; identity matching; fixture/E2E/reconciliation  |
| ONB-012 / P1  | Division command lacks rich policy and consumer contract; all sizes     | Rosters, Roll, attendance, exams, and services may diverge                          | Compare modeled rule with `{studentId, divisionId}` command | Effective-dated move applies policy and every required consumer reaches applied/reconciled or recoverable failure   | Backend + integrations + operations; outbox; contract/chaos/E2E          |
| ONB-013 / P1  | No annual lifecycle; all sizes                                          | Promotion, repeat, withdrawal, and re-entry history can be wrong                    | No clone/roll-forward command exists                        | Dry-run clone/rollover is idempotent, concurrent-safe, effective-dated, and reconciled                              | Product + backend + data; calendars; API/E2E                             |
| ONB-014 / P1  | No immutable correction workflow; all sizes                             | Mistakes may be overwritten without trace                                           | Correction scenario unavailable                             | Authorized correction preserves original value, reason, approval, before/after, and downstream reconciliation       | Product + backend + security; audit model; API/E2E                       |
| ONB-015 / P2  | Many controls, no setup wizard/health score; small/growing              | Non-technical staff can misconfigure policy                                         | First-use timed study not available                         | Template-assisted setup passes moderated completion and comprehension targets set by product                        | Product/UX/frontend; research participants; usability/browser            |
| ONB-016 / P2  | No rule impact comparison; growing/large                                | Policy changes can surprise operators                                               | Current preview covers selection, not publish impact        | Version diff lists affected/preserved/blocked/approval students and explains why                                    | Backend + frontend; preview service; API/browser                         |
| ONB-017 / P2  | No operational telemetry surface; growing/large                         | Stuck jobs, range exhaustion, or failed consumers go unnoticed                      | No dashboards/runbooks found                                | Metrics, traces, alerts, correlation search, ownership, SLOs, and recovery drills exist                             | Operations + backend; telemetry platform; observability/game-day         |

## Extra feature recommendations

All recommendations depend on the P0 integrity architecture; a polished frontend must not substitute for backend truth.

### Must have before pilot

| Feature                           | Problem / users / value                                                                        | Minimum scope                                                                         | Dependencies and risks                                            | Owner                                     | Measurable acceptance                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Guided school setup wizard        | Non-technical school administrators face many controls; guided choices reduce unsafe omissions | Operating model, GR, Roll, Division, readiness, review, publish checklist             | Needs approved defaults; oversimplification can hide exceptions   | Product + UX + frontend                   | Moderated small-school users complete a valid draft without engineering help at a product-approved success rate |
| Rule templates by operating model | Repeating common policy is slow and inconsistent for administrators                            | Small single-Board, multi-Board, and controlled-exception templates                   | Templates must remain editable and jurisdiction-neutral           | Product + school operations               | Applying a template produces a valid draft and a complete change summary                                        |
| Configuration health check        | Administrators cannot see conflicts, missing context, exhaustion, or unsafe combinations       | Blocking errors, warnings, affected scope, readiness score                            | Depends on authoritative validation; score must not mask blockers | Backend + frontend                        | Published state is impossible with any blocking health finding                                                  |
| Why this rule applied             | Staff cannot explain a student's result                                                        | Rule ID/version, scope path, precedence reasons, alternatives rejected                | Depends on deterministic resolver; avoid technical overload       | Backend + frontend                        | Every previewed row exposes the same explanation returned by the server                                         |
| Impact preview before publishing  | A rule change can affect many students silently                                                | Old/new diff and affected/preserved/blocked/approval totals with samples/export       | Requires versioned policies and bounded queries                   | Backend + frontend                        | Publish always references a completed, unexpired impact preview                                                 |
| Draft, publish, version, rollback | Session edits lack governance                                                                  | Explicit lifecycle, maker/checker option, immutable versions, rollback-as-new-version | Approval policy and audit storage required                        | Backend + product + security              | Reload/second user see the same version and all transitions are auditable                                       |
| Identifier collision monitor      | Imported and concurrent identifiers can collide                                                | Preflight, database-backed collision alerts, exhaustion warning, resolution queue     | Canonical normalization and uniqueness scope required             | Backend + data + operations               | No commit bypasses uniqueness; every detected collision has owner and status                                    |
| Approval inbox and SLA escalation | Manual GR and capacity exceptions need accountable decisions                                   | Assigned queue, reason, due time, decision, delegation, escalation                    | Notification failure and segregation-of-duty risks                | Product + backend + frontend + operations | Overdue items alert configured owners and decisions retain complete audit evidence                              |
| Data-quality exception queue      | Blocked students otherwise disappear into filters                                              | Owned row errors, correction action, bulk retry eligibility, aging                    | Must avoid exposing PII across scope                              | Data + frontend + backend                 | Every blocked row has safe reason, owner, age, and valid next action                                            |
| Bulk retry for failed rows        | Operators cannot safely recover mixed outcomes                                                 | Durable result, failed-row selection, same-operation retry, exported errors           | Depends on idempotency and stable row identity                    | Backend + operations + frontend           | Retry never repeats succeeded rows and totals reconcile across attempts                                         |
| Student correction center         | Post-activation mistakes need governed repair                                                  | Search, before/after preview, reason, approval, effective date, downstream status     | Can become an unsafe unrestricted editor                          | Product + security + backend              | Corrections preserve originals and every consumer reconciles or exposes recovery                                |
| Duplicate resolution              | Duplicate identity may appear before or after activation                                       | Candidate match, evidence comparison, merge/link/reject workflow, immutable history   | High privacy and irreversible-merge risk                          | Product + data + security                 | No merge without authorization, preview, confirmation, and reversible recovery policy                           |

### Must have before large-school rollout

| Feature                                      | Problem / users / value                                     | Minimum scope                                                                       | Dependencies and risks                                | Owner                                 | Measurable acceptance                                                                           |
| -------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Academic-year clone and rollover assistant   | Annual setup is error-prone for central and school admins   | Dry run, source/target diff, calendars, promotion/repeat exceptions, publish, rerun | Requires effective-dated history and job locking      | Product + backend + data              | Repeated run is idempotent and reconciliation totals match source decisions                     |
| Migration dry-run and reconciliation center  | Large adopters need safe legacy import                      | Mapping version, identity match, row validation, correction file, replay, sign-off  | Poor source data and historical semantics             | Data/migration + backend + operations | Accepted/rejected/skipped totals remain stable and final Student Records totals reconcile       |
| Capacity and roster reconciliation dashboard | Final-seat races and failed consumers can split truth       | Capacity source, membership count, roster consumer status, repair action            | Requires authoritative membership and outbox          | Academics + backend + operations      | Every mismatch is detected within an approved interval and has an idempotent repair path        |
| Cross-module propagation status              | Operators need to know when activation reached every module | Per-student/event consumer states and correlation search                            | Can leak sensitive implementation detail              | Backend + operations + frontend       | Source success with consumer failure is never shown as fully complete                           |
| Audit explorer                               | Security, compliance, and support need traceability         | Filter by actor/student/action/rule/time/correlation and protected export           | Retention, masking, and export authorization required | Security + operations + frontend      | Authorized users reconstruct every configuration and student transition without database access |
| Configuration export/import                  | School groups need repeatable setup                         | Signed/versioned non-secret package, validation, diff, dry run                      | Cross-tenant identifiers and secret leakage           | Product + security + data             | Import cannot activate automatically and rejects incompatible or foreign scope references       |
| Onboarding completion and aging dashboard    | Leaders need workload and bottleneck visibility             | Stage counts, aging, owner, school/year filters, drill-down                         | Metrics must use server truth and respect scope       | Product + backend + frontend          | Counts reconcile with worklists and stale items meet configurable alert rules                   |

### Valuable differentiators

| Feature                                  | Problem / users / value                                             | Minimum scope                                                                    | Dependencies and risks                            | Owner                                   | Measurable acceptance                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Sandbox policy simulator                 | Administrators need to explore changes safely                       | Synthetic or masked students, version comparison, no commit path                 | Must be isolated from production commands and PII | Product + backend + frontend            | Simulator cannot invoke mutation endpoints and gives deterministic results for the same snapshot                       |
| Multi-language staff help                | Staff may interpret policy labels differently                       | Contextual English, Hindi, and Gujarati help with examples and glossary          | Translation drift can misstate policy             | Content design + localization + product | Approved translations cover every blocking choice and pass comprehension review                                        |
| OneRoster-compatible exchange            | Integrations need portable roster semantics                         | Versioned CSV/REST import-export mapping and reconciliation                      | Local concepts may not map one-to-one             | Integrations + data                     | Conformance fixtures round-trip supported fields with documented loss/extension behavior                               |
| APAAR/PEN readiness and consent tracking | Applicable Indian schools need traceable external identity workflow | Separate PEN/APAAR fields, consent state, demographic match, correction/resubmit | Legal, privacy, and government dependency changes | Product + privacy + integrations        | External failure never blocks unrelated internal identity unless approved policy says so; consent history is auditable |

### Later enhancements

| Feature                     | Problem / users / value                                  | Minimum scope                                                                | Dependencies and risks                                      | Owner                         | Measurable acceptance                                                                           |
| --------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Offline-safe draft handling | Intermittent networks can lose long configuration drafts | Encrypted local draft with explicit unsynced state and conflict-aware resume | Shared devices and stale sensitive data create privacy risk | Frontend + security           | No student PII is stored offline by default and resync never publishes without fresh validation |
| Predictive capacity warning | School leaders want earlier staffing/section signals     | Explainable trend using confirmed admissions and current capacity            | Forecast uncertainty and false confidence                   | Product analytics + Academics | Forecast displays inputs, confidence/limitations, and never overrides capacity truth            |

## Prioritized implementation roadmap

| Priority                | Workstreams and outcome                                                                                                                                                                                                                                                                                                                                                                                                     | Dependencies                                                                                                           | Acceptance criteria                                                                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 release blockers     | Product defines exact scopes, precedence, normalization, lifecycle, and permissions. Backend/data implement versioned settings, unique allocators, capacity-safe membership, preview/commit, approval/activation, idempotency, audit/outbox, and tenant authorization. Frontend connects without inventing missing truth. QA/security add negative, contention, retry, stale-version, rollback, and accessibility coverage. | Approved product policy, backend repository, database migration, identity/permission model, representative test tenant | ONB-001 through ONB-006 pass; settings persist; ties are rejected; concurrent requests cannot duplicate identifiers or seats; retries are stable; activation is complete or recoverable |
| P1 pilot requirements   | Frontend fixes drawer action and error focus. Backend/operations deliver paging, durable bulk jobs, migration preflight, corrections, annual lifecycle, and integration reconciliation. QA runs all twelve student journeys with safe synthetic data.                                                                                                                                                                       | P0 contracts, seeded integration environment, downstream owners, migration fixtures, support ownership                 | ONB-007 through ONB-014 pass; pilot users finish representative work; row totals reconcile; historical state remains queryable; runbooks and rollback drill are approved                |
| P2 scale and efficiency | Product/UX add guided templates, health checks, why-applied explanations, impact simulation, dashboards, and central override governance. Performance/security prove bounded 25,000/50,000-student operation and least privilege.                                                                                                                                                                                           | Stable pilot telemetry, approved SLOs, scale dataset, central/school scope decision                                    | ONB-015 through ONB-017 pass; product-approved completion targets and latency percentiles are met; alerts detect seeded failures; large-school release review accepts evidence          |
| P3 differentiators      | Integrations/data add sandbox simulation, multilingual guidance, OneRoster exchange, APAAR/PEN workflows where applicable, optional offline-safe drafts, and predictive capacity signals.                                                                                                                                                                                                                                   | Legal/privacy review, translation governance, partner specifications, mature core lifecycle                            | Each feature has conformance or usability evidence, never weakens P0 controls, and can be disabled independently                                                                        |

No delivery dates are estimated because team capacity and dependency availability were not provided.

## Release gates

Production assignment must remain disabled until all of these statements are supported by evidence:

- Reloading and another authorized session read the same approved configuration version.
- Two concurrent requests cannot allocate the same GR or Roll Number or overfill a Division.
- Retrying a timed-out command returns the same result without duplicating side effects.
- Preview and commit detect stale student, capacity, or rule versions.
- Every mutation records actor, tenant, school, academic year, reason, before/after values, rule/version, outcome, and correlation ID.
- Unauthorized tenant, school, student, property, and action access is rejected and tested.
- Bulk work has bounded selection, progress, failure export, safe retry, and cancellation behavior.
- Activation either commits all required records or exposes a recoverable compensated failure.
- Historical enrollment, withdrawal, transfer, and re-entry records remain queryable.
- Keyboard, screen-reader, focus, error, and touch-target checks pass on representative mobile and desktop viewports.
- Operations has dashboards, alerts, reconciliation, support runbooks, and rollback procedures.

## Product research and resulting requirements

| Source                                                                                                                                                                                                                                                                                                                                                                  | Observed practice                                                                                                                                           | Requirement adopted here                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [Ed-Fi Enrollment domain](https://docs.ed-fi.org/reference/data-exchange/data-standard/4/model-reference/enrollment-domain/overview/)                                                                                                                                                                                                                                   | Enrollment and school-year association are lifecycle records, not student identity fields                                                                   | Keep stable identity separate from effective-dated school enrollment                             |
| [Ed-Fi Enrollment best practices](https://docs.ed-fi.org/reference/data-exchange/data-standard/4/model-reference/enrollment-domain/best-practices/)                                                                                                                                                                                                                     | Withdrawal and re-entry can create multiple enrollment records and relate to calendars                                                                      | Preserve enrollment history and calendar context                                                 |
| [1EdTech OneRoster 1.2](https://standards.1edtech.org/oneroster/specifications/standards/v1p2)                                                                                                                                                                                                                                                                          | Roster exchange covers people, courses, enrollments, and grades through REST or CSV                                                                         | Define versioned import/export and reconciliation contracts                                      |
| [PowerSchool re-enrollment](https://ps.powerschool-docs.com/pssis-admin/latest/reenroll-students)                                                                                                                                                                                                                                                                       | Transfer and re-enrollment preserve lifecycle history and use entry/exit context                                                                            | Model transfer, re-entry, dates, codes, and comments explicitly                                  |
| [PowerSchool import and export](https://ps.powerschool-docs.com/pssis-admin/latest/import-and-export)                                                                                                                                                                                                                                                                   | Stable student numbers and enrollment identifiers matter during migration                                                                                   | Use stable source keys and migration preflight                                                   |
| [Infinite Campus enrollment](https://kb.infinitecampus.com/help/enrollments-explanation)                                                                                                                                                                                                                                                                                | Enrollment overlap policy can warn, auto-end, or block and distinguishes primary versus partial enrollment                                                  | Make overlap behavior explicit and testable                                                      |
| [Infinite Campus roll forward](https://kb.infinitecampus.com/help/enrollment-roll-forward)                                                                                                                                                                                                                                                                              | Annual operations support test/run separation, repeated runs, and concurrency controls                                                                      | Require dry run, idempotency, and single-job ownership                                           |
| [Blackbaud student enrollment access](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/education/k12/full-help/content/bb-core-access.html?Highlight=manage+roles)                                                                                                                                                                                            | Enrollment changes carry year, level, grade, future-year, re-enroll, withdraw, and role effects                                                             | Cover future-year and identity-access lifecycle effects                                          |
| [Blackbaud individual course enrollment](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/education/k12/full-help/content/lms-individual-student-enrollment.html)                                                                                                                                                                                             | Drop can retain history while deletion is constrained after grades or attendance                                                                            | Separate reversible status change from destructive correction                                    |
| [Oracle Campus Solutions documentation](https://docs.oracle.com/cd/F44665_01/psft/pdf/cs92lsaa-b072021.pdf)                                                                                                                                                                                                                                                             | Effective-dated rows preserve current and historical administrative configurations                                                                          | Store effective-dated, versioned policy rather than overwriting it                               |
| [APAAR resources](https://apaar.education.gov.in/resource) and [APAAR FAQ](https://apaar.education.gov.in/faqs)                                                                                                                                                                                                                                                         | PEN, consent for minors, demographic matching, correction, and resubmission affect applicable Indian student workflows                                      | Add consent and correction states while keeping external IDs separate from internal identity     |
| [DPDP Act, 2023](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf), [DPDP Rules, 2025](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa), and [commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf) | The Act permits different commencement dates, and the 2025 notification phases specified provisions across publication, one-year, and eighteen-month points | Track the phased dates and complete jurisdiction-specific legal review before production rollout |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                                                                                                                                                                                                                                                                               | Labels, identified errors, suggestions, error prevention, and redundant-entry reduction are testable criteria                                               | Treat accessibility as a release gate, including first-error focus                               |
| [OWASP API Security Top 10, 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)                                                                                                                                                                                                                                                                            | Object, property, and function authorization plus resource limits and sensitive-flow protection are primary API risks                                       | Add negative authorization, field allow-list, quota, and abuse tests                             |
| [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) and [NIST SSDF](https://csrc.nist.gov/pubs/sp/800/218/final)                                                                                                                                                                                                                    | Security needs verifiable requirements across implementation and delivery                                                                                   | Maintain a traceable security verification plan and release evidence                             |

## Required next test suite

The next implementation phase should add automated coverage for:

- school default versus academic-year override persistence and authorization;
- Board/Class/Division/profile precedence, tied rules, overlaps, inactive rules, and effective dates;
- GR sequence exhaustion, format changes, imports, gaps, cancellations, concurrent allocation, and retry;
- Roll stable ordering, locks, late admission, withdrawal, re-entry, transfer, Division change, and batch retry;
- Division capacity contention, over-capacity approval, effective dates, Roll effects, and downstream consumers;
- preview-to-commit stale versions, partial failures, rollback or compensation, and immutable audit events;
- 1, 100, 1,000, and 50,000-student worklists with server paging and representative filters;
- object/property/function authorization across tenant, school, academic year, student, export, approval, and activation;
- migration dry run, duplicate identity matching, error correction, replay, and final reconciliation;
- screen reader, keyboard, focus, error announcement, reduced motion, zoom, mobile touch, and document overflow;
- dependency outages for documents, accounts, notifications, and downstream Student Records integrations.

## Audit closeout

### What is proven working

Permission-gated routes, URL-backed task views, current-session school/year scopes, modeled readiness/GR/Roll/Division rules, safe assignment previews, focused automated tests, TypeScript, lint, and responsive settings layout are proven within the evidence described above.

### What is preview-only

Readiness interpretation, applied Onboarding rules, GR/Roll/Division assignment outcomes, approvals, account preparation, bulk workflow actions, and activation are frontend session projections or proposed contracts.

### What is missing

Persisted governance, authoritative rule resolution, commands, transaction and concurrency control, migration, correction, annual lifecycle, downstream convergence, security proof, performance evidence, and operational recovery are missing.

### What blocks small-school adoption

Configuration disappears after reload, no authoritative assignment or activation path exists, and the two observed frontend interaction/accessibility failures make even moderated operation unreliable.

### What blocks large-school rollout

The unpaged worklist contract, ambiguous equal-priority rules, absent tenant-negative evidence, missing durable bulk jobs, unproved concurrency and idempotency, no migration/reconciliation, and no measured scale or operations model are release blockers.

### Ten highest-value next actions

1. Approve the scope, precedence, uniqueness, normalization, lifecycle, approval, and correction policies.
2. Persist versioned and effective-dated settings with tenant/school/year authorization and audit.
3. Build a server-owned GR/Roll allocator and Division capacity transaction with database constraints.
4. Implement version-bound preview and idempotent commit with stale-state revalidation.
5. Implement authoritative readiness, approval, activation, and failure-recovery states.
6. Prove cross-tenant, object, property, and function authorization with negative API tests.
7. Fix the individual drawer action and first-invalid-field focus and add browser regressions.
8. Replace the unpaged worklist with server paging and add durable, recoverable bulk jobs.
9. Deliver migration dry run, stable source-key replay, correction, and signed reconciliation.
10. Define outbox events, consumer ownership, propagation status, observability, alerts, and runbooks.

### Evidence still required before production approval

Production approval requires passing API and database tests for persistence, versioning, authorization, uniqueness, capacity contention, idempotency, stale previews, rollback/compensation, immutable audit, and bulk totals.
It also requires all twelve synthetic end-to-end journeys, annual rollover and historical import tests, consumer failure/replay tests, 25,000/50,000-student percentile measurements, security and privacy review, full WCAG-oriented browser coverage, and an operational recovery drill.
