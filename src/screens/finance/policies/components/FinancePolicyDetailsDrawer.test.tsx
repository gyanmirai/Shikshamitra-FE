import React from 'react';
import { it, vi, expect } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import FinancePolicyDetailsDrawer, { FinancePolicyDetails } from './FinancePolicyDetailsDrawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('./FinancePolicySkeleton', () => ({
  default: ({ label }: any) => <div role="status">{label}</div>,
}));

const { simulate } = vi.hoisted(() => ({ simulate: vi.fn() }));
vi.mock('src/redux/finance/prorationPolicy', () => ({
  useSimulateProrationPolicyMutation: simulate.mockReturnValue([vi.fn(), { isLoading: false }]),
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: () => ({
    currentData: { incomeCategories: [{ id: 'category-id', label: 'Late fees' }] },
    isFetching: false,
  }),
}));
const policy = {
  id: 'refund-1',
  policyType: 'refund',
  policyName: 'Saved refund',
  status: 'Active',
  version: 1,
  creationTime: '2026-11-24T10:00:00Z',
} as any;

it('replaces all detail fields with loading state until configuration arrives', () => {
  const { rerender } = render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={policy}
      policyDetails={undefined}
      isLoading
    />
  );
  expect(screen.getByRole('status')).toHaveTextContent('Loading policy configuration');
  expect(screen.queryByText('No description provided.')).not.toBeInTheDocument();
  expect(screen.queryByText('General Information')).not.toBeInTheDocument();
  rerender(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={policy}
      policyDetails={{ description: 'Saved description' }}
    />
  );
  expect(screen.getByText('Saved description')).toBeInTheDocument();
});

it('shows a failed request with retry instead of empty saved values', () => {
  const retry = vi.fn();
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={policy}
      policyDetails={undefined}
      isError
      onRetry={retry}
    />
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load this policy');
  expect(screen.queryByText('No description provided.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(retry).toHaveBeenCalledOnce();
});

it('shows refund fee head names and lifecycle labels without exposing reference ids', () => {
  const feeHeadId = '3a240330-46a0-f61e-020d-0648c28c0436';
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={policy}
      policyDetails={{
        feeHeadScope: 'SelectedFeeHeads',
        applicableFeeHeadIds: [feeHeadId],
        feeHeadNames: { [feeHeadId]: 'Transport Fee' },
        feeHeadStatuses: { [feeHeadId]: 'Inactive' },
        expenseCategoryId: 'expense-id',
        expenseCategoryName: 'Student refunds',
        defaultPayingBankAccountId: 'account-id',
        defaultPayingBankAccountName: 'Main payout account',
      }}
    />
  );
  expect(screen.getByText('Transport Fee (Inactive)')).toBeInTheDocument();
  expect(screen.getByText('Student refunds')).toBeInTheDocument();
  expect(screen.getByText('Main payout account')).toBeInTheDocument();
  expect(screen.queryByText(feeHeadId)).not.toBeInTheDocument();
});

it.each([{ maximumPerRequest: 12500, maximumPerStudentYear: 25000 }, {}])(
  'shows refund eligibility and payout settings without calculation, version, or settlement metadata (%j)',
  (caps) => {
    render(
      <FinancePolicyDetailsDrawer
        open
        onClose={vi.fn()}
        policy={policy}
        policyDetails={{
          ...caps,
          amountMode: 'Percentage',
          percentageValue: 25,
          allowedPayoutMethods: ['Cash', 'BankTransfer'],
          deductionType: 'Percentage',
          deductionValue: 5,
          maximumDeduction: 400,
          deductionExplanation: 'Legacy fee',
          processingTargetDays: 7,
        }}
      />
    );

    expect(screen.getByText('Active')).toBeVisible();
    expect(screen.queryByText('v1')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'General Information' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Refund Scope & Eligibility' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Refund Calculation' })).not.toBeInTheDocument();
    expect(screen.queryByText('Amount calculation mode')).not.toBeInTheDocument();
    expect(screen.queryByText('25%')).not.toBeInTheDocument();
    const disbursement = screen
      .getByRole('heading', { name: 'Deductions & Allowed Disbursement' })
      .closest('section')!;
    expect(within(disbursement).getByText('Permitted payout channels')).toBeVisible();
    expect(within(disbursement).getByText('BankTransfer')).toBeVisible();
    expect(within(disbursement).queryByText('Administrative deduction rule')).not.toBeInTheDocument();
    expect(within(disbursement).queryByText('Operational processing SLA')).not.toBeInTheDocument();
    expect(within(disbursement).queryByText('Legacy fee')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Settlement Guarantees & Constraints' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Version & Audit Trail' })).not.toBeInTheDocument();
  }
);

