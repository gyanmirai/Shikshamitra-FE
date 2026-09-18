# Student Admissions Settings and CRM End-to-End Test Report

**Test date:** 17 September 2026  
**Environment:** Local frontend `http://localhost:3000`, local backend `https://localhost:44332`  
**Context:** DDVS, Academic Year 2026-2027, CBSE, English  
**Result:** Core setup-to-application flow passed after three frontend fixes and one frontend API-registration fix.

## Tested school admission flow

1. Created and published an admission cycle.
2. Created a detailed application form from the registration template.
3. Validated the form, requested approval, recorded an administrator override reason, approved it, and published version 1.
4. Created a workflow, applied the standard five-stage admission journey, attached the published application form, validated it, and published version 1.
5. Created a Class 1 offering, attached the published workflow, inquiry form, and application form, and activated it.
6. Created a fictional CRM inquiry through the published inquiry form.
7. Verified the inquiry in the list, pipeline, and Applicant 360.
8. Started an application from Applicant 360 and verified the five-stage journey and eight-step application form.

## Data now visible in the UI

### Admission cycle

| Field | Value |
|---|---|
| Name | Rolling Admissions 2026–27 |
| Code | ROLLING_2627 |
| Academic year | 2026-2027 |
| Window | 17 Sep 2026 – 31 Mar 2027 |
| Status | Published / Open |

### Forms

| Form | Code | Version | Structure | Status |
|---|---|---:|---|---|
| Common Admission Inquiry | ADMISSION_INQUIRY | 1 | 1 section | Published |
| Rolling Admission Application 2026–27 | ROLLING_APPLICATION_2627 | 1 | 8 steps, 15 sections, 134 fields, 19 required | Approved / Published |

The application-form approval history contains this administrator override reason:

> End-to-end admission setup requested for validating the complete school admission flow.

### Workflow

| Field | Value |
|---|---|
| Name | Rolling Admission Journey 2026–27 |
| Code | ROLLING_ADMISSION_JOURNEY_2026_27 |
| Version | 1 |
| Status | Published |
| Stages | 5 |
| Transitions | 4 default routes |

Stages:

1. Basic inquiry received
2. Physical registration form issued
3. Entrance exam scheduled and passed
4. Detailed registration completed
5. Verify and approve admission

### Admission offering

| Field | Value |
|---|---|
| Code | ROLLING_2627_CBSE_ENG_C1 |
| Scope | CBSE → English → Primary → Class 1 |
| Campus | All campuses |
| Workflow | Rolling Admission Journey 2026–27 v1 |
| Inquiry form | Common Admission Inquiry v1 |
| Application form | Rolling Admission Application 2026–27 v1 |
| Window | Inherited from cycle |
| Status | Open / Ready |

### CRM and application

All personal data below is fictional test data.

| Field | Value |
|---|---|
| Applicant | Aarav Sharma |
| Guardian | Priya |
| Phone | 9000000001 |
| Source | Website |
| Source detail | 2026–27 Class 1 admissions website campaign |
| Inquiry | INQ/2026/bc40a1915c5 |
| Inquiry pipeline state | Application started |
| Application | APP/2026/3a23c0dbd7a |
| Application state | Draft |
| Current stage | Basic inquiry received |
| Journey progress | 0 of 5 steps completed |

Applicant 360 shows the applicant, guardian, phone, family record, inquiry-created activity, and linked application. The application form prefilled the applicant first and last name from the inquiry.

## Defects found and fixed

### 1. False unsaved-changes warning after creating a cycle

**Observed:** The API succeeded and a success toast appeared, but the dialog immediately asked to discard unsaved changes.  
**Cause:** The success path called the close handler while it still held stale dirty-form state.  
**Fix:** Reset the dialog state and call the successful close callback directly after the mutation completes.  
**Regression coverage:** Added a focused test that edits, saves, and confirms the dialog closes without a discard prompt.

### 2. Missing workflow rendered as `- vnull`

**Observed:** An incomplete offering displayed `- vnull` in the Workflow column.  
**Fix:** The column now renders the workflow only when both name and version exist; otherwise it displays `Not configured`.

### 3. Ready offering could not be activated

**Observed:** The table showed `Ready`, but the lifecycle menu showed `Complete setup to activate`. The server-side activation contract derives readiness from `configurationStatus`, while the client relied only on a separate `canActivate` value.  
**Fix:** The row action now accepts either the server activation flag or `configurationStatus === Ready`. The activation API subsequently succeeded and the offering became `Open / Ready`.  
**Regression coverage:** Added a UI test for both incomplete and ready configurations.

### 4. Duplicate RTK Query endpoint registration

**Observed console error:** `called injectEndpoints to override already-existing endpointName issueAdmissionOffer without specifying overrideExisting: true`  
**Cause:** The application-decision API and stage-specific offer API registered different contracts under the same endpoint name.  
**Fix:** Renamed the stage-specific endpoint and hook to `issueAdmissionStageOffer` / `useIssueAdmissionStageOfferMutation`, preserving both contracts without overriding either.  
**Verification:** Reloading the application detail produced no new duplicate-endpoint errors.

## Verification performed

- Cycle creation, publication, and date inheritance: passed.
- Form validation, audited approval override, and publication: passed.
- Workflow template application, save, validation, and publication: passed.
- Offering configuration, activation readiness, and activation API: passed.
- Inquiry creation and list rendering: passed.
- Pipeline visibility and handoff state: passed.
- Applicant 360 identity, guardian, family, and activity display: passed.
- Application creation, workflow instance creation, form version pinning, and inquiry prefill: passed.
- Focused automated tests: 3 files, 7 tests passed.
- Focused ESLint: passed.
- Duplicate endpoint console-error regression check: passed.

The Vitest run emitted non-fatal Windows/MSW `read EINVAL` socket noise after execution; all selected test files still completed and passed.

## Remaining coverage and limits

- The current signed-in role can view the application but cannot perform admission decision actions. Review, approval, offer, finalization, student enrollment, payments, documents, assessment scoring, and onboarding were not executed.
- The draft application intentionally remains unsubmitted. Required data still missing in the UI includes date of birth, gender, address, and other registration fields.
- Email was not present in the published inquiry form, so the inquiry and Applicant 360 correctly show no email.
- No destructive cleanup was performed. All created test records remain available for UI review.

## Recommended next test pass

Use a role with application-review and decision permissions, complete the required eight-step registration form with fictional data, then test assessment, review, offer acceptance, admission finalization, and student-record creation. Keep the current offering and applicant as the starting dataset.
