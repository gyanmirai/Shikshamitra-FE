# Student Onboarding backend API contract

| Field                                          | Value                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Status                                         | Proposed implementation contract for backend handoff                         |
| Version                                        | 1.0                                                                          |
| Prepared                                       | 2026-08-29                                                                   |
| Frontend module                                | Student Onboarding                                                           |
| Canonical backend destination after acceptance | `Shikshamitra-BE/docs/modules/student/references/onboarding-api-contract.md` |

## 1. Contract status and evidence

This document is implementation-ready but is not evidence that these APIs already exist.
The backend repository is not available in the current workspace, so the backend team must promote the accepted contract into backend-owned Student documentation before implementation.

The proposal is aligned with verified frontend conventions:

- Shared RTK Query base URL adds `/api` before feature paths.
- Academic clients use resource queries, explicit command endpoints, settings endpoints, preview endpoints, and RTK Query cache tags.
- Existing Student Enrollment clients use `items` plus `totalCount`, `skipCount`, `maxResultCount`, numeric enums, `concurrencyStamp`, preview fingerprints, approval commands, and explicit activation commands.
- Date-time values use `DateTimeOffset`-compatible ISO 8601 strings.
- Backend permissions, tenant isolation, domain invariants, uniqueness, and transactions remain backend-owned.

Reference implementations inspected:

| Convention                                                                               | Frontend source                                                                              |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Shared `/api` base query and authenticated JSON requests                                 | `src/redux/service.ts`                                                                       |
| Academic settings, resource CRUD, explicit publish/archive commands, and audit tags      | `src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api.ts`                         |
| Academic preview, validate, submit, approve, reject, publish, lock, and archive commands | `src/redux/academicAPI/ExaminationApi/QuestionPaperApi/question-paper-api.ts`                |
| Typed paged results and metadata DTOs                                                    | `src/redux/academicAPI/timetableApi/substitutionManagementApi.ts`                            |
| Student configuration previews, fingerprints, versions, and concurrency stamps           | `src/redux/student/admissions-crm/setup-playbooks-api.ts`                                    |
| Existing placement, identifier governance, approval, and activation commands             | `src/redux/student/admissions-crm/final-admission-api.ts` and `final-admission-contracts.ts` |

## 2. Mandatory ownership boundary

The backend must not create a second competing Student, Enrollment Activation, Identifier, Division, Document, Guardian, or User Account source of truth.

| Data or command                                      | Owning authority                            | Student Onboarding responsibility                                                             |
| ---------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Applicant and admission decision                     | Student Enrollment                          | Read admission handoff data only                                                              |
| Existing activation aggregate                        | Student Enrollment Activation               | Project it into the Onboarding worklist and invoke existing command handlers where applicable |
| Student master record                                | Student Records                             | Read and update only through Student domain services                                          |
| Academic year, board, medium, standard, and division | Institute Setup or Class Management         | Validate IDs and return scoped lookup metadata                                                |
| Division capacity                                    | Class Management                            | Validate capacity inside the assignment transaction                                           |
| GR identifier allocation                             | Existing identifier or activation allocator | Reserve and commit numbers through one concurrency-safe allocator                             |
| Roll number                                          | Student Records academic enrollment         | Enforce uniqueness per academic year, standard, and division                                  |
| Admission documents                                  | Enrollment Documents                        | Project document readiness; do not duplicate document rows                                    |
| Student and guardian identity                        | Identity and Family domains                 | Project account state and request provisioning through domain services                        |
| Onboarding settings                                  | Student Onboarding                          | Own versioned settings scoped to the academic context                                         |
| Onboarding stage and readiness projection            | Student Onboarding                          | Own the operational projection and recalculate it from authoritative facts                    |
| Approval and audit                                   | Student Onboarding                          | Own onboarding approval records and append-only onboarding audit events                       |

### Activation compatibility rule

If Student Enrollment Activation already owns creation of the Student master and identifier commitment, Student Onboarding must call or compose the existing activation application service.
It must not insert another Student or allocate the same identifier independently.

For legacy students without an Enrollment Activation record, the backend may create a compatibility Onboarding case referencing the existing `studentId`.
Compatibility creation must be idempotent and must never create a duplicate Student.

## 3. API conventions

### 3.1 Base path

All paths below are relative to:

```text
/api/student-onboarding
```

Example:

```text
GET /api/student-onboarding/worklist
```

### 3.2 Serialization

- JSON property naming: camelCase.
- Identifier type: GUID serialized as a string.
- Date-only value: `YYYY-MM-DD`.
- Date-time value: ISO 8601 with UTC marker or explicit offset.
- Enums: numeric values on the wire, matching the enum tables in this document.
- User-facing labels are returned separately from enum values where required.
- Null means unavailable or not applicable; an empty string must not represent a missing identifier.

### 3.3 Paging

List endpoints use:

```json
{
  "skipCount": 0,
  "maxResultCount": 25,
  "sorting": "studentName asc"
}
```

Paged responses use:

```json
{
  "totalCount": 125,
  "items": []
}
```

Default `maxResultCount` is 25.
Maximum synchronous page size is 100.

### 3.4 Concurrency

- Every mutable configuration, Onboarding case, approval request, and assignment-affecting student projection returns `concurrencyStamp`.
- Every update or state-changing command must send the latest `concurrencyStamp` or a preview fingerprint that was created from it.
- A stale value returns HTTP `409` and error code `STUDENT_ONBOARDING:CONCURRENCY_CONFLICT`.
- The server response must include enough information for the client to refetch; it must not silently overwrite a newer change.

### 3.5 Idempotency

These endpoints require an `Idempotency-Key` header:

- All assignment commit endpoints.
- Request approval.
- Approval decision endpoints.
- Activation commit.
- Readiness recalculation when requested as a bulk command.

The server must retain the idempotency result for at least 24 hours per tenant and user.
Repeating the same key with the same payload returns the original result.
Repeating the same key with a different payload returns HTTP `409` and `STUDENT_ONBOARDING:IDEMPOTENCY_KEY_REUSED`.

### 3.6 Correlation and audit

- Accept optional `X-Correlation-Id`.
- Generate one when it is absent.
- Return `correlationId` in every command result.
- Persist it on every generated audit event.

### 3.7 Error envelope

Use the platform-standard remote service error envelope:

```json
{
  "error": {
    "code": "STUDENT_ONBOARDING:PREVIEW_STALE",
    "message": "The preview is no longer current. Refresh and preview the operation again.",
    "details": null,
    "data": {
      "studentId": "GUID",
      "currentConcurrencyStamp": "new-stamp"
    },
    "validationErrors": []
  }
}
```

Do not expose stack traces, SQL constraint names, internal account identifiers, protected guardian data, or authorization rules in the response.

## 4. Scope model

Onboarding configuration is scoped by:

```ts
export interface OnboardingScopeDto {
  academicYearId: string;
  educationBoardId: string;
  educationMediumId: string;
  campusId?: string | null;
}
```

