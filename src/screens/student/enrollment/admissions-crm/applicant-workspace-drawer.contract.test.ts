import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (file: string) =>
  fs.readFileSync(
    path.join(process.cwd(), 'src', 'screens', 'student', 'enrollment', 'admissions-crm', file),
    'utf8'
  );

describe('Student Enrollment applicant workspace drawer contracts', () => {
  it('uses the compact responsive shell and project navigation pattern', () => {
    const drawer = read('applicant-workspace-drawer.tsx');

    expect(drawer).toContain("width: { xs: '100%', sm: 720, lg: 860 }");
    expect(drawer).toContain('<CustomTabs');
    expect(drawer).toContain('isMobile ? (');
    expect(drawer).toContain("aria-label': 'Applicant workspace sections'");
    expect(drawer).toContain("'aria-label': 'Applicant Workspace'");
    expect(drawer).not.toContain('<Tabs');
    expect(drawer).not.toContain('journeySteps');
    expect(drawer).not.toContain('Next required action');
  });

  it('keeps overview read-first and progressively discloses creation forms', () => {
    const overview = read('applicant-workspace-overview.tsx');

    expect(overview).toContain('ApplicantSummaryGrid');
    expect(overview).toContain('noteFormOpen ?');
    expect(overview).toContain('taskFormOpen ?');
    expect(overview).toContain('visibleTasks');
    expect(overview).toContain('openTasks.slice(0, 3)');
    expect(overview).toContain('timelineEvents.slice(0, 5)');
    expect(overview).not.toContain('Save Owner');
    expect(overview).not.toContain('Save Priority');
  });

  it('autosaves ownership controls and keeps staff searches independent and lazy', () => {
    const overview = read('applicant-workspace-overview.tsx');

    expect(overview).toContain('const saveOwner = async');
    expect(overview).toContain('const savePriority = async');
    expect(overview).toContain('debouncedOwnerSearch');
    expect(overview).toContain('debouncedTaskSearch');
    expect(overview).toContain('{ skip: !ownerEditorOpen }');
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

  it('opens route rows on their contextual applicant sections', () => {
    const pipeline = read('pipeline-workspace.tsx');
    const exams = read('exams-workspace.tsx');
    const queueColumns = read('operations-queue-columns.tsx');

    expect(pipeline).toContain("openApplicant(lead.id, 'overview')");
    expect(exams).toContain("openApplicant(exam.leadId, 'exam')");
    expect(exams).toContain("openApplicant(exam.leadId, 'registration')");
    expect(queueColumns).toContain('openApplicant(item.leadId, applicantTab)');
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
    const drawer = read('applicant-workspace-drawer.tsx');
    const registration = read('applicant-registration-operations.tsx');

    expect(drawer).toContain('hasRegistration={Boolean(');
    expect(drawer).toContain('lead?.registrationFormIssuedAt || lead?.registrationFormNumber');
    expect(registration).toContain('{ skip: !hasRegistration }');
  });
});
