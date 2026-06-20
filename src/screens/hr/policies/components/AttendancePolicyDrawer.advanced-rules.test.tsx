import React, { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import { AttendancePolicyDrawer } from './AttendancePolicyDrawer';

import type { AttendanceForm } from '../types/hr-policy-workspace.types';
import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

vi.mock('src/components/custom-tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const baseAttendanceForm: AttendanceForm = {
  name: 'Standard Attendance',
  status: 'active',
  workCalendarPolicyId: 'calendar-1',
  isDefault: true,
  captureMode: 'integrated',
  fullDayThresholdPercentage: '75',
  halfDayThresholdPercentage: '50',
  absentThresholdPercentage: '0',
  missingPunchBehavior: 'requires_review',
  manualCorrectionAllowed: true,
  graceTime: '5',
  maxLateAllowedPerMonth: '3',
  penaltyType: 'none',
  penaltyCountThreshold: '3',
  penaltyDeductionAmount: '',
  earlyExitEnabled: false,
  earlyExitGraceTime: '0',
  overtimeEnabled: false,
  overtimeRate: '',
  minOvertimeMinutes: '',
  holidayWorkBehavior: 'comp_off',
  payrollPreviewEnabled: true,
};

function AttendancePolicyDrawerHarness({
  initialForm = baseAttendanceForm,
}: {
  initialForm?: AttendanceForm;
}) {
  const [attendanceForm, setAttendanceForm] = useState(initialForm);

  const ctx = {
    drawer: { kind: 'attendance', mode: 'edit', item: { id: 'attendance-1' } },
    formError: '',
    attendanceForm,
    setAttendanceForm,
    attendanceAdvancedMode: true,
    setAttendanceAdvancedMode: vi.fn(),
    currentAttendanceUnchanged: false,
    createAttendanceState: { isLoading: false },
    updateAttendanceState: { isLoading: false },
    activePolicyOperation: null,
    activeCalendars: [{ id: 'calendar-1', name: 'Main Calendar' }],
    canEditPolicy: true,
    canCreatePolicy: true,
    closeDrawer: vi.fn(),
    saveAttendance: vi.fn(),
    getAttendanceNumericFieldProps: (field: keyof AttendanceForm) => ({
      fullWidth: true,
      size: 'small' as const,
      value: attendanceForm[field] as string,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setAttendanceForm((current) => ({ ...current, [field]: event.target.value })),
    }),
  } as unknown as HRPolicyWorkspaceContext;

  return <AttendancePolicyDrawer ctx={ctx} />;
}

describe('AttendancePolicyDrawer advanced rules', () => {
  it('renders grouped advanced cards and hides irrelevant fields by default', () => {
    renderWithProviders(<AttendancePolicyDrawerHarness />);

    expect(screen.getByText('Attendance Policy Summary')).toBeInTheDocument();
    expect(screen.getByText('Late Arrival Policy')).toBeInTheDocument();
    expect(screen.getByText('Early Exit Policy')).toBeInTheDocument();
    expect(screen.getByText('Overtime Policy')).toBeInTheDocument();
    expect(screen.getByText('Holiday Rules')).toBeInTheDocument();
    expect(screen.queryByText('Apply Penalty After')).not.toBeInTheDocument();
    expect(screen.queryByText('Deduction Amount')).not.toBeInTheDocument();
    expect(screen.queryByText('Minimum Overtime Minutes')).not.toBeInTheDocument();
    expect(screen.getByText('Penalty Action')).toBeInTheDocument();
    expect(screen.getByText('Track Early Exit')).toBeInTheDocument();
  });

  it('shows conditional fields when rules are enabled', () => {
    renderWithProviders(
      <AttendancePolicyDrawerHarness
        initialForm={{
          ...baseAttendanceForm,
          penaltyType: 'deduct_half_day',
          earlyExitEnabled: true,
          overtimeEnabled: true,
          overtimeRate: '1.5x',
          minOvertimeMinutes: '30',
        }}
      />
    );

    expect(screen.getByText('Apply Penalty After')).toBeInTheDocument();
    expect(screen.getByText('Penalty Action')).toBeInTheDocument();
    expect(screen.getAllByText('Grace Period')).toHaveLength(2);
    expect(screen.getByText('Minimum Overtime Minutes')).toBeInTheDocument();
    expect(screen.getByText('Calculation Method')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Multiplier (1.5x)')).toBeInTheDocument();
  });

  it('shows deduction amount only for salary deduction penalty', () => {
    renderWithProviders(
      <AttendancePolicyDrawerHarness
        initialForm={{
          ...baseAttendanceForm,
          penaltyType: 'salary_deduction',
          penaltyDeductionAmount: '250',
        }}
      />
    );

    expect(screen.getByText('Deduction Amount')).toBeInTheDocument();
    expect(screen.getByDisplayValue('250')).toBeInTheDocument();
    expect(screen.getByText(/Salary Deduction applies after 3 violations at INR 250 each/i)).toBeInTheDocument();
  });

  it('updates the summary from form state', () => {
    renderWithProviders(<AttendancePolicyDrawerHarness />);

    expect(screen.getByText(/Employees receive 5 minutes grace period/i)).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '10' } });

    expect(screen.getByText(/Employees receive 10 minutes grace period/i)).toBeInTheDocument();
  });

  it('renders legacy paid holiday compensation without an invalid empty select', () => {
    renderWithProviders(
      <AttendancePolicyDrawerHarness
        initialForm={{
          ...baseAttendanceForm,
          holidayWorkBehavior: 'paid',
        }}
      />
    );

    expect(screen.getByText(/Holiday work is paid as regular work/i)).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it.each([
    ['no_benefit', /Holiday work grants No Benefit/i],
    ['comp_off', /Holiday work grants Comp Off/i],
    ['ot_payout', /Holiday work grants Overtime Pay/i],
    ['both', /Holiday work grants Both/i],
  ])('summarizes holiday compensation value %s', (holidayWorkBehavior, summaryText) => {
    renderWithProviders(
      <AttendancePolicyDrawerHarness
        initialForm={{
          ...baseAttendanceForm,
          holidayWorkBehavior,
        }}
      />
    );

    expect(screen.getByText(summaryText)).toBeInTheDocument();
  });

  it('uses fixed rate as the effective overtime method when enabled with an empty stored rate', () => {
    renderWithProviders(
      <AttendancePolicyDrawerHarness
        initialForm={{
          ...baseAttendanceForm,
          overtimeEnabled: true,
          overtimeRate: '',
        }}
      />
    );

    expect(screen.getByText('Minimum Overtime Minutes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fixed Rate')).toBeInTheDocument();
  });
});
