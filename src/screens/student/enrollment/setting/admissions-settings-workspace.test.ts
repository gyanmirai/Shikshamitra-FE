import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Enrollment settings route contracts', () => {
  const sections = [
    'journey',
    'inquiry-capture',
    'routing-scoring',
    'entrance-exams',
    'registration-documents',
    'offers-seats',
    'activation',
    'governance',
    'communications',
    'automation',
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
    expect(setupCenter).toContain('<CustomBreadcrumbs');
    expect(setupCenter).toContain('heading="Enrollment Setup Center"');
    expect(setupCenter).toContain("{ name: 'Student Enrollment', href: withCycle");
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
      'admissions-seat-pool-configuration.tsx',
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
    expect(menu).toContain("title: 'Admission Journey'");
    expect(menu).toContain("title: 'Exam & Eligibility'");
    expect(menu).toContain('studentPaths.enrollment.settingsSections.automation');
    expect(menu.match(/preserveQueryParams: \['cycle'\]/g)).toHaveLength(19);
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
    expect(settingsPage).toContain('EnrollmentSettingsPanelTabs');
    expect(settingsPage).toContain('EnrollmentSettingsSetupSteps');
    expect(settingsPage).toContain('<Stepper');
    expect(settingsPage).toContain('<StepButton');
    expect(settingsPage).toContain('component={RouterLink}');
    expect(settingsPage).toContain('href={getPanelHref(option.value)}');
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

    expect(settingsPage).toContain('<CustomBreadcrumbs');
    expect(settingsPage).toContain("{ name: 'Settings', href:");
    expect(settingsPage).toContain('sx={{ px: 2 }}');
    expect(settingsShell).toContain("flexDirection: 'column'");
    expect(examRoute).toContain('fillAvailableHeight');
    expect(playbooks).toContain('wrapperProps={{ sx: { minHeight: 320 } }}');
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
    expect(workspaceHeader).toContain('sx={{ px: 2 }}');
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

  it('adds administrator help and duplicate actions to dense Admission Journey settings', () => {
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
    expect(playbooks).toContain("label: 'Scope'");
    expect(registrations).toContain("label: 'Registration Fee'");
    expect(registrations).toContain("label: 'Issue Method'");
  });

  it('offers a concise school-first exam setup while retaining advanced rules', () => {
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

    expect(playbooks).toContain('Quick admission setup');
    expect(playbooks).toContain('Written entrance exam');
    expect(playbooks).toContain('Student interaction only');
    expect(playbooks).toContain('No entrance assessment');
    expect(playbooks).toContain('Generate hall tickets for this exam');
    expect(playbooks).toContain('Advanced setup');
    expect(playbooks).toContain('hallTicketEnabled: false');
    expect(route).toContain('whether the school issues hall tickets');
  });

  it('explains operational handoffs and progressively discloses applicant stage editing', () => {
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

    expect(guidance).toContain('Applicant journey');
    expect(guidance).toContain('gridTemplateColumns');
    expect(guidance).toContain('Automatic stage');
    expect(guidance).toContain('Ready to Invite');
    expect(configuration).toContain('Applicant Stages');
    expect(configuration).toContain('<Accordion');
    expect(configuration).toContain('Staff can move applicants to');
    expect(configuration).not.toContain('Pipeline Stages');
  });

  it('protects every exposed draft editor and uses staff selectors for delegation', () => {
    const protectedEditors = [
      'admissions-crm-configuration.tsx',
      'admissions-playbook-configuration.tsx',
      'admissions-registration-configuration.tsx',
      'admissions-document-configuration.tsx',
      'admissions-seat-pool-configuration.tsx',
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
});
