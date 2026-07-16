import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Student Enrollment workspace route contracts', () => {
  it.each([
    ['overview', 'EnrollmentOverviewWorkspace'],
    ['pipeline', 'AdmissionsPipelineWorkspace'],
    ['exams', 'AdmissionsExamsWorkspace'],
    ['registrations', 'AdmissionsRegistrationsWorkspace'],
    ['offers-seats', 'AdmissionsOffersWorkspace'],
    ['activation', 'AdmissionsActivationWorkspace'],
    ['operations', 'AdmissionsOperationsWorkspace'],
    ['analytics', 'AdmissionsAnalyticsWorkspace'],
  ])('binds %s to its route-specific workspace', (route, workspaceComponent) => {
    const source = read('src', 'app', '(auth-route)', 'student', 'enrollment', route, 'page.tsx');
    expect(source).toContain(workspaceComponent);
  });

  it('uses route-owned workspace components instead of a shared mode-driven screen', () => {
    const source = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'workspace-pages.tsx'
    );
    [
      'PipelineWorkspace',
      'ExamsWorkspace',
      'RegistrationsWorkspace',
      'OffersWorkspace',
      'ActivationWorkspace',
      'OperationsWorkspace',
      'AnalyticsWorkspace',
    ].forEach((workspace) => expect(source).toContain(workspace));
    expect(source).not.toContain('StudentAdmissionsCrmScreen');
    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          'src',
          'screens',
          'student',
          'enrollment',
          'admissions-crm',
          'index.tsx'
        )
      )
    ).toBe(false);
  });

  it('redirects the Enrollment root to the role-focused overview', () => {
    const source = read('src', 'app', '(auth-route)', 'student', 'enrollment', 'page.tsx');
    expect(source).toContain("redirect('/student/enrollment/overview')");
  });

  it('keeps bounded server pagination and debounced staff search in owning workspaces', () => {
    const pipeline = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'pipeline-workspace.tsx'
    );
    const operations = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'operations-queue-workspace.tsx'
    );
    const board = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'pipeline-stage-column.tsx'
    );

    expect(pipeline).toContain('const pageSize = 50');
    expect(operations).toContain('const pageSize = 50');
    expect(pipeline).toContain('setDebouncedStaffSearch');
    expect(operations).toContain('setDebouncedOwnerSearch');
    expect(operations).toContain('setDebouncedAssigneeSearch');
    expect(board).toContain('const PAGE_SIZE = 25');
    expect(board).toContain('Load more');
    expect(board).toContain('IntersectionObserver');
    expect(board).toContain('!academicYearId || !shouldLoad');
  });

  it('uses configurable employee-backed owners and employee task assignees', () => {
    const pipeline = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'pipeline-workspace.tsx'
    );
    const overview = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'applicant-workspace-overview.tsx'
    );
    const settings = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-crm-configuration.tsx'
    );

    expect(pipeline).toContain('ownerOnly: true');
    expect(overview).toContain('ownerOnly: true');
    expect(settings).toContain('label="Pipeline owners"');
    expect(settings).toContain('ownerOnly: true');
    expect(settings).toContain('Only active HR employees with Enrollment CRM access');
  });

  it('filters pipeline owners through the shared table instead of a separate list filter', () => {
    const pipeline = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'pipeline-workspace.tsx'
    );

    expect(pipeline).not.toContain('label="Pipeline owner"');
    expect(pipeline).toContain("column: 'ownerUserId'");
    expect(pipeline).toContain("owner: getLatestStringFilter(filters, 'ownerUserId')");
    expect(pipeline).toContain('enumOptions: ownerFilterOptions');
  });

  it('keeps the Enrollment navigation and registration title concise', () => {
    const menu = read('src', 'constants', 'student-menu.ts');
    const registration = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'registrations-workspace.tsx'
    );

    expect(menu).toContain("title: 'Registration'");
    expect(menu).not.toContain("title: 'Registrations & Documents'");
    expect(registration).toContain('title="Registration"');
  });

  it('pins the entrance exam admission status beside the actions column', () => {
    const exams = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'exams-workspace.tsx'
    );

    expect(exams).toContain("label: 'Admission status'");
    expect(exams).toContain("stickyPosition: 'right'");
    expect(exams).toContain('icon="solar:clock-circle-bold-duotone"');
    expect(exams).toContain('icon="solar:door-2-bold-duotone"');
  });

  it('keeps free-text applicant searches out of URL state', () => {
    const state = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'enrollment-workspace-state.ts'
    );
    expect(state).not.toContain("set('search'");
    expect(state).not.toContain("set('phone'");
    expect(state).not.toContain("set('email'");
  });

  it('uses the global vertical menu without rendering duplicate workspace navigation', () => {
    const shell = read('src', 'screens', 'student', 'enrollment', 'enrollment-shell.tsx');
    expect(shell).not.toContain('Student enrollment workspaces');
    expect(shell).not.toContain('enrollmentRoutes');
    expect(shell).not.toContain('RouterLink');
    expect(shell).not.toContain('<Drawer');
  });

  it('resolves the admission cycle from URL state or the global academic-year selection', () => {
    const context = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'enrollment-workspace-context.tsx'
    );
    expect(context).toContain("current.get('cycle') || (currentYear?.id as string | undefined)");
    expect(context).not.toContain("searchParams.get('search')");
  });

  it('uses the shared project table and action patterns throughout Enrollment', () => {
    const tableFiles = [
      'pipeline-workspace.tsx',
      'exams-workspace.tsx',
      'operations-queue-workspace.tsx',
      'analytics-workspace.tsx',
      'rte-allotment-import.tsx',
    ];
    const sources = tableFiles.map((file) =>
      read('src', 'screens', 'student', 'enrollment', 'admissions-crm', file)
    );

    sources.forEach((source) => {
      expect(source).toContain('CustomizableTable');
      expect(source).not.toContain('<Table');
      expect(source).not.toContain('enrollment-table-styles');
    });
    expect(sources.join('\n')).toContain('ThreeDotsActions');
    expect(sources.join('\n')).toContain('enrollmentActionsColumn');
    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          'src',
          'screens',
          'student',
          'enrollment',
          'admissions-crm',
          'enrollment-table-styles.ts'
        )
      )
    ).toBe(false);
  });

  it('keeps shared table sort indicators decorative instead of unnamed buttons', () => {
    const tableHeader = read(
      'src',
      'components',
      'customizabaleTable',
      'components',
      'TableHeader.tsx'
    );

    expect(tableHeader).not.toContain('<IconButton');
    expect(tableHeader).toContain('aria-hidden="true"');
  });

  it('keeps the simulated scale contract paginated instead of materializing 25,000 leads', () => {
    const fixture = read('e2e', 'student', 'fixtures', 'admission-crm-scale.ts');
    const browserFlow = read('e2e', 'student', 'admissions-crm-flow.guest.spec.ts');

    expect(fixture).toContain('admissionCrmScaleTotal = 25_000');
    expect(fixture).toContain('length: maxResultCount');
    expect(fixture).not.toContain('length: admissionCrmScaleTotal');
    expect(browserFlow).toContain('toHaveCount(50)');
    expect(browserFlow).toContain("has('stage') ? 25 : 50");
    expect(browserFlow).toContain('toBeLessThanOrEqual(25)');
  });

  it('does not expose raw staff identifiers or editable provider JSON in ordinary UI', () => {
    const workspaceSources = [
      'pipeline-workspace.tsx',
      'operations-queue-workspace.tsx',
      'applicant-workspace-drawer.tsx',
    ]
      .map((file) => read('src', 'screens', 'student', 'enrollment', 'admissions-crm', file))
      .join('\n');
    const settings = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-crm-configuration.tsx'
    );

    expect(workspaceSources).not.toContain('Owner user ID');
    expect(workspaceSources).not.toContain('Assigned to user ID');
    expect(settings).not.toContain('label="Settings JSON"');
  });

  it('keeps removed legacy Enrollment routes and clients absent', () => {
    const removedPaths = [
      ['src', 'app', '(auth-route)', 'student', 'enrollment', 'follow-up', 'page.tsx'],
      ['src', 'app', '(auth-route)', 'student', 'enrollment', 'enroll', 'page.tsx'],
      [
        'src',
        'app',
        '(auth-route)',
        'student',
        'enrollment',
        'enrollment-status-tracking',
        'page.tsx',
      ],
      ['src', 'redux', 'student', 'follow-up', 'follow-up-api.ts'],
      ['src', 'redux', 'student', 'registration-form', 'registration-form-api.ts'],
      ['src', 'redux', 'student', 'inquiry', 'inquiry-api.ts'],
    ];

    removedPaths.forEach((segments) => {
      expect(fs.existsSync(path.join(process.cwd(), ...segments)), segments.join('/')).toBe(false);
    });
  });
});