All IDs must belong to the current tenant.
The board and medium must belong to the selected academic structure.
If campuses are not enabled, `campusId` is null.

## 5. Canonical enums

```ts
export enum OnboardingStage {
  ToPrepare = 0,
  AwaitingApproval = 1,
  ReadyToActivate = 2,
  ActionRequired = 3,
  Completed = 4,
}

export enum OnboardingCheckStatus {
  Passed = 0,
  Pending = 1,
  Failed = 2,
  NotRequired = 3,
  NotConnected = 4,
}

export enum OnboardingAccountStatus {
  Ready = 0,
  Pending = 1,
  NotRequired = 2,
  NotConnected = 3,
  Failed = 4,
}

export enum AssignmentModePolicy {
  AutomaticOnly = 0,
  ManualOnly = 1,
  AutomaticAndManual = 2,
}

export enum AssignmentMode {
  Automatic = 0,
  Manual = 1,
}

export enum RollArrangeBy {
  StudentName = 0,
  AdmissionDate = 1,
  AdmissionNumber = 2,
  GrNumber = 3,
}

export enum SortDirection {
  Ascending = 0,
  Descending = 1,
}

export enum DivisionAssignmentStrategy {
  BalanceCapacity = 0,
  Sequential = 1,
  PreserveExisting = 2,
}

export enum ApprovalRequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3,
  Superseded = 4,
}

export enum BulkItemStatus {
  Succeeded = 0,
  Failed = 1,
  Skipped = 2,
  PendingApproval = 3,
}
```

The server is authoritative for enum-to-label mapping.
Clients must not infer lifecycle state from display labels.

## 6. Permission contract

Follow the existing Academic permission pattern of a stable permission base plus action leaves.

| Permission                                     | Purpose                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `Students.Onboarding.Setup.View`               | View worklist, summary, and student drawer                             |
| `Students.Onboarding.Setup.AssignDivision`     | Preview and commit division changes                                    |
| `Students.Onboarding.Setup.AssignGrNumber`     | Preview and commit GR assignments                                      |
| `Students.Onboarding.Setup.AssignRollNumber`   | Preview and commit roll assignments                                    |
| `Students.Onboarding.Setup.RequestApproval`    | Request onboarding approval                                            |
| `Students.Onboarding.Setup.Approve`            | Approve or reject onboarding requests                                  |
| `Students.Onboarding.Setup.Activate`           | Preview and complete activation                                        |
| `Students.Onboarding.Setup.Override`           | Override an allowed readiness or capacity rule with a mandatory reason |
| `Students.Onboarding.Setup.ViewAudit`          | View full onboarding activity and audit detail                         |
| `Students.Onboarding.Setup.Export`             | Export the scoped worklist                                             |
| `Students.Onboarding.Settings.View`            | View Onboarding settings                                               |
| `Students.Onboarding.Settings.Edit`            | Edit readiness, access, and division rules                             |
| `Students.Onboarding.Settings.ManageNumbering` | Create, update, version, or archive GR and roll rules                  |

Backend authorization is mandatory on every endpoint.
Frontend visibility is defense in depth only.

During migration, the backend may grant these permissions to roles that already have:

- `Students.Enrollment.AdmissionsCrm.ViewActivation`
- `Students.Enrollment.AdmissionsCrm.ManageConfiguration`

The compatibility grant must be explicit and temporary; the new permissions remain canonical.

## 7. Settings DTOs

```ts
export interface ReadinessAccessSettingsDto {
  requireDocuments: boolean;
  requireIdentifiers: boolean;
  requireApproval: boolean;
  blockActivation: boolean;
  prepareStudentAccount: boolean;
  prepareGuardianAccount: boolean;
  requireVerifiedGuardianContact: boolean;
  credentialReleaseTiming: 0 | 1; // 0 AfterActivation, 1 ManualRelease
}

export interface GrNumberSeriesDto {
  id: string;
  scope: OnboardingScopeDto;
  code: string;
  name: string;
  prefix: string;
  startingNumber: number;
  nextNumber: number;
  padding: number;
  suffix: string;
  maximumNumber?: number | null;
  isDefault: boolean;
  isActive: boolean;
  allocatedCount: number;
  committedCount: number;
  previewValue: string;
  version: number;
  concurrencyStamp: string;
  creationTime: string;
  lastModificationTime?: string | null;
}

export interface RollNumberRuleDto {
  id: string;
  scope: OnboardingScopeDto;
  standardId?: string | null; // null means all standards in the scope
  standardName: string;
  arrangeBy: RollArrangeBy;
  sortDirection: SortDirection;
  startingNumber: number;
  preserveExisting: boolean;
  isActive: boolean;
  version: number;
  concurrencyStamp: string;
  creationTime: string;
  lastModificationTime?: string | null;
}

export interface DivisionChangeSettingsDto {
  assignmentMode: AssignmentModePolicy;
  requireReason: boolean;
  requireApproval: boolean;
  recalculateRollNumber: boolean;
  preventOverCapacity: boolean;
}

export interface NumberingAssignmentModesDto {
  grNumberAssignmentMode: AssignmentModePolicy;
  rollNumberAssignmentMode: AssignmentModePolicy;
}

export interface OnboardingSettingsDto {
  id?: string | null;
  scope: OnboardingScopeDto;
  isSystemDefault: boolean;
  version: number;
  readinessAccess: ReadinessAccessSettingsDto;
  divisionChange: DivisionChangeSettingsDto;
  numberingAssignmentModes: NumberingAssignmentModesDto;
  defaultGrNumberSeriesId?: string | null;
  concurrencyStamp?: string | null;
  creationTime: string;
  lastModificationTime?: string | null;
  lastModifiedByUserId?: string | null;
}

export interface CreateGrNumberSeriesDto {
  scope: OnboardingScopeDto;
  code: string;
  name: string;
  prefix: string;
  startingNumber: number;
  padding: number;
  suffix: string;
  maximumNumber?: number | null;
  isDefault: boolean;
}

export interface UpdateGrNumberSeriesDto {
  name: string;
  prefix: string;
  padding: number;
  suffix: string;
  maximumNumber?: number | null;
  isDefault: boolean;
  concurrencyStamp: string;
}

export interface CreateRollNumberRuleDto {
  scope: OnboardingScopeDto;
  standardId?: string | null;
  arrangeBy: RollArrangeBy;
  sortDirection: SortDirection;
  startingNumber: number;
  preserveExisting: boolean;
}

export interface UpdateRollNumberRuleDto {
  arrangeBy: RollArrangeBy;
  sortDirection: SortDirection;
  startingNumber: number;
  preserveExisting: boolean;
  concurrencyStamp: string;
}
```

### 7.1 Settings validation

