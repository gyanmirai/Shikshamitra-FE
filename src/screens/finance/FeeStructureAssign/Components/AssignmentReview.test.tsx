import type { AssignmentPreview } from 'src/redux/finance/studentFeeAssignment';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import AssignmentReview from './AssignmentReview';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/finance/studentFeeAssignment', () => ({
  selectableAssignmentPolicyFamilies: ['refund', 'collection'],
}));
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: vi.fn() }));

const preview: AssignmentPreview = {
  studentId: 'student',
  academicYearId: 'year',
  structureId: 'structure',
  structureName: 'School fees',
  revisionNumber: 2,
  currency: 'INR',
  scheduledTotal: 1200,
  proratedTotal: 1000,
  reductionTotal: 200,
  previewToken: 'test-token',
  warnings: ['Configured dates are in the past.'],
  heads: [
    {
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition',
      isOptional: false,
      isOneTime: false,
      included: true,
      configuredAmount: 1200,
      effectiveAmount: 1200,
      amountBasis: 'AnnualTotal',
      obligation: 1000,
      verification: 'Configured year, not a verified joining date',
      paymentTermName: 'Monthly',
      paymentTermVersionNumber: 3,
      servicePeriod: {
        feeHeadId: 'tuition',
        source: 'AcademicYear',
        startDate: '2026-04-01',
        endDate: '2027-03-31',
      },
    },
    {
      feeHeadId: 'transport',
      feeHeadName: 'Transport',
      isOptional: true,
      isOneTime: false,
      included: false,
      configuredAmount: 500,
      effectiveAmount: null,
      amountBasis: 'AnnualTotal',
      obligation: 0,
      verification: '',
    },
  ],
  lines: Array.from({ length: 12 }, (_, i) => ({
    feeHeadId: 'tuition',
    feeHeadName: 'Tuition',
    sequence: i + 1,
    installmentLabel: `Installment ${i + 1}`,
    coverageStartDate: i === 0 ? '2026-04-05' : undefined,
    coverageEndDate: i === 0 ? '2026-04-30' : undefined,
    dueDate: '2026-04-10',
    demandDate: '2026-04-01',
    allocationPercentage: 8.33,
    scheduledAmount: 100,
    proratedAmount: i < 10 ? 80 : 100,
    reductionAmount: i < 10 ? 20 : 0,
    ruleType: 'Daily',
    paidAmount: 30,
    outstandingAmount: 50,
    explanation: 'Reviewed service charge',
  })),
  policies: [
    {
      family: 'collection',
      policyId: 'collection',
      versionId: 'collection-v2',
      name: 'School collection',
      version: 2,
      source: 'FeeStructure',
      headTreatment: { tuition: 'Evaluated during collection only.' },
    },
  ],
};

