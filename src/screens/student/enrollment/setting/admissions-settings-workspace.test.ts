import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Enrollment settings route contracts', () => {
  const sections = [
    'admission-cycles',
    'pipeline',
    'entrance-exams',
    'registration-documents',
    'finance-handoff',
    'offers-seats',
    'activation',
    'communications',
  ];

  it.each(sections)('provides a dedicated %s settings route', (section) => {
    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          'src',
          'app',
          '(auth-route)',
          'student',
          'enrollment',
          'settings',
          section,
          'page.tsx'
        )
      )
    ).toBe(true);
  });

  it('keeps the root settings URL as the Enrollment Setup Center', () => {
    const source = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'settings',
      'page.tsx'
    );
    expect(source).toContain('EnrollmentSetupCenter');
    expect(source).not.toContain('redirect(');

    const setupCenter = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-setup-center.tsx'
    );
    expect(setupCenter).toContain('<EnrollmentWorkspaceHeader');
    expect(setupCenter).toContain('title="Enrollment Setup Center"');
    expect(setupCenter).toContain('actions={');
    expect(setupCenter).not.toContain('component="h1" variant="h4"');
  });

  it('protects dirty settings across domain-sidebar navigation and browser exit', () => {
    const shell = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-shell.tsx'
    );
    expect(shell).toContain("addEventListener('beforeunload'");
    expect(shell).toContain("document.addEventListener('click'");
    expect(shell).toContain('Discard Unsaved Changes?');
    expect(shell).not.toContain('window.confirm');
  });

  it('uses URL-backed admission-cycle context in every cycle-scoped settings surface', () => {
    const cycleScopedFiles = [
      'admissions-number-series-configuration.tsx',
      'admissions-route-configuration.tsx',
      'admissions-policy-pack-configuration.tsx',
      'admissions-governance-configuration.tsx',
    ];

    cycleScopedFiles.forEach((file) => {
      const source = read('src', 'screens', 'student', 'enrollment', 'setting', file);
      expect(source).toContain('useEnrollmentWorkspace()');
      expect(source).not.toContain('globalState.currentYear');
    });
  });

  it('uses the domain sidebar as the only settings category navigation', () => {
    const shell = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-shell.tsx'
    );
    const menu = read('src', 'constants', 'student-menu.ts');

    expect(shell).not.toContain('Enrollment settings categories');
    expect(shell).not.toContain('<Drawer');
    expect(menu).toContain("title: 'Admission Year Setup'");
    expect(menu).toContain("title: 'Pipeline Settings'");
    expect(menu).toContain("title: 'Assessment Settings'");
    expect(menu).toContain("title: 'Communication Settings'");
    expect(menu).not.toContain("title: 'Journey rules'");
    expect(menu).not.toContain('studentPaths.enrollment.settingsSections.automation');
    expect(menu.match(/preserveQueryParams: \['cycle'\]/g)).toHaveLength(17);
  });

  it('uses URL-backed panels to progressively disclose dense settings', () => {
    const state = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'enrollment-workspace-state.ts'
    );
    const settingsPage = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-page.tsx'
    );

    expect(state).toContain("searchParams.get('panel')");
    expect(state).toContain("set('panel', state.settingsPanel)");
    expect(settingsPage).toContain('EnrollmentSettingsTaskNav');
    expect(settingsPage).not.toContain('EnrollmentSettingsPanelTabs');
    expect(settingsPage).not.toContain('EnrollmentSettingsSetupSteps');
    expect(settingsPage).not.toContain('<Stepper');
    expect(settingsPage).toContain('component={RouterLink}');
    expect(settingsPage).toContain('href={getPanelHref(option.value)}');
  });

  it('resets schema-dependent catalog table state when the visible record type changes', () => {
    const catalog = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'pipeline-catalog-settings.tsx'
    );

    expect(catalog).toContain('key={view}');
    expect(catalog).toContain('tableId={`student-enrollment-pipeline-catalog-');
  });

  it('leaves tenant-wide message-template retirement safety to the backend guard', () => {
    const templates = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'communication-template-settings.tsx'
    );

    expect(templates).not.toContain('useGetAdmissionCrmCycleConfigurationQuery');
    expect(templates).toContain('server will block retirement');
  });

  it('uses the project breadcrumb header and lets the exam setup table fill the workspace', () => {
    const settingsPage = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-page.tsx'
    );
    const settingsShell = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-shell.tsx'
    );
    const examRoute = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'exam-settings-route.tsx'
    );
    const playbooks = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-playbook-configuration.tsx'
    );

    expect(settingsPage).toContain('<EnrollmentWorkspaceHeader');
    expect(settingsPage).toContain(
      "section={{ name: 'Settings', href: studentPaths.enrollment.settings }}"
    );
    expect(settingsPage).not.toContain('<CustomBreadcrumbs');
    expect(settingsShell).toContain("flexDirection: 'column'");
    expect(examRoute).toContain('layout="table"');
    expect(playbooks).toContain('wrapperProps={{ sx: enrollmentTableWrapperSx }}');
    expect(playbooks).toContain('tableContainerProps={{ sx: enrollmentTableContainerSx }}');
  });

  it('aligns CRM workspace headers with the shared module breadcrumb spacing', () => {
    const workspaceHeader = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'workspace-header.tsx'
    );

    expect(workspaceHeader).toContain('<CustomBreadcrumbs');
    expect(workspaceHeader).toContain('section?: {');
    expect(workspaceHeader).toContain('section.href');
    expect(workspaceHeader).toContain('cycleQuery');
    expect(workspaceHeader).toContain('headingComponent="h1"');
    expect(workspaceHeader).toContain('descriptionDisplay="visible"');
    expect(workspaceHeader).toContain('px: 2,');
    expect(workspaceHeader).toContain("flexDirection: { xs: 'column', md: 'row' }");
    expect(workspaceHeader).toContain("breadcrumbs: { display: { xs: 'none', sm: 'block' } }");
  });

  it('keeps skipped settings queries referentially stable', () => {
    const configuration = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-crm-configuration.tsx'
    );

    expect(configuration).toContain(
      'const emptyPipelineStages: AdmissionCrmPipelineStageDto[] = []'
    );
    expect(configuration).toContain('const stages = stageData ?? emptyPipelineStages');
    expect(configuration).not.toContain('data: stages = []');
  });

  it('adds administrator help and duplicate actions to dense Journey rules settings', () => {
    const configuration = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-crm-configuration.tsx'
    );
    const settingsPage = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-page.tsx'
    );

    expect(settingsPage).toContain('<Box');
    expect(settingsPage).toContain('px: 2');
    expect(configuration).toContain('function SettingsHelpLabel');
    expect(configuration).toContain('component="span"');
    expect(configuration).toContain("display: 'inline-flex'");
    expect(configuration).toContain('role="img"');
    expect(configuration).toContain('aria-label={help}');
    expect(configuration).toContain('Target response time for a new admission inquiry');
    expect(configuration).toContain('handleDuplicateRoutingRule');
    expect(configuration).toContain('handleDuplicateJourneyRule');
    expect(configuration).toContain('Duplicate this routing rule');
    expect(configuration).toContain('Duplicate this journey rule');
    expect(configuration).toContain('getJourneyRuleSummary');
    expect(configuration).toContain(
      'These settings are used when an inquiry is reviewed in Pipeline'
    );
    expect(configuration).toContain('Duplicate Form');
    expect(configuration).toContain('Language Preview');
    expect(configuration).toContain('Download QR');
    expect(configuration).toContain('handleDuplicateFormTemplate');
    expect(configuration).toContain('buildDuplicateInquiryFormTemplate');
    expect(configuration).toContain('Create Draft Copy');
    expect(configuration).toContain('The original form will not change.');
    expect(configuration).toContain('setInquiryFormPreviewTemplate(template)');
    expect(configuration).toContain('<InquiryFormTemplatePreviewDialog');
  });

  it('uses one edit event per project-table action and retains operational summary columns', () => {
    const playbooks = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-playbook-configuration.tsx'
    );
    const registrations = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-registration-configuration.tsx'
    );
    const documents = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-document-configuration.tsx'
    );

    expect(`${playbooks}${registrations}${documents}`).not.toContain('onEditMouseDown');
    expect(playbooks).toContain("label: entranceExamMode ? 'Applicability' : 'Scope'");
    expect(registrations).not.toContain("label: 'Registration Fee'");
    expect(registrations).toContain('feeRequired: false');
    expect(registrations).toContain("label: 'Issue Method'");
  });

  it('offers a concise school-first assessment setup while retaining advanced rules', () => {
    const playbooks = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-playbook-configuration.tsx'
    );
    const route = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'exam-settings-route.tsx'
    );

    expect(playbooks).toContain('Quick Admission Setup');
    expect(playbooks).toContain('Written Entrance Exam');
    expect(playbooks).toContain('Student Interaction');
    expect(playbooks).toContain('No Entrance Assessment');
    expect(playbooks).toContain('Generate hall tickets for this exam');
    expect(playbooks).toContain('Advanced setup');
    expect(playbooks).toContain('hallTicketEnabled: false');
    expect(route).toContain(
      'written tests, interviews, interactions, schedules, decisions, and parent messages'
    );
  });

  it('uses projection-safe exam and registration guidance without a competing journey model', () => {
    const guidance = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admission-journey-guidance.tsx'
    );
    const configuration = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-crm-configuration.tsx'
    );
    const coreRoute = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'core-settings-route.tsx'
    );
    const stagePolicy = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'application-stage-policy-panel.tsx'
    );

    expect(guidance).toContain('After an exam decision');
    expect(guidance).toContain('After registration');
    expect(guidance).toContain('Ready to Invite');
    expect(guidance).toContain('next required step');
    expect(guidance).not.toContain('AdmissionJourneyOverview');
    expect(guidance).not.toContain('Offers final-approval queue');
    expect(guidance).not.toContain('handoff');
    expect(configuration).toContain('Applicant Stages');
    expect(configuration).toContain('<Accordion');
    expect(configuration).toContain('Staff can move applicants to');
    expect(configuration).not.toContain('Pipeline Stages');
    expect(coreRoute).not.toContain("title: 'Journey rules'");
    expect(coreRoute).not.toContain('AdmissionJourneyOverview');
    expect(coreRoute).not.toContain('ApplicationStagePolicyPanel');
    expect(coreRoute).not.toContain('Follow-up Automation');
    expect(stagePolicy).toContain('Cycle-owned journey policy');
    expect(stagePolicy).toContain('Preview Impact');
    expect(stagePolicy).toContain('Policy-only');
  });

  it('protects every exposed draft editor and uses staff selectors for delegation', () => {
    const protectedEditors = [
      'admission-year-setup.tsx',
      'admissions-crm-configuration.tsx',
      'admissions-playbook-configuration.tsx',
      'admissions-registration-configuration.tsx',
      'admissions-document-configuration.tsx',
      'admissions-number-series-configuration.tsx',
      'admissions-route-configuration.tsx',
      'admissions-policy-pack-configuration.tsx',
      'admissions-governance-configuration.tsx',
    ];

    protectedEditors.forEach((file) => {
      const source = read('src', 'screens', 'student', 'enrollment', 'setting', file);
      expect(source).toContain('useEnrollmentSettingsDirtyState({');
    });

    const governance = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-governance-configuration.tsx'
    );
    expect(governance).toContain('useGetAdmissionCrmStaffQuery');
    expect(governance).toContain('label="Delegating staff"');
    expect(governance).toContain('label="Delegate staff"');
    expect(governance).not.toContain('label="Delegator user ID"');
    expect(governance).not.toContain('label="Delegate user ID"');
  });

  it('keeps registration configuration readable while gating each mutation family', () => {
    const registration = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-registration-configuration.tsx'
    );

    expect(registration).toContain('resolveAdmissionCrmRegistrationSettingsPermissions');
    expect(registration).toContain('canManageRegistrationTemplates');
    expect(registration).toContain('canPublishRegistrationTemplates');
    expect(registration).toContain('canManageFormNumberSeries');
    expect(registration).toContain("action === 'publish' || action === 'retire'");
    expect(registration).toContain('requiresPublishPermission && !canPublishRegistrationTemplates');
    expect(registration).toContain('!requiresPublishPermission && !canManageRegistrationTemplates');
    expect(registration).toMatch(
      /template\.status === AdmissionCrmRegistrationTemplateStatus\.Published &&\s+canPublishRegistrationTemplates/
    );
    expect(registration).toContain("'View Registration Template'");
    expect(registration).toContain("'Edit form number series'");
    expect(registration).toContain("'View form number series'");
  });
});
