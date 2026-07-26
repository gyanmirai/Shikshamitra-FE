import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (file: string) =>
  fs.readFileSync(
    path.join(process.cwd(), 'src', 'screens', 'student', 'enrollment', 'admissions-crm', file),
    'utf8'
  );

describe('Student Enrollment applicant workspace page contracts', () => {
  it('uses a dedicated, responsive, journey-led page instead of a drawer', () => {
    const page = read('applicant-workspace-page.tsx');

    expect(page).toContain('component="article"');
    expect(page).toContain('<CustomBreadcrumbs');
    expect(page).toContain('isBack');
    expect(page).toContain('onBack={handleClose}');
    expect(page).toContain('<Stepper');
    expect(page).toContain('journeySteps.map');
    expect(page).toContain('<CustomTabs');
    expect(page).toContain('visibleSections.map');
    expect(page).toContain('<ApplicantActivityTimeline');
    expect(page).not.toContain('<Drawer');
    expect(page).not.toContain("role: 'dialog'");
  });

  it('keeps overview read-first and moves audit activity to its own section', () => {
    const overview = read('applicant-workspace-overview.tsx');
    const activity = read('applicant-activity-timeline.tsx');

    expect(overview).toContain('ApplicantSummaryGrid');
    expect(overview).toContain('noteFormOpen ?');
    expect(overview).toContain('taskFormOpen ?');
    expect(overview).toContain('visibleTasks');
    expect(overview).toContain('openTasks.slice(0, 3)');
    expect(overview).not.toContain('useGetAdmissionCrmTimelineQuery');
    expect(activity).toContain('useGetAdmissionCrmTimelineQuery');
    expect(activity).toContain('Activity & Audit');
    expect(overview).not.toContain('Save Owner');
    expect(overview).not.toContain('Save Priority');
  });

  it('autosaves ownership controls and keeps staff searches independent and lazy', () => {
    const overview = read('applicant-workspace-overview.tsx');

    expect(overview).toContain('const saveOwner = async');
    expect(overview).toContain('const savePriority = async');
    expect(overview).toContain('debouncedOwnerSearch');
    expect(overview).toContain('debouncedTaskSearch');
    expect(overview).toContain('{ skip: !ownerEditorOpen && !lead.ownerUserId }');
    expect(overview).toContain('{ skip: !taskFormOpen }');
  });

  it('keeps governed reasons isolated and protects unsaved forms', () => {
    const overview = read('applicant-workspace-overview.tsx');
    const dirty = read('applicant-workspace-dirty-context.tsx');

    expect(overview).toContain('stageReason');
    expect(overview).toContain('archiveReason');
    expect(overview).toContain('mergeReason');
    expect(overview).not.toContain('const [reason, setReason]');
    expect(dirty).toContain('Discard unsaved changes?');
    expect(dirty).toContain("window.addEventListener('beforeunload'");
  });

  it('opens table rows on their contextual applicant sections and restores private table state', () => {
    const pipeline = read('pipeline-workspace.tsx');
    const exams = read('exams-workspace.tsx');
    const overview = read('overview-workspace.tsx');
    const operations = read('operations-queue-workspace.tsx');
    const operationColumns = read('operations-queue-columns.tsx');

    expect(pipeline).toContain(
      "onOpen: () => openApplicant((row as AdmissionCrmLeadDto).id, 'overview')"
    );
    expect(exams).toContain("onOpen: () => openApplicant(row.leadId, 'exam')");
    expect(operations).toContain('onOpen: () => openApplicant(row.leadId, applicantTab)');
    expect(overview).toContain('createApplicantRowNavigationProps');
    expect(pipeline).toMatch(
      /`pipeline:\$\{academicYearId \|\| 'none'\}:\$\{sessionIdentity\}`/
    );
    expect(exams).toMatch(
      /`exams:\$\{academicYearId \|\| 'none'\}:\$\{sessionIdentity\}`/
    );
    expect(operations).toMatch(
      /`operations-\$\{variant\}:\$\{academicYearId \|\| 'none'\}:\$\{sessionIdentity\}`/
    );
    expect(pipeline).toContain('createApplicantLinkNavigationProps');
    expect(pipeline).toContain("onOpen: () => openApplicant(lead.id, 'overview')");
    expect(exams).toContain("onOpen: () => openApplicant(exam.leadId, 'exam')");
    expect(operationColumns).toContain(
      'onOpen: () => openApplicant(item.leadId, applicantTab)'
    );
    expect(pipeline).not.toContain('<ApplicantWorkspaceDrawer');
    expect(pipeline).not.toContain('component={NextLink}');
    expect(exams).not.toContain('component={NextLink}');
    expect(operationColumns).not.toContain('component={NextLink}');
  });

  it('derives visible sections from operational journey facts and permissions', () => {
    const page = read('applicant-workspace-page.tsx');
    const context = read('enrollment-workspace-context.tsx');

    expect(page).toContain('useGetAdmissionCrmQuickInquiryOptionsQuery');
    expect(page).toContain('buildApplicantJourney');
    expect(page).toContain('registrationFormRequiredBeforeExam');
    expect(page).toContain('entranceExamRequired');
    expect(page).toContain('canViewOffers');
    expect(page).toContain('canViewActivation');
    expect(page).toContain('canViewGovernance');
    expect(page).toContain('canViewRoutes ?');
    expect(page).toContain('canViewPolicies ?');
    expect(page).toContain('canViewHouseholds ?');
    expect(page).toContain('visibleSections');
    expect(page).toContain('{ skip: !leadId || !lead }');
    expect(page).not.toContain('entranceExamRequired === true');
    expect(page).not.toContain('useGetAdmissionCrmCycleConfigurationQuery');
    expect(context).toContain('studentPaths.enrollment.applicant(leadId)');
    expect(context).toContain('window.sessionStorage.setItem');
    expect(context).toContain('router.replace(returnTo');
  });

  it('uses individual result rows for bulk entrance exam marks entry', () => {
    const exams = read('exams-workspace.tsx');

    expect(exams).toContain('type BulkExamResultForm');
    expect(exams).toContain('parseBulkExamNumber');
    expect(exams).toContain('isValidBulkExamResultForm');
    expect(exams).toContain('bulkMarksByExamId');
    expect(exams).toContain('selectedExams.length === selectedExamIds.length');
    expect(exams).toContain('items: selectedExams.map((exam)');
    expect(exams).toContain('examRecordId: exam.id');
    expect(exams).toContain('Enter individual marks for each selected applicant');
    expect(exams).toContain('Upload Results');
    expect(exams).toContain('OMR Import');
    expect(exams).not.toContain('bulkObtainedMarks');
  });

  it('keeps generated documents in their owning workflow', () => {
    const page = read('applicant-workspace-page.tsx');
    const documents = read('generated-document-operations.tsx');

    expect(page).toContain('allowedDocumentTypes={examDocumentTypes}');
    expect(page).toContain('AdmissionCrmGeneratedDocumentType.HallTicket');
    expect(page).toContain('allowedDocumentTypes={registrationDocumentTypes}');
    expect(page).toContain('allowedDocumentTypes={offerDocumentTypes}');
    expect(page).toContain('allowedDocumentTypes={activationDocumentTypes}');
    expect(documents).toContain('useGetAdmissionCrmGeneratedDocumentAvailabilityQuery');
    expect(documents).toContain('availableDocumentTypes.length === 0');
  });

  it('allows staff to upload registration checklist documents', () => {
    const registration = read('applicant-registration-operations.tsx');
    const actionPermissions = read('admission-action-permissions.ts');

    expect(registration).toContain('useUploadAdmissionCrmRegistrationDocumentMutation');
    expect(registration).toContain('type="file"');
    expect(registration).toContain('registrationApplicationId: registration.id');
    expect(registration).toContain('document.validityDateRequired');
    expect(registration).toContain('admissionCrmActionPermissions.reviewDocuments');
    expect(actionPermissions).toMatch(
      /reviewDocuments: `\$\{admissionCrmPermissionRoot\}\.ReviewDocuments`/
    );
    expect(registration).toContain('canUploadDocuments ?');
  });

  it('uses switches and chips for operational booleans while retaining explicit consent', () => {
    const activation = read('applicant-activation-operations.tsx');
    const offers = read('applicant-final-admission-operations.tsx');
    const registration = read('applicant-registration-operations.tsx');
    const household = read('applicant-household-identity-operations.tsx');

    expect(activation).toContain('ApplicantSwitchRow');
    expect(activation).toContain('aria-pressed={selected}');
    expect(activation).toContain('Consent confirmed for minimum-data service handoff');
    expect(offers).toContain('Enable capacity override');
    expect(offers).toContain('Enable rank override');
    expect(offers).toContain('Enable governed override');
    expect(registration).toContain('Enable readiness override');
    expect(household).toContain('Pickup authorization');
    expect(household).not.toContain('<Checkbox');
  });

  it('does not request a current registration for a known empty lead', () => {
    const page = read('applicant-workspace-page.tsx');
    const registration = read('applicant-registration-operations.tsx');

    expect(page).toContain('hasRegistration={Boolean(');
    expect(page).toContain('lead?.registrationFormIssuedAt || lead?.registrationFormNumber');
    expect(registration).toContain('{ skip: !hasRegistration }');
  });

  it('shows the captured pathway and protects every substantive registration draft', () => {
    const overview = read('applicant-workspace-overview.tsx');
    const registration = read('applicant-registration-operations.tsx');

    expect(overview).toContain('label="Admission pathway"');
    expect(overview).toContain('lead.intendedRouteNameSnapshot');
    expect(overview).toContain('lead.intendedRouteDefinitionVersion');
    expect(overview).toContain('captured at inquiry');
    expect(registration).toContain('hasApplicantRegistrationDraft');
    expect(registration).toContain('documentReasonByKey');
    expect(registration).toContain('documentFileByKey');
    expect(registration).toContain('documentValidUntilByKey');
    expect(registration).toContain('overrideReadiness');
  });
});
