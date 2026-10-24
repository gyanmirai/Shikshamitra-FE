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