- `padding`: 1 to 12.
- `startingNumber`: at least 1.
- `maximumNumber`: null or greater than/equal to `startingNumber`.
- Prefix plus suffix plus padded number: maximum 64 characters.
- Series `code`: required, normalized uppercase, unique in the Onboarding scope.
- An active scope can have only one default GR series.
- An active scope can have only one active roll rule per standard; a null-standard fallback rule is allowed.
- A series with committed identifiers cannot be deleted or renumbered in place.
- Changing the format of an allocated series creates a new version; historical values remain unchanged.
- `prepareStudentAccount=false` and `prepareGuardianAccount=false` makes the Accounts readiness check `NotRequired`.
- `requireApproval=false` does not auto-approve existing pending approval requests; they must be explicitly cancelled or completed.

## 8. Settings endpoints

### 8.1 Get resolved settings

```http
GET /settings?academicYearId={id}&educationBoardId={id}&educationMediumId={id}&campusId={id?}
Permission: Students.Onboarding.Settings.View or Students.Onboarding.Setup.View
```

Response: `OnboardingSettingsDto` with resolved defaults plus links to the default numbering rules.

If no tenant configuration exists, the backend must return a resolved default DTO with `isSystemDefault=true`; it must not return `404`.
For a system default, `id` and `concurrencyStamp` are null.
The first update creates the tenant-scoped settings record; later updates require its current `concurrencyStamp`.

### 8.2 Preview settings impact

```http
POST /settings/impact-preview
Permission: Students.Onboarding.Settings.Edit
```

Request:

```ts
export interface OnboardingSettingsImpactPreviewRequest {
  scope: OnboardingScopeDto;
  section: 'readinessAccess' | 'divisionChange';
  proposedValue: ReadinessAccessSettingsDto | DivisionChangeSettingsDto;
  concurrencyStamp?: string | null;
}
```

Response:

```ts
export interface OnboardingSettingsImpactPreviewDto {
  affectedOpenStudentCount: number;
  stageChangeCount: number;
  newlyBlockedCount: number;
  newlyEligibleCount: number;
  pendingApprovalCount: number;
  warnings: string[];
  impactFingerprint: string;
  expiresAt: string;
}

export interface OnboardingSettingsUpdateResultDto {
  settings: OnboardingSettingsDto;
  affectedOpenStudentCount: number;
  projectionRefreshPending: boolean;
  recalculationJobId?: string | null;
  correlationId: string;
}
```

Preview does not mutate data.

### 8.3 Update Readiness & Access

```http
PUT /settings/readiness-access
Permission: Students.Onboarding.Settings.Edit
```

Request:

```json
{
  "scope": {
    "academicYearId": "GUID",
    "educationBoardId": "GUID",
    "educationMediumId": "GUID",
    "campusId": null
  },
  "value": {
    "requireDocuments": true,
    "requireIdentifiers": true,
    "requireApproval": true,
    "blockActivation": true,
    "prepareStudentAccount": true,
    "prepareGuardianAccount": true,
    "requireVerifiedGuardianContact": true,
    "credentialReleaseTiming": 0
  },
  "concurrencyStamp": "settings-stamp",
  "expectedImpactFingerprint": "impact-fingerprint"
}
```

Response: `OnboardingSettingsUpdateResultDto`.

The transaction must update the settings version and start readiness recalculation for open cases.
The backend may finish a bounded recalculation synchronously; larger scopes return `projectionRefreshPending=true` and a job ID.
Completed cases retain their historical readiness snapshot.

### 8.4 Update Division Changes

```http
PUT /settings/division-change
Permission: Students.Onboarding.Settings.Edit
```

Uses the same envelope as Readiness & Access with `DivisionChangeSettingsDto` as `value`.
Response: `OnboardingSettingsUpdateResultDto`.

### 8.5 Get settings recalculation status

```http
GET /settings/recalculations/{jobId}
Permission: Students.Onboarding.Settings.View
```

Response:

```ts
export interface OnboardingRecalculationJobDto {
  id: string;
  settingsId: string;
  settingsVersion: number;
  status: 0 | 1 | 2 | 3; // Queued, Running, Completed, Failed
  affectedCount: number;
  processedCount: number;
  failedCount: number;
  failureMessage?: string | null;
  requestedAt: string;
  completedAt?: string | null;
  correlationId: string;
}
```

The worklist may temporarily contain rows projected with the previous settings version.
Each row therefore returns its `projectionSettingsVersion`, and the UI treats older rows as refreshing rather than final.

### 8.6 Update numbering assignment modes

```http
PUT /settings/numbering-assignment-modes
Permission: Students.Onboarding.Settings.ManageNumbering
```

Request:

```ts
export interface UpdateNumberingAssignmentModesRequest {
  scope: OnboardingScopeDto;
  value: NumberingAssignmentModesDto;
  concurrencyStamp?: string | null;
}
```

Response: updated `OnboardingSettingsDto`.
The modes affect future previews and do not rewrite committed identifiers.

### 8.7 List GR series

```http
GET /settings/gr-number-series
Permission: Students.Onboarding.Settings.View
```

Query:

```text
academicYearId, educationBoardId, educationMediumId, campusId?, filter?, isActive?, skipCount, maxResultCount, sorting
```

Response: paged `GrNumberSeriesDto`.

### 8.8 Create GR series

```http
POST /settings/gr-number-series
Permission: Students.Onboarding.Settings.ManageNumbering
```

Request: `CreateGrNumberSeriesDto`.
Response: created `GrNumberSeriesDto`.

### 8.9 Update GR series

```http
PUT /settings/gr-number-series/{seriesId}
Permission: Students.Onboarding.Settings.ManageNumbering
```

Request: `UpdateGrNumberSeriesDto`.
If committed identifiers exist and the format changes, return `409 STUDENT_ONBOARDING:SERIES_IMMUTABLE` and instruct the caller to create a new version.

### 8.10 Archive GR series

```http
POST /settings/gr-number-series/{seriesId}/archive
Permission: Students.Onboarding.Settings.ManageNumbering
```

Request:

```json
{
  "reason": "Replaced for the new academic year",
  "concurrencyStamp": "series-stamp"
}
```

Archiving is rejected when the series is the only active default used by open cases.

### 8.11 GR governance

```http
GET /settings/gr-number-series/{seriesId}/governance
Permission: Students.Onboarding.Settings.View
```

Return starting, next, maximum, allocated, committed, manual, voided, exhaustion, and bounded gap information.
Reuse the existing Enrollment identifier-governance projection where possible.

### 8.12 List Roll rules

```http
GET /settings/roll-number-rules
Permission: Students.Onboarding.Settings.View
```

Uses the same scope and paging conventions as GR series.
Response: paged `RollNumberRuleDto`.

### 8.13 Create Roll rule

```http
POST /settings/roll-number-rules
Permission: Students.Onboarding.Settings.ManageNumbering
```

Request: `CreateRollNumberRuleDto`.
Response: created `RollNumberRuleDto`.

### 8.14 Update Roll rule

```http
PUT /settings/roll-number-rules/{ruleId}
Permission: Students.Onboarding.Settings.ManageNumbering
```

Request: `UpdateRollNumberRuleDto`.
Changing a rule never silently rewrites existing roll numbers.

### 8.15 Archive Roll rule

