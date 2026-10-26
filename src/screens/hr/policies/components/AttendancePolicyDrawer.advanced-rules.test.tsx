import React, { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
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
  const [attendanceAdvancedMode, setAttendanceAdvancedMode] = useState(true);

  const ctx = {
    drawer: { kind: 'attendance', mode: 'edit', item: { id: 'attendance-1' } },
    formError: '',
    attendanceForm,
    setAttendanceForm,
    attendanceAdvancedMode,
    setAttendanceAdvancedMode,
    currentAttendanceUnchanged: false,
    createAttendanceState: { isLoading: false },
    updateAttendanceState: { isLoading: false },
    activePolicyOperation: null,
    activeCalendars: [
      { id: 'calendar-1', name: 'Main Calendar' },
      { id: 'calendar-2', name: 'Other Calendar' },
    ],
    canEditPolicy: true,
    canCreatePolicy: true,
    closeDrawer: vi.fn(),
    saveAttendance: vi.fn(),
    getAttendanceNumericFieldProps: (field: keyof AttendanceForm) => {
      const full = Number(attendanceForm.fullDayThresholdPercentage || 0);
      const half = Number(attendanceForm.halfDayThresholdPercentage || 0);
      let helperText = '';
      let error = false;
      if (field === 'fullDayThresholdPercentage' && full <= half) {
        error = true;
        helperText = `Must be greater than half day threshold (${half}%)`;
      } else if (field === 'halfDayThresholdPercentage' && half >= full) {
        error = true;
        helperText = `Must be less than full day threshold (${full}%)`;
      }
      return {
        fullWidth: true,
        size: 'small' as const,
        value: attendanceForm[field] as string,
        error,
        helperText,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          setAttendanceForm((current) => ({ ...current, [field]: event.target.value })),
      };
    },
  } as unknown as HRPolicyWorkspaceContext;

  return (
    <>
      <AttendancePolicyDrawer ctx={ctx} />
      <output data-testid="draft">{JSON.stringify(attendanceForm)}</output>
    </>
  );
}

describe('AttendancePolicyDrawer advanced rules', () => {
  it('preserves custom rules through repeated disclosure and only resets after explicit confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AttendancePolicyDrawerHarness />);
    const draft = () => JSON.parse(screen.getByTestId('draft').textContent || '{}');
    for (let index = 0; index < 3; index += 1) {
      // Disclosure/reopen steps must remain sequential to exercise retained state.
      // eslint-disable-next-line no-await-in-loop
      await user.click(screen.getByRole('switch', { name: /Advanced settings/ }));
      expect(screen.getByText('Custom rules active')).toBeInTheDocument();
      expect(draft().graceTime).toBe('5');
      // eslint-disable-next-line no-await-in-loop
      await user.click(screen.getByRole('switch', { name: /Advanced settings/ }));
      expect(draft().graceTime).toBe('5');
    }
    await user.click(screen.getByRole('button', { name: 'Reset advanced rules' }));
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(draft().graceTime).toBe('5');
    await user.click(await screen.findByRole('button', { name: 'Reset advanced rules' }));
    await user.click(screen.getByRole('button', { name: 'Reset rules' }));
    expect(draft().graceTime).toBe('0');
    expect(draft().workCalendarPolicyId).toBe('calendar-1');
    expect(draft().isDefault).toBe(true);
  });

  it('changing the calendar keeps an active non-default policy non-default', () => {
    renderWithProviders(
      <AttendancePolicyDrawerHarness initialForm={{ ...baseAttendanceForm, isDefault: false }} />
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Work Calendar *' }));
    fireEvent.click(screen.getByRole('option', { name: 'Other Calendar' }));
    const draft = JSON.parse(screen.getByTestId('draft').textContent || '{}');
    expect(draft.workCalendarPolicyId).toBe('calendar-2');
    expect(draft.isDefault).toBe(false);
  });
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
    expect(
      screen.getByText(/Salary Deduction applies after 3 violations at INR 250 each/i)
    ).toBeInTheDocument();
  });

  it('updates the summary from form state', () => {
    renderWithProviders(<AttendancePolicyDrawerHarness />);

    expect(screen.getByText(/Staff receive 5 minutes grace period/i)).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '10' } });

    expect(screen.getByText(/Staff receive 10 minutes grace period/i)).toBeInTheDocument();
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

  it('shows threshold validation error directly near the invalid input fields', () => {
    renderWithProviders(
      <AttendancePolicyDrawerHarness
        initialForm={{
          ...baseAttendanceForm,
          fullDayThresholdPercentage: '10',
          halfDayThresholdPercentage: '50',
        }}
      />
    );

    expect(
      screen.getByText(/Must be greater than half day threshold \(50%\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Must be less than full day threshold \(10%\)/i)).toBeInTheDocument();
  });
});
