import type { AssignmentPreview } from 'src/redux/finance/studentFeeAssignment';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

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

const mount = (data = preview, committed = false, dirty = false) =>
  render(
    <Provider store={configureStore({ reducer: () => ({ confirmPopup: { isChanges: dirty } }) })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AssignmentReview data={data} committed={committed} />
      </ThemeProvider>
    </Provider>
  );

describe('assignment review evidence', () => {
  it('shows canonical totals, skipped heads and every installment without hidden paging', () => {
    mount();
    expect(screen.getByText('Total to assign').nextElementSibling).toHaveTextContent('₹ 1,000');
    expect(screen.queryByText('Before service adjustment')).not.toBeInTheDocument();
    expect(screen.queryByText('Service reduction')).not.toBeInTheDocument();
    const heads = within(
      screen.getByRole('table', { name: 'Assignment fee-head breakdown table' })
    );
    expect(heads.getByText('Not selected')).toBeInTheDocument();
    expect(heads.getByText('Not assigned')).toBeInTheDocument();
    expect(heads.getByText('Monthly · v3')).toBeInTheDocument();
    expect(
      heads.queryByRole('button', { name: 'Tuition service details' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Configured dates are in the past.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
    const schedule = within(screen.getByRole('table', { name: 'Preview fee installments table' }));
    expect(schedule.getAllByRole('row')).toHaveLength(13);
    expect(schedule.getByText('Tuition · Installment 12')).toBeInTheDocument();
  });

  it('shows policy names and versions with read-only policy view fields', () => {
    mount();
    expect(screen.getByText('collection policy')).toBeVisible();
    expect(screen.getByText('School collection · v2')).toBeVisible();
    expect(screen.queryByRole('button', { name: /edit|service details/i })).not.toBeInTheDocument();
  });

  it('collapses evidence tables independently while keeping totals, policies and View all available', async () => {
    mount();
    const heads = screen.getByRole('button', { name: 'Collapse fee breakdown' });
    const schedule = screen.getByRole('button', { name: 'Collapse installment schedule' });
    expect(heads).toHaveAttribute('aria-expanded', 'true');
    expect(schedule).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(heads);
    await waitFor(
      () =>
        expect(
          screen.queryByRole('table', { name: 'Assignment fee-head breakdown table' })
        ).not.toBeInTheDocument(),
      { timeout: 10000 }
    );
    expect(
      screen.getByRole('table', { name: 'Assignment installment schedule table' })
    ).toBeVisible();
    fireEvent.click(schedule);
    await waitFor(
      () =>
        expect(
          screen.queryByRole('table', { name: 'Assignment installment schedule table' })
        ).not.toBeInTheDocument(),
      { timeout: 10000 }
    );
    expect(screen.getByText('Total to assign')).toBeVisible();
    expect(screen.getByText('School collection · v2')).toBeVisible();
    expect(screen.getByRole('button', { name: 'View all' })).toBeEnabled();
    const expand = screen.getByRole('button', { name: 'Expand fee breakdown' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(expand.getAttribute('aria-controls')!)).toBeInTheDocument();
    fireEvent.click(expand);
    expect(
      await screen.findByRole('table', { name: 'Assignment fee-head breakdown table' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Expand installment schedule' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('opens installment evidence with its original information controls and tooltips', async () => {
    mount();
    const viewAll = screen.getByRole('button', { name: 'View all' });
    expect(viewAll).toHaveClass('MuiLink-root');
    expect(viewAll).not.toHaveClass('MuiButton-root');
    fireEvent.click(viewAll);
    const dialog = within(screen.getByRole('dialog'));
    const shareHeader = within(dialog.getByRole('columnheader', { name: /Share/ }));
    expect(shareHeader.getAllByText('Share')).toHaveLength(1);
    expect(dialog.getByRole('button', { name: 'About installment shares' })).toBeVisible();
    expect(dialog.getByRole('button', { name: 'About installment demand dates' })).toBeVisible();
    expect(dialog.getByRole('button', { name: 'About installment due dates' })).toBeVisible();
    expect(dialog.getByRole('button', { name: 'About installment obligations' })).toBeVisible();
    const explanation = dialog.getByRole('button', {
      name: 'Tuition Installment 1 calculation details',
    });
    act(() => explanation.focus());
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Reviewed service charge');
  });

  it('closes installment evidence without discarding the parent assignment form', async () => {
    const confirm = vi.fn();
    vi.stubGlobal('confirm', confirm);
    mount(preview, false, true);
    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Installment details');
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(confirm).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('preserves saved balances and does not invent legacy schedule evidence', () => {
    mount({ ...preview, calculationVersion: 'LegacyUnknown' }, true);
    expect(screen.queryByText('Before service adjustment')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Coverage amount' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Recorded Amount' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
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