```http
POST /settings/roll-number-rules/{ruleId}/archive
Permission: Students.Onboarding.Settings.ManageNumbering
```

Requires `reason` and `concurrencyStamp`.

## 9. Setup metadata endpoint

```http
GET /metadata?academicYearId={id}&educationBoardId={id}&educationMediumId={id}&campusId={id?}
Permission: Students.Onboarding.Setup.View
```

Response:

```ts
export interface OnboardingMetadataDto {
  scope: OnboardingScopeDto;
  settingsVersion: number;
  standards: Array<{ id: string; name: string }>;
  divisions: Array<{
    id: string;
    standardId: string;
    name: string;
    capacityConfigured: boolean;
    capacity?: number | null;
    activeStudentCount: number;
    pendingOnboardingCount: number;
    remainingCapacity?: number | null;
  }>;
  activeGrNumberSeries: Array<{
    id: string;
    name: string;
    previewValue: string;
    isDefault: boolean;
  }>;
  activeRollNumberRules: Array<{ id: string; standardId?: string | null; standardName: string }>;
  capabilities: {
    canAssignDivision: boolean;
    canAssignGrNumber: boolean;
    canAssignRollNumber: boolean;
    canRequestApproval: boolean;
    canApprove: boolean;
    canActivate: boolean;
    canOverride: boolean;
    canExport: boolean;
  };
}
```

The frontend must use these division IDs instead of hardcoded `A`, `B`, and `C` values.

## 10. Worklist contract

### 10.1 Get worklist

```http
GET /worklist
Permission: Students.Onboarding.Setup.View
```

Query:

```ts
export interface GetOnboardingWorklistRequest extends OnboardingScopeDto {
  standardIds?: string[];
  divisionIds?: string[];
  stages?: OnboardingStage[];
  admissionRoutes?: string[];
  ownerUserIds?: string[];
  readinessFrom?: number;
  readinessTo?: number;
  accountStatuses?: OnboardingAccountStatus[];
  filter?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}
```

Allowed sorting fields:

- `studentName`
- `applicationNumber`
- `admissionDate`
- `standardName`
- `divisionName`
- `readinessPercent`
- `ownerName`
- `stage`
- `lastUpdatedAt`

Unknown sorting fields return HTTP `400`.

Response:

```ts
export interface OnboardingWorklistDto {
  totalCount: number;
  items: OnboardingWorklistItemDto[];
  summary: {
    all: number;
    toPrepare: number;
    awaitingApproval: number;
    readyToActivate: number;
    actionRequired: number;
    completed: number;
  };
  appliedSettingsId?: string | null;
  appliedSettingsVersion: number;
  projectionRefreshPending: boolean;
  recalculationJobId?: string | null;
  generatedAt: string;
}

export interface OnboardingWorklistItemDto {
  onboardingCaseId: string;
  studentId: string;
  activationId?: string | null;
  leadId?: string | null;
  studentName: string;
  applicationNumber?: string | null;
  admissionReference?: string | null;
  admissionRoute: string;
  admissionDate?: string | null;
  standardId: string;
  standardName: string;
  divisionId?: string | null;
  divisionName?: string | null;
  grNumber?: string | null;
  rollNumber?: number | null;
  studentAccountStatus: OnboardingAccountStatus;
  guardianAccountStatus: OnboardingAccountStatus;
  ownerUserId?: string | null;
  ownerName?: string | null;
  stage: OnboardingStage;
  readiness: ReadinessSummaryDto;
  capabilities: OnboardingStudentCapabilitiesDto;
  projectionSettingsVersion: number;
  concurrencyStamp: string;
  lastUpdatedAt: string;
}

export interface ReadinessSummaryDto {
  passedCount: number;
  requiredCount: number;
  blockingCount: number;
  readinessPercent: number;
  isReadyForApproval: boolean;
  isReadyForActivation: boolean;
}

export interface OnboardingStudentCapabilitiesDto {
  canAssignDivision: boolean;
  canAssignGrNumber: boolean;
  canAssignRollNumber: boolean;
  canRequestApproval: boolean;
  canApprove: boolean;
  canReject: boolean;
  canActivate: boolean;
  canOverride: boolean;
  disabledReasonCode?: string | null;
  disabledReason?: string | null;
}
```

The backend calculates the summary using all filters except the selected stage, so KPI counts remain meaningful while viewing one stage.

### 10.2 Worklist projection rules

- The backend, not the frontend, owns stage calculation.
- `NotConnected` is reserved for a temporarily unavailable owning integration; absence of data is normally `Pending` or `Failed`.
- A check configured as optional is `NotRequired` and is excluded from `requiredCount`.
- `readinessPercent = passed required checks / total required checks * 100`, rounded to the nearest integer.
- A blocking required check in `Pending`, `Failed`, or `NotConnected` increments `blockingCount`.
- A completed case remains Completed unless an authorized correction workflow explicitly reopens it.
- Search, filtering, sorting, and paging are server-side.

## 11. Student drawer contract

### 11.1 Get student Onboarding detail

```http
GET /students/{studentId}?academicYearId={id}
Permission: Students.Onboarding.Setup.View
```

Response:

```ts
export interface StudentOnboardingDetailDto extends OnboardingWorklistItemDto {
  scope: OnboardingScopeDto;
  admissionHandoff: {
    applicationNumber?: string | null;
    admissionReference?: string | null;
    admissionRoute: string;
    admissionDate?: string | null;
    enrollmentOwnerUserId?: string | null;
    enrollmentOwnerName?: string | null;
  };
  placement: {
    educationBoardId: string;
    boardName: string;
    educationMediumId: string;
    mediumName: string;
    standardId: string;
    standardName: string;
    divisionId?: string | null;
    divisionName?: string | null;
    capacityConfigured: boolean;
    remainingCapacity?: number | null;
  };
  identifiers: Array<{
    id?: string | null;
    type: 0 | 1; // 0 GR, 1 Roll
    value?: string | null;
    status: 0 | 1 | 2; // Pending, Reserved, Committed
    source: string;
    assignedAt?: string | null;
  }>;
  documents: {
    passedCount: number;
    requiredCount: number;
    missingDocumentCodes: string[];
    correctionRequiredCount: number;
    sourceAvailable: boolean;
  };
  accounts: {
    studentAccountStatus: OnboardingAccountStatus;
    guardianAccountStatus: OnboardingAccountStatus;
    verifiedGuardianContactRequired: boolean;
    guardianContactVerified: boolean;
    credentialReleaseTiming: 0 | 1;
    credentialsReleasedAt?: string | null;
  };
  readinessItems: ReadinessItemDto[];
  recentActivity: OnboardingActivityDto[];
  pendingApproval?: OnboardingApprovalRequestDto | null;
}

export interface ReadinessItemDto {
  key: string;
  label: string;
  status: OnboardingCheckStatus;
  blocking: boolean;
  detail: string;
  ownerModule: string;
  actionCode?: string | null;
  actionRoute?: string | null;
  evaluatedAt: string;
}
```

