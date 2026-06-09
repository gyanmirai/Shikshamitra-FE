import type React from 'react';

import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';

import { EffectivePreviewTab } from './EffectivePreviewTab';

vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label }: { label: string }) => <input aria-label={label} readOnly />,
}));

vi.mock('./HRPolicySharedUI', () => ({
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

vi.mock('../hooks/useHRPolicyWorkspace', () => ({
  useHRPolicyWorkspace: () => ({
    effectiveFilters: { employeeId: 'employee-1', groupId: '', date: '2026-05-01' },
    setEffectiveFilters: vi.fn(),
    effectiveLoading: false,
    effectiveError: null,
    effectiveEmployeeOptions: [{ id: 'employee-1', label: 'Asha Teacher' }],
    effectiveGroupOptions: [],
    employeeOptions: [{ id: 'employee-1', label: 'Asha Teacher' }],
    groupOptions: [],
    effectivePreview: {
      policySource: 'employee',
      matchedTargetDisplayName: 'Asha Teacher',
      payrollPolicy: { name: 'Teacher Payroll' },
      payrollWorkCalendarPolicy: { name: 'Academic Calendar' },
      attendancePolicy: { name: 'Teacher Attendance' },
      attendanceWorkCalendarPolicy: { name: 'Academic Calendar' },
      resolutionSummary:
        'Asha Teacher matched on 01 May 2026. Employee-specific assignments take precedence over group assignments.',
      recommendedAction:
        'Review the matched policy and resolution chain before changing assignments.',
      resolutionSteps: [
        {
          source: 'employee',
          targetType: 'employee',
          targetDisplayName: 'Asha Teacher',
          status: 'matched',
          skipReason: 'winner',
          priority: 100,
        },
      ],
    },
  }),
}));

describe('EffectivePreviewTab summary rendering', () => {
  it('shows the admin-readable resolution summary and recommended action', () => {
    renderWithProviders(<EffectivePreviewTab />);

    expect(screen.getByText(/Employee-specific assignments take precedence/)).toBeInTheDocument();
    expect(screen.getByText(/Review the matched policy/)).toBeInTheDocument();
    expect(screen.getByText('Resolution Chain')).toBeInTheDocument();
  });
});
