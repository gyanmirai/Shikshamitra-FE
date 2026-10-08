import { http, HttpResponse } from 'msw';
import { it, expect, describe } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { screen } from '@testing-library/react';

import { mount, requests } from './dashboard-test-harness';
import { dashboardContext, dashboardSection } from './dashboard-test-fixture';

describe('shared Student dashboard empty and personal views', () => {
  it('shows real zero values and empty graphs without inventing population or health', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/sections/:section', ({ params }) => {
        const section = String(params.section) as 'records' | 'admissions' | 'attendance';
        return HttpResponse.json({ ...dashboardSection(section, 'year-1', 0), classStrength: [] });
      })
    );
    mount();
    await screen.findByRole('link', { name: 'Open Active students: 0' });
    expect(screen.getByRole('link', { name: 'Active students: 0. Open workspace' })).toBeVisible();
    expect(screen.queryByRole('img', { name: /^Student population:/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open registers:/ })).not.toBeInTheDocument();
    expect(screen.getByText('No priority actions in the available summaries.')).toBeVisible();
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
  });

  it('keeps verified parent/student identities in the default view without staff data requests', async () => {
    mswServer.use(
      http.get('*/api/students/dashboard/context', () => {
        requests.push('context');
        return HttpResponse.json({
          ...dashboardContext,
          mode: 'common',
          sections: [],
          links: [],
          myStudents: [
            { studentId: 'verified-1', name: 'Verified student', relationship: 'mother' },
          ],
        });
      })
    );
    mount();
    await screen.findByText('Verified student');
    expect(screen.getByText('My student workspace')).toBeVisible();
    expect(screen.queryByText('Student population')).not.toBeInTheDocument();
    expect(screen.queryByText('Needs attention')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Student directory/ })).not.toBeInTheDocument();
    expect(requests).toEqual(['context']);
  });
});
