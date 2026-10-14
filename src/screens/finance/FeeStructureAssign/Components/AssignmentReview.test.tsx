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
    dueDate: '2026-04-10',
    demandDate: '2026-04-01',
    allocationPercentage: 8.33,
    scheduledAmount: 100,
    proratedAmount: 80,
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
    expect(screen.getByText('Total obligation').nextElementSibling).toHaveTextContent('₹ 1,000');
    expect(screen.getByText('Service reduction').nextElementSibling).toHaveTextContent('₹ 200');
    const heads = within(
      screen.getByRole('table', { name: 'Assignment fee-head breakdown table' })
    );
    expect(heads.getByText('Not selected')).toBeInTheDocument();
    expect(heads.getByText('No obligation')).toBeInTheDocument();
    expect(heads.getByText('Monthly · v3')).toBeInTheDocument();
    expect(heads.getByText('Configured year, not a verified joining date')).toBeInTheDocument();
    const schedule = within(screen.getByRole('table', { name: 'Preview fee installments table' }));
    expect(schedule.getAllByRole('row')).toHaveLength(13);
    expect(schedule.getByText('Tuition · Installment 12')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Configured dates are in the past.');
  });

  it('keeps policy versions visible and reveals treatment on expansion', () => {
    mount();
    const policy = screen.getByRole('button', { name: /Applicable policies/ });
    expect(policy).toHaveAttribute('aria-expanded', 'false');
    expect(policy).toHaveTextContent('School collection · v2');
    fireEvent.click(policy);
    expect(policy).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Tuition: Evaluated during collection only.')).toBeVisible();
  });

  it('preserves saved balances and does not invent legacy schedule evidence', () => {
    mount({ ...preview, calculationVersion: 'LegacyUnknown' }, true);
    expect(screen.queryByText('Configured schedule')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Coverage amount' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Recorded obligation' })).toBeInTheDocument();
    const schedule = within(
      screen.getByRole('table', { name: 'Assigned fee installments and balances table' })
    );
    expect(schedule.getAllByText('Unknown')).toHaveLength(12);
    expect(schedule.getByRole('columnheader', { name: 'Paid' })).toBeInTheDocument();
    expect(schedule.getByRole('columnheader', { name: 'Outstanding' })).toBeInTheDocument();
    expect(schedule.getAllByText('₹ 30')).toHaveLength(12);
    expect(schedule.getAllByText('₹ 50')).toHaveLength(12);
  });
});