Sensitive guardian values are not returned to users without the owning sensitive-data permission.

### 11.2 Get activity

```http
GET /students/{studentId}/activity?academicYearId={id}&skipCount=0&maxResultCount=50
Permission: Students.Onboarding.Setup.ViewAudit
```

Response: paged `OnboardingActivityDto`.

```ts
export interface OnboardingActivityDto {
  id: string;
  onboardingCaseId: string;
  actionCode: string;
  title: string;
  detail: string;
  actorUserId?: string | null;
  actorName: string;
  correlationId: string;
  reason?: string | null;
  occurredAt: string;
}
```

### 11.3 Recalculate readiness

```http
POST /students/{studentId}/readiness/recalculate
Permission: Students.Onboarding.Setup.View
Idempotency-Key: required
```

Request:

```json
{
  "academicYearId": "GUID",
  "concurrencyStamp": "case-stamp"
}
```

Response: refreshed `StudentOnboardingDetailDto` plus `correlationId`.

## 12. Shared preview and command results

```ts
export interface OperationIssueDto {
  code: string;
  message: string;
  field?: string | null;
  blocking: boolean;
}

export interface AssignmentPreviewItemDto {
  studentId: string;
  studentName: string;
  currentValue?: string | null;
  proposedValue?: string | null;
  currentDivisionId?: string | null;
  proposedDivisionId?: string | null;
  canCommit: boolean;
  warnings: OperationIssueDto[];
  errors: OperationIssueDto[];
  concurrencyStamp: string;
}

export interface AssignmentPreviewDto {
  operationType: 'division' | 'grNumber' | 'rollNumber';
  mode: AssignmentMode;
  items: AssignmentPreviewItemDto[];
  canCommit: boolean;
  allOrNothing: boolean;
  settingsVersion: number;
  previewFingerprint: string;
  expiresAt: string;
  warnings: OperationIssueDto[];
}

export interface BulkCommandResultDto {
  operationId: string;
  totalCount: number;
  succeededCount: number;
  failedCount: number;
  skippedCount: number;
  pendingApprovalCount: number;
  items: Array<{
    studentId: string;
    status: BulkItemStatus;
    onboardingCaseId?: string | null;
    approvalRequestId?: string | null;
    value?: string | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    concurrencyStamp?: string | null;
  }>;
  correlationId: string;
  completedAt: string;
}
```

Preview fingerprints expire after 10 minutes.
A commit must validate the fingerprint, settings version, current student stamps, capacity, and identifier uniqueness again inside the transaction.

## 13. Division assignment APIs

### 13.1 Preview Division assignment

```http
POST /assignments/division/preview
Permission: Students.Onboarding.Setup.AssignDivision
```

Request:

```ts
export interface DivisionAssignmentPreviewRequest {
  scope: OnboardingScopeDto;
  mode: AssignmentMode;
  strategy?: DivisionAssignmentStrategy | null;
  items: Array<{
    studentId: string;
    targetDivisionId?: string | null; // required for Manual
    concurrencyStamp: string;
  }>;
  reason?: string | null;
  allowCapacityOverride: boolean;
  capacityOverrideReason?: string | null;
  allOrNothing: boolean;
}
```

Response: `AssignmentPreviewDto`.

Rules:

- Automatic mode uses live capacity and valid divisions for each student's standard.
- PreserveExisting proposes the current division.
- Sequential assigns in configured division display order.
- BalanceCapacity uses remaining capacity, then current strength, then stable division ID as tie-breakers.
- Manual values must be valid division IDs for the student's standard.
- Capacity override requires `Students.Onboarding.Setup.Override` and a reason of at least 10 characters.
- The server reports whether a roll number will be recalculated.

### 13.2 Commit Division assignment

```http
POST /assignments/division/commit
Permission: Students.Onboarding.Setup.AssignDivision
Idempotency-Key: required
```

Request:

```json
{
  "previewFingerprint": "fingerprint",
  "reason": "Balancing Grade 6 divisions",
  "allOrNothing": true
}
```

Response: `BulkCommandResultDto`.

The transaction must update placement through Student Records, optionally recalculate roll numbers through the roll allocator, recalculate readiness, update the Onboarding stage, and append audit events.

## 14. GR assignment APIs

### 14.1 Preview GR assignment

```http
POST /assignments/gr-number/preview
Permission: Students.Onboarding.Setup.AssignGrNumber
```

Request:

```ts
export interface GrNumberAssignmentPreviewRequest {
  scope: OnboardingScopeDto;
  mode: AssignmentMode;
  grNumberSeriesId?: string | null; // required for Automatic
  items: Array<{
    studentId: string;
    manualValue?: string | null; // required for Manual
    concurrencyStamp: string;
  }>;
  reason?: string | null;
  allOrNothing: boolean;
}
```

Response: `AssignmentPreviewDto`.

Rules:

- Automatic values are reserved by the authoritative identifier allocator.
- Preview reservations expire with the preview and do not consume committed sequence numbers permanently.
- Manual values require a reason of at least 5 characters.
- Normalized GR values are unique across the tenant, not only within an academic year.
- Existing committed GR values are preserved unless a separately authorized correction workflow is used.
- Duplicate values return a per-item `STUDENT_ONBOARDING:GR_NUMBER_DUPLICATE` error.

### 14.2 Commit GR assignment

```http
POST /assignments/gr-number/commit
Permission: Students.Onboarding.Setup.AssignGrNumber
Idempotency-Key: required
```

Request uses `previewFingerprint`, `reason`, and `allOrNothing`.
Response: `BulkCommandResultDto`.

The commit must use one concurrency-safe allocator transaction and the existing identifier governance store.

## 15. Roll assignment APIs

### 15.1 Preview Roll assignment

```http
POST /assignments/roll-number/preview
Permission: Students.Onboarding.Setup.AssignRollNumber
```

Request:

```ts
export interface RollNumberAssignmentPreviewRequest {
  scope: OnboardingScopeDto;
  mode: AssignmentMode;
  rollNumberRuleId?: string | null;
  items: Array<{
    studentId: string;
    manualValue?: number | null;
    concurrencyStamp: string;
  }>;
  reason?: string | null;
  allOrNothing: boolean;
}
```

Response: `AssignmentPreviewDto`.

Rules:

- Roll uniqueness scope is tenant plus academic year plus standard plus division.
- Automatic mode groups students by standard and division.
- A standard-specific active rule wins; otherwise the active all-standard fallback is used.
- Ordering must be stable. If primary values are equal, use student ID ascending as the final tie-breaker.
- `preserveExisting=true` keeps committed values and allocates after the highest occupied number or configured start, whichever is greater.
- `preserveExisting=false` previews recalculation but does not commit until the user confirms.
- Manual roll values must be positive integers.

### 15.2 Commit Roll assignment

```http
POST /assignments/roll-number/commit
Permission: Students.Onboarding.Setup.AssignRollNumber
Idempotency-Key: required
```

