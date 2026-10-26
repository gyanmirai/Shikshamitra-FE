import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { render, screen, fireEvent } from '@testing-library/react';

import { PayrollRegistrationReadiness } from './payroll-registration-readiness';

vi.mock('src/redux/hr/statutory-profile-api', () => ({
  useGetPayrollRegistrationReadinessQuery: () => ({
    currentData: { items: [{ employeeId: 'synthetic-staff', applyPf: true, applyEsic: true }] },
  }),
}));
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: any) =>
    columns.find((column: any) => column.id === 'action').render(null, data[0]),
}));

function mount(authorized: boolean) {
  const store = configureStore({
    reducer: {
      auth: () => ({
        loading: false,
        permissionsInitialized: true,
        permissions: authorized
          ? [
              hrPermissions.root,
              hrPermissions.employee.root,
              `${hrPermissions.employee.list}.View`,
              `${hrPermissions.employee.list}.Edit`,
              hrPermissions.payroll.settings.statutorySchemes,
            ].map((name) => ({ name, isGranted: true }))
          : [],
      }),
    },
  });
  render(
    <Provider store={store}>
      <PayrollRegistrationReadiness month="2026-08" />
    </Provider>
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Registration review before payroll refresh' })
  );
}

describe('registration readiness setup detour', () => {
  it('opens the selected staff payroll step with noopener in a separate tab', () => {
    mount(true);
    const link = screen.getByRole('link', { name: /Review statutory registration/ });
    expect(link).toHaveAttribute(
      'href',
      `${hrPaths.employee.list}?mode=form&editEmployee=synthetic-staff&step=payroll`
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('offers administrator guidance rather than an inaccessible staff edit link', () => {
    mount(false);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/Ask your HR administrator/)).toBeVisible();
  });
});

// This screen test isolates its owning reader; typed criteria transport is covered by the adapter suite.
vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: () => ({
    currentData: undefined,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
