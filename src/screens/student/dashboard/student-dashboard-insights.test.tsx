import { http, HttpResponse } from 'msw';
import { it, expect, describe } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { screen, waitFor } from '@testing-library/react';

import { mount, requests } from './dashboard-test-harness';
import { dashboardContext, dashboardSection, dashboardPermissions } from './dashboard-test-fixture';

const attendanceMetrics = [
  { id: 'submitted', label: 'Submitted registers', value: 40, tone: 'success' as const },
  { id: 'drafts', label: 'Draft registers', value: 6, tone: 'warning' as const },
].map((metric) => ({
  ...metric,
  href: '/student/attendance/take-attendance',
  permission: 'Students.Attendance.MarkAttendance.View',
}));

describe('Student dashboard graphs and priority work with real scoped reads', () => {
  it('shares three reads across all cards, charts and role-ordered actions', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/sections/attendance', () => {
        requests.push('attendance');
        return HttpResponse.json({ ...dashboardSection('attendance'), metrics: attendanceMetrics });
      })
    );
    mount();
    expect(
      await screen.findByRole('link', {
        name: 'Open registers: 6. Attendance drafts need submission',
      })
    ).toHaveAttribute('href', '/student/attendance/take-attendance');
    await screen.findByRole('link', { name: 'Open Submitted registers: 40' });
    await screen.findByRole('link', { name: 'Open Class 5: 111' });
    await waitFor(() =>
      expect(requests.sort()).toEqual(['admissions', 'attendance', 'context', 'records'])
    );
    const chartTitles = screen
      .getAllByText(/^(Student population|Attendance registers)$/)
      .map((element) => element.textContent);
    expect(chartTitles).toEqual(['Attendance registers', 'Student population']);
    expect(screen.queryByText(/attendance rate/i)).not.toBeInTheDocument();
  });

  it('does not request or render records charts outside the server-confirmed default workspace', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/context', () => {
        requests.push('context');
        return HttpResponse.json({
          ...dashboardContext,
          mode: 'common',
          sections: ['admissions'],
          links: [],
        });
      })
    );
    mount();
    await screen.findByText('Admissions workload');
    await screen.findByRole('link', { name: 'Open My open inquiries: 111' });
    expect(screen.getByText('My student workspace')).toBeVisible();
    expect(screen.queryByText('Student population')).not.toBeInTheDocument();
    expect(screen.queryByText('Class strength')).not.toBeInTheDocument();
    expect(requests.sort()).toEqual(['admissions', 'context']);
  });

  it('filters unauthorized graph values and priority links even if a response includes them', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/sections/attendance', () =>
        HttpResponse.json({
          ...dashboardSection('attendance'),
          metrics: [
            ...attendanceMetrics,
            {
              id: 'leave',
              label: 'Pending leave requests',
              value: 999,
              tone: 'warning',
              href: '/student/attendance/leave-absent',
              permission: 'Students.Attendance.LeaveAndAbsent.View',
            },
          ],
        })
      )
    );
    mount(dashboardPermissions);
    await screen.findByRole('link', {
      name: 'Open registers: 6. Attendance drafts need submission',
    });
    expect(screen.queryByText('999')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Review requests/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open Pending leave/ })).not.toBeInTheDocument();
  });

  it('reports an incomplete priority queue when a section fails without inventing a healthy status', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/sections/attendance', () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    mount();
    await screen.findByText('Some summaries are unavailable. This queue may be incomplete.');
    await screen.findByRole('link', { name: 'Open Active students: 111' });
    expect(screen.queryByText(/No priority actions/)).not.toBeInTheDocument();
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
  });
});
