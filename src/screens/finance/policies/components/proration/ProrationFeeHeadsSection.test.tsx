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
  earlyWithdrawalConfiguration: { calculationBasis: 'CalendarDays' },
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
  it('keeps controls outside the keyboard-scrollable list and preserves expanded rows on scroll', async () => {
    render(
      <Harness
        rules={[
          rule(),
          ...Array.from({ length: 20 }, (_, index) =>
            rule({ feeHeadId: `head-${index}`, feeHeadName: `Recurring fee ${index + 1}` })
          ),
        ]}
      />
    );
    const list = screen.getByRole('region', { name: 'Configured fee heads' });
    expect(list).toHaveAttribute('tabindex', '0');
    expect(within(list).queryByRole('textbox', { name: 'Search fee heads' })).toBeNull();
    expect(within(list).queryByRole('group', { name: 'Admission presets' })).toBeNull();
    expect(
      within(list).getByRole('button', { name: 'Configure Recurring fee 20' })
    ).toBeInTheDocument();
    await expand();
    fireEvent.scroll(list, { target: { scrollTop: 1200 } });
    expect(screen.getByRole('button', { name: 'Collapse Tuition fee' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(admission().getByRole('spinbutton')).toHaveValue(15);
    expect(screen.getByRole('textbox', { name: 'Search fee heads' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All Daily' })).toBeEnabled();
  });

  it('searches by name without changing row identity or losing edits', async () => {
    const saved = vi.fn();
    render(
      <Harness
        onSubmit={saved}
        rules={[rule(), rule({ feeHeadId: 'hostel', feeHeadName: 'Hostel fee' })]}
      />
    );
    await expand();
    await act(async () => {
      fireEvent.change(admission().getByRole('spinbutton'), { target: { value: '16' } });
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search fee heads' }), {
      target: { value: '  HOSTEL  ' },
    });
    expect(screen.queryByRole('button', { name: 'Collapse Tuition fee' })).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Configure Hostel fee' }));
    });
    const hostel = within(
      screen.getByRole('region', { name: 'Admission settings for Hostel fee' })
    );
    await act(async () => {
      fireEvent.change(hostel.getByRole('spinbutton'), { target: { value: '22' } });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear fee head search' }));
    expect(admission().getByRole('spinbutton')).toHaveValue(16);
    expect(hostel.getByRole('spinbutton')).toHaveValue(22);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    });
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(
      saved.mock.calls[0][0].feeHeadRules.map((entry: { feeHeadId: string; cutoffDay: number }) => [
        entry.feeHeadId,
        entry.cutoffDay,
      ])
    ).toEqual([
      ['tuition', 16],
      ['hostel', 22],
    ]);
  });

  it('provides a clear-search action when no fee head matches', () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search fee heads' }), {
      target: { value: 'missing fee head' },
    });
    expect(screen.getByText('Not found')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Configure Tuition fee' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    expect(screen.getByRole('textbox', { name: 'Search fee heads' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Configure Tuition fee' })).toBeInTheDocument();
  });

  it('applies admission presets to all recurring heads while search is active', async () => {
    const saved = vi.fn();
    render(
      <Harness
        onSubmit={saved}
        rules={[
          rule(),
          rule({ feeHeadId: 'hostel', feeHeadName: 'Hostel fee' }),
          rule({
            feeHeadId: 'registration',
            feeHeadName: 'Registration',
            feeType: 'OneTime',
            ruleType: 'NoProration',
            applyOnAdmission: false,
            applyOnEarlyWithdrawal: false,
          }),
        ]}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Search fee heads' }), {
      target: { value: 'hostel' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'All Daily' }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    });
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(saved.mock.calls[0][0].feeHeadRules).toEqual([
      expect.objectContaining({
        feeHeadId: 'tuition',
        ruleType: 'Daily',

        earlyWithdrawalRuleType: 'Daily',
      }),
      expect.objectContaining({
        feeHeadId: 'hostel',
        ruleType: 'Daily',

        earlyWithdrawalRuleType: 'Daily',
      }),
    ]);
  });

  it('clears search to reveal and focus invalid hidden fee-head settings on submit', async () => {
    render(
      <Harness
        rules={[
          rule({ configuration: { monthlyRule: 'ChargeNextMonth', cutOffDay: 32 } }),
          rule({ feeHeadId: 'hostel', feeHeadName: 'Hostel fee' }),
        ]}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Search fee heads' }), {
      target: { value: 'hostel' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    });
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Search fee heads' })).toHaveValue('')
    );
    await waitFor(() => expect(admission().getByRole('spinbutton')).toHaveFocus());
  });

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
    expect(withdrawal().queryByRole('spinbutton')).not.toBeInTheDocument();
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
    expect(withdrawal().queryByRole('spinbutton')).not.toBeInTheDocument();
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
      expect(screen.queryByRole('option', { name: 'No proration' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('option', { name: 'Daily proration' }));
    });
    await waitFor(() =>
      expect(admission().getByRole('combobox', { name: /Calculation basis/ })).toHaveTextContent(
        'Calendar days'
      )
    );
    expect(withdrawal().queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Rounding/ })).not.toBeInTheDocument();
  });

  it.each([false, true])(
    'offers only daily and monthly models (withdrawal: %s)',
    async (isWithdrawal) => {
      render(<Harness />);
      await expand();
      const selected = isWithdrawal ? withdrawal : admission;
      await act(async () => {
        fireEvent.mouseDown(selected().getByRole('combobox', { name: 'Proration model' }));
      });
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
        'Daily proration',
        'Monthly proration',
      ]);
    }
  );

  it.each([false, true])(
    'preserves an existing no-proration value until it is edited (withdrawal: %s)',
    async (isWithdrawal) => {
      const saved = vi.fn();
      render(
        <Harness
          onSubmit={saved}
          rules={[
            rule(
              isWithdrawal
                ? { earlyWithdrawalRuleType: 'NoProration' }
                : { ruleType: 'NoProration' }
            ),
          ]}
        />
      );
      await expand();
      const selected = isWithdrawal ? withdrawal : admission;
      expect(selected().getByRole('combobox', { name: 'Proration model' })).not.toHaveTextContent(
        /No proration|Daily proration|Monthly proration/
      );
      expect(
        selected().getByText('Choose daily or monthly proration, or turn off this event.')
      ).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
      });
      await waitFor(() => expect(saved).toHaveBeenCalledOnce());
      expect(saved.mock.calls[0][0].feeHeadRules[0]).toMatchObject(
        isWithdrawal
          ? { ruleType: 'MonthlyCutoff', earlyWithdrawalRuleType: 'FullCharge' }
          : { ruleType: 'FullCharge', earlyWithdrawalRuleType: 'Daily' }
      );
    }
  );

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

  it.each([false, true])(
    'saves full-month proration as the only enabled event (withdrawal: %s)',
    async (isWithdrawal) => {
      const saved = vi.fn();
      render(
        <Harness
          onSubmit={saved}
          rules={[
            rule({
              applyOnAdmission: !isWithdrawal,
              applyOnEarlyWithdrawal: isWithdrawal,
              earlyWithdrawalRuleType: 'MonthlyProration',
              earlyWithdrawalConfiguration: { monthlyRule: 'HalfMonthRule', cutOffDay: 12 },
            }),
          ]}
        />
      );
      await expand();
      const selected = isWithdrawal ? withdrawal : admission;
      await act(async () => {
        fireEvent.mouseDown(selected().getByRole('combobox', { name: 'Cut-off behavior' }));
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('option', { name: 'Full month charge' }));
      });
      expect(screen.getByText('1 / 1 prorated')).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
      });
      await waitFor(() => expect(saved).toHaveBeenCalledOnce());
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(saved.mock.calls[0][0].feeHeadRules[0]).toMatchObject({
        applyOnAdmission: !isWithdrawal,
        applyOnEarlyWithdrawal: isWithdrawal,
        ...(isWithdrawal
          ? { earlyWithdrawalRuleType: 'FullMonthCharge' }
          : { ruleType: 'FullMonthCharge' }),
      });
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
        fireEvent.click(screen.getByRole('button', { name: 'Reset Admission' }));
      });
      await expand();
    });
    await waitFor(() =>
      expect(admission().getByRole('combobox', { name: 'Proration model' })).not.toHaveTextContent(
        /No proration|Daily proration|Monthly proration/
      )
    );
    expect(withdrawal().queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('reveals all event errors on submit, expands the row, and focuses the first field', async () => {
    render(
      <Harness
        rules={[
          rule({
            configuration: { monthlyRule: 'ChargeNextMonth', cutOffDay: 32 },
            earlyWithdrawalConfiguration: {
              calculationBasis: undefined,
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
    expect(withdrawal().getByText('Calculation basis is required')).toBeInTheDocument();
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
