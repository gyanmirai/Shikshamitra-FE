import type { ReactNode } from 'react';

import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { mapLibraryDashboardOverviewDto } from 'src/redux/library/library-adapters';

import PrincipalDashboard from './principal';
import AdminAlerts from './admin/admin-alerts';
import { dashboardFinancePayload } from './dashboard-finance-data.fixture';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/chart', () => ({ Chart: () => null, useChart: (value: unknown) => value }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

export const financialNotices = [
  {
    type: 'pendingCharges',
    severity: 'warning',
    title: 'Collectible Library charges',
    message: '1 Library assessments have a collectible Finance balance.',
    count: 1,
    link: '/library/charges-management',
  },
  {
    type: 'overdueCharges',
    severity: 'error',
    title: 'Overdue collectible Library charges',
    message: '1 collectible assessments are past their confirmed school due date.',
    count: 1,
    link: '/library/charges-management',
  },
  {
    type: 'unpostedCharges',
    severity: 'warning',
    title: 'Review unposted Library assessments',
    message:
      '1 assessment records have no accepted Finance posting. Review their recorded context and declarations.',
    count: 1,
    link: '/library/charges-management',
  },
  {
    type: 'reviewCharges',
    severity: 'warning',
    title: 'Review Library financial evidence',
    message:
      '2 assessment records need source or settlement evidence review before financial action.',
    count: 2,
    link: '/library/charges-management',
  },
];
export const bookNotice = {
  type: 'overdueBooks',
  severity: 'warning',
  title: 'Overdue books',
  message: 'Three confirmed loans need attention.',
  count: 3,
  link: '/library/issued-books',
};
export const alertPayload = {
  ...dashboardFinancePayload,
  schoolAsOfDate: '2026-11-18',
  schoolDateSource: 'ConfirmedLibraryClock',
  circulation: {
    activeIssues: 3,
    overdueIssues: 3,
    overdueClassificationAvailable: true,
    unknownDueDateCount: 0,
    overdueAsOfDate: '2026-11-18',
    overdueDateSource: 'ConfirmedLibraryClock',
  },
  utilization: { ...dashboardFinancePayload.utilization, overdueRate: 100 },
  alerts: [...financialNotices, bookNotice],
};
export function mountAlertDashboard(
  role: 'admin' | 'principal',
  payload: Record<string, unknown> = alertPayload,
  grants = ['Library.Dashboard.View']
) {
  const fixture = reservationWrapper(grants);
  const Component = role === 'admin' ? AdminAlerts : PrincipalDashboard;
  return {
    ...fixture,
    ...render(<Component overview={mapLibraryDashboardOverviewDto(payload)} />, fixture),
  };
}
