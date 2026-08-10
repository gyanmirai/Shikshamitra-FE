import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';
import { readEnrollmentSource } from '../enrollment-source-contract';

const read = readEnrollmentSource;

describe('Student Enrollment workspace route contracts', () => {
  it.each([
    ['my-work', 'AdmissionsOverviewWorkspace'],
    ['pipeline', 'AdmissionsPipelineWorkspace'],
    ['entrance-exams', 'AdmissionsExamsWorkspace'],
    ['visits-events', 'AdmissionsEventsWorkspace'],
    ['registration', 'AdmissionsRegistrationsWorkspace'],
    ['class-placement', 'AdmissionsOffersWorkspace'],
    ['activation', 'AdmissionsActivationWorkspace'],
    ['follow-ups-messages', 'AdmissionsOperationsWorkspace'],
    ['reports', 'AdmissionsAnalyticsWorkspace'],
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
    ].forEach((workspace) => expect(source).toContain(workspace));
    expect(source).not.toContain('StudentAdmissionsCrmScreen');
    expect(source).toContain('EnrollmentWorkspaceLoadingState');
    expect(source).not.toContain('SplashScreen');
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

  it('redirects the Enrollment root to the canonical My Work route', () => {
    const source = read('src', 'app', '(auth-route)', 'student', 'enrollment', 'page.tsx');
    expect(source).toContain(
      'redirectEnrollmentRoute(studentPaths.enrollment.myWork, searchParams)'
    );
  });

  it.each([
    ['overview', 'studentPaths.enrollment.myWork'],
    ['exams', 'studentPaths.enrollment.entranceExams'],
    ['registrations', 'studentPaths.enrollment.registration'],
    ['offers-seats', 'studentPaths.enrollment.classPlacement'],
    ['operations', 'studentPaths.enrollment.followUpsMessages'],
    ['analytics', 'studentPaths.enrollment.reports'],
  ])('redirects the legacy %s route without discarding URL state', (route, destination) => {
    const source = read('src', 'app', '(auth-route)', 'student', 'enrollment', route, 'page.tsx');
    expect(source).toContain('searchParams: EnrollmentRouteSearchParams');
    expect(source).toContain(`redirectEnrollmentRoute(${destination}, searchParams)`);
  });

  it('preserves repeated query values and explicit route overrides during redirects', () => {
    const source = read('src', 'routes', 'enrollment-redirect.ts');
    expect(source).toContain('value.forEach((entry) => query.append(key, entry))');
    expect(source).toContain('Object.entries(overrides)');
    expect(source).toContain('query.set(key, value)');
    expect(source).toMatch(/`\$\{destination\}\?\$\{serialized\}`/);
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
    expect(context).toContain('const href = query ?');
    expect(context).toContain('pathname}?');
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
    const contextRail = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'applicant-context-rail.tsx'
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
    expect(contextRail).toContain('ownerOnly: true');
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
    const admissionYearRoute = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'settings',
      'admission-year',
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

    expect(menu).toContain("title: 'Admission Year Setup'");
    expect(menu).toContain("myWork: '/student/enrollment/my-work'");
    expect(menu).toContain("admissionYear: '/student/enrollment/settings/admission-year'");
    expect(menu).not.toContain("'/student/enrollment/overview'");
    expect(menu).not.toContain("'/student/enrollment/settings/admission-cycles'");
    expect(root).toContain('studentPaths.enrollment.myWork');
    expect(admissionYearRoute).toContain('AdmissionYearSetup');
    expect(menu).toContain("title: 'Registration'");
    expect(menu).not.toContain("title: 'Registrations & Documents'");
    expect(registration).toContain('title="Registration"');
  });

  it('uses Class Placement wording and a canonical class-placement URL', () => {
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
    const legacyRoute = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'offers-seats',
      'page.tsx'
    );

    expect(menu).toContain("title: 'Class Placement'");
    expect(menu).toContain("classPlacement: '/student/enrollment/class-placement'");
    expect(menu).not.toContain("'/student/enrollment/offers-seats'");
    expect(setup).toContain("title: 'Class Placement Settings'");
    expect(offers).toContain('title="Class Placement"');
    expect(legacyRoute).toContain('studentPaths.enrollment.classPlacement');
  });

  it('uses the shared compact icon stage filter across enrollment worklists', () => {
    const worklists = [
      ['registrations-workspace.tsx', 'Registration Stage'],
      ['offers-workspace.tsx', 'Placement Stage'],
      ['activation-workspace.tsx', 'Activation Stage'],
      ['operations-workspace.tsx', 'Follow-up Focus'],
    ] as const;

    worklists.forEach(([file, label]) => {
      const source = read('src', 'screens', 'student', 'enrollment', 'admissions-crm', file);
      expect(source, file).toContain(`label: '${label}'`);
      expect(source, file).toContain("icon: 'mdi:");
      expect(source, file).toContain('tableConfiguration=');
    });

    const stageFilter = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'applicant-worklist-stage-filter.tsx'
    );
    expect(stageFilter).toContain('minHeight: 44');
    expect(stageFilter).toContain("width: '100%'");
    expect(stageFilter).toContain('aria-hidden="true"');
  });

  it('wires the versioned Admission Year Setup through dedicated RTK Query endpoints', () => {
    const api = [
      read('src', 'redux', 'student', 'admissions-crm', 'setup-playbooks-api.ts'),
      read('src', 'redux', 'student', 'admissions-crm', 'operations-governance-api.ts'),
    ].join('\n');
    const workspace = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admission-year-setup.tsx'
    );
    const legacyDetailRoute = read(
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

    expect(api).toContain(
      `/student-enrollment/admissions-crm/setup/admission-years/${academicYearToken}/versions`
    );
    expect(api).toContain(
      `/student-enrollment/admissions-crm/setup/admission-years/${academicYearToken}/standard-options`
    );
    expect(api).toContain('createAdmissionCrmAdmissionYearDraft');
    expect(api).toContain('updateAdmissionCrmAdmissionYearDraft');
    expect(api).toContain('publishAdmissionCrmAdmissionYear');
    expect(api).toContain('closeAdmissionCrmAdmissionYear');
    expect(workspace).toContain('useGetAdmissionCrmAdmissionYearVersionsQuery');
    expect(workspace).toContain('useGetAdmissionCrmAdmissionYearStandardOptionsQuery');
    expect(workspace).toContain('useCreateAdmissionCrmAdmissionYearDraftMutation');
    expect(workspace).toContain('usePublishAdmissionCrmAdmissionYearMutation');
    expect(workspace).toContain('<Stepper');
    expect(workspace).toContain("'Admission scope'");
    expect(workspace).toContain("'Dates and gates'");
    expect(workspace).toContain("'Ownership'");
    expect(workspace).toContain("'Review and publish'");
    expect(workspace).toContain('CustomizableTable');
    expect(workspace).toContain('tableId="student-enrollment-admission-year-versions"');
    expect(legacyDetailRoute).toContain('{ cycle: academicYearId }');
    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          'src',
          'screens',
          'student',
          'enrollment',
          'admissions-crm',
          'admission-cycle-detail-workspace.tsx'
        )
      )
    ).toBe(false);
  });

  it.each([
    ['journey', 'pipeline'],
    ['inquiry-capture', 'pipeline'],
    ['routing-scoring', 'pipeline'],
    ['entrance-exams', 'entranceExam'],
    ['registration-documents', 'registration'],
    ['offers-seats', 'classPlacement'],
    ['communications', 'communication'],
    ['automation', 'communication'],
  ])('redirects the legacy %s settings route to %s', (route, destination) => {
    const source = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'settings',
      route,
      'page.tsx'
    );
    expect(source).toContain(`studentPaths.enrollment.settingsSections.${destination}`);
    expect(source).toContain('searchParams');
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

  it('keeps applicant-entered table searches private while structural filters remain shareable', () => {
    const state = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'enrollment-workspace-state.ts'
    );
    const myWork = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'overview-workspace.tsx'
    );
    const applicantWorklist = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'applicant-worklist-workspace.tsx'
    );
    expect(state).toContain("set('search'");
    expect(state).toContain("set('workType'");
    expect(state).toContain("set('urgency'");
    expect(state).not.toContain("set('phone'");
    expect(state).not.toContain("set('email'");
    [myWork, applicantWorklist].forEach((source) => {
      expect(source).toContain('useWorkspaceTableSessionState');
      expect(source).not.toContain("searchParams.get('search')");
    });
    expect(myWork).not.toContain("searchParams.get('applicantSearch')");
    expect(myWork).not.toContain("searchParams.get('targetClassSearch')");
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
    expect(pipeline).toContain("|| 'Unknown admission pathway'");
  });

  it('uses the global vertical menu without rendering duplicate workspace navigation', () => {
    const shell = read('src', 'screens', 'student', 'enrollment', 'enrollment-shell.tsx');
    expect(shell).not.toContain('Student enrollment workspaces');
    expect(shell).not.toContain('enrollmentRoutes');
    expect(shell).not.toContain('RouterLink');
    expect(shell).not.toContain('<Drawer');
  });

  it('resolves the admission year from URL state or the global academic-year selection', () => {
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
      'pipeline-workspace.tsx',
      'exams-workspace.tsx',
      'applicant-worklist-workspace.tsx',
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

  it('keeps shared table sort and filter actions keyboard accessible and explicitly named', () => {
    const tableHeader = read(
      'src',
      'components',
      'customizabaleTable',
      'components',
      'TableHeader.tsx'
    );

    expect(tableHeader).toContain('<ButtonBase');
    expect(tableHeader).toContain('<IconButton');
    expect(tableHeader).toContain('aria-label={`Sort by');
    expect(tableHeader).toContain('aria-label={`Filter');
    expect(tableHeader).toContain('aria-hidden="true"');
  });

  it('keeps filter-capable paginated Enrollment workspaces server-filtered and server-sorted', () => {
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
      expect(source, file).toContain('serverSideSortMode="single"');
      expect(source, file).toContain('onServerSort');
      expect(source, file).toContain('parseEnrollmentTableSorts');
    });

    const applicantWorklist = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'applicant-worklist-workspace.tsx'
    );
    expect(applicantWorklist).toContain('serverSideSearch');
    expect(applicantWorklist).toContain('serverSideSort');
    expect(applicantWorklist).toContain('serverSideSortMode="single"');
    expect(applicantWorklist).toContain('parseEnrollmentTableSorts');
    expect(applicantWorklist).toContain('state.pipelineColumn');
    expect(applicantWorklist).toContain(
      'updateState({ pipelineColumn: value, queue: undefined, page: 1 })'
    );
    expect(applicantWorklist).not.toContain("searchParams.get('worklist')");

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
    expect(analytics).toContain('key={reportView}');
    expect(analytics).toContain('tableId={`student-enrollment-admission-report-');
    expect(rteImport).not.toContain('isFilter={false}');
  });

  it('keeps the simulated scale contract paginated instead of materializing 25,000 leads', () => {
    const fixture = read('e2e', 'student', 'fixtures', 'admission-crm-scale.ts');
    const browserFlow = read('e2e', 'student', 'admissions-crm-flow.guest.spec.ts');

    expect(fixture).toContain('admissionCrmScaleTotal = 25_000');
    expect(fixture).toContain('length: maxResultCount');
    expect(fixture).not.toContain('length: admissionCrmScaleTotal');
    expect(browserFlow).toContain('toHaveCount(50)');
    expect(browserFlow).toContain("has('pipelineColumn') ? 25 : 50");
    expect(browserFlow).toContain('toBeLessThanOrEqual(25)');

    const boardColumn = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'pipeline-stage-column.tsx'
    );
    expect(boardColumn).toContain('pipelineColumn: column.key');
    expect(boardColumn).toContain('data-pipeline-column={column.key}');
    expect(boardColumn).toContain("color: 'text.primary'");
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
