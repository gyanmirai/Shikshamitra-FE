import { it, expect, describe } from 'vitest';
import { DASHBOARD_TEMPLATES } from 'src/screens/mainDashboard/dashboard-types';

import { dashboardApi, buildDashboardSummaryQueryParams } from './dashboardApi';

describe('dashboardApi', () => {
  it('builds dashboard summary query params without empty optional values', () => {
    expect(
      buildDashboardSummaryQueryParams({
        dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
        academicYearId: ' 2026-27 ',
        from: '',
        to: ' 2026-05-23 ',
      })
    ).toEqual({
      dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
      academicYearId: '2026-27',
      to: '2026-05-23',
    });
  });

  it('registers the dashboard widget metadata endpoint', () => {
    const endpoint = dashboardApi.endpoints.getDashboardWidgetMetadata;

    expect(endpoint).toBeDefined();
  });

  it('sends child selection and presentation without transmitting the local access key', () => {
    expect(buildDashboardSummaryQueryParams({ dashboardTemplate: DASHBOARD_TEMPLATES.studentParent,
      academicYearId: 'year', studentId: ' child ', presentationRole: 'parent', accessKey: 'tenant:user:permission-version' }))
      .toEqual({ dashboardTemplate: 'studentParent', academicYearId: 'year', studentId: 'child', presentationRole: 'parent' });
  });
});
