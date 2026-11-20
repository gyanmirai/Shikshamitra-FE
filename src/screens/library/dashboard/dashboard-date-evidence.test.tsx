import { it, vi, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { mapLibraryDashboardOverviewDto } from 'src/redux/library/library-adapters';

import AdminKPICards from './admin/admin-kpi-cards';
import PrincipalKPICards from './principal/principal-kpi-cards';

vi.mock('src/screens/student/dashboard/principal/kpi-card-item', () => ({
  default: ({ title, value }: { title: string; value: string }) => (
    <div role="group" aria-label={title}>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}));

it('keeps inventory zero while refusing to label unavailable daily and overdue counts as known zero', () => {
  render(
    <AdminKPICards overview={mapLibraryDashboardOverviewDto({ stockTotals: { totalCopies: 0 } })} />
  );
  expect(
    within(screen.getByRole('group', { name: 'Total Copies' })).getByText('0')
  ).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Circulation Today' })).toHaveTextContent(
    'Not classified'
  );
  expect(screen.getByRole('group', { name: 'Overdue Books' })).toHaveTextContent('Not classified');
});

it('identifies a confirmed overdue subset while some saved due dates still need review', () => {
  render(
    <AdminKPICards
      overview={mapLibraryDashboardOverviewDto({
        schoolAsOfDate: '2026-11-18',
        schoolDateSource: 'ConfirmedLibraryClock',
        circulation: {
          overdueIssues: 1,
          overdueClassificationAvailable: false,
          unknownDueDateCount: 1,
          overdueAsOfDate: '2026-11-18',
          overdueDateSource: 'ConfirmedLibraryClock',
        },
      })}
    />
  );
  expect(screen.getByRole('group', { name: 'Overdue Books' })).toHaveTextContent('1 confirmed');
});

it('does not present an unclassified principal overdue rate or week total as a known zero', () => {
  render(<PrincipalKPICards overview={mapLibraryDashboardOverviewDto({})} />);
  expect(screen.getByRole('group', { name: 'Overdue Rate' })).toHaveTextContent('Not classified');
  expect(screen.getByRole('group', { name: 'Weekly Circulation' })).toHaveTextContent(
    'Not classified'
  );
});