const mount = (data = preview, committed = false) =>
  render(
    <Provider store={configureStore({ reducer: () => ({ confirmPopup: { isChanges: false } }) })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AssignmentReview data={data} committed={committed} />
      </ThemeProvider>
    </Provider>
  );

describe('assignment review evidence', () => {
  it('shows canonical totals, skipped heads and every installment without hidden paging', () => {
    mount();
    expect(screen.getByText('Final amount').nextElementSibling).toHaveTextContent('₹ 1,000');
    expect(screen.getByText('Total fees').nextElementSibling).toHaveTextContent('₹ 1,200');
    expect(screen.getByText('Proration reduction').nextElementSibling).toHaveTextContent('₹ 200');
    expect(screen.getByRole('group', { name: 'Assignment total calculation' })).toHaveTextContent(
      /Total fees\s*₹ 1,200\s*−\s*Proration reduction\s*₹ 200\s*=\s*Final amount\s*₹ 1,000/
    );
    expect(screen.queryByText('Before service adjustment')).not.toBeInTheDocument();
    expect(screen.queryByText('Service reduction')).not.toBeInTheDocument();
    const heads = within(screen.getByRole('region', { name: 'Fee Breakdown' }));
    expect(heads.getByText('Not selected')).toBeInTheDocument();
    expect(heads.queryByText('Not assigned')).not.toBeInTheDocument();
    expect(heads.getByText('Monthly')).toBeInTheDocument();
    expect(heads.getByText('₹ 1,000')).toBeVisible();
    expect(heads.queryByText('Daily proration')).not.toBeInTheDocument();
    expect(screen.queryByText('Configured dates are in the past.')).not.toBeInTheDocument();
    const tuition = heads.getByRole('button', { name: 'View Tuition installments' });
    expect(heads.getByText('Service dates')).toBeInTheDocument();
    expect(tuition).toHaveAttribute('aria-expanded', 'false');
    expect(tuition).toHaveAccessibleDescription('01 Apr 2026 – 31 Mar 2027');
    expect(within(tuition).getByText('01 Apr 2026 – 31 Mar 2027')).toBeVisible();
    fireEvent.click(tuition);
    const schedule = within(screen.getByRole('table', { name: 'Tuition installments' }));
    expect(schedule.getAllByRole('row')).toHaveLength(13);
    expect(schedule.getByText('Installment 12')).toBeInTheDocument();
    expect(schedule.getByRole('columnheader', { name: 'Service dates' })).toBeVisible();
    expect(
      within(schedule.getByRole('row', { name: /^Installment 1 / })).getByRole('cell', {
        name: '05 Apr 2026 – 30 Apr 2026',
      })
    ).toBeVisible();
    expect(
      within(schedule.getByRole('row', { name: /^Installment 2 / })).getByRole('cell', {
        name: '—',
      })
    ).toBeVisible();
    expect(schedule.getByRole('columnheader', { name: 'Available from' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'View all' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows policy names and versions with read-only policy view fields', () => {
    mount();
    expect(screen.getByText('Collection policy')).toBeVisible();
    expect(screen.getByText('School collection')).toBeVisible();
    expect(screen.queryByRole('button', { name: /edit|service details/i })).not.toBeInTheDocument();
  });

  it('explains the stored monthly cutoff factor and whole-rupee result', () => {
    mount(
      {
        ...preview,
        heads: [{ ...preview.heads[0], obligation: 4688 }],
        lines: [
          {
            ...preview.lines[0],
            ruleType: 'MonthlyCutoff',
            roundingMode: 'RoundUpRupee',
            scheduledAmount: 10_000,
            proratedAmount: 4688,
            reductionAmount: 5312,
            factor: 0.46875,
            explanation: 'Monthly cutoff evaluated across 16 service months.',
          },
        ],
        scheduledTotal: 10_000,
        proratedTotal: 4688,
        reductionTotal: 5312,
      },
      true
    );
    fireEvent.click(screen.getByRole('button', { name: 'View Tuition installments' }));
    const heads = within(screen.getByRole('region', { name: 'Fee Breakdown' }));
    expect(heads.getByText('Monthly cutoff', { exact: true })).toBeVisible();
    expect(
      heads.getByText('₹ 10,000 × 46.875% → ₹ 4,688 (rounded up to a whole rupee)')
    ).toBeVisible();
    expect(heads.getByText('Monthly cutoff evaluated across 16 service months.')).toBeVisible();
  });

  it('shows separate saved factors when a monthly fee was calculated by installment', () => {
    mount({
      ...preview,
      heads: [
        { ...preview.heads[0], amountBasis: 'MonthlyRate', effectiveAmount: 100, obligation: 150 },
      ],
      lines: [
        {
          ...preview.lines[0],
          scheduledAmount: 100,
          proratedAmount: 50,
          reductionAmount: 50,
          factor: 0.5,
        },
        {
          ...preview.lines[1],
          scheduledAmount: 100,
          proratedAmount: 100,
          reductionAmount: 0,
          factor: 1,
        },
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'View Tuition installments' }));
    const heads = within(screen.getByRole('region', { name: 'Fee Breakdown' }));
    expect(heads.getByText('₹ 200 − ₹ 50 = ₹ 150')).toBeVisible();
    const details = heads.getByText('Calculation by installment').closest('details')!;
    expect(within(details).getByText('Installment 1 ₹ 100 × 50% → ₹ 50')).toBeInTheDocument();
    expect(within(details).getByText('Installment 2 ₹ 100 × 100% → ₹ 100')).toBeInTheDocument();
    expect(within(details).getAllByText('Reviewed service charge')).toHaveLength(1);
  });

  it('keeps installment details closed until the head is opened', () => {
    mount();
    const schedule = screen.getByRole('button', { name: 'View Tuition installments' });
    expect(schedule).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('table', { name: 'Tuition installments' })).not.toBeInTheDocument();
    fireEvent.click(schedule);
    expect(schedule).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('table', { name: 'Tuition installments' })).toBeVisible();
    fireEvent.click(schedule);
    expect(screen.queryByRole('table', { name: 'Tuition installments' })).not.toBeInTheDocument();
    expect(screen.getByText('Final amount')).toBeVisible();
    expect(screen.getByText('School collection')).toBeVisible();
  });

  it('preserves saved balances and does not invent legacy schedule evidence', () => {
    mount({ ...preview, calculationVersion: 'LegacyUnknown' }, true);
    expect(screen.queryByText('Before service adjustment')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Coverage amount' })).not.toBeInTheDocument();
    expect(screen.getByText('Recorded amount')).toBeInTheDocument();
    expect(screen.queryByText('Daily proration')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View Tuition installments' }));
    const schedule = within(screen.getByRole('table', { name: 'Tuition installments' }));
    expect(schedule.getByRole('columnheader', { name: 'Paid' })).toBeInTheDocument();
    expect(schedule.getByRole('columnheader', { name: 'Outstanding' })).toBeInTheDocument();
    expect(schedule.getAllByText('₹ 30')).toHaveLength(12);
    expect(schedule.getAllByText('₹ 50')).toHaveLength(12);
  });
});
