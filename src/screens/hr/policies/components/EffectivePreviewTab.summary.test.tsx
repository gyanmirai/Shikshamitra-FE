import type React from 'react';

import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { EffectivePreviewTab } from './EffectivePreviewTab';

const mocks = vi.hoisted(() => ({
  setEffectiveFilters: vi.fn(),
  setEmployeeLookupSearch: vi.fn(),
  context: {} as Record<string, unknown>,
}));

function createContext() {
  return {
    effectiveFilters: { employeeId: 'employee-1', groupId: '', date: '2026-05-01' },
    setEffectiveFilters: mocks.setEffectiveFilters,
    effectiveLoading: false,
    effectiveError: null,
    effectiveEmployeeOptions: [{ id: 'employee-1', name: 'Asha Teacher' }],
    effectiveGroupOptions: [],
    employeeOptions: [{ id: 'employee-1', name: 'Asha Teacher' }],
    employeeLookupSearch: 'Asha Teacher',
    setEmployeeLookupSearch: mocks.setEmployeeLookupSearch,
    employeeSearchLoading: false,
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
  };
}

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
  useHRPolicyWorkspace: () => mocks.context,
}));

describe('EffectivePreviewTab summary rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.context = createContext();
  });

  it('shows the admin-readable resolution summary and recommended action', () => {
    renderWithProviders(<EffectivePreviewTab />);

    expect(screen.getByText(/Employee-specific assignments take precedence/)).toBeInTheDocument();
    expect(screen.getByText(/Review the matched policy/)).toBeInTheDocument();
    expect(screen.getByText('Resolution Chain')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Employee' })).toHaveValue('Asha Teacher');
  });

  it('clears the selected employee when its lookup text diverges', () => {
    renderWithProviders(<EffectivePreviewTab />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Employee' }), {
      target: { value: 'Bhavin Teacher' },
    });

    expect(mocks.setEmployeeLookupSearch).toHaveBeenCalledWith('Bhavin Teacher');
    const updateFilters = mocks.setEffectiveFilters.mock.calls.find(
      ([updater]) => typeof updater === 'function'
    )?.[0];

    expect(updateFilters).toBeTypeOf('function');
    expect(updateFilters({ employeeId: 'employee-1', groupId: '', date: '2026-05-01' })).toEqual({
      employeeId: '',
      groupId: '',
      date: '2026-05-01',
    });
  });

  it('does not show employee A while employee B preview is pending', () => {
    const { rerender } = renderWithProviders(<EffectivePreviewTab />);

    expect(screen.getByText(/Asha Teacher matched/)).toBeInTheDocument();

    mocks.context = {
      ...createContext(),
      effectiveFilters: { employeeId: 'employee-2', groupId: '', date: '2026-05-01' },
      effectiveEmployeeOptions: [{ id: 'employee-2', name: 'Bhavin Teacher' }],
      employeeOptions: [{ id: 'employee-2', name: 'Bhavin Teacher' }],
      employeeLookupSearch: 'Bhavin Teacher',
      effectiveLoading: true,
      effectivePreview: undefined,
    };
    rerender(<EffectivePreviewTab />);

    expect(screen.queryByText(/Asha Teacher matched/)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