Request uses `previewFingerprint`, `reason`, and `allOrNothing`.
Response: `BulkCommandResultDto`.

## 16. Approval APIs

```ts
export interface OnboardingApprovalRequestDto {
  id: string;
  onboardingCaseId: string;
  studentId: string;
  status: ApprovalRequestStatus;
  requestedByUserId: string;
  requestedByName: string;
  requestedAt: string;
  requestReason?: string | null;
  decidedByUserId?: string | null;
  decidedByName?: string | null;
  decidedAt?: string | null;
  decisionReason?: string | null;
  readinessSnapshot: ReadinessItemDto[];
  settingsVersion: number;
  concurrencyStamp: string;
}
```

### 16.1 Request approval

```http
POST /approval-requests
Permission: Students.Onboarding.Setup.RequestApproval
Idempotency-Key: required
```

Request:

```json
{
  "academicYearId": "GUID",
  "items": [
    {
      "studentId": "GUID",
      "concurrencyStamp": "case-stamp"
    }
  ],
  "reason": "Readiness review completed",
  "allOrNothing": true
}
```

Response: `BulkCommandResultDto` with generated approval request IDs.

Rules:

- Reject when approval is disabled in the applied settings.
- Reject students with blocking readiness errors.
- Do not create more than one pending approval request per Onboarding case.
- Store an immutable readiness and settings snapshot with the request.

### 16.2 List approval requests

```http
GET /approval-requests?academicYearId={id}&status={value?}&skipCount=0&maxResultCount=25
Permission: Students.Onboarding.Setup.Approve
```

Response: paged `OnboardingApprovalRequestDto`.

### 16.3 Approve

```http
POST /approval-requests/{requestId}/approve
Permission: Students.Onboarding.Setup.Approve
Idempotency-Key: required
```

Request:

```json
{
  "reason": "Verified",
  "concurrencyStamp": "approval-stamp"
}
```

Response: updated `OnboardingApprovalRequestDto` plus refreshed student capabilities and `correlationId`.

### 16.4 Reject

```http
POST /approval-requests/{requestId}/reject
Permission: Students.Onboarding.Setup.Approve
Idempotency-Key: required
```

Reason is required and must be at least 5 characters.

### 16.5 Cancel

```http
POST /approval-requests/{requestId}/cancel
Permission: Students.Onboarding.Setup.RequestApproval
Idempotency-Key: required
```

Only the requester or a user with Approve permission can cancel a pending request.

## 17. Activation APIs

Activation is the final Onboarding command.
It must compose the existing Enrollment Activation and Student Records services rather than duplicate them.

### 17.1 Preview activation

```http
POST /activations/preview
Permission: Students.Onboarding.Setup.Activate
```

Request:

```ts
export interface OnboardingActivationPreviewRequest {
  academicYearId: string;
  items: Array<{
    studentId: string;
    concurrencyStamp: string;
  }>;
  overrideBlockingChecks: boolean;
  overrideReason?: string | null;
  allOrNothing: boolean;
}
```

Response:

```ts
export interface OnboardingActivationPreviewDto {
  items: Array<{
    studentId: string;
    studentName: string;
    canActivate: boolean;
    readiness: ReadinessSummaryDto;
    willPrepareStudentAccount: boolean;
    willPrepareGuardianAccount: boolean;
    credentialReleaseTiming: 0 | 1;
    warnings: OperationIssueDto[];
    errors: OperationIssueDto[];
    concurrencyStamp: string;
  }>;
  canCommit: boolean;
  allOrNothing: boolean;
  settingsVersion: number;
  previewFingerprint: string;
  expiresAt: string;
}
```

Override requires `Students.Onboarding.Setup.Override` and a reason of at least 10 characters.
Checks that are legally or structurally non-overridable must remain blocking.

### 17.2 Commit activation

```http
POST /activations/commit
Permission: Students.Onboarding.Setup.Activate
Idempotency-Key: required
```

Request:

```json
{
  "previewFingerprint": "fingerprint",
  "allOrNothing": true
}
```

Response: `BulkCommandResultDto`.

For every successful student, the command must:

1. Revalidate the preview and concurrency stamps.
2. Recalculate authoritative readiness.
3. Confirm required approval is approved.
4. Commit pending placement and identifiers through their owning services.
5. Prepare required student and guardian accounts idempotently.
6. Release credentials only when the configured timing permits.
7. Execute or finalize the existing Enrollment Activation when one exists.
8. Mark the Onboarding case Completed.
9. Persist an immutable completion snapshot.
10. Append audit events using the command correlation ID.

A repeated activation request must return the existing successful result and must not create duplicate users, identifiers, relationships, or Students.

## 18. Worklist export

### 18.1 Create export job

```http
POST /worklist/exports
Permission: Students.Onboarding.Setup.Export
```

Request uses the same filters and sorting as `GET /worklist` plus:

```json
{
  "format": "xlsx",
  "columns": [
    "studentName",
    "applicationNumber",
    "placement",
    "readiness",
    "identifiers",
    "accounts",
    "owner",
    "stage"
  ]
}
```

Response:

```json
{
  "jobId": "GUID",
  "status": 0,
  "requestedAt": "2026-08-29T10:00:00Z"
}
```

### 18.2 Get export job

```http
GET /worklist/exports/{jobId}
Permission: Students.Onboarding.Setup.Export
```

Return status, row count, failure message, expiry, and a protected download URL when completed.

Exports must respect the requesting user's tenant, scope, permissions, and sensitive-field access.

## 19. Stage state machine

```text
ToPrepare
  -> AwaitingApproval       when readiness passes and approval is requested
  -> ReadyToActivate       when readiness passes and approval is not required
  -> ActionRequired        when a blocking check fails

AwaitingApproval
  -> ReadyToActivate       when approved and readiness remains valid
  -> ActionRequired        when rejected or readiness becomes invalid
  -> ToPrepare             when the request is cancelled

ReadyToActivate
  -> Completed             when activation commits successfully
  -> ActionRequired        when authoritative readiness becomes invalid

ActionRequired
  -> ToPrepare             when the blocking issue is resolved but preparation remains
  -> AwaitingApproval      when ready and approval is required
  -> ReadyToActivate       when ready and approval is not required

Completed
  -> no normal transition
```

The backend returns the calculated stage and allowed capabilities.
The frontend must never derive a competing stage.

## 20. Data constraints and transactional rules

### 20.1 Required unique constraints

- One open Onboarding case per tenant, student, and academic year.
- One active settings aggregate per tenant and scope.
- One active default GR series per tenant and scope.
- GR normalized value unique per tenant and identifier type.
- Roll number unique per tenant, academic year, standard, and division.
- One pending onboarding approval request per Onboarding case.
- Idempotency key unique per tenant, user, endpoint family, and retention window.

### 20.2 Soft deletion and history

- Settings, numbering rules, cases, approvals, and audit records are not hard-deleted.
- Numbering configurations are archived.
- Completed cases and committed identifiers are immutable except through explicit correction workflows.
- Every configuration update preserves version history.