it('shows saved concession settings and the active version in General Information', () => {
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={{
        ...policy,
        policyType: 'concession',
        policyName: 'Sibling assistance',
        policyCode: 'CON-INTERNAL',
        academicYearName: '2026–2027',
        updatedAt: '2026-11-24T11:00:00Z',
      }}
      policyDetails={{
        description: 'Supports siblings at the same school.',
        valueSource: 'PolicyFixed',
        calculationMethod: 'Percentage',
        percentageValue: 25,
        applyOn: 'AllFees',
        autoCreateRefund: false,
      }}
    />
  );
  expect(screen.getByRole('heading', { name: 'Sibling assistance' })).toBeVisible();
  expect(screen.getByText('2026–2027')).toBeVisible();
  expect(screen.getByText('Supports siblings at the same school.')).toBeVisible();
  expect(screen.getByText('Default selection')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Calculation Rules' })).toBeVisible();
  expect(screen.getByText('25%')).toBeVisible();
  const scope = screen.getByRole('heading', { name: 'Application Scope' }).closest('section')!;
  expect(within(scope).getByText('All installments (including paid)')).toBeVisible();
  expect(
    within(scope).getByText('Automatically create refund requests on concession approval')
  ).toBeVisible();
  expect(within(scope).getByText('No / Disabled')).toBeVisible();
  const general = screen.getByRole('heading', { name: 'General Information' }).closest('section')!;
  expect(within(general).getByText('Active version')).toBeVisible();
  expect(within(general).getByText('Version 1')).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Usage And History' })).not.toBeInTheDocument();
  expect(screen.queryByText('Last modified')).not.toBeInTheDocument();
  expect(screen.queryByText('v1')).not.toBeInTheDocument();
  expect(screen.queryByText('Policy code')).not.toBeInTheDocument();
  expect(screen.queryByText('CON-INTERNAL')).not.toBeInTheDocument();
  expect(screen.queryByText('Fee head eligibility')).not.toBeInTheDocument();
  expect(screen.queryByText('Downstream attachment')).not.toBeInTheDocument();
  expect(screen.queryByText('Created date')).not.toBeInTheDocument();
});

it('shows collection settings from the creation form and moves the draft version into General Information', () => {
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={{
        ...policy,
        policyType: 'collection',
        policyName: 'Saved collection policy',
        policyCode: 'CP-INTERNAL',
        status: 'Draft',
      }}
      policyDetails={{
        allocationBasis: 'Installment',
        receiptGrouping: 'Combined',
        enableLateFee: true,
        gracePeriodDays: 0,
        lateFeeType: 'Flat',
        flatAmount: 350,
        academicYearId: 'academic-year-id',
        lateFeeIncomeCategoryId: 'category-id',
        allowOnlineCollection: true,
        considerAsIncome: true,
        maximumLateFeeAmount: 800,
        maximumChargingDays: 60,
      }}
    />
  );
  const general = screen.getByRole('heading', { name: 'General Information' }).closest('section')!;
  expect(within(general).getByText('Version 1')).toBeVisible();
  expect(screen.queryByText('v1')).not.toBeInTheDocument();
  expect(screen.queryByText('CP-INTERNAL')).not.toBeInTheDocument();
  expect(screen.getByText('Installment first (earliest due)')).toBeVisible();
  expect(screen.getByText('Single combined receipt')).toBeVisible();
  expect(
    screen.queryByText('Reconciliation entries when verification is required')
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Collection & Gateway Settings' })
  ).not.toBeInTheDocument();
  const lateFees = screen.getByRole('heading', { name: 'Late Fee Rules' }).closest('section')!;
  expect(within(lateFees).getByText('Enable late fee charges')).toBeVisible();
  expect(within(lateFees).getByText('0 calendar days')).toBeVisible();
  expect(within(lateFees).getByText('Calculation method')).toBeVisible();
  expect(within(lateFees).getByText('Flat late fee amount')).toBeVisible();
  expect(within(lateFees).getByText('Late fees')).toBeVisible();
  expect(within(lateFees).queryByText('Maximum late fee ceiling')).not.toBeInTheDocument();
  expect(within(lateFees).queryByText('Maximum charging days')).not.toBeInTheDocument();
});

