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

  it('binds the dynamic applicant route and protects it with Pipeline view permission', () => {
    const route = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'applicants',
      '[leadId]',
      'page.tsx'
    );
    const workspaces = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'workspace-pages.tsx'
    );
    const applicantWorkspace = workspaces.slice(
      workspaces.indexOf('export const AdmissionsApplicantWorkspace'),
      workspaces.indexOf('export const AdmissionsExamsWorkspace')
    );

    expect(route).toContain('params: Promise<{ leadId: string }>');
    expect(route).toContain('const { leadId } = await params');
    expect(route).toContain('<AdmissionsApplicantWorkspace leadId={leadId} />');
    expect(applicantWorkspace).toContain(
      '<StudentPermissionGuard permissionKey={studentPermissions.enrollment.pipeline}>'
    );
    expect(applicantWorkspace).toContain('<ApplicantWorkspace leadId={leadId} />');
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
      'AdmissionCyclesWorkspace',
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

  it('binds the Enrollment root to the operational My Work entry point', () => {
    const source = read('src', 'app', '(auth-route)', 'student', 'enrollment', 'page.tsx');
    expect(source).toContain('AdmissionsOverviewWorkspace');
    expect(source).not.toContain('redirect(');
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
    expect(pipeline).toContain('setSelectedLeadIds([])');
    expect(pipeline).toContain('onSearchInputChange={(value)');
    expect(pipeline).toContain("updateState({ page: 1 }, 'replace')");
    const context = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'enrollment-workspace-context.tsx'
    );
    expect(context).toContain("window.history.pushState(null, '', href)");
    expect(context).toContain("window.history.replaceState(null, '', href)");
    expect(context).not.toContain('window.history.state');
    expect(context).toContain('useIsomorphicLayoutEffect(() =>');
    expect(context).toContain('window.location.pathname !== pathname');
    expect(context).toContain('pendingNavigationPathRef.current = applicantPath');
    expect(context).toContain('pendingNavigationPathRef.current !== pathname');
    expect(context).toContain('areSearchParamsEquivalent(liveSearchParams, current)');
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
    const root = read('src', 'app', '(auth-route)', 'student', 'enrollment', 'page.tsx');
    const cyclesRoute = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'settings',
      'admission-cycles',
      'page.tsx'
    );
    const registration = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'registrations-workspace.tsx'
    );

    expect(menu).toContain("title: 'Admission Cycles'");
    expect(menu).toContain("admissionCycles: '/student/enrollment/settings/admission-cycles'");
    expect(menu).not.toContain('path: studentPaths.enrollment.admissionCycles');
    expect(root).toContain('AdmissionsOverviewWorkspace');
    expect(cyclesRoute).toContain('AdmissionsCyclesWorkspace');
    expect(menu).toContain("title: 'Registration'");
    expect(menu).not.toContain("title: 'Registrations & Documents'");
    expect(registration).toContain('title="Registration"');
  });

  it('keeps Class Placement Plan wording user-facing while preserving offers-seats URLs', () => {
    const menu = read('src', 'constants', 'student-menu.ts');
    const setup = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-setup-center.tsx'
    );
    const offers = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'offers-workspace.tsx'
    );

    expect(menu).toContain("title: 'Class Placement Plan'");
    expect(menu).toContain("offersSeats: '/student/enrollment/offers-seats'");
    expect(setup).toContain("title: 'Class Placement Plan'");
    expect(offers).toContain('title="Offers & Class Placement Plan"');
  });

  it('wires Admission Cycles through setup RTK Query endpoints', () => {
    const api = read('src', 'redux', 'student', 'admissions-crm', 'admissions-crm-api.ts');
    const workspace = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'admission-cycles-workspace.tsx'
    );
    const detailWorkspace = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'admission-cycle-detail-workspace.tsx'
    );
    const detailRoute = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'settings',
      'admission-cycles',
      '[academicYearId]',
      'page.tsx'
    );
    const academicYearToken = ['$', '{academicYearId}'].join('');

    expect(api).toContain('getAdmissionCrmCycles');
    expect(api).toContain("url: '/student-enrollment/admissions-crm/setup/cycles'");
    expect(api).toContain('getAdmissionCrmCycleSummary');
    expect(api).toContain(
      `/student-enrollment/admissions-crm/setup/cycles/${academicYearToken}/summary`
    );
    expect(api).toContain('getAdmissionCrmApplicationStagePolicy');
    expect(api).toContain(
      `/student-enrollment/admissions-crm/setup/cycles/${academicYearToken}/stage-policy`
    );
    expect(api).toContain('previewAdmissionCrmApplicationStagePolicy');
    expect(api).toContain('updateAdmissionCrmApplicationStagePolicy');
    expect(workspace).toContain('useGetAdmissionCrmCyclesQuery');
    expect(workspace).toContain('CustomizableTable');
    expect(workspace).toContain('tableId="student-enrollment-admission-cycles"');
    expect(workspace).toContain('getAdmissionCycleWorkspaceHref');
    expect(workspace).not.toContain('useGetAdmissionCrmCycleSummaryQuery');
    expect(workspace).not.toContain('CycleSummaryPanel');
    expect(detailRoute).toContain('params: Promise<{ academicYearId: string }>');
    expect(detailRoute).toContain(
      '<AdmissionsCycleDetailWorkspace academicYearId={academicYearId} />'
    );
    expect(detailWorkspace).toContain('useGetAdmissionCrmCycleSummaryQuery');
    expect(detailWorkspace).toContain('Guided setup');
    expect(detailWorkspace).toContain('Journey rules');
    expect(detailWorkspace).toContain('ApplicationStagePolicyPanel');
    expect(detailWorkspace).toContain('Configured journey');
    expect(detailWorkspace).toContain('Fees and Class Placement Plan');
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

  it('keeps My Work search and filters shareable in URL state', () => {
    const state = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'enrollment-workspace-state.ts'
    );
    expect(state).toContain("set('search'");
    expect(state).toContain("set('workType'");
    expect(state).toContain("set('urgency'");
    expect(state).not.toContain("set('phone'");
    expect(state).not.toContain("set('email'");
  });

  it('renders legacy or unknown admission pathway values without crashing Pipeline', () => {
    const pipeline = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'pipeline-workspace.tsx'
    );

    expect(pipeline).toContain("typeof value === 'string' && /^\\d+$/.test(value)");
    expect(pipeline).toContain("|| 'Unknown pathway'");
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
      'overview-workspace.tsx',
      'admission-cycles-workspace.tsx',
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
    expect(sources[0]).toContain("stickyPosition: 'left'");
    expect(sources[0]).toContain('actionLabels[item.recommendedAction]');
    expect(sources[0]).toContain('<PriorityIndicator');
    expect(sources[0]).toContain('variant="outlined"');
    expect(sources[0]).toContain("color={isCompletionAction ? 'success' : 'primary'}");
    expect(sources[0]).toContain('<TaskAltRounded aria-hidden="true" />');
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

  it('keeps every paginated Enrollment workspace server-filtered and server-sorted', () => {
    const paginatedTableFiles = [
      'overview-workspace.tsx',
      'pipeline-workspace.tsx',
      'exams-workspace.tsx',
      'operations-queue-workspace.tsx',
    ];

    paginatedTableFiles.forEach((file) => {
      const source = read('src', 'screens', 'student', 'enrollment', 'admissions-crm', file);
      expect(source, file).toContain('serverSideFilter');
      expect(source, file).toContain('onServerFilter');
      expect(source, file).toContain('serverSideSort');
      expect(source, file).toContain('onServerSort');
    });

    const analytics = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'analytics-workspace.tsx'
    );
    const rteImport = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'rte-allotment-import.tsx'
    );
    expect(analytics).not.toContain('isFilter={false}');
    expect(rteImport).not.toContain('isFilter={false}');
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
      'applicant-workspace-page.tsx',
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