### 20.3 Bulk operations

- Maximum synchronous bulk size: 100 students.
- `allOrNothing=true` is the default and required for GR and roll recalculation unless the caller explicitly chooses partial processing.
- With `allOrNothing=true`, one failure rolls back the whole command.
- With `allOrNothing=false`, each student is processed in an independent transaction and returned in `BulkCommandResultDto`.
- Partial processing must never hide failures.
- The same idempotency key safely resumes or returns the previous result.

### 20.4 No client-side authority

The server must recalculate and revalidate:

- Readiness percentage.
- Stage.
- Permissions and capabilities.
- Division validity and capacity.
- GR availability and formatting.
- Roll ordering and uniqueness.
- Approval requirement.
- Account eligibility.
- Activation eligibility.

Values proposed by the browser are requests, not authoritative facts.

### 20.5 Non-functional targets

- Worklist query P95: at most 2 seconds for a tenant with 50,000 students and a page size of 25.
- Student detail query P95: at most 1 second excluding a declared unavailable dependency.
- Assignment preview P95: at most 3 seconds for 100 students.
- Synchronous bulk commit timeout: 30 seconds; requests above the 100-student v1 limit return validation error instead of starting untracked work.
- Worklist and detail queries must avoid N+1 document, identity, placement, and audit calls.
- Database indexes must cover tenant, academic scope, stage, student, division, normalized GR value, Roll uniqueness scope, approval status, and last update time.
- Dependency calls require bounded timeouts and must produce `NotConnected` readiness only when the owning service is genuinely unavailable.
- Logs and telemetry must use IDs, error codes, durations, counts, and correlation IDs without unmasked student or guardian personal data.
- Export files and preview fingerprints must expire and be tenant/user bound.

## 21. Error catalogue

| HTTP | Code                                              | Meaning                                                             |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------- |
| 400  | `STUDENT_ONBOARDING:INVALID_SCOPE`                | Academic scope is incomplete or inconsistent                        |
| 400  | `STUDENT_ONBOARDING:VALIDATION_ERROR`             | Field validation failed                                             |
| 400  | `STUDENT_ONBOARDING:INVALID_SORTING`              | Unsupported worklist sort field                                     |
| 401  | Platform unauthorized code                        | Authentication missing or expired                                   |
| 403  | Platform forbidden code                           | Permission denied or cross-scope access attempted                   |
| 404  | `STUDENT_ONBOARDING:CASE_NOT_FOUND`               | Onboarding case does not exist                                      |
| 404  | `STUDENT_ONBOARDING:STUDENT_NOT_FOUND`            | Student does not exist in the tenant                                |
| 404  | `STUDENT_ONBOARDING:CONFIGURATION_NOT_FOUND`      | Required configuration is absent                                    |
| 409  | `STUDENT_ONBOARDING:CONCURRENCY_CONFLICT`         | A mutable record changed after it was loaded                        |
| 409  | `STUDENT_ONBOARDING:PREVIEW_STALE`                | Preview facts or settings changed                                   |
| 409  | `STUDENT_ONBOARDING:PREVIEW_EXPIRED`              | Preview fingerprint expired                                         |
| 409  | `STUDENT_ONBOARDING:IDEMPOTENCY_KEY_REUSED`       | Same key was used with a different payload                          |
| 409  | `STUDENT_ONBOARDING:INVALID_STAGE_TRANSITION`     | Command is not allowed from the current stage                       |
| 409  | `STUDENT_ONBOARDING:APPROVAL_REQUIRED`            | Required approval is missing                                        |
| 409  | `STUDENT_ONBOARDING:APPROVAL_ALREADY_PENDING`     | A pending request already exists                                    |
| 409  | `STUDENT_ONBOARDING:READINESS_BLOCKED`            | Required checks prevent the command                                 |
| 409  | `STUDENT_ONBOARDING:DIVISION_CAPACITY_EXCEEDED`   | Target division has insufficient capacity                           |
| 409  | `STUDENT_ONBOARDING:GR_NUMBER_DUPLICATE`          | GR value already exists                                             |
| 409  | `STUDENT_ONBOARDING:GR_SERIES_EXHAUSTED`          | Series has no available sequence                                    |
| 409  | `STUDENT_ONBOARDING:SERIES_IMMUTABLE`             | Allocated series cannot be edited in place                          |
| 409  | `STUDENT_ONBOARDING:ROLL_NUMBER_DUPLICATE`        | Roll number conflicts in its uniqueness scope                       |
| 409  | `STUDENT_ONBOARDING:IDENTIFIER_ALREADY_COMMITTED` | Identifier requires a correction workflow                           |
| 422  | `STUDENT_ONBOARDING:GUARDIAN_CONTACT_UNVERIFIED`  | Account rule requires verified contact                              |
| 422  | `STUDENT_ONBOARDING:DEPENDENCY_UNAVAILABLE`       | Owning document, identity, class, or student service is unavailable |
| 422  | `STUDENT_ONBOARDING:BULK_ATOMICITY_FAILURE`       | At least one item failed in an all-or-nothing command               |

## 22. Cache and refresh contract

Recommended frontend RTK Query tags:

```ts
studentOnboardingType = {
  settings: 'StudentOnboardingSettings',
  metadata: 'StudentOnboardingMetadata',
  worklist: 'StudentOnboardingWorklist',
  student: 'StudentOnboardingStudent',
  approval: 'StudentOnboardingApproval',
  audit: 'StudentOnboardingAudit',
  export: 'StudentOnboardingExport',
};
```

| Successful mutation                   | Required invalidation                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| Readiness or division settings update | settings, metadata, worklist, affected students                                      |
| GR series mutation                    | settings, metadata, worklist when readiness depends on identifiers                   |
| Roll rule mutation                    | settings, metadata                                                                   |
| Division commit                       | worklist, affected students, metadata/capacity, Student Records                      |
| GR commit                             | worklist, affected students, settings/governance, Student Records                    |
| Roll commit                           | worklist, affected students, Student Records                                         |
| Request or decide approval            | worklist, affected students, approval, audit                                         |
| Activation commit                     | worklist, affected students, approval, audit, Student Records, Enrollment Activation |
| Recalculate readiness                 | worklist, affected student, audit when stage changes                                 |

The frontend should retain safe existing rows during a background refetch and display a contained progress state.

## 23. Frontend integration map

