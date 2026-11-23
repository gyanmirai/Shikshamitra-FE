import React from 'react';
import { it, vi, expect } from 'vitest';
import { formatNumber } from 'src/utils/formate_number';
import { render, screen, within, fireEvent } from '@testing-library/react';

import FinancePolicyDetailsDrawer from './FinancePolicyDetailsDrawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('./FinancePolicyDrawerHeader', () => ({ default: ({ title }: any) => <h2>{title}</h2> }));
vi.mock('./FinancePolicySkeleton', () => ({
  default: ({ label }: any) => <div role="status">{label}</div>,
}));

const { simulate } = vi.hoisted(() => ({ simulate: vi.fn() }));
vi.mock('src/redux/finance/prorationPolicy', () => ({
  useSimulateProrationPolicyMutation: () => [
    simulate,
    {
      isLoading: false,
      data: {
        scheduledAmount: 6000,
        proratedAmount: 2000,
        reductionAmount: 4000,
        factor: 1 / 3,
        ruleType: 'FullCharge',
        chargedDays: 10,
        coverageDays: 30,
        explanation: 'September 1 through 10 is billable.',
        policyVersion: 2,
      },
    },
  ],
}));
const policy = {
  id: 'refund-1',
  policyType: 'refund',
  policyName: 'Saved refund',
  status: 'Active',
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

it('shows saved settlement limits in their section without duplicating them in calculation', () => {
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={policy}
      policyDetails={{ maximumPerRequest: 12500, maximumPerStudentYear: 25000 }}
    />
  );
  const settlement = screen
    .getByRole('heading', { name: 'Settlement Guarantees & Constraints' })
    .closest('section')!;
  expect(within(settlement).getByText(formatNumber(12500, 'INR'))).toBeInTheDocument();
  expect(within(settlement).getByText(formatNumber(25000, 'INR'))).toBeInTheDocument();
  expect(
    within(settlement).getByText('Enforced across all processed and reserved refunds')
  ).toBeInTheDocument();
  expect(screen.getAllByText(formatNumber(12500, 'INR'))).toHaveLength(1);
  expect(
    screen.queryByText('No settlement guarantees or constraints configured.')
  ).not.toBeInTheDocument();
});

it('explains the empty settlement configuration instead of rendering an empty box', () => {
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={policy}
      policyDetails={{ maximumPerRequest: null, maximumPerStudentYear: null }}
    />
  );
  const settlement = screen
    .getByRole('heading', { name: 'Settlement Guarantees & Constraints' })
    .closest('section')!;
  expect(
    within(settlement).getByText('No settlement guarantees or constraints configured.')
  ).toBeInTheDocument();
});

it('shows an unset student-year cap clearly when only the request limit is configured', () => {
  render(
    <FinancePolicyDetailsDrawer
      open
      onClose={vi.fn()}
      policy={policy}
      policyDetails={{ maximumPerRequest: 5000, maximumPerStudentYear: null }}
    />
  );
  const settlement = screen
    .getByRole('heading', { name: 'Settlement Guarantees & Constraints' })
    .closest('section')!;
  expect(within(settlement).getByText(formatNumber(5000, 'INR'))).toBeInTheDocument();
  expect(within(settlement).getByText('No cumulative student cap')).toBeInTheDocument();
});

it('simulates a saved withdrawal-only rule and clears the preview when dates change', () => {
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
      }}
      policyDetails={{
        version: 2,
        feeHeadRules: [
          {
            feeHeadId: 'tuition',
            feeHeadName: 'Tuition',
            ruleType: 'FullCharge',
            applyOnAdmission: false,
            applyOnEarlyWithdrawal: true,
            earlyWithdrawalRuleType: 'Daily',
            roundingMode: 'Currency',
          },
        ],
      }}
    />
  );

  expect(screen.getByRole('combobox', { name: 'Target Fee Head' })).toHaveTextContent('Tuition');
  fireEvent.change(screen.getByLabelText('Billing Period Start'), { target: { value: '2026-09-01' } });
  fireEvent.change(screen.getByLabelText('Billing Period End'), { target: { value: '2026-09-30' } });
  fireEvent.change(screen.getByLabelText('Student Active From'), { target: { value: '2026-09-01' } });
  const lastDay = screen.getByLabelText('Student Active Until');
  fireEvent.change(lastDay, { target: { value: '2026-09-10' } });
  expect(screen.queryByText('September 1 through 10 is billable.')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Calculate proration preview' }));
  expect(simulate).toHaveBeenCalledWith({
    id: 'proration-1',
    body: expect.objectContaining({
      feeHeadId: 'tuition',
      coverageStartDate: '2026-09-01',
      coverageEndDate: '2026-09-30',
      chargeStartDate: '2026-09-01',
      chargeEndDate: '2026-09-10',
    }),
  });
  expect(screen.getByText('September 1 through 10 is billable.')).toBeVisible();

  fireEvent.change(lastDay, { target: { value: '2026-09-11' } });
  expect(screen.queryByText('September 1 through 10 is billable.')).not.toBeInTheDocument();
});