it('shows the disabled late fee setting without inapplicable collection values', () => {
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={{ ...policy, policyType: 'collection' }}
      policyDetails={{
        enableLateFee: false,
        gracePeriodDays: 5,
        lateFeeType: 'PerWeek',
        amountPerWeek: 100,
        lateFeeIncomeCategoryName: 'Late fees',
      }}
    />
  );
  const lateFees = screen.getByRole('heading', { name: 'Late Fee Rules' }).closest('section')!;
  expect(within(lateFees).getByText('No / Disabled')).toBeVisible();
  expect(within(lateFees).queryByText('Grace period')).not.toBeInTheDocument();
  expect(within(lateFees).queryByText('Calculation method')).not.toBeInTheDocument();
  expect(within(lateFees).queryByText('Late fee income category')).not.toBeInTheDocument();
});

it('shows saved admission and withdrawal rules in a read-only proration drawer', () => {
  simulate.mockClear();
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={{
        ...policy,
        id: 'proration-1',
        policyType: 'proration',
        policyName: 'September proration',
        policyCode: 'PRO-INTERNAL',
        version: 2,
      }}
      policyDetails={{
        version: 2,
        feeHeadRules: [
          {
            feeHeadId: 'tuition',
            feeHeadName: 'Tuition',
            ruleType: 'MonthlyCutoff',
            cutoffDay: 3,
            applyOnAdmission: false,
            applyOnEarlyWithdrawal: true,
            earlyWithdrawalRuleType: 'Daily',
            roundingMode: 'Currency',
          },
          {
            feeHeadId: 'missing-head-id',
            ruleType: 'MonthlyCutoff',
            applyOnAdmission: true,
            cutoffDay: 15,
            afterCutoffAction: 'HalfCharge',
            applyOnEarlyWithdrawal: false,
            roundingMode: 'Currency',
          },
        ],
      }}
    />
  );

  const general = screen.getByRole('heading', { name: 'General Information' }).closest('section')!;
  expect(within(general).getByText('Version 2')).toBeVisible();
  expect(screen.queryByText('PRO-INTERNAL')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Proration Strategy & Scope' })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Fee Head Configuration' })).toBeVisible();
  const rule = screen.getByRole('row', { name: /Tuition Disabled Daily proration Calendar days/i });
  expect(rule).toBeVisible();
  expect(screen.getByText('Half month charge')).toBeVisible();
  expect(screen.getByText('Monthly cut-off day 15')).toBeVisible();
  expect(screen.queryByText('Monthly cut-off day 3')).not.toBeInTheDocument();
  expect(screen.queryByText('missing-head-id')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close September proration' })).toBeVisible();
  expect(screen.queryByText('v1')).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Proration Preview' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Version & Audit Trail' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /edit|calculate|submit/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(simulate).not.toHaveBeenCalled();
});

it.each(['Combined', 'Separate'])(
  'limits compact default, version and receipt presentation to Fee Structure (%s)',
  (receiptGrouping) => {
    const props = {
      policy: { ...policy, policyType: 'collection' as const, policyName: 'School collection', isDefault: true, academicYearName: '2026–27' },
      policyDetails: { description: 'Saved collection settings', version: 3, receiptGrouping, enableLateFee: false, allocationBasis: 'FeeHead' },
    };
    const { rerender } = render(<FinancePolicyDetails {...props} presentation="feeStructure" showVersionBadge />);
    expect(screen.queryByText('v1')).toBeNull();
    expect(screen.queryByText('Version 3')).toBeNull();
    expect(screen.queryByText('Default selection')).toBeNull();
    expect(screen.getAllByRole('img', { name: 'Default policy' })).toHaveLength(2);
    const general = screen.getByRole('heading', { name: 'General Information' }).closest('section')!;
    expect(within(general).getByText('Policy name')).toBeVisible();
    expect(within(general).getByText('Academic year')).toBeVisible();
    expect(within(general).getByText('Description')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Payment Priority' })).toBeVisible();
    const receipts = screen.getByRole('heading', { name: 'Receipts' }).closest('section')!;
    expect(within(receipts).getByText('Fee receipts')).toBeVisible();
    expect(within(receipts).getByText('Charge receipts')).toBeVisible();
    expect(within(receipts).getByText(receiptGrouping === 'Combined' ? 'Combined with charges' : 'Separate from charges')).toBeVisible();
    expect(within(receipts).getByText(receiptGrouping === 'Combined' ? 'Combined with fees' : 'Separate from fees')).toBeVisible();

    rerender(<FinancePolicyDetails {...props} />);
    expect(screen.getByText('Default selection')).toBeVisible();
    expect(screen.getByText('Version 3')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Automatic Payment Priority' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Receipt Generation' })).toBeVisible();
    expect(screen.queryByRole('img', { name: 'Default policy' })).toBeNull();
    expect(screen.queryByText('Fee receipts')).toBeNull();
  }
);
