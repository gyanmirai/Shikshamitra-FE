import type { ProrationPolicySavePayload } from 'src/redux/finance/prorationPolicy';

import { useFormik } from 'formik';
import React, { useRef } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { ProrationSummaryPanel } from './ProrationCommon';
import { applyAdmissionPreset } from './prorationRuleHelpers';
import ProrationFeeHeadsSection from './ProrationFeeHeadsSection';
import { useProrationValidationFocus } from '../../hooks/useProrationValidationFocus';
import {
  getProrationFormChecks,
  toProrationPolicyPayload,
  buildProrationValidationSchema,
} from '../../hooks/useProrationPolicyForm';

import type {
  IProrationFeeHeadRule,
  IProrationPolicyFormValues,
} from '../../types/finance-policy.types';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

const rule = (overrides: Partial<IProrationFeeHeadRule> = {}): IProrationFeeHeadRule => ({
  feeHeadId: 'tuition',
  feeHeadName: 'Tuition fee',
  feeType: 'Recurring',
  ruleType: 'MonthlyProration',
  applyOnAdmission: true,
  configuration: { monthlyRule: 'ChargeNextMonth', cutOffDay: 15, roundOff: 'NearestRupee' },
  applyOnEarlyWithdrawal: true,
  earlyWithdrawalRuleType: 'DailyProration',
  earlyWithdrawalConfiguration: { calculationBasis: 'CalendarDays', minimumChargeDays: 3 },
  ...overrides,
});
function Harness({
  rules = [rule()],
  onSubmit = vi.fn(),
}: {
  rules?: IProrationFeeHeadRule[];
  onSubmit?: (payload: ProrationPolicySavePayload) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const formik = useFormik<IProrationPolicyFormValues>({
    initialValues: {
      policyType: 'proration',
      policyName: 'Test policy',
      policyCode: '',
      description: '',
      status: 'Draft',
      academicYearId: 'year',
      isDefault: false,
      feeHeadRules: rules,
    },
    validationSchema: buildProrationValidationSchema(false),
    onSubmit: (values) => {
      onSubmit(toProrationPolicyPayload(values));
    },
  });
  useProrationValidationFocus(formik, formRef);
  return (
    <form ref={formRef} onSubmit={formik.handleSubmit} noValidate>
      <ProrationFeeHeadsSection formik={formik} />
      <ProrationSummaryPanel
        formik={formik}
        checks={getProrationFormChecks(formik.values)}
        inline
      />
      <button type="submit">Save policy</button>
      <button type="button" onClick={() => formik.resetForm()}>
        Reset form
      </button>
    </form>
  );
}
const admission = () =>
  within(screen.getByRole('region', { name: 'Admission settings for Tuition fee' }));
const withdrawal = () =>
  within(screen.getByRole('region', { name: 'Early withdrawal settings for Tuition fee' }));
const expand = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Configure Tuition fee' }));
  });
};

beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('proration fee-head interactions', () => {
  it('expands and focuses errors again after resetting the form', async () => {
    render(
      <Harness
        rules={[rule({ configuration: { monthlyRule: 'ChargeNextMonth', cutOffDay: 32 } })]}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    });
    await waitFor(() => expect(admission().getByRole('spinbutton')).toHaveFocus());
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset form' }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Collapse Tuition fee' }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    });
    await waitFor(() => expect(admission().getByRole('spinbutton')).toHaveFocus());
  });
  it('shows distinct Off and No proration summaries and restricts one-time fees', () => {
    render(
      <Harness
        rules={[
          rule({ applyOnAdmission: false, earlyWithdrawalRuleType: 'NoProration' }),
          rule({
            feeHeadId: 'registration',
            feeHeadName: 'Registration',
            feeType: 'OneTime',
            ruleType: 'NoProration',
            applyOnEarlyWithdrawal: false,
          }),
        ]}
      />
    );
    expect(screen.getByText('Admission: Off')).toBeInTheDocument();
    expect(screen.getByText('Early withdrawal: No proration')).toBeInTheDocument();
    expect(screen.getByText('One-time fees cannot be prorated.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Configure Registration' })
    ).not.toBeInTheDocument();
  });

  it('keeps event settings independent and restores values when re-enabled', async () => {
    render(<Harness />);
    await expand();
    await act(async () => {
      fireEvent.click(admission().getByRole('switch'));
    });
    expect(admission().queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(withdrawal().getByRole('spinbutton')).toHaveValue(3);
    await act(async () => {
      fireEvent.click(admission().getByRole('switch'));
    });
    expect(admission().getByRole('spinbutton')).toHaveValue(15);
    await act(async () => {
      fireEvent.click(withdrawal().getByRole('switch'));
    });
    expect(admission().getByRole('spinbutton')).toHaveValue(15);
    await act(async () => {
      fireEvent.click(withdrawal().getByRole('switch'));
    });
    expect(withdrawal().getByRole('spinbutton')).toHaveValue(3);
    expect(screen.queryByRole('combobox', { name: /Rounding/ })).not.toBeInTheDocument();
  });

  it('changes the admission model without changing withdrawal or shared rounding', async () => {
    render(<Harness />);
    await expand();
    await act(async () => {
      fireEvent.mouseDown(admission().getByRole('combobox', { name: 'Proration model' }));
    });
    await act(async () => {
      expect(screen.queryByRole('option', { name: 'Full month charge' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('option', { name: 'No proration' }));
    });
    await waitFor(() => expect(admission().queryByRole('spinbutton')).not.toBeInTheDocument());
    expect(withdrawal().getByRole('spinbutton')).toHaveValue(3);
    expect(screen.queryByRole('combobox', { name: /Rounding/ })).not.toBeInTheDocument();
  });

  it.each([false, true])(
    'selects full month from the cutoff dropdown (withdrawal: %s)',
    async (isWithdrawal) => {
      const onSubmit = vi.fn();
      render(
        <Harness
          onSubmit={onSubmit}
          rules={[
            rule({
              earlyWithdrawalRuleType: 'MonthlyProration',
              earlyWithdrawalConfiguration: { monthlyRule: 'HalfMonthRule', cutOffDay: 12 },
            }),
          ]}
        />
      );
      await expand();
      const selected = isWithdrawal ? withdrawal : admission;
      const other = isWithdrawal ? admission : withdrawal;
      await act(async () => {
        fireEvent.mouseDown(selected().getByRole('combobox', { name: 'Cut-off behavior' }));
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('option', { name: 'Full month charge' }));
      });
      expect(selected().getByRole('combobox', { name: 'Proration model' })).toHaveTextContent(
        'Monthly proration'
      );
      expect(selected().getByRole('combobox', { name: 'Cut-off behavior' })).toHaveTextContent(
        'Full month charge'
      );
      expect(selected().queryByRole('spinbutton')).not.toBeInTheDocument();
      expect(other().getByRole('spinbutton')).toHaveValue(isWithdrawal ? 15 : 12);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
      });
      await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
      expect(onSubmit.mock.calls[0][0].feeHeadRules[0]).toMatchObject(
        isWithdrawal
          ? {
              ruleType: 'MonthlyCutoff',
              cutoffDay: 15,
              earlyWithdrawalRuleType: 'FullMonthCharge',
              earlyWithdrawalCutoffDay: null,
              earlyWithdrawalBeforeCutoffAction: null,
            }
          : {
              ruleType: 'FullMonthCharge',
              cutoffDay: null,
              afterCutoffAction: null,
              earlyWithdrawalRuleType: 'MonthlyCutoff',
              earlyWithdrawalCutoffDay: 12,
              earlyWithdrawalBeforeCutoffAction: 'HalfCharge',
            }
      );
      await act(async () => {
        fireEvent.mouseDown(selected().getByRole('combobox', { name: 'Cut-off behavior' }));
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('option', { name: 'Half month charge' }));
      });
      expect(selected().getByRole('spinbutton')).toHaveValue(15);
      expect(other().getByRole('spinbutton')).toHaveValue(isWithdrawal ? 15 : 12);
    }
  );

  it('displays a saved full-month rule as monthly proration with full-month cutoff behavior', async () => {
    render(<Harness rules={[rule({ ruleType: 'FullMonthCharge', configuration: {} })]} />);
    await expand();
    expect(admission().getByRole('combobox', { name: 'Proration model' })).toHaveTextContent(
      'Monthly proration'
    );
    expect(admission().getByRole('combobox', { name: 'Cut-off behavior' })).toHaveTextContent(
      'Full month charge'
    );
    expect(admission().queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it.each(['DailyProration', 'MonthlyProration', 'NoProration'] as const)(
    'preserves withdrawal and one-time fees in the %s admission preset',
    (model) => {
      const original = rule();
      const oneTime = rule({ feeType: 'OneTime' });
      const updated = applyAdmissionPreset([original, oneTime], model);
      expect(updated[0]).toMatchObject({
        earlyWithdrawalRuleType: original.earlyWithdrawalRuleType,
        earlyWithdrawalConfiguration: original.earlyWithdrawalConfiguration,
        applyOnEarlyWithdrawal: true,
      });
      expect(updated[0].configuration.roundOff).toBe('RoundUp');
      expect(updated[1]).toBe(oneTime);
      expect(original.ruleType).toBe('MonthlyProration');
    }
  );

  it('resets admission from the UI without removing withdrawal', async () => {
    render(<Harness />);
    await act(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Reset admission' }));
      });
      await expand();
    });
    await waitFor(() =>
      expect(admission().getByRole('combobox', { name: 'Proration model' })).toHaveTextContent(
        'No proration'
      )
    );
    expect(withdrawal().getByRole('spinbutton')).toHaveValue(3);
  });

  it('reveals all event errors on submit, expands the row, and focuses the first field', async () => {
    render(
      <Harness
        rules={[
          rule({
            configuration: { monthlyRule: 'ChargeNextMonth', cutOffDay: 32 },
            earlyWithdrawalConfiguration: {
              calculationBasis: 'CalendarDays',
              minimumChargeDays: -1,
            },
          }),
        ]}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Collapse Tuition fee' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    );
    expect(
      admission().getByText('Monthly cut-off day must be a whole number from 1 to 31')
    ).toBeInTheDocument();
    expect(
      withdrawal().getByText('Minimum charge days must be a whole number from 0 to 366')
    ).toBeInTheDocument();
    await waitFor(() => expect(admission().getByRole('spinbutton')).toHaveFocus());
    expect(screen.getByText('Pending: Enabled event settings')).toBeInTheDocument();
  });

  it('shows field errors after blur, preserves invalid values, and saves when that event is disabled', async () => {
    const saved = vi.fn();
    render(<Harness onSubmit={saved} />);
    await expand();
    const cutoff = admission().getByRole('spinbutton');
    await act(async () => {
      fireEvent.change(cutoff, { target: { value: '32' } });
    });
    await waitFor(() => expect(cutoff).toHaveValue(32));
    expect(
      admission().queryByText('Monthly cut-off day must be a whole number from 1 to 31')
    ).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.blur(cutoff);
    });
    await waitFor(() =>
      expect(
        admission().getByText('Monthly cut-off day must be a whole number from 1 to 31')
      ).toBeInTheDocument()
    );
    await act(async () => {
      fireEvent.click(admission().getByRole('switch'));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    });
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(saved.mock.calls[0][0].feeHeadRules[0]).toMatchObject({
      applyOnAdmission: false,
      applyOnEarlyWithdrawal: true,
      earlyWithdrawalRuleType: 'Daily',
      roundingMode: 'RoundUpRupee',
    });
    await act(async () => {
      fireEvent.click(admission().getByRole('switch'));
    });
    expect(admission().getByRole('spinbutton')).toHaveValue(32);
  });

  it('focuses the missing-proration message when all events are off', async () => {
    render(<Harness rules={[rule({ applyOnAdmission: false, applyOnEarlyWithdrawal: false })]} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    expect(screen.getByRole('alert')).toHaveTextContent('at least one recurring fee head');
  });
});
