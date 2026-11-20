import { render } from '@testing-library/react';
import { mapLibraryDashboardOverviewDto } from 'src/redux/library/library-adapters';

import AdminFinancials from './admin/admin-financials';
import PrincipalFinancials from './principal/principal-financials';
import { dashboardFinancePayload } from './dashboard-finance-data.fixture';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

export function renderFinancialPanel(
  role: 'admin' | 'principal',
  payload: Record<string, unknown> = dashboardFinancePayload
) {
  const Panel = role === 'admin' ? AdminFinancials : PrincipalFinancials;
  return render(
    <Panel overview={mapLibraryDashboardOverviewDto(payload)} />,
    reservationWrapper(['Library.Dashboard.View'])
  );
}
