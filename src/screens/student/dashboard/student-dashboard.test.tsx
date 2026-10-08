import { http, HttpResponse } from 'msw';
import { it, expect, describe } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { setCurrentYear } from 'src/redux/globalState/globalSlice';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { mount, requests, getDashboardStore } from './dashboard-test-harness';
import { dashboardSection, dashboardPermissions } from './dashboard-test-fixture';

describe('student dashboard with real RTK Query and network responses', () => {
  it('prioritizes server-confirmed teacher work and uses real accessible links', async () => {
    mount();
    await screen.findByRole('link', { name: 'Active students: 111. Open workspace' });
    const headings = screen
      .getAllByText(/^(Student records|Admissions & student setup|Attendance & leave)$/)
      .map((element) => element.textContent);
    expect(headings).toEqual([
      'Attendance & leave',
      'Student records',
      'Admissions & student setup',
    ]);
    expect(screen.getByRole('link', { name: /Student directory Find permitted/ })).toHaveAttribute(
      'href',
      '/student/records/directory'
    );
    fireEvent.click(screen.getByRole('button', { name: 'View class strength' }));
    expect(screen.getByRole('link', { name: /^Class 5: 111/ })).toHaveAttribute(
      'href',
      '/student/records/directory?population=Active&class=class-5'
    );
    expect(requests.filter((key) => key === 'records')).toHaveLength(1);
  });

  it('makes no dashboard request without its exact view grant', async () => {
    mount(
      dashboardPermissions.filter((permission) => permission.name !== 'Students.Dashboard.View')
    );
    expect(await screen.findByText(/do not have permission/)).toBeVisible();
    expect(requests).toEqual([]);
  });

  it('shows no privileged data or link when context authorization fails', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/context', () => HttpResponse.json({}, { status: 403 }))
    );
    mount();
    await screen.findByText(/Unable to confirm/);
    expect(screen.queryByRole('link', { name: /Active students/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Student directory')).not.toBeInTheDocument();
  });

  it('keeps other sections working when attendance fails and retries only the failed read', async () => {
    let fail = true;
    mswServer.use(
      http.get('*/api/students/dashboard/sections/attendance', () =>
        fail
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json(dashboardSection('attendance'))
      )
    );
    mount();
    await screen.findByText(/Unable to load attendance/);
    await screen.findByRole('link', { name: /^Active students:/ });
    fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('link', { name: /^Draft registers:/ });
    expect(requests.filter((key) => key === 'records')).toHaveLength(1);
  });

  it('clears the old year immediately while a new scoped response is pending', async () => {
    let release: (() => void) | undefined;
    mswServer.use(
      http.get('*/api/students/dashboard/sections/records', async ({ request }) => {
        const year = new URL(request.url).searchParams.get('academicYearId') ?? '';
        if (year === 'year-2')
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        return HttpResponse.json(dashboardSection('records', year, year === 'year-2' ? 222 : 111));
      })
    );
    mount();
    await screen.findByRole('link', { name: /^Active students: 111/ });
    getDashboardStore().dispatch(setCurrentYear({ id: 'year-2', name: '2027–28' }));
    await waitFor(() => expect(release).toBeDefined());
    expect(screen.queryByRole('link', { name: /^Active students: 111/ })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Open Active students: 111' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open Class 5: 111' })).not.toBeInTheDocument();
    release?.();
    await screen.findByRole('link', { name: /^Active students: 222/ });
  });

  it('refreshes live GETs without snapshot jobs or polling and preserves the strength view', async () => {
    mount();
    await screen.findByRole('link', { name: /^Active students:/ });
    fireEvent.click(screen.getByRole('button', { name: 'View class strength' }));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh dashboard' }));
    await waitFor(() => expect(requests.filter((key) => key === 'context')).toHaveLength(2));
    await waitFor(() => expect(requests.filter((key) => key === 'records')).toHaveLength(2));
    expect(screen.getByRole('button', { name: 'Hide class strength' })).toBeVisible();
  });
});