| Current frontend behavior                       | Backend connection                                             |
| ----------------------------------------------- | -------------------------------------------------------------- |
| In-memory `OnboardingSettingsProvider` defaults | Initialize from `GET /settings`                                |
| Apply Readiness & Access                        | Preview impact, then `PUT /settings/readiness-access`          |
| Add GR configuration                            | `POST /settings/gr-number-series`                              |
| GR assignment mode                              | `PUT /settings/numbering-assignment-modes`                     |
| Add Roll configuration                          | `POST /settings/roll-number-rules`                             |
| Roll assignment mode                            | `PUT /settings/numbering-assignment-modes`                     |
| Apply Division Changes                          | Preview impact, then `PUT /settings/division-change`           |
| Existing Student Records compatibility list     | Replace with `GET /worklist`                                   |
| Local stage and readiness projection            | Use server stage, readiness, and capabilities                  |
| Student drawer                                  | `GET /students/{studentId}`                                    |
| Hardcoded divisions A/B/C                       | Replace with `GET /metadata` divisions                         |
| Local Division preview                          | `POST /assignments/division/preview`                           |
| Local GR preview                                | `POST /assignments/gr-number/preview`                          |
| Local Roll preview                              | `POST /assignments/roll-number/preview`                        |
| Confirm preview                                 | Call the matching commit endpoint                              |
| Review readiness preview                        | Use drawer detail or recalculation endpoint                    |
| Request approval preview                        | `POST /approval-requests`                                      |
| Activation preview                              | `POST /activations/preview`                                    |
| Disabled activation action                      | Enable only when server capability allows, then call commit    |
| Local activity examples                         | `GET /students/{studentId}/activity`                           |
| Client-side export                              | Replace with export job APIs when data exceeds one loaded page |

## 24. Backend implementation structure

Follow the existing backend module structure and naming conventions.
A suggested ABP-style ownership map is:

```text
Application.Contracts/Students/Onboarding/
  IStudentOnboardingSettingsAppService
  IStudentOnboardingWorklistAppService
  IStudentOnboardingAssignmentAppService
  IStudentOnboardingApprovalAppService
  IStudentOnboardingActivationAppService
  Dtos/

Application/Students/Onboarding/
  StudentOnboardingSettingsAppService
  StudentOnboardingWorklistAppService
  StudentOnboardingAssignmentAppService
  StudentOnboardingApprovalAppService
  StudentOnboardingActivationAppService

Domain/Students/Onboarding/
  StudentOnboardingCase
  OnboardingSettings
  GrNumberSeriesVersion
  RollNumberRuleVersion
  OnboardingApprovalRequest
  OnboardingAuditEvent
  Domain services and policies

EntityFrameworkCore/Students/Onboarding/
  Entity configurations, indexes, repositories, and migrations

HttpApi/Controllers/Students/Onboarding/
  Thin controllers delegating to application services
```

Adapt names to the actual backend repository structure after the backend team confirms it.
Controllers must not implement allocation, readiness, capacity, or transition rules directly.

## 25. Required backend tests

### 25.1 Contract tests

- Every endpoint path, method, request, response, and numeric enum value.
- `items` plus `totalCount` paging shape.
- Camel-case JSON and null behavior.
- DateTimeOffset serialization.
- Stable error codes.

### 25.2 Security tests

- Tenant isolation for every query and mutation.
- Permission denial for every permission leaf.
- Cross-tenant student, division, series, rule, approval, preview, and export IDs.
- Sensitive guardian data redaction.

### 25.3 Settings tests

- Default resolution when no saved settings exist.
- Optimistic concurrency conflict.
- Impact preview and stale impact fingerprint.
- Open-case recalculation after a setting change.
- Completed-case historical snapshot remains unchanged.
- Number series format/version immutability.
- One active fallback Roll rule.

### 25.4 Worklist tests

- Server paging, search, every filter, every allowed sort, and invalid sort rejection.
- Stage summary remains independent of selected stage.
- Optional checks are excluded from readiness totals.
- Missing integration is distinguished from pending data.
- Capability projection combines permission and case state.

### 25.5 Assignment tests

- Individual and bulk automatic assignment.
- Individual and bulk manual assignment.
- Stable Roll ordering and tie-breaker.
- GR collision under two concurrent requests.
- Roll collision under two concurrent requests.
- Division capacity collision under two concurrent requests.
- Preserve and recalculate behavior.
- Stale and expired preview rejection.
- All-or-nothing rollback.
- Explicit partial result.
- Repeated idempotency key.

### 25.6 Approval and activation tests

- Approval disabled.
- Approval required and absent.
- Duplicate pending request.
- Approve, reject, cancel, and stale decision.
- Readiness changes after approval but before activation.
- Account preparation is idempotent.
- Existing Enrollment Activation is reused.
- Legacy Student compatibility case does not duplicate Student.
- Repeated activation does not duplicate identifiers, accounts, or relationships.

### 25.7 Audit tests

- Every settings update and command creates an audit event.
- Old and new values are bounded and protected.
- Reason and correlation ID are preserved.
- Audit events are append-only.

## 26. Acceptance criteria

The backend contract is complete when:

1. Accepted DTOs and enum values exist in backend Application Contracts.
2. OpenAPI exposes every endpoint in this document.
3. Permissions are registered and enforced server-side.
4. Tenant isolation tests pass.
5. Settings survive refresh and resolve by academic scope.
6. Worklist stages and readiness are server-authoritative.
7. Individual and bulk Division, GR, and Roll previews match commit results unless a stale preview is rejected.
8. GR, Roll, and capacity collisions are prevented under concurrency.
9. Approval and activation use explicit state transitions.
10. Existing Enrollment Activation and Student Records logic is reused rather than duplicated.
11. Every critical commit is idempotent and auditable.
12. Frontend can remove its sample workflow data and in-memory settings authority without losing any current screen behavior.
13. Backend documentation owns the accepted contract and links it from Student `api.md`, `product.md`, `workflows.md`, and `testing.md`.

## 27. Recommended implementation order

### Phase 1 — Settings and projection foundation

- Permissions.
- Scoped settings and numbering rule persistence.
- Metadata.
- Compatibility Onboarding case projection.
- Worklist and detail query.
- Audit foundation.

### Phase 2 — Assignment commands

- Division preview and commit.
- GR allocator preview and commit.
- Roll preview and commit.
- Concurrency, fingerprint, idempotency, and bulk-result infrastructure.

### Phase 3 — Approval and activation

- Approval requests and decisions.
- Activation preview and commit.
- Existing Enrollment Activation composition.
- Identity/account preparation.

### Phase 4 — Operations hardening

- Export jobs.
- Recalculation jobs after high-impact settings changes.
- Performance indexes and query telemetry.
- Load, resilience, and dependency-failure tests.

## 28. Backend team handoff checklist

- [ ] Confirm actual backend repository structure and rename suggested folders only where necessary.
- [ ] Confirm existing Enrollment Activation service entry points and reuse plan.
- [ ] Confirm Student Records placement and identifier command entry points.
- [ ] Confirm Class Management capacity query and locking behavior.
- [ ] Confirm Identity account-provisioning idempotency contract.
- [ ] Register permissions and compatibility grants.
- [ ] Publish accepted DTOs and enums in OpenAPI.
- [ ] Implement migrations and unique indexes.
- [ ] Implement settings and query endpoints first.
- [ ] Implement preview/commit infrastructure once and reuse it for all three assignments.
- [ ] Add contract, permission, tenant, concurrency, idempotency, and round-trip tests.
- [ ] Promote this proposal into backend-owned Student documentation.
