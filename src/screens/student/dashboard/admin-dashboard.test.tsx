import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { loadUser } from 'src/redux/auth/authSlice';
import { setCurrentYear } from 'src/redux/globalState/globalSlice';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';
import { studentOnboardingApi } from 'src/redux/student/onboarding/student-onboarding-api';

import {
  mountAdmin,
  adminContext,
  adminSection,
  navigateAdmin,
  getAdminStore,
  adminRequests,
  adminNavigation,
  adminPermissions,
  deferAdminResponse,
} from './admin-test-harness';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
// Real shared tables and MUI menus render alongside several authenticated reads.
vi.setConfig({ testTimeout: 15000 });
const ready = () =>
  screen.findByRole('link', { name: 'Active students: 111. Open workspace' }, { timeout: 5000 });
const sectionRequests = () =>
  adminRequests.filter(({ path }) => ['records', 'admissions', 'attendance'].includes(path));
const scopedQuery = 'year=year-1&board=board-1&medium=medium-1&class=class-5&division=division-a';
const select = async (label: string, option: string) => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(await screen.findByRole('option', { name: option }));
};

describe('Admin Student dashboard with real shared components and scoped RTK reads', () => {
  it('combines operational work, individual blockers and class divisions without module tabs or duplicate reads', async () => {
    mountAdmin();
    await ready();
    await screen.findByRole('link', { name: 'Open setup for Aarav Shah' });
    expect(screen.getByText('GR number missing')).toBeVisible();
    expect(screen.getByText('Riya Patel')).toBeVisible();
    expect(screen.getByText('Showing 1 of 21 setup cases needing attention')).toBeVisible();
    [
      'Students needing attention',
      'Decisions & follow-ups',
      'Onboarding tasks',
      'Class & division overview',
      "Today's attendance",
    ].forEach((title) => {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(
      within(screen.getByTestId('dashboard-attention-preview')).queryByRole('button', {
        name: /filter/i,
      })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(adminRequests.map(({ path }) => path).sort()).toEqual([
        'admissions',
        'attendance',
        'context',
        'filters',
        'records',
      ])
    );
  });

  it('keeps zero student counts distinct from loading and shows real empty work without invented health', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/sections/:section', ({ params }) =>
        HttpResponse.json(
          adminSection(
            String(params.section) as 'records' | 'admissions' | 'attendance',
            'year-1',
            0
          )
        )
      )
    );
    mountAdmin();
    await screen.findByRole('link', { name: 'Active students: 0. Open workspace' });
    await screen.findByText('No setup cases need attention');
    expect(screen.getByText('No pending decisions')).toBeVisible();
    expect(screen.getByText('No pending setup tasks')).toBeVisible();
    expect(screen.getAllByRole('img', { name: 'empty content' })).toHaveLength(3);
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open setup for/ })).not.toBeInTheDocument();
  });

  it('keeps filters compact and exposes helper guidance through focusable custom tooltips', async () => {
    mountAdmin();
    await ready();
    expect(screen.queryByText(/^Updated /)).not.toBeInTheDocument();
    expect(screen.queryByText('Select a class first')).not.toBeInTheDocument();
    expect(screen.queryByText(/Task groups may overlap/)).not.toBeInTheDocument();
    const info = screen.getByRole('button', { name: 'About Onboarding tasks' });
    act(() => info.focus());
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Activation readiness is checked again in Onboarding.'
    );
    act(() => info.blur());
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    const divisionInfo = screen.getByRole('button', { name: 'About Division filter' });
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    act(() => divisionInfo.focus());
    expect(divisionInfo).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Select a class first to choose a division.'
    );
  });

  it('does not show empty success illustrations when setup or decision data fails to load', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/sections/admissions', () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    mountAdmin();
    await ready();
    await screen.findByText(/Onboarding tasks could not be loaded/);
    expect(screen.queryByText('No pending setup tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('No setup cases need attention')).not.toBeInTheDocument();
    expect(screen.queryByText('No pending decisions')).not.toBeInTheDocument();
    expect(screen.getByText(/This queue may be incomplete/)).toBeVisible();
  });

  it('retains the header and loading state while an authorized section is pending', async () => {
    let release: (() => void) | undefined;
    mswServer.use(
      http.get('*/api/students/dashboard/sections/admissions', async () => {
        const pending = deferAdminResponse();
        ({ release } = pending);
        await pending.promise;
        return HttpResponse.json(adminSection('admissions'));
      })
    );
    mountAdmin();
    await waitFor(() => expect(release).toBeDefined());
    expect(screen.getByRole('heading', { name: 'Student Dashboard' })).toBeVisible();
    expect(screen.getByLabelText('Loading Unfinished onboarding')).toBeVisible();
    expect(
      within(screen.getByTestId('dashboard-attention-preview')).getAllByRole('row')
    ).toHaveLength(5);
    expect(screen.queryByRole('link', { name: /^Active students: 0/ })).not.toBeInTheDocument();
    act(() => release?.());
    await ready();
    await screen.findByRole('link', { name: 'Open setup for Aarav Shah' });
  });

  it('keeps successful sections usable and retries only the failed section', async () => {
    let attempts = 0;
    mswServer.use(
      http.get('*/api/students/dashboard/sections/attendance', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json(adminSection('attendance'));
      })
    );
    mountAdmin();
    await ready();
    const error = await screen.findByText(/Today's attendance could not be loaded/);
    expect(screen.queryByText(/No priority actions/)).not.toBeInTheDocument();
    fireEvent.click(
      within(error.closest('[data-student-feedback]') as HTMLElement).getByRole('button', {
        name: 'Retry',
      })
    );
    await waitFor(() => expect(attempts).toBe(2));
    await waitFor(() =>
      expect(screen.queryByText(/Today's attendance could not be loaded/)).not.toBeInTheDocument()
    );
    expect(adminRequests.filter(({ path }) => path === 'records')).toHaveLength(1);
    expect(adminRequests.filter(({ path }) => path === 'admissions')).toHaveLength(1);
  });

  it('hydrates scope from URLs and sends all four hierarchy filters to every summary exactly once', async () => {
    mountAdmin(adminPermissions, scopedQuery);
    await ready();
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('CBSE');
    expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveTextContent('English');
    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent('Class 5');
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent('A');
    expect(sectionRequests()).toHaveLength(3);
    sectionRequests().forEach(({ query }) =>
      expect(Object.fromEntries(query)).toMatchObject({
        academicYearId: 'year-1',
        boardId: 'board-1',
        mediumId: 'medium-1',
        standardId: 'class-5',
        divisionId: 'division-a',
      })
    );
  });

  it('resets dependent fields when a parent changes and restores prior URL state on navigation', async () => {
    mountAdmin(adminPermissions, scopedQuery);
    await ready();
    await select('Board', 'State Board');
    await waitFor(() =>
      expect(new URLSearchParams(adminNavigation.query).get('board')).toBe('board-2')
    );
    ['medium', 'class', 'division'].forEach((key) =>
      expect(new URLSearchParams(adminNavigation.query).has(key)).toBe(false)
    );
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await waitFor(() =>
      expect(
        sectionRequests().filter(({ query }) => query.get('boardId') === 'board-2')
      ).toHaveLength(3)
    );
    act(() => navigateAdmin(scopedQuery));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent('A')
    );
    await select('Medium', 'All mediums');
    expect(new URLSearchParams(adminNavigation.query).has('class')).toBe(false);
    expect(new URLSearchParams(adminNavigation.query).has('division')).toBe(false);
  });

  it('clears scope through Reset filters and preserves unrelated URL context', async () => {
    mountAdmin(adminPermissions, `${scopedQuery}&source=operations`);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('All boards')
    );
    const query = new URLSearchParams(adminNavigation.query);
    expect(query.get('source')).toBe('operations');
    ['board', 'medium', 'class', 'division'].forEach((key) => expect(query.has(key)).toBe(false));
  });

  it('rejects a stale or incompatible hierarchy before requesting any section and recovers through Clear filters', async () => {
    mountAdmin(adminPermissions, 'year=year-1&board=board-2&medium=medium-1&class=class-5');
    await screen.findByText(/These academic filters are no longer available/);
    expect(sectionRequests()).toEqual([]);
    expect(screen.queryByRole('link', { name: /^Active students:/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    await ready();
    expect(sectionRequests()).toHaveLength(3);
  });

  it('does not request guessed summaries when filter scope cannot be confirmed and retries the filter read', async () => {
    let attempts = 0;
    mswServer.use(
      http.get('*/api/students/dashboard/filters', () => {
        attempts += 1;
        return HttpResponse.json({}, { status: 500 });
      })
    );
    mountAdmin();
    await screen.findByText(/Academic filter choices could not be loaded/);
    expect(sectionRequests()).toEqual([]);
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry filters' }));
    await waitFor(() => expect(attempts).toBe(2));
    expect(sectionRequests()).toEqual([]);
  });

  it('expands A/B divisions using a keyboard-operable control and preserves real workspace links', async () => {
    const user = userEvent.setup();
    mountAdmin();
    await ready();
    const expand = screen.getByRole('button', { name: 'Expand Class 5' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    act(() => expand.focus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Collapse Class 5' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute(
      'href',
      '/student/records/directory?division=division-a'
    );
    expect(screen.getByRole('link', { name: 'B' })).toHaveAttribute(
      'href',
      '/student/records/directory?division=division-b'
    );
    await user.keyboard(' ');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Expand Class 5' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    );
  });

  it('renders unassigned class and division counts without misleading broad workspace links', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/sections/records', () =>
        HttpResponse.json({
          ...adminSection('records'),
          classStrength: [
            { standardId: null, label: 'Unassigned class', students: 4, href: '', divisions: [] },
            {
              standardId: 'class-5',
              label: 'Class 5',
              students: 10,
              href: '/student/records/directory?class=class-5',
              divisions: [
                { divisionId: null, label: 'Unassigned division', students: 3, href: '' },
                {
                  divisionId: 'division-a',
                  label: 'A',
                  students: 7,
                  href: '/student/records/directory?division=division-a',
                },
              ],
            },
          ],
        })
      )
    );
    mountAdmin();
    await ready();
    expect(screen.getByText('Unassigned class')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Unassigned class' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand Class 5' }));
    expect(screen.getByText('Unassigned division')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Unassigned division' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute(
      'href',
      '/student/records/directory?division=division-a'
    );
  });

  it('refreshes only admissions after a successful owner assignment and keeps dashboard reads unchanged after rejection', async () => {
    let admissionsReads = 0;
    let ownerName = 'Riya Patel';
    let rejectAssignment = false;
    const assignments: unknown[] = [];
    mswServer.use(
      http.get('*/api/students/dashboard/sections/admissions', () => {
        admissionsReads += 1;
        const section = adminSection('admissions');
        return HttpResponse.json({
          ...section,
          attentionItems: section.attentionItems?.map((item) => ({ ...item, ownerName })),
        });
      }),
      http.put('*/api/student/onboarding/case-1/owner', async ({ request }) => {
        assignments.push(await request.json());
        if (rejectAssignment)
          return HttpResponse.json(
            { detail: 'The case changed. Reload before assigning an owner.' },
            { status: 409 }
          );
        ownerName = 'Meera Joshi';
        return HttpResponse.json({
          data: {
            id: 'case-1',
            assignedToUserId: 'owner-2',
            assignedToUserName: ownerName,
            concurrencyStamp: 'case-stamp-2',
          },
        });
      })
    );
    mountAdmin();
    await ready();
    await screen.findByText('Riya Patel');
    const store = getAdminStore();
    await act(async () => {
      await store
        .dispatch(
          studentOnboardingApi.endpoints.assignStudentOnboardingOwner.initiate({
            id: 'case-1',
            userId: 'owner-2',
            concurrencyStamp: 'case-stamp-1',
          })
        )
        .unwrap();
      await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
    });
    await screen.findByText('Meera Joshi');
    expect(admissionsReads).toBe(2);
    ['records', 'attendance', 'context', 'filters'].forEach((path) =>
      expect(adminRequests.filter((request) => request.path === path)).toHaveLength(1)
    );
    rejectAssignment = true;
    await act(async () => {
      const result = await store.dispatch(
        studentOnboardingApi.endpoints.assignStudentOnboardingOwner.initiate({
          id: 'case-1',
          userId: 'owner-3',
          concurrencyStamp: 'stale-stamp',
        })
      );
      expect(result).toMatchObject({ error: { status: 409 } });
      await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
    });
    expect(admissionsReads).toBe(2);
    ['records', 'attendance', 'context', 'filters'].forEach((path) =>
      expect(adminRequests.filter((request) => request.path === path)).toHaveLength(1)
    );
    expect(assignments).toEqual([
      { userId: 'owner-2', concurrencyStamp: 'case-stamp-1' },
      { userId: 'owner-3', concurrencyStamp: 'stale-stamp' },
    ]);
    expect(screen.getByText('Meera Joshi')).toBeVisible();
  });

  it('clears old-year data and hierarchy while the next year is loading', async () => {
    let release: (() => void) | undefined;
    mswServer.use(
      http.get('*/api/students/dashboard/sections/records', async ({ request }) => {
        const year = new URL(request.url).searchParams.get('academicYearId') ?? '';
        if (year === 'year-2') {
          const pending = deferAdminResponse();
          ({ release } = pending);
          await pending.promise;
        }
        return HttpResponse.json(adminSection('records', year, year === 'year-2' ? 222 : 111));
      })
    );
    mountAdmin(adminPermissions, scopedQuery);
    await ready();
    act(() => {
      getAdminStore().dispatch(setCurrentYear({ id: 'year-2', name: '2027–28' }));
    });
    await waitFor(() => expect(release).toBeDefined());
    expect(screen.queryByRole('link', { name: /^Active students: 111/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Expand Class 5' })).not.toBeInTheDocument();
    expect(new URLSearchParams(adminNavigation.query).has('class')).toBe(false);
    expect(
      sectionRequests()
        .filter(({ query }) => query.get('academicYearId') === 'year-2')
        .every(({ query }) => !query.has('boardId') && !query.has('standardId'))
    ).toBe(true);
    act(() => release?.());
    await screen.findByRole('link', { name: 'Active students: 222. Open workspace' });
  });

  it('does not render or request dashboard content without the dashboard view permission', async () => {
    mountAdmin(adminPermissions.filter(({ name }) => name !== 'Students.Dashboard.View'));
    await screen.findByText(/do not have permission/);
    expect(adminRequests).toEqual([]);
    expect(screen.queryByText('Aarav Shah')).not.toBeInTheDocument();
  });

  it('does not expose onboarding data when its module visibility is missing even if responses contain it', async () => {
    mountAdmin(
      adminPermissions.filter(({ name }) => name !== 'ShikshaMitra.Module.Students.Onboarding')
    );
    await ready();
    expect(screen.queryByText('Aarav Shah')).not.toBeInTheDocument();
    expect(screen.queryByText('Students needing attention')).not.toBeInTheDocument();
    expect(screen.queryByText('Onboarding tasks')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Unfinished onboarding:/ })).not.toBeInTheDocument();
  });

  it('removes old authorized content immediately after permission identity changes while access is rechecked', async () => {
    let release: (() => void) | undefined;
    mountAdmin();
    await ready();
    await screen.findByText('Aarav Shah');
    mswServer.use(
      http.get('*/api/students/dashboard/context', async () => {
        const pending = deferAdminResponse();
        ({ release } = pending);
        await pending.promise;
        return HttpResponse.json({ ...adminContext, sections: [], links: [] });
      })
    );
    const store = getAdminStore();
    act(() => {
      store.dispatch(loadUser.pending('updated-permissions', {}));
      store.dispatch(
        loadUser.fulfilled(
          {
            user: { sub: 'admin-1' },
            mainModuleVisibility: [],
            permissionData: adminPermissions.filter(
              ({ name }) => name !== 'Students.Onboarding.View'
            ),
            sessionContext: {
              accountMode: 'tenant',
              tenantId: 'school-1',
              canViewTenants: false,
              canCreateTenants: false,
              canUpdateTenants: false,
              canManageTenantStatus: false,
            },
          },
          'updated-permissions',
          {}
        )
      );
    });
    await waitFor(() => expect(release).toBeDefined());
    expect(screen.queryByText('Aarav Shah')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Active students:/ })).not.toBeInTheDocument();
    act(() => release?.());
    await waitFor(() =>
      expect(screen.queryByLabelText('Loading student dashboard')).not.toBeInTheDocument()
    );
  });
});
