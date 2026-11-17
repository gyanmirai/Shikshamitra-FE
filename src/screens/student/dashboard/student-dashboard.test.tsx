import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { setCurrentYear } from 'src/redux/globalState/globalSlice';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

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
    let contextReads = 0;
    mswServer.use(
      http.get('*/api/students/dashboard/context', () => {
        contextReads += 1;
        return HttpResponse.json({}, { status: 403 });
      })
    );
    mount();
    await expectStudentErrorToast(/Unable to confirm/);
    expect(screen.queryByRole('link', { name: /Active students/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Student directory')).not.toBeInTheDocument();
    expect(contextReads).toBe(1);
    expect(requests).toEqual([]);
  });

  it('keeps other sections working when attendance fails and retries only the failed read', async () => {
    let fail = true;
    let attendanceReads = 0;
    mswServer.use(
      http.get('*/api/students/dashboard/sections/attendance', () => {
        attendanceReads += 1;
        return fail
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json(dashboardSection('attendance'));
      })
    );
    mount();
    await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalled());
    const { message } = vi.mocked(shikshaMitraToast.error).mock.calls.at(-1)![0];
    const notice = render(<div>{message}</div>);
    expect(notice.container).toHaveTextContent(
      'Unable to load attendance & leave. Other sections remain available.'
    );
    notice.unmount();
    await screen.findByRole('link', { name: /^Active students:/ });
    expect(screen.queryByRole('link', { name: /^Draft registers:/ })).not.toBeInTheDocument();
    expect(attendanceReads).toBe(1);
    fail = false;
    const attendance = screen.getByText('Attendance & leave').closest('.MuiCard-root');
    expect(attendance).not.toBeNull();
    fireEvent.click(within(attendance as HTMLElement).getByRole('button', { name: 'Refresh' }));
    await screen.findByRole('link', { name: /^Draft registers:/ });
    expect(attendanceReads).toBe(2);
    expect(requests.filter((key) => key === 'context')).toHaveLength(1);
    expect(requests.filter((key) => key === 'records')).toHaveLength(1);
    expect(requests.filter((key) => key === 'admissions')).toHaveLength(1);
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
