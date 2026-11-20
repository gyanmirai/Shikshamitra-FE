import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, render, screen } from '@testing-library/react';
import { mapLibraryDashboardOverviewDto } from 'src/redux/library/library-adapters';

import AdminDashboard from './admin';
import { dashboardFinancePayload } from './dashboard-finance-data.fixture';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => navigation }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/chart', () => ({ Chart: () => null, useChart: (value: unknown) => value }));
vi.mock('./admin/admin-alerts', () => ({ default: () => null }));
vi.mock('./admin/admin-financials', () => ({ default: () => null }));
vi.mock('./admin/admin-quick-actions', () => ({ default: () => null }));
vi.mock('./admin/admin-charts', () => ({
  SectionBooksChart: () => null,
  MemberActivityChart: () => null,
  InventoryIntelligence: () => null,
  WeeklyCirculationChart: () => null,
  CategoryDistributionChart: () => null,
}));

it('uses a keyboard-activatable Finance review link under actual Charges View and removes it on revocation', async () => {
  const grants = ['Library.Dashboard.View', 'Library.Charges.View'];
  const fixture = reservationWrapper(grants);
  render(
    <AdminDashboard overview={mapLibraryDashboardOverviewDto(dashboardFinancePayload)} />,
    fixture
  );
  expect(screen.getByText('Needs Finance Review')).toBeVisible();
  const link = screen.getByRole('link', { name: 'Open Library charge register' });
  expect(link).toHaveAttribute('href', '/library/charges-management');
  expect(link.querySelector('a,button,[role="button"]')).toBeNull();
  const activation = vi.fn((event: Event) => event.preventDefault());
  link.addEventListener('click', activation);
  await userEvent.tab();
  expect(link).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(activation).toHaveBeenCalledTimes(1);
  expect(navigation.push).not.toHaveBeenCalled();
  grants.splice(grants.indexOf('Library.Charges.View'), 1);
  await act(async () => {
    fixture.store.dispatch({ type: 'test/authRefreshed' });
  });
  expect(screen.queryByRole('link', { name: 'Open Library charge register' })).toBeNull();
  expect(screen.getByText('Needs Finance Review')).toBeVisible();
});
