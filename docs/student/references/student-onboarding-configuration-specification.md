---
module: student
domain: onboarding-configuration
content_type: Reference
status: canonical
updated_on: 2026-09-08
owner: frontend-team
audience: humans-and-agents
---

# Student Onboarding: school configuration and management review

TL;DR: each school should be able to choose how it assigns GR Numbers, Roll Numbers, and Divisions, and which checks must be completed before a student becomes active.
These choices must work separately for each Board, teaching Medium, School Level, Class, and Division.
The proposed approach is a common school setup with specific rules wherever the school needs a different process.

| Document information    | Detail                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| Prepared for            | Management and product review                                                                                 |
| Purpose                 | Explain the proposed school configuration flow and the decisions needed to deliver it                         |
| Features covered        | GR Number, Roll Number, Division, Readiness, and Activation                                                   |
| Document updated        | 8 September 2026                                                                                              |
| Delivery status         | Proposed product design; detailed field lists are not a declaration that all features are live                |
| Implementation evidence | Source review from 3 September; session-based settings and Board-only rule targeting rechecked on 8 September |

## How to use this document in the meeting

Present sections 1–8 first.
Use the detailed reference only when someone asks about a specific setting or implementation requirement.

| Meeting topic                               | Where to read                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| Why this work is needed                     | [1. Business problem](#1-business-problem)                                   |
| Meaning of the five features                | [2. Feature overview](#2-feature-overview)                                   |
| How a school completes setup                | [3. Proposed school setup](#3-proposed-school-setup)                         |
| What happens with All Boards                | [4. Board, Medium, and Class selection](#4-board-medium-and-class-selection) |
| A complete student example                  | [5. Worked example](#5-worked-example)                                       |
| Choices for different schools               | [6. School configuration choices](#6-school-configuration-choices)           |
| What management needs to decide             | [7. Decisions and delivery order](#7-decisions-and-delivery-order)           |
| Suggested meeting explanation               | [8. Suggested explanation](#8-suggested-explanation)                         |
| Every field, meaning, option, and safeguard | [Detailed reference](#detailed-reference)                                    |

## 1. Business problem

Different schools follow different admission and classroom processes.
One school may keep a single GR register for every student, while another may maintain separate approved registers for different sections.
Roll ordering, Division placement, required documents, and approval steps may also differ.

Selecting a Board alone does not describe these differences.
For example, the selection `GSEB` still leaves two questions unanswered: which teaching Medium, and which School Level?

| Situation                                     | Problem to solve                                               | Proposed outcome                                     |
| --------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| GSEB school offers Gujarati and English       | Board selection does not tell staff which Medium a rule covers | The school selects Medium separately                 |
| One school has Primary and Secondary sections | The two sections may need different processes                  | The school selects School Level separately           |
| Both GSEB and CBSE have Class 9               | A list showing only “Class 9” is unclear                       | Show Board, Medium, and Level with every Class       |
| Most Classes use the same rules               | Repeating the setup creates extra work                         | Create a common rule and add exceptions where needed |
| Two staff assign numbers or seats together    | They could act on the same available number or seat            | The system checks availability again when saving     |

The current Onboarding settings are a preview held in the browser session.
The school needs settings that remain saved, can be reviewed and published, and are applied consistently when staff perform the actual student operation.

## 2. Feature overview

| Feature     | Simple meaning                                                   | What the school decides                                                                   | Example                                    |
| ----------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| GR Number   | The student's school register identifier                         | Number format, shared or separate register, manual entry, and returning-student treatment | `GJ-001245`                                |
| Roll Number | The student's number within a Class or Division roster           | Numbering group, ordering, and treatment of new admissions or moves                       | Roll 27 in Class 9 A                       |
| Division    | The student's classroom group                                    | Manual or automatic placement, seat limits, and Division-change rules                     | Class 9, Division A                        |
| Readiness   | The checks required before activation                            | Required documents, placement, identifiers, access, and approvals                         | Transfer certificate awaiting verification |
| Activation  | The action that makes an eligible student operational in the ERP | Approval, required account setup, and completion conditions                               | Student becomes First Day Ready            |

Three different uses of “active” must stay clear:

| Term                        | Meaning                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| Active configuration        | A published rule is eligible to be used for new operations during its effective dates           |
| Ready for activation        | The student's required pre-activation checks have passed or have a permitted approved exception |
| Activated / First Day Ready | The activation operation has completed the required student, placement, and access steps        |

Readiness can check that a GR can be assigned and an account can be created.
The actual GR allocation and account creation can happen during activation when the selected policy requires that timing.

## 3. Proposed school setup

This is the proposed setup journey for the school administrator.
The system should display only options that exist in that school's academic structure.

| Step                    | What the school chooses                                                        | What the system shows or does                          |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 1. Select coverage      | School, Year, Board, Medium, School Level, Class, and optionally Division      | A complete description of who the rule will affect     |
| 2. Set GR rules         | Number format, starting point, shared/separate counter, and manual-entry rules | Example GR values and any duplicate risk               |
| 3. Set Division rules   | Placement method, capacity, and change approvals                               | Available Divisions and the effect of each choice      |
| 4. Set Roll rules       | Numbering group, order, preservation, and assignment timing                    | Example roster with proposed Roll Numbers              |
| 5. Set readiness checks | Required checks, who completes them, and which ones block activation           | A checklist for each admission type                    |
| 6. Set activation rules | Approval, accounts, communication, and completion conditions                   | The steps needed to make the student ready for school  |
| 7. Review an example    | One or more representative student cases                                       | Applied rules, expected results, and unresolved issues |
| 8. Publish              | Effective date and authorized approval where required                          | A saved rule version that staff can use                |

For a small school, a template should prefill the common choices.
Advanced settings should be available when the school needs a different process.

## 4. Board, Medium, and Class selection

Use this selection order:

**School → Academic Year → Board → Medium → School Level → Class → Division**

Example selection: `Main School / 2026–27 / GSEB / Gujarati / Secondary / Class 9 / A`.
The exact relationship between School and Campus remains a product decision.

| School's choice               | How the Class selection should behave                                     |
| ----------------------------- | ------------------------------------------------------------------------- |
| GSEB + Gujarati + Secondary   | Show only Classes configured under that combination                       |
| GSEB + English + Primary      | Show only Classes configured under that combination                       |
| All Boards + all Classes      | Show a coverage summary and a way to inspect the included academic groups |
| All Boards + selected Classes | Group Classes under their Board, Medium, and School Level                 |

When All Boards is selected, staff should see choices such as:

- GSEB / Gujarati / Secondary / Class 9
- GSEB / English / Secondary / Class 9
- CBSE / English / Secondary / Class 9

These are three separate selections even though the Class name is the same.

The school must also choose whether a new Board, Medium, or Class added later is automatically covered.
The proposed default is to include only the academic groups reviewed when the rule was published; new groups can then be reviewed before inclusion.

## 5. Worked example

The following is an illustrative school choice, not a Board-mandated numbering format or seat limit.

Example school: Main School offers GSEB Gujarati Secondary, GSEB English Secondary, and CBSE English Secondary.
It chooses separate GR series for these three groups, subject to its register requirements.

| Setting              | Example choice                                                                | Meaning                                                             |
| -------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Applies to           | GSEB / Gujarati / Secondary                                                   | This rule covers only that academic group                           |
| GR prefix            | `GJ-`                                                                         | Every new GR begins with these characters                           |
| Next sequence        | 1245                                                                          | Next available counter value, confirmed by the system when assigned |
| Number digits        | 6                                                                             | The sequence displays as `001245`                                   |
| Reset                | Continue existing sequence                                                    | The counter does not restart at the new academic year               |
| Division method      | Staff choose an available Division                                            | Staff select from valid placement options                           |
| Division capacity    | 40 for this example                                                           | Placement must use the school's approved seat limit                 |
| Roll numbering group | Class and Division                                                            | Each Class/Division has its own Roll sequence                       |
| Mid-year Roll method | Next available number                                                         | Existing students keep their Roll Numbers                           |
| Readiness            | Admission, documents, valid placement, identifiers, and account prerequisites | Applicable checks must be resolved                                  |
| Activation           | Approval followed by required student and access setup                        | Completion makes the student First Day Ready                        |

For a transfer student joining Class 9 during the year:

| Stage                | Staff action                                            | Expected system result                                                              |
| -------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Identify student     | Review existing records and transfer details            | Detect a returning or duplicate student before creating another record              |
| Select placement     | Choose GSEB / Gujarati / Secondary / Class 9 / A        | Apply the rules for this academic group and check its seat availability             |
| Review numbers       | Preview GR and Roll                                     | Propose `GJ-001245` and, if Rolls 1–26 are occupied, Roll 27                        |
| Check readiness      | Verify the required transfer documents and other checks | Show incomplete checks and the person responsible                                   |
| Approve and activate | Submit the eligible case and complete approval          | Recheck availability, save the final assignment, and create required records/access |
| Confirm completion   | Review the activation result                            | Show final GR, Division, Roll, and any outstanding work                             |

A later move to Division B should follow the configured approval and Roll-change rules.
The student's GR should remain unchanged in this example, and the previous Division membership must remain in history.

## 6. School configuration choices

| School model                       | Recommended starting approach                             | Benefit                                          |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| Small school, one Board and Medium | One shared set of rules, with simple defaults             | Less setup work                                  |
| GSEB with Gujarati and English     | Shared defaults with separate Medium rules where needed   | Flexibility without repeating every setting      |
| GSEB and CBSE in one school        | Board-specific coverage with clear Class labels           | Staff can see exactly which group a rule affects |
| Large group with multiple schools  | Approved common templates and permitted school exceptions | Consistent processes with local flexibility      |

A school can choose its operational preferences, such as name ordering or manual Division placement.
Required data protections and applicable mandatory rules remain enforced.
Board-specific requirements must be verified before the product presents them as mandatory defaults.

## 7. Decisions and delivery order

| Decision for management                                     | Suggested starting position                                    | Reason                                           |
| ----------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| How much configuration should a small school see initially? | Show essential choices first, advanced options on demand       | Keeps setup understandable                       |
| Should GR counters be shared or separate?                   | Support both, with an explicit register decision               | Schools have different register arrangements     |
| What happens to newly added academic groups?                | Review before including them in published rules                | Avoids applying an unsuitable rule automatically |
| Should a mid-year admission renumber existing students?     | Keep existing Rolls by default                                 | Reduces classroom and record disruption          |
| What happens when a Division is full?                       | Block placement unless an allowed exception is approved        | Makes the seat decision visible                  |
| Who approves exceptional changes?                           | Map approval responsibilities to the school's authorized staff | Keeps ownership clear                            |

| Delivery order                 | Deliverable                                                                    | Evidence of completion                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| First: reliable school setup   | Saved configuration, complete academic selection, and conflict checks          | Reopen the settings and confirm the published choices remain correct                       |
| Next: student operations       | GR allocation, Division placement, and Roll assignment using those rules       | Run representative admissions and confirm the expected assignments                         |
| Next: readiness and activation | Required checks, approval, account preparation, and recovery from failed steps | Confirm eligible students complete activation and blocked students show actionable reasons |
| Then: larger-school operations | Bulk processing, import, year rollover, and progress/recovery tools            | Demonstrate the agreed student volume and simultaneous staff usage                         |

Concurrent assignment checks and duplicate prevention are required from the first operational release.
The delivery order is a proposed scope sequence; dates and effort need engineering estimation.

## 8. Suggested explanation

> Our schools need different onboarding settings because Board, teaching Medium, and School Level are separate choices. For example, GSEB Gujarati Secondary and GSEB English Primary may follow different processes. We propose one common school setup, with specific rules wherever the school needs them.
>
> Staff will first choose the academic group. They will then configure GR Numbers, Division placement, Roll Numbers, and the checks required before activation. Before publishing, they can review an example student and see the expected result. All Boards will still show Classes grouped by Board, Medium, and School Level, so staff know exactly what they are selecting.
>
> The immediate priority is to save and apply these rules reliably. We then need to prove that real student assignments and activation follow them, including returning students, transfers, full Divisions, and staff working at the same time.

## Detailed reference

The following sections retain the full proposed field catalogue and implementation requirements for product, engineering, and QA review.
The manager presentation above is a reading guide to this reference; it does not replace or remove the detailed fields.

| Detail needed                           | Link                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Fields shared by all settings           | [Common configuration fields](#common-configuration-fields)                                                   |
| GR fields, meanings, and workflow       | [GR Number configuration](#gr-number-configuration)                                                           |
| Roll fields, meanings, and workflow     | [Roll Number configuration](#roll-number-configuration)                                                       |
| Division fields, meanings, and workflow | [Division configuration](#division-configuration)                                                             |
| Readiness checks and access fields      | [Readiness & Access configuration](#readiness--access-configuration)                                          |
| Activation fields and completion flow   | [Activation configuration](#activation-configuration)                                                         |
| Rule priority and publishing            | [Deterministic rule resolution](#deterministic-rule-resolution)                                               |
| Technical operations and audit          | [Audit and operational fields](#audit-and-operational-fields)                                                 |
| Research references                     | [External standards and official product implications](#external-standards-and-official-product-implications) |
| Full release criteria                   | [Release acceptance criteria](#release-acceptance-criteria)                                                   |

## Purpose

This document is the manager-facing product specification for Student Onboarding configuration.
It defines the target fields, meanings, rule resolution, workflows, safeguards, permissions, audit requirements, and release acceptance criteria.
It covers small, growing, large, multi-board, multi-medium, and multi-campus schools.

This document does not claim that every target field is implemented today.

| Evidence label       | Meaning                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Current              | Verified in the present frontend or an existing connected Enrollment workflow            |
| Target               | Required product behavior proposed by this specification                                 |
| Backend requirement  | Must be authoritative on the server and database, not calculated only in the browser     |
| Regulatory reference | Product implication based on an official external source; legal review is still required |

## Executive decision

### Is the current flow fully customizable?

No.
The current configuration model supports useful GR, Roll, Division, and Readiness choices, but it is not yet a complete school-owned configuration system.

| Area                   | Current capability                                                                       | Main gap                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| School and year scope  | Current-school defaults and an academic-year override can be represented                 | Settings are held in frontend session state and reset after a full reload                      |
| Board targeting        | GR, Roll, and Division rules can target all or selected Boards                           | Board selection does not identify Medium or School Level                                       |
| Medium targeting       | Student Setup can filter operational rows by Board and Medium                            | Rules cannot independently target Gujarati, English, Hindi, or another Medium                  |
| School Level targeting | Academic structures elsewhere contain `academicMediumStage`                              | Onboarding rules cannot target Pre-primary, Primary, Upper Primary, Secondary, or Sr Secondary |
| Class targeting        | Roll and Division rules can target a Class                                               | A Class name can be ambiguous across Boards, Media, campuses, and school levels                |
| GR configuration       | Format, sequence, reset, range, applicability, and manual-entry controls are modeled     | No verified persisted allocator, uniqueness boundary, atomic counter, or correction lifecycle  |
| Roll configuration     | Scope, ordering, timing, preservation, locks, and mid-year behavior are modeled          | No verified persisted assignment engine or historical trace                                    |
| Division configuration | Strategies, tolerance, capacity behavior, approval, and effective date are modeled       | No verified authoritative capacity lock or governed effective-dated move                       |
| Readiness              | Route profiles, required/blocking checks, owners, approvals, and account controls exist  | No persisted versions or connection to authoritative readiness sources                         |
| Activation             | Connected Enrollment has preview, approval, execution, repair, and cancellation concepts | Onboarding settings are not the published policy source used by that connected workflow        |

## Non-negotiable academic hierarchy

The configuration hierarchy must be:

```text
Tenant or School Group
└── School or Campus
    └── Academic Year
        └── Board
            └── Medium
                └── School Level
                    └── Class
                        └── Division
```

| Dimension     | Question it answers                                      | Example values                                                   |
| ------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| Tenant        | Which customer owns the data and policy boundary?        | Shree Education Trust                                            |
| School/Campus | Which operating location applies the rule?               | Main Campus, Science Campus                                      |
| Academic Year | During which academic cycle is the rule effective?       | 2026-27                                                          |
| Board         | Which curriculum or regulatory affiliation applies?      | GSEB, CBSE, ICSE, IB, School-defined                             |
| Medium        | In which teaching language is the academic path offered? | Gujarati, English, Hindi, Marathi                                |
| School Level  | Which education stage owns the Class?                    | Pre-primary, Primary, Upper Primary, Secondary, Senior Secondary |
| Class         | Which grade or standard applies?                         | Standard 1, Standard 9, Grade 11                                 |
| Division      | Which roster group within the Class applies?             | A, B, Commerce A                                                 |

`GSEB` does not automatically mean Gujarati Medium.
A GSEB school can offer Gujarati and English Medium.
The same school can operate Primary and Secondary sections with different numbering and placement policies.

### Required selection order

1. Select School or Campus.
2. Select Academic Year.
3. Choose All Boards or selected Boards.
4. Choose All Media or selected Media available under those Boards.
5. Choose All School Levels or selected levels available under those Board and Medium paths.
6. Choose All Classes or selected Classes from the qualified paths.
7. Choose All Divisions or selected Divisions when the rule needs Division-level scope.
8. Review the full coverage summary before validation and publish.

Every selected Class must be displayed with its full path.
For example, the UI must show `GSEB / Gujarati / Secondary / Standard 9`, not only `Standard 9`.

## How “All Boards” must work

“All Boards” is a coverage choice, not a shortcut that removes academic context.

### Mode A: all academic structures

Use this mode when the same rule genuinely applies to every currently selected School/Campus academic path.
The Class control must be replaced by a read-only coverage summary such as:

```text
All configured academic paths in 2026-27
2 Boards • 3 Media • 4 School Levels • 28 Classes • 74 Divisions
```

The administrator must choose how future academic structures behave:

| Field                     | Choice                  | Meaning                                                                        |
| ------------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| Include future structures | No, snapshot at publish | Safest default; only the paths reviewed during publish are included            |
| Include future structures | Yes, auto-include       | New matching paths inherit the rule and create an audit event and notification |

### Mode B: selected structures across Boards

Use this mode when the administrator selects All Boards but only some Media, School Levels, Classes, or Divisions.
Show one searchable hierarchical tree:

```text
GSEB
├── Gujarati
│   ├── Primary
│   │   ├── Standard 1
│   │   └── Standard 2
│   └── Secondary
│       └── Standard 9
└── English
    └── Secondary
        └── Standard 10
CBSE
└── English
    ├── Primary
    └── Secondary
```

The UI must never combine same-named Classes from different paths into one unlabeled option.

## Configuration layers and inheritance

Schools need strong defaults without losing local flexibility.
The product must resolve rules through these layers:

| Order | Layer                   | Purpose                                                         | Override rule                                            |
| ----- | ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| 1     | Platform invariant      | Protect tenant isolation, uniqueness, audit, and data integrity | Cannot be disabled by a school                           |
| 2     | Regulatory policy pack  | Represent verified Board/government obligations and guidance    | Mandatory rules cannot be overridden; advisory rules can |
| 3     | School-group template   | Share an approved starting model across related schools         | A school may override only permitted fields              |
| 4     | School/Campus default   | Define normal local operations                                  | Academic-year and path exceptions can be allowed         |
| 5     | Academic-year override  | Handle year-specific changes without rewriting history          | Applies only within its effective year                   |
| 6     | Academic-path exception | Handle Board, Medium, Level, Class, or Division differences     | More specific valid coverage wins                        |
| 7     | Student exception       | Handle an authorized one-student operational exception          | Requires reason, permission, evidence, and audit         |

### Policy pack fields

The system must not hard-code guessed GSEB, CBSE, or government rules into UI code.
Verified rules should be delivered as versioned policy packs.

| UI field             | Proposed key         | Required  | Meaning                                                        |
| -------------------- | -------------------- | --------- | -------------------------------------------------------------- |
| Policy pack name     | `policyPackName`     | Yes       | Human-readable policy title                                    |
| Authority            | `authorityName`      | Yes       | Board, department, or regulator that issued the source         |
| Jurisdiction         | `jurisdictionCode`   | Yes       | Country/state/region where it applies                          |
| Board                | `boardIds`           | As needed | Boards covered by the pack                                     |
| School type          | `schoolTypeCodes`    | No        | Government, aided, private, minority, or another verified type |
| Effective from       | `effectiveFrom`      | Yes       | First date the policy can apply                                |
| Effective until      | `effectiveUntil`     | No        | Last date, when the policy expires                             |
| Source URL/reference | `sourceReference`    | Yes       | Official circular, rule, bye-law, or order                     |
| Requirement type     | `requirementType`    | Yes       | Mandatory or advisory                                          |
| Override allowed     | `overrideAllowed`    | Yes       | Whether a school can change the recommended value              |
| Version              | `version`            | Yes       | Immutable published policy revision                            |
| Verification status  | `verificationStatus` | Yes       | Draft, reviewed, verified, superseded                          |

## Common configuration fields

These fields apply to GR, Roll, Division, Readiness, and Activation policies unless a section says otherwise.

| UI field                  | Proposed key              | Required      | Meaning                                                               | Example or default                  |
| ------------------------- | ------------------------- | ------------- | --------------------------------------------------------------------- | ----------------------------------- |
| Configuration name        | `name`                    | Yes           | Name staff can recognize in lists and audit history                   | GSEB Gujarati Secondary GR          |
| Description               | `description`             | No            | Operational purpose and special context                               | Persistent GR for secondary section |
| Rule type                 | `ruleType`                | Yes           | GR, Roll, Division, Readiness, or Activation                          | `gr-number`                         |
| School/Campus             | `schoolIds`               | Yes           | Operating schools or campuses covered                                 | Main Campus                         |
| Academic-year mode        | `academicYearMode`        | Yes           | All eligible years or selected year                                   | Selected year                       |
| Academic Year             | `academicYearIds`         | Conditional   | Selected years when mode is not all                                   | 2026-27                             |
| Board mode                | `boardMode`               | Yes           | All configured Boards or selected Boards                              | Selected Boards                     |
| Boards                    | `boardIds`                | Conditional   | Board identifiers when selected                                       | GSEB                                |
| Medium mode               | `mediumMode`              | Yes           | All Media under selected Boards or selected Media                     | Selected Media                      |
| Media                     | `academicMediumIds`       | Conditional   | Teaching languages covered                                            | Gujarati, English                   |
| School Level mode         | `stageMode`               | Yes           | All levels or selected levels                                         | Selected levels                     |
| School Levels             | `academicMediumStageIds`  | Conditional   | Pre-primary, Primary, Upper Primary, Secondary, or Sr Secondary paths | Secondary                           |
| Class mode                | `classMode`               | Yes           | All Classes in coverage or selected Classes                           | Selected Classes                    |
| Classes                   | `standardIds`             | Conditional   | Fully qualified Classes covered                                       | Standard 9 and 10                   |
| Division mode             | `divisionMode`            | When relevant | All Divisions or selected Divisions                                   | All Divisions                       |
| Divisions                 | `divisionIds`             | Conditional   | Fully qualified Divisions covered                                     | A and B                             |
| Admission profiles        | `onboardingProfileIds`    | No            | Fresh, Transfer, Mid-year, Returning, or school-defined routes        | Fresh and Transfer                  |
| Include future structures | `includeFutureStructures` | Yes           | Whether new matching paths inherit the rule automatically             | `false`                             |
| Effective from            | `effectiveFrom`           | Yes           | Date/time the rule becomes eligible                                   | 2026-04-01                          |
| Effective until           | `effectiveUntil`          | No            | Date/time the rule stops being eligible                               | 2027-03-31                          |
| Status                    | `status`                  | Yes           | Draft, Validated, Approval Pending, Published, Retired                | Draft                               |
| Change reason             | `changeReason`            | At publish    | Why the configuration was created or changed                          | New English Medium section          |
| Source policy pack        | `policyPackVersionId`     | No            | Verified policy pack from which the rule inherits                     | CBSE admission-register v3          |
| Version                   | `version`                 | Server        | Immutable published revision number                                   | 4                                   |
| Created/updated by        | `auditActor`              | Server        | Staff identity responsible for the change                             | User ID, not free text              |

Coverage must be stored by stable IDs.
Names are display labels and cannot be the database key.

## GR Number configuration

### GR Number definition

GR Number means the school's General Register or permanent admission-register identifier.
It must not be treated as the same value as Roll Number, application number, admission form number, PEN, APAAR ID, or a portal username.

### GR Number field dictionary

| UI field                  | Proposed key                | Required | Meaning                                                                | Example or recommended value                          |
| ------------------------- | --------------------------- | -------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| Series name               | `name`                      | Yes      | Recognizable name of the GR rule                                       | GSEB Gujarati GR                                      |
| Assignment mode           | `assignmentMode`            | Yes      | Automatic, manual, or both                                             | Both                                                  |
| Assignment timing         | `assignmentTiming`          | Yes      | When the GR is reserved or assigned                                    | During activation                                     |
| Format pattern            | `formatPattern`             | Yes      | Token-based construction of the visible GR                             | `{PREFIX}{YEAR}-{SEQUENCE}`                           |
| Prefix                    | `prefix`                    | No       | Fixed text before the sequence                                         | GJ                                                    |
| Suffix                    | `suffix`                    | No       | Fixed text after the sequence                                          | S                                                     |
| Starting number           | `startingNumber`            | Yes      | First sequence value for a new counter                                 | 1                                                     |
| Padding                   | `padding`                   | Yes      | Minimum sequence digits with leading zeroes                            | 6 gives `000001`                                      |
| Maximum number            | `maximumNumber`             | No       | Last permitted sequence before exhaustion handling                     | 999999                                                |
| Sequence pool scope       | `sequenceScope`             | Yes      | Boundary that owns one increasing counter                              | School, Campus, Year, Board, Medium, Stage, or custom |
| Uniqueness scope          | `uniquenessScope`           | Yes      | Boundary inside which no two active/historical GR values may collide   | School                                                |
| Reset policy              | `resetPolicy`               | Yes      | Continuous, academic-year reset, calendar-year reset, or never reset   | Continuous                                            |
| Next number               | `nextNumber`                | Server   | Read-only next candidate; never trusted as a client allocation         | 12843                                                 |
| Token set                 | `allowedTokens`             | Server   | Tokens allowed in the pattern                                          | School, Board, Medium, Year, Sequence                 |
| Duplicate detection scope | `duplicateDetectionScope`   | Yes      | Current only or current plus historical records                        | Current plus historical                               |
| Gap reuse policy          | `gapReusePolicy`            | Yes      | Never reuse, reuse cancelled reservations, or controlled manual reuse  | Never reuse                                           |
| Exhaustion behavior       | `exhaustionBehavior`        | Yes      | Block, notify, or move to an approved next series                      | Block and notify                                      |
| Manual entry allowed      | `manualEntryAllowed`        | Yes      | Whether permitted staff may enter a GR instead of using the allocator  | Yes for migration/transfer only                       |
| Manual reason required    | `requireManualReason`       | Yes      | Whether a reason is mandatory for manual GR                            | Yes                                                   |
| Manual approval required  | `requireManualApproval`     | Yes      | Whether a second authorized person must approve manual GR              | Yes                                                   |
| Manual evidence required  | `requireManualEvidence`     | Target   | Whether register/import evidence must be attached                      | Yes for legacy GR                                     |
| Returning-student policy  | `returningStudentPolicy`    | Yes      | Resume existing GR, review conflict, or issue new only when authorized | Resume existing                                       |
| Transfer-student policy   | `transferStudentPolicy`     | Yes      | Allocate local GR, preserve external reference separately, or manual   | Allocate local and retain external ID                 |
| Correction policy         | `correctionPolicy`          | Yes      | Govern typo correction, replacement, alias history, and approval       | Never overwrite history                               |
| Reservation timeout       | `reservationTimeoutMinutes` | Backend  | Time after which an unused reservation can be cancelled safely         | Product decision                                      |
| Effective from/until      | Common fields               | Yes/No   | Controls eligibility without rewriting earlier student history         | Academic year dates                                   |
| Active status             | `isActive`                  | Yes      | Whether the series can receive new allocations                         | Yes                                                   |

Recommended pattern tokens:

| Token        | Meaning                                     | Example |
| ------------ | ------------------------------------------- | ------- |
| `{SCHOOL}`   | Stable school code                          | SM01    |
| `{CAMPUS}`   | Stable campus code                          | MAIN    |
| `{BOARD}`    | Board code                                  | GSEB    |
| `{MEDIUM}`   | Medium code                                 | GUJ     |
| `{STAGE}`    | School Level code                           | SEC     |
| `{YEAR}`     | Configured academic-year code               | 2627    |
| `{SEQUENCE}` | Atomic padded sequence generated by backend | 001284  |

Names must not be inserted into identifiers unless the school explicitly accepts the impact of renaming.
Stable short codes are safer.

### GR Number workflow

1. Administrator creates or clones a GR series in Draft status.
2. Administrator selects the complete academic coverage path.
3. System validates pattern tokens, sample output, maximum length, range, and overlaps.
4. System simulates at least the first, next, and maximum values.
5. System checks conflicts against current and historical identifiers.
6. Administrator previews affected academic paths and students.
7. A permitted approver publishes the immutable version.
8. During student activation, the backend resolves the applicable published version.
9. The backend checks whether the student already has a valid persistent GR.
10. The backend atomically reserves the next sequence and returns a preview reference.
11. Commit revalidates the policy version, placement, duplicate state, and reservation.
12. Successful activation stores the GR, series version, assignment event, actor, timestamp, and reason.
13. Failure must release or reconcile the reservation without creating a duplicate.
14. A correction creates a new lifecycle event and preserves the old value as history or alias.

### GR validation rules

- Two published rules with equal specificity and overlapping dates cannot produce an ambiguous result.
- Sequence scope cannot be broader than the uniqueness guarantee without an explicit collision strategy.
- Reset is blocked if the resulting visible values could collide with retained history.
- Manual GR must use the same uniqueness checks as automatic allocation.
- Bulk import must be restartable and idempotent by a stable source row key.
- Returning students must be searched by stable identity and historical identifiers before allocation.
- A previewed value is not guaranteed until the backend reserves or commits it.

## Roll Number configuration

### Roll Number definition

Roll Number is an operational ordering value for a student within a defined roster scope.
It may change when the academic year, Class, or Division changes.
Roll history must remain traceable.

### Roll Number field dictionary

| UI field                 | Proposed key                | Required | Meaning                                                               | Example or recommended value              |
| ------------------------ | --------------------------- | -------- | --------------------------------------------------------------------- | ----------------------------------------- |
| Rule name                | `name`                      | Yes      | Recognizable Roll rule name                                           | Secondary Roll by Division                |
| Assignment mode          | `assignmentMode`            | Yes      | Automatic, manual, or both                                            | Automatic                                 |
| Numbering scope          | `numberingScope`            | Yes      | Class, Class+Division, Grade+Campus, or approved custom scope         | Class+Division                            |
| Starting number          | `startingNumber`            | Yes      | First Roll Number in each resolved scope                              | 1                                         |
| Maximum number           | `maximumNumber`             | No       | Highest allowed Roll Number                                           | Division capacity or school-defined limit |
| Assignment timing        | `assignmentTiming`          | Yes      | After Division, during activation, first academic day, or manual bulk | After Division                            |
| Preserve existing        | `preserveExisting`          | Yes      | Keep already assigned valid numbers during recalculation              | Yes                                       |
| Mid-year handling        | `midYearHandling`           | Yes      | Next available, insert without recalc, insert and recalc, or manual   | Next available                            |
| Transfer handling        | `transferHandling`          | Yes      | Behavior when a student moves Class or Division                       | Reassign in destination scope             |
| Withdrawal handling      | `withdrawalHandling`        | Yes      | Whether released Roll Numbers are reusable                            | Do not reuse during the year              |
| Ordering field           | `orderingRules[].field`     | Yes      | Attribute used to order students                                      | Student name                              |
| Ordering direction       | `orderingRules[].direction` | Yes      | Ascending or descending                                               | Ascending                                 |
| Null handling            | `orderingRules[].nulls`     | Yes      | Whether missing values sort first, last, or block calculation         | Missing last                              |
| Text collation           | `textCollation`             | Yes      | Locale-aware ordering rule for Gujarati, English, or another script   | Locale selected from Medium               |
| Final tie-breaker        | `finalTieBreaker`           | Yes      | Stable unique field that prevents nondeterministic ordering           | Student record ID                         |
| Individual locks allowed | `allowIndividualLocks`      | Yes      | Whether selected students can keep a Roll during bulk reorder         | Yes                                       |
| Lock reason required     | `requireLockReason`         | Yes      | Whether every individual lock requires explanation                    | Yes                                       |
| Change reason required   | `requireChangeReason`       | Yes      | Whether manual/recalculated changes require a reason                  | Yes                                       |
| Approval required        | `requireApproval`           | Yes      | Whether bulk or exceptional changes need approval                     | Based on school policy                    |
| Collision behavior       | `collisionBehavior`         | Yes      | Block, propose next available, or require governed correction         | Block                                     |
| Recalculation mode       | `recalculationMode`         | Yes      | Never, scheduled, event-triggered, or approved manual run             | Approved manual run                       |
| Effective from/until     | Common fields               | Yes/No   | Rule validity period                                                  | Academic year                             |
| Active status            | `isActive`                  | Yes      | Whether the rule can assign new Roll Numbers                          | Yes                                       |

`orderingRules` is an ordered list.
For example: Student name ascending, then admission date ascending, then GR ascending, then stable Student ID.

### Roll Number workflow

1. Resolve the student's School, Year, Board, Medium, Level, Class, and Division.
2. Resolve exactly one published Roll rule and explain why it won.
3. Apply locks and preservation rules before proposing changes.
4. Sort with configured locale, null behavior, and stable final tie-breaker.
5. Preview preserved, new, changed, locked, conflict, and approval-required counts.
6. Show every student whose Roll will change, with before and after values.
7. Commit through a version-bound, idempotent backend operation.
8. Recheck roster membership and concurrent changes before writing.
9. Write one immutable event per student and one summary event for the run.
10. Notify downstream attendance, timetable, exam, transport, and communication consumers when required.

### Roll safeguards

- Roll Number must be unique within its resolved numbering scope.
- A missing ordering value cannot silently create unstable ordering.
- Gujarati and other non-Latin names require locale-aware, testable collation.
- Re-running the same job with the same idempotency key must not create new changes.
- Mid-year admission cannot renumber an entire Division unless the published policy explicitly allows it.
- A Division change must state whether Roll is preserved, recalculated immediately, or queued for an approved run.

## Division configuration

### Division definition

Division is the student's effective-dated roster membership within a Class.
It is not only a label on the Student record.
It affects capacity, Roll Number, attendance, timetable, exams, transport, communication, and reporting.

### Division field dictionary

| UI field                    | Proposed key                | Required    | Meaning                                                                    | Example or recommended value                |
| --------------------------- | --------------------------- | ----------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Rule name                   | `name`                      | Yes         | Recognizable placement rule                                                | Grade 9 balanced placement                  |
| Assignment mode             | `assignmentMode`            | Yes         | Automatic, manual, or both                                                 | Both                                        |
| Automatic strategy          | `automaticStrategy`         | Conditional | Next available, balanced count, balanced tolerance, sequential, preference | Balanced count                              |
| Strategy priority order     | `strategyPriority`          | Target      | Ordered factors when more than one placement goal exists                   | Capacity, accessibility, sibling preference |
| Balance tolerance           | `balanceTolerance`          | Conditional | Maximum permitted difference between Division strengths                    | 2                                           |
| Capacity required           | `capacityRequired`          | Yes         | Whether placement is blocked when capacity is missing                      | Yes for automatic placement                 |
| Capacity source             | `capacitySource`            | Yes         | Authoritative academic-structure field or approved capacity plan           | Division capacity                           |
| Capacity warning threshold  | `capacityWarningThreshold`  | Yes         | Remaining-seat level that raises an early warning                          | 5                                           |
| Over-capacity behavior      | `overCapacityBehavior`      | Yes         | Block, waitlist, or approval-based exception                               | Block                                       |
| Waitlist enabled            | `waitlistEnabled`           | Yes         | Whether eligible students can wait for a Division seat                     | School decision                             |
| Preference fields           | `preferenceFields`          | No          | Approved student preferences considered by placement                       | Language/elective preference                |
| Constraint fields           | `constraintFields`          | No          | Hard placement constraints                                                 | Accessibility support                       |
| Sensitive balancing allowed | `sensitiveBalancingAllowed` | Yes         | Whether legally reviewed sensitive data may be used                        | Off by default                              |
| Effective date required     | `effectiveDateRequired`     | Yes         | Whether every move must state when membership starts                       | Yes                                         |
| Backdate policy             | `backdatePolicy`            | Yes         | Block or approve changes before today                                      | Approval required                           |
| Future move allowed         | `futureMoveAllowed`         | Yes         | Whether a Division change can be scheduled                                 | Yes                                         |
| Reason required             | `requireReason`             | Yes         | Whether manual or exceptional placement needs a reason                     | Yes                                         |
| Approval required           | `requireApproval`           | Yes         | Whether the change needs maker-checker approval                            | Yes for exceptions                          |
| Approval required after     | `approvalRequiredAfter`     | No          | Date after which normal changes require approval                           | First instructional day                     |
| Roll Number action          | `rollNumberAction`          | Yes         | Preserve, recalculate, clear and queue, or manual decision                 | Recalculate                                 |
| Notify Class Teacher        | `notifyClassTeacher`        | Yes         | Whether the affected teacher receives a notification                       | Yes                                         |
| Notify family               | `notifyFamily`              | Yes         | Whether approved placement/move is communicated to guardian/student        | School decision                             |
| Downstream handoff mode     | `downstreamHandoffMode`     | Backend     | Synchronous transaction, durable event, or managed saga                    | Durable event/saga                          |
| Effective from/until        | Common fields               | Yes/No      | Policy validity period                                                     | Academic year                               |
| Active status               | `isActive`                  | Yes         | Whether the rule accepts new placements                                    | Yes                                         |

### Division workflow

1. System loads authoritative placement options as fully qualified academic paths.
2. System shows current active count, pending activations, configured capacity, and remaining capacity.
3. System resolves the published Division rule for the chosen path.
4. Automatic mode proposes a Division; manual mode validates the selected Division.
5. Preview shows capacity, tolerance, before/after membership, Roll consequence, approvals, and downstream impact.
6. If an exception is needed, the user supplies reason and evidence and submits it for approval.
7. The backend rechecks capacity using concurrency protection immediately before commit.
8. The backend closes the previous membership and creates the new effective-dated membership.
9. Roll handling executes or is queued according to the same versioned decision.
10. Attendance, timetable, exams, transport, communication, and reports receive a durable handoff.
11. Partial failure moves the operation to Repair Required; it must not silently show success.

### Division safeguards

- A student cannot have two active Divisions for the same Class and date unless the domain explicitly supports split enrollment.
- Capacity includes active membership and relevant pending activation reservations.
- A stale preview must be rejected when capacity or membership changed.
- Over-capacity approval cannot bypass a platform safety rule without a defined exception contract.
- Backdated changes must show attendance, timetable, exam, and fee impact before approval.
- Division deletion is blocked when historical membership depends on it; retire it instead.

## Readiness & Access configuration

### Readiness definition

Readiness determines whether the applicant has completed the policy gates needed for Student activation.
It must be evaluated from authoritative modules and evidence, not only from switches stored in the frontend.

### Profile fields

| UI field                  | Proposed key              | Required    | Meaning                                                        | Example                                   |
| ------------------------- | ------------------------- | ----------- | -------------------------------------------------------------- | ----------------------------------------- |
| Profile name              | `name`                    | Yes         | Recognizable route-specific readiness profile                  | Transfer Admission                        |
| Description               | `description`             | No          | Purpose and main differences                                   | Requires transfer certificate and history |
| Admission routes          | `admissionRoutes`         | Yes         | Fresh, Transfer, Mid-year, Returning, or school-defined routes | Transfer                                  |
| Academic coverage         | Common coverage fields    | Yes         | Board/Medium/Level/Class paths for which the profile applies   | GSEB / Gujarati / Secondary               |
| Default profile           | `isDefault`               | Yes         | Fallback only when no more specific route profile matches      | One default per valid scope               |
| Approval mode             | `approvalMode`            | Yes         | None, every student, or conditional exceptions                 | Conditional                               |
| Approval triggers         | `approvalTriggers`        | Conditional | Events that require approval                                   | Manual identifier, capacity override      |
| Block activation          | `blockActivation`         | Yes         | Whether unresolved blocking checks prevent activation          | Yes                                       |
| Student account           | `studentAccount`          | Yes         | Whether Student portal access must be provisioned              | Yes                                       |
| Guardian account          | `guardianAccount`         | Yes         | Whether Guardian access must be provisioned                    | Yes                                       |
| Verified guardian contact | `verifiedGuardianContact` | Yes         | Whether verified phone/email is required before access         | Yes                                       |
| Credential delivery       | `deliveryTiming`          | Yes         | After activation or manual release                             | After activation                          |
| Approval SLA              | `approvalSlaHours`        | Target      | Expected decision time for queued activation exceptions        | 24 hours                                  |
| Effective from/until      | Common fields             | Yes/No      | Profile validity period                                        | Academic year                             |

### Readiness check fields

Each profile contains an ordered list of readiness checks.

| UI field              | Proposed key            | Required    | Meaning                                                         | Example                                      |
| --------------------- | ----------------------- | ----------- | --------------------------------------------------------------- | -------------------------------------------- |
| Check key             | `key`                   | Yes         | Stable machine identifier                                       | `registration_verified`                      |
| Display label         | `label`                 | Yes         | Staff-facing name                                               | Registration verified                        |
| Description           | `description`           | No          | What satisfies the check                                        | Required registration data is approved       |
| Source module         | `sourceModule`          | Yes         | Authoritative owner of the result                               | Registration, Assessment, Finance, Placement |
| Source rule/reference | `sourceReference`       | Yes         | Policy, checklist, invoice state, or placement record evaluated | Transfer Certificate checklist item          |
| Required              | `required`              | Yes         | Whether the check applies to this profile                       | Yes                                          |
| Blocking              | `blocking`              | Yes         | Whether failure prevents activation                             | Yes                                          |
| Owner capability/team | `owner`                 | Yes         | Operational responsibility, without hard-coded role names       | Verify documents capability                  |
| Evidence required     | `evidenceRequired`      | Yes         | Whether a document/reference must support completion            | Yes                                          |
| Evidence freshness    | `evidenceMaxAgeDays`    | No          | Maximum accepted age where the rule requires recency            | 30                                           |
| Exception allowed     | `exceptionAllowed`      | Yes         | Whether authorized staff can request an exception               | Yes for advisory, No for invariant           |
| Exception approval    | `exceptionApprovalMode` | Conditional | None, single approval, or maker-checker                         | Maker-checker                                |
| Completion SLA        | `completionSlaHours`    | No          | Expected time for the owning team to resolve the check          | 48                                           |
| Sort order            | `sortOrder`             | Yes         | Stable order displayed in readiness and audit views             | 10                                           |

Recommended check catalogue:

| Check key                   | Typical source     | Purpose                                                                   |
| --------------------------- | ------------------ | ------------------------------------------------------------------------- |
| `identity_verified`         | Registration       | Confirm the student identity and detect an existing Student               |
| `demographics_verified`     | Registration       | Confirm name, date of birth, gender, and required demographic consistency |
| `guardian_verified`         | Registration       | Confirm guardian relationship and contact details                         |
| `consent_verified`          | Registration/Legal | Record required consent and notice evidence                               |
| `documents_complete`        | Documents          | Confirm the route-specific required document checklist                    |
| `assessment_complete`       | Assessment         | Confirm required exam/interview/interaction outcome                       |
| `offer_accepted`            | Admissions         | Confirm the approved offer is accepted                                    |
| `finance_verified`          | Finance            | Consume Finance-owned readiness only; do not recreate ledger logic        |
| `placement_valid`           | Academic structure | Confirm Board, Medium, Level, Class, and Division are valid               |
| `capacity_available`        | Academic structure | Confirm authoritative capacity or approved exception                      |
| `gr_ready`                  | Identifier service | Confirm persistent GR exists or an approved series can allocate one       |
| `roll_ready`                | Roll service       | Confirm Roll assignment timing and rule result                            |
| `account_access_ready`      | Identity/access    | Confirm requested accounts and verified delivery contact                  |
| `policy_ready`              | Policy engine      | Confirm no unresolved mandatory policy evaluation                         |
| `downstream_handoffs_ready` | Integration        | Confirm required service handoffs have consent and valid destination      |

Not every school needs every check.
The catalogue supplies reusable check definitions; the published profile determines what is required and blocking.

## Activation configuration

### Activation definition

Activation is the governed transition from applicant/admission state to a first-day-ready Student record.
The backend must own the transition and report partial failures.

### Activation field dictionary

| UI field                   | Proposed key                       | Required | Meaning                                                                  | Example or recommended value             |
| -------------------------- | ---------------------------------- | -------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| Activation profile         | `activationProfileId`              | Yes      | Published Readiness/Activation policy used for the student               | Transfer 2026-27                         |
| Activation target date     | `activationTargetDate`             | No       | Planned operational date for the cycle                                   | 2026-06-01                               |
| Placement timing           | `placementTiming`                  | Yes      | Whether full Division or only Class is required before activation        | Division required before activation      |
| GR requirement             | `requireGrNumber`                  | Yes      | Whether activation must assign or confirm GR                             | Yes                                      |
| Roll requirement           | `rollNumberRequirement`            | Yes      | During activation, after Division, first day, or not required            | After Division                           |
| Student account required   | `requireStudentAccount`            | Yes      | Whether Student identity/access provisioning is part of activation       | Yes                                      |
| Guardian account required  | `requireGuardianAccount`           | Yes      | Whether Guardian identity/access provisioning is part of activation      | Yes                                      |
| Service handoffs           | `serviceHandoffs`                  | No       | Transport, hostel, library, LMS, or other approved downstream requests   | Transport                                |
| Handoff consent required   | `requireServiceConsent`            | Yes      | Whether consent must be confirmed before optional minimum-data handoff   | Yes                                      |
| Approval required          | `requireActivationApproval`        | Yes      | Whether a distinct authorized approval is required                       | Yes                                      |
| Execution mode             | `executionMode`                    | Backend  | Atomic transaction or durable saga with explicit repair                  | Durable saga                             |
| Duplicate-student behavior | `existingStudentBehavior`          | Yes      | Link, resume, block, or governed merge when an existing Student is found | Block and review                         |
| Credential delivery        | `credentialDeliveryTiming`         | Yes      | After successful activation or manual release                            | After successful activation              |
| Cancellation window        | `activationCancellationWindowDays` | Yes      | Days in which governed cancellation follows the normal cancellation path | 7                                        |
| Cancellation approval      | `requireCancellationApproval`      | Yes      | Whether a second actor approves reversal                                 | Yes                                      |
| Repair owner               | `repairOwner`                      | Yes      | Capability/team responsible for a partial activation                     | Enrollment repair capability             |
| Retry policy               | `retryPolicy`                      | Backend  | Safe attempt limit and retry behavior                                    | Idempotent retry                         |
| First-day-ready condition  | `firstDayReadyCondition`           | Yes      | Required successful steps before status becomes First Day Ready          | Student, placement, GR, access, handoffs |
| Family message             | `activationMessageTemplateId`      | No       | Approved communication sent after successful activation                  | Admission confirmed template             |

Current connected Enrollment already represents activation states including Draft, Approval Pending, Approved, In Progress, Repair Required, First Day Ready, Cancelled, and Cancellation Pending.
The target Onboarding configuration must become a published policy input to this connected workflow instead of remaining a separate frontend-only projection.

### End-to-end Readiness and Activation flow

1. Enrollment hands off an admitted applicant with a stable applicant/lead identity.
2. System resolves the academic path and route-specific published profile.
3. System evaluates every check from its authoritative source and records input snapshots and evidence references.
4. UI groups results as Complete, Pending, Failed, Overridden, or Not Required.
5. Blocking failures prevent activation request.
6. Permitted exceptions enter a reason/evidence/approval workflow and never change the underlying source result silently.
7. Activation preview shows existing-student matches, placement, capacity, GR preview, Roll behavior, accounts, and service handoffs.
8. Request creates a version-bound activation record.
9. Approval is performed by an authorized actor when policy requires it.
10. Execute re-evaluates stale data and performs the transaction or managed saga idempotently.
11. Success creates or resumes the Student, placement membership, identifiers, accounts, and required handoffs.
12. Status becomes First Day Ready only when the configured success conditions are true.
13. Partial failure becomes Repair Required with the exact failed step and a safe retry path.
14. Student Records becomes the source of truth after activation while the complete admission and activation audit remains linked.
15. Cancellation uses preview, reason, permissions, approval, downstream compensation, and immutable history.

## Deterministic rule resolution

The backend must return both the winning rule and an explanation.

### Resolution order

1. Reject rules that violate a platform invariant or mandatory policy pack.
2. Keep only Published and effective rules for the student's School/Campus and date.
3. Apply the academic-year rule over an inherited School default.
4. Prefer exact Board over All Boards.
5. Prefer exact Medium over All Media.
6. Prefer exact School Level over All Levels.
7. Prefer exact Class over All Classes.
8. Prefer exact Division over All Divisions.
9. Prefer an exact admission profile over the default profile.
10. If two candidates remain equally specific, block validation/publish or execution; never choose by creation time.

### Applied-rule explanation

Every preview and student decision should show:

- rule name and immutable version;
- inheritance layer;
- full academic coverage path;
- admission profile;
- effective date range;
- policy pack, when applicable;
- values inherited and values overridden;
- approval or exception reason;
- evaluation timestamp and input version.

## Configuration lifecycle

```text
Draft → Validated → Previewed → Approval Pending → Published → Retired
```

| State            | Allowed behavior                                                                |
| ---------------- | ------------------------------------------------------------------------------- |
| Draft            | Edit freely; cannot affect live assignments                                     |
| Validated        | Structure, ranges, conflicts, required fields, and policy constraints pass      |
| Previewed        | Impact snapshot is available with a fingerprint and affected counts             |
| Approval Pending | Proposed version is locked while an authorized approver reviews it              |
| Published        | Immutable and eligible for backend rule resolution                              |
| Retired          | Cannot be used for new decisions; remains available for history and explanation |

Editing a Published rule creates a new Draft version.
Rollback creates and publishes a new version based on an earlier version; history is never rewritten.

## Capability-based permissions

Do not invent fixed role names.
Schools can map their own roles to these capabilities.

| Capability                        | Purpose                                          |
| --------------------------------- | ------------------------------------------------ |
| View onboarding configuration     | Read current rules and applied explanations      |
| Create/edit configuration draft   | Prepare a new version                            |
| Validate configuration            | Run structural and policy validation             |
| Preview configuration impact      | See affected paths/students without mutation     |
| Submit configuration for approval | Start maker-checker review                       |
| Approve configuration             | Approve another actor's submitted version        |
| Publish configuration             | Make an approved version active                  |
| Retire configuration              | Stop new decisions while preserving history      |
| Assign manual GR                  | Use governed manual identifier flow              |
| Correct identifier                | Create a replacement/alias lifecycle event       |
| Run Roll assignment               | Preview and execute a Roll batch                 |
| Lock individual Roll              | Protect an approved student Roll from reorder    |
| Change Division                   | Create an effective-dated roster move            |
| Override capacity                 | Request or approve an over-capacity exception    |
| Request activation                | Submit an eligible student for activation        |
| Approve activation                | Perform distinct activation approval             |
| Execute activation                | Run the governed Student creation/handoff        |
| Repair activation                 | Resolve a failed activation step safely          |
| Cancel activation                 | Request or approve governed reversal             |
| View/export audit                 | Investigate configuration and assignment history |

Server authorization and tenant/object-scope checks are required even when the UI hides an action.

## Audit and operational fields

Every configuration publish, preview, assignment, override, correction, activation, repair, and cancellation must record:

| Audit field               | Meaning                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `tenantId`                | Tenant boundary                                                |
| `schoolId` / `campusId`   | Operating scope                                                |
| `academicYearId`          | Academic cycle                                                 |
| `operationId`             | Stable business operation reference                            |
| `idempotencyKey`          | Retry protection                                               |
| `correlationId`           | Trace across services and logs                                 |
| `policyVersionIds`        | Exact rules used                                               |
| `inputSnapshotHash`       | Detect and explain stale inputs                                |
| `previewFingerprint`      | Bind commit to reviewed impact                                 |
| `actorUserId`             | User or service that acted                                     |
| `approverUserId`          | Distinct approver when required                                |
| `reasonCode` and `reason` | Structured and human explanation                               |
| `evidenceReferences`      | Documents or records supporting the action                     |
| `before` and `after`      | Relevant changed values                                        |
| `occurredAt`              | Server timestamp in DateTimeOffset-compatible ISO 8601 form    |
| `source`                  | UI, API integration, import, scheduled job, or repair          |
| `status`                  | Requested, approved, committed, failed, repaired, or cancelled |
| `failureCode`             | Safe actionable failure classification                         |

## School configuration templates

Templates are editable starting points, not regulatory truth.

### Template A: small single-board school

| Area       | Starting configuration                                                                  |
| ---------- | --------------------------------------------------------------------------------------- |
| Coverage   | One School, one Year, selected Board, selected Medium, all configured Levels/Classes    |
| GR         | One continuous school-wide series; automatic during activation; manual by approval      |
| Roll       | Class+Division, starting at 1, name then GR, preserve existing, next available mid-year |
| Division   | Manual or both, capacity required, over-capacity blocked                                |
| Readiness  | Fresh/Transfer profiles with only applicable checks                                     |
| Activation | Approval required, GR assigned, accounts created, cancellation window configured        |

### Template B: GSEB school with Gujarati and English Medium

| Area       | Starting configuration                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Coverage   | GSEB with separate Gujarati and English Medium paths and explicit Primary/Secondary levels                             |
| GR         | School-wide series if the register is shared; separate series only when the school's verified register policy requires |
| Roll       | Per Class+Division with locale-aware collation for the selected Medium                                                 |
| Division   | Capacity-balanced rules may differ by Medium/Level                                                                     |
| Readiness  | Shared base profile plus verified Medium/Level document or communication exceptions                                    |
| Activation | Fully qualified placement is mandatory before execution                                                                |

### Template C: mixed GSEB and CBSE school

| Area       | Starting configuration                                                                     |
| ---------- | ------------------------------------------------------------------------------------------ |
| Coverage   | Separate Board branches; Media and Levels selected under each branch                       |
| GR         | Explicit decision whether one School register or Board-specific registers own the sequence |
| Roll       | Board/Medium/Level-specific exceptions only where operations differ                        |
| Division   | Capacity comes from each qualified Division                                                |
| Readiness  | Verified Board policy packs plus a shared school baseline                                  |
| Activation | Applied-rule explanation shows the exact Board pack and School override                    |

### Template D: large multi-campus school group

| Area       | Starting configuration                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Coverage   | Group template inherited by selected campuses with reviewed exceptions                              |
| GR         | Central or campus sequence decision is explicit; allocator supports concurrency and recovery        |
| Roll       | Async preview/commit jobs with stable ordering, reconciliation, and downloadable errors             |
| Division   | Capacity reservations, concurrent change protection, waitlist, and downstream repair                |
| Readiness  | Capability-based work queues, SLAs, bulk evidence handling, and exception aging                     |
| Activation | Idempotent bulk activation, throttled handoffs, job dashboard, repair queue, and operational alerts |

## Validation and error messages

| Condition                                  | Required behavior and message                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Board selected but no Medium exists        | Block publish: `Configure at least one Medium under the selected Board.`             |
| Medium selected but no School Level exists | Block publish: `Configure a School Level before selecting Classes.`                  |
| Duplicate Class labels across paths        | Show fully qualified paths; never merge by label                                     |
| All Boards with selected Classes           | Show the hierarchical selector and full coverage summary                             |
| Equal-specificity overlapping rules        | Block publish and identify both conflicting versions                                 |
| GR pattern produces duplicate values       | Block validation and show sample collisions                                          |
| GR maximum is below the next sequence      | Block publish and require a new series/exhaustion decision                           |
| Manual GR duplicates history               | Block regardless of client-side override                                             |
| Roll ordering has no stable tie-breaker    | Block validation                                                                     |
| Roll source data is missing                | Apply configured null rule or block; never silently reorder                          |
| Division capacity missing when required    | Block automatic assignment                                                           |
| Division capacity changed after preview    | Reject stale commit and require refreshed preview                                    |
| Readiness source unavailable               | Mark Unknown/Unavailable; do not interpret as Passed                                 |
| Required blocking check fails              | Disable request/execute and link to the owning work item                             |
| Existing Student match found               | Block new Student creation and open review/link/resume flow                          |
| Activation partially fails                 | Mark Repair Required and identify the failed step                                    |
| Permission missing                         | Hide/disable action in UI and return server authorization failure if called directly |
| Published rule edited                      | Create a new Draft version; do not mutate the published record                       |

## Edge-case catalogue

The release test plan must include:

- same Class name under GSEB Gujarati, GSEB English, and CBSE English;
- Primary and Secondary sections in one school;
- Class renamed after a rule is published;
- new Medium or Level added after an All Boards snapshot is published;
- two GR rules overlapping on Board, Medium, Level, date, and profile;
- academic-year reset creating a historical GR collision;
- two staff members allocating the last GR sequence concurrently;
- returning student with the original GR;
- transfer student with an external GR matching a local GR;
- imported legacy GR with leading zeroes and mixed scripts;
- Gujarati name sorting and two identical display names;
- Roll recalculation while a student changes Division;
- mid-year admission when the Division is full;
- capacity change after preview but before commit;
- backdated Division move after attendance is recorded;
- applicant already linked to an active Student;
- guardian has no verified delivery channel;
- Finance/readiness service timeout;
- approval rejected after the underlying record changes;
- bulk job retried after network timeout;
- activation succeeds in Student Records but one optional handoff fails;
- cancellation after attendance, fees, exams, or accounts have downstream activity;
- cross-tenant guessed identifiers and direct API calls;
- 100 concurrent operators during term-start onboarding.

## Proposed backend domain capabilities

These are capability names, not claims about shipped endpoint URLs.

| Capability/entity    | Backend responsibility                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Policy Set           | Group related GR, Roll, Division, Readiness, and Activation policies                     |
| Policy Version       | Immutable status, effective dates, source pack, approval, and audit                      |
| Coverage Path        | Stable School/Year/Board/Medium/Level/Class/Division identifiers                         |
| Rule Resolver        | Deterministic winning rule plus explanation                                              |
| Identifier Series    | Format, scope, uniqueness, counter, reservation, correction, and exhaustion              |
| Roll Assignment Run  | Version-bound preview, deterministic order, batch commit, reconciliation, and events     |
| Division Membership  | Effective-dated roster membership, capacity concurrency, approval, and downstream events |
| Readiness Evaluation | Authoritative check outcomes, snapshots, evidence, exceptions, and aging                 |
| Activation Operation | Preview, request, approval, execute, repair, cancel, idempotency, and status             |
| Audit Query          | Filterable/exportable history within authorized tenant and school scope                  |

## External standards and official product implications

| Source                                                                                                                                        | Product implication                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [CBSE admission rules](https://www.cbse.gov.in/examin~1/admissionmt.htm)                                                                      | Model a persistent admission-register number, successive numbering, and returning-student reuse where the rule applies.             |
| [CBSE affiliation bye-laws](https://www.cbse.gov.in/cbsenew/aff-bye-laws.html)                                                                | Preserve admission/withdrawal and attendance records with traceable history.                                                        |
| [CBSE infrastructure guidance](https://www.cbse.gov.in/cbsenew/infra.html)                                                                    | Capacity guidance belongs in a verified, effective-dated policy pack; do not impose one universal Division maximum on every school. |
| [Gujarat Samagra Shiksha](https://samagrashiksha.ssagujarat.org/en/About-Samagra-Shiksha)                                                     | School Level must cover the education continuum and cannot be inferred from Board alone.                                            |
| [GSEB official website](https://website.gseb.org/)                                                                                            | Keep GSEB policies source-linked and verified; no universal GR pattern should be guessed from the Board name.                       |
| [UDISE+ report](https://www.education.gov.in/sites/upload_files/mhrd/files/statistics-new/UDISE%2BReport%202024-25%20-%20NEP%20Structure.pdf) | Treat national/student education identifiers as separate governed identifiers rather than reusing GR or Roll.                       |
| [APAAR FAQs](https://apaar.education.gov.in/faqs)                                                                                             | Support PEN/demographic verification and consent/correction evidence without making APAAR the school's GR.                          |
| [Ed-Fi Enrollment domain](https://docs.ed-fi.org/reference/data-exchange/data-standard/4/model-reference/enrollment-domain/overview/)         | Separate stable Student identity from school-year enrollment and placement membership.                                              |
| [OneRoster 1.2](https://standards.1edtech.org/oneroster/specifications/standards/v1p2)                                                        | Keep organizations, academic sessions, Classes, users, and enrollments as explicit integration concepts.                            |
| [PowerSchool import/export](https://ps.powerschool-docs.com/pssis-admin/latest/import-and-export)                                             | Migration needs stable identifiers, preserved enrollment history, validation, and reconciliation.                                   |
| [Infinite Campus Enrollment Roll Forward](https://kb.infinitecampus.com/help/enrollment-roll-forward)                                         | Academic-year rollover needs a test run, result summary, repeat-safe behavior, and concurrent-run protection.                       |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                                                 | Configuration drawers, trees, errors, previews, and approvals must be keyboard and screen-reader usable.                            |
| [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)                                                   | Enforce tenant/object authorization, resource limits, safe workflow access, and inventory/version control on the server.            |

Government and Board requirements change.
The legal/compliance owner must verify the exact circular, applicability, effective date, and school type before a policy pack is marked Verified.

## Delivery roadmap

### P0: integrity and publish foundation

- Persist versioned configurations.
- Implement the full academic coverage hierarchy.
- Implement deterministic conflict detection and rule explanation.
- Implement backend GR uniqueness, allocation, reservation, correction, and audit.
- Implement version-bound preview/commit with idempotency and stale-preview rejection.
- Implement authoritative Division capacity and effective-dated membership.
- Connect Readiness profiles to authoritative module results.
- Connect published policy versions to the existing Activation workflow.
- Enforce server tenant/object authorization and capability permissions.

### P1: school usability

- Add guided templates for small, GSEB multi-medium, mixed-board, and large schools.
- Add the hierarchical All Boards selector and coverage summary.
- Add clone from prior year, compare versions, approval, publish, and rollback-as-new-version.
- Add applied-rule explanation and student-level exception workflow.
- Add import dry run, row correction, replay, and reconciliation.

### P2: scale and operations

- Add async bulk jobs, progress, downloadable errors, safe retry, and cancellation.
- Add dashboards for counter exhaustion, readiness aging, capacity, conflicts, repair, and failed handoffs.
- Add load/concurrency tests for term-start volumes and multiple simultaneous operators.
- Add tenant-negative security tests and audit export controls.

### P3: ecosystem and optimization

- Add standards-aligned roster/export mappings.
- Add governed policy-pack distribution and update impact review.
- Add explainable placement recommendations without making automated decisions opaque.
- Add measured setup-time and completion analytics for school administrators.

## Manager decisions required

| Decision                                                                   | Why it must be explicit                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Is the tenant a School, School Group, or Trust?                            | Determines inheritance and isolation boundaries.                    |
| Is Campus separate from School?                                            | Determines identifier scope, capacity, permissions, and reporting.  |
| Can a GR sequence be shared across Boards/Media/Levels?                    | Determines counter and uniqueness design.                           |
| Is GR permanent for returning students in every school or policy-specific? | Determines matching and reactivation behavior.                      |
| What does “All Boards” do with future paths?                               | Snapshot is safer; auto-include is more convenient but higher risk. |
| Which Division capacity value is authoritative?                            | Prevents UI estimates from becoming unsafe placement decisions.     |
| Which readiness checks are platform invariants?                            | Schools must not disable integrity, security, or legal gates.       |
| Which changes require maker-checker approval?                              | Affects staffing, permissions, and turnaround time.                 |
| What is the allowed activation cancellation/repair model?                  | Determines downstream compensation and historical integrity.        |
| Which services are mandatory before First Day Ready?                       | Defines success versus optional handoff failure.                    |
| What scale and concurrency target represents the largest customer?         | Drives paging, jobs, load tests, and operational design.            |

## Release acceptance criteria

The configuration feature is production-ready only when all of the following are demonstrated:

1. A school can model Board, Medium, School Level, Class, and Division independently.
2. GSEB Gujarati Primary and GSEB English Secondary can receive different rules without duplicate or ambiguous Class options.
3. All Boards provides a reviewed coverage snapshot and an explicit future-structure choice.
4. One and only one published rule resolves for every tested student/path/date/profile combination.
5. Conflicting equal-specificity rules cannot be published.
6. Published versions are immutable, auditable, approval-aware, and recoverable through a new version.
7. GR allocation is atomic, unique within its configured scope, history-aware, and safe under concurrency.
8. Returning, transfer, migration, manual-entry, and correction GR flows preserve history.
9. Roll assignment is deterministic across scripts/locales and produces a complete before/after preview.
10. Division assignment enforces authoritative capacity and rejects stale concurrent commits.
11. Readiness evaluates authoritative Registration, Documents, Assessment, Finance, Placement, Identifier, Account, and Policy sources as configured.
12. Activation preview, request, approval, execute, repair, and cancellation use the published policy version.
13. Student creation, placement, identifier, account, and required handoffs are atomic or recoverable through an explicit saga.
14. Every mutation is authorized on the server, tenant-isolated, idempotent, and auditable.
15. Bulk import and academic-year rollover support dry run, repeat-safe execution, reconciliation, and row-level errors.
16. The hierarchical selector, validation, preview, and approval flows pass keyboard, screen-reader, mobile, tablet, and desktop testing.
17. Load and concurrency evidence meets the manager-approved largest-school target.
18. Support staff have dashboards, alerts, correlation IDs, repair actions, and runbooks for failed operations.

## Current source boundary

Use these paths when comparing this target specification with the present implementation:

| Area                                    | Current source                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| Onboarding settings model               | `src/screens/student/onboarding/onboarding-settings-model.ts`                       |
| Frontend session state                  | `src/screens/student/onboarding/onboarding-settings-context.tsx`                    |
| GR, Roll, and Division settings UI      | `src/screens/student/onboarding/setting/onboarding-number-settings.tsx`             |
| Readiness settings UI                   | `src/screens/student/onboarding/setting/onboarding-policy-settings.tsx`             |
| Student Setup worklist                  | `src/screens/student/onboarding/student-setup/index.tsx`                            |
| Existing connected activation contracts | `src/redux/student/admissions-crm/final-admission-contracts.ts`                     |
| Existing connected activation UI        | `src/screens/student/enrollment/admissions-crm/applicant-activation-operations.tsx` |
| Existing activation settings            | `src/screens/student/enrollment/setting/activation-settings-configuration.tsx`      |
| Existing academic hierarchy precedent   | `src/screens/calendar/GroupManagement/Components/TransformApiToTree.ts`             |
| Existing qualified path labels          | `src/screens/calendar/GroupManagement/Components/ConditionBaseSettings.tsx`         |

The present Onboarding configuration must continue to be described as a frontend preview until persistence, backend enforcement, assignment/activation integration, concurrency, tenant isolation, and audit are verified end to end.
