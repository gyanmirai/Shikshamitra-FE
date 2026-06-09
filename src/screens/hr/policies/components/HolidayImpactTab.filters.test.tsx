import type React from 'react';

import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';

import { HolidayImpactTab } from './HolidayImpactTab';

vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label }: { label: string }) => <input aria-label={label} readOnly />,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('./HRPolicySharedUI', () => ({
  EmptyRows: ({ message }: { message: string }) => (
    <tr>
      <td>{message}</td>
    </tr>
  ),
  SectionTable: ({ columns, children }: { columns: string[]; children: React.ReactNode }) => (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  ),
}));

describe('HolidayImpactTab filters', () => {
  it('shows policy-calendar fallback instead of silently selecting the first calendar', () => {
    renderWithProviders(
      <HolidayImpactTab
        ctx={
          {
            calendars: [
              { id: 'archived-calendar', name: 'Archived Calendar', status: 'archived' },
              { id: 'active-calendar', name: 'Active Calendar', status: 'active' },
            ],
            payroll: [],
            attendance: [],
            holidayFilters: {
              workCalendarPolicyId: '',
              payrollPolicyId: '',
              attendancePolicyId: '',
              month: '',
              fromDate: '',
              toDate: '',
            },
            setHolidayFilters: vi.fn(),
            holidayImpact: { items: [] },
            holidayImpactLoading: false,
            holidayImpactError: null,
            openPayrollDrawer: vi.fn(),
          } as any
        }
      />
    );

    expect(screen.getAllByText('Use payroll policy calendar')[0]).toBeInTheDocument();
    expect(screen.queryByText('Archived Calendar')).not.toBeInTheDocument();
  });
});
