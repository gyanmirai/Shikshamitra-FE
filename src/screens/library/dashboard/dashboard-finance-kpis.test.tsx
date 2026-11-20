import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mapLibraryDashboardOverviewDto } from 'src/redux/library/library-adapters';

import AdminKPICards from './admin/admin-kpi-cards';
import PrincipalKPICards from './principal/principal-kpi-cards';
import { dashboardFinancePayload } from './dashboard-finance-data.fixture';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

vi.mock('src/screens/student/dashboard/principal/kpi-card-item', () => ({
  default: ({
    title,
    value,
    trendData,
  }: {
    title: string;
    value: string;
    trendData?: number[];
  }) => (
    <section aria-label={title}>
      <span>{value}</span>
      <span data-testid={`${title}-trend`}>{JSON.stringify(trendData || [])}</span>
    </section>
  ),
}));

it('shows an admin Finance review count instead of treating local Pending principal as outstanding', () => {
  render(
    <AdminKPICards overview={mapLibraryDashboardOverviewDto(dashboardFinancePayload)} />,
    reservationWrapper(['Library.Dashboard.View'])
  );
  expect(screen.getByRole('region', { name: 'Needs Finance Review' })).toHaveTextContent('2');
  expect(screen.getByTestId('Needs Finance Review-trend')).toHaveTextContent('[]');
  expect(screen.queryByRole('region', { name: 'Pending Charges' })).toBeNull();
});

it('shows a principal verified-source count without a local-status collection percentage', () => {
  render(
    <PrincipalKPICards overview={mapLibraryDashboardOverviewDto(dashboardFinancePayload)} />,
    reservationWrapper(['Library.Dashboard.View'])
  );
  expect(screen.getByRole('region', { name: 'Verified Finance Sources' })).toHaveTextContent('3');
  expect(screen.getByTestId('Verified Finance Sources-trend')).toHaveTextContent('[]');
  expect(screen.queryByRole('region', { name: 'Fine Collection Rate' })).toBeNull();
});
