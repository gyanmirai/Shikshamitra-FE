import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import CashDetails from './CashDetails';

const mock = vi.hoisted(() => ({ canApprove: false, status: 0, fetching: false }));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useGetCashDetailQuery: () => ({
    currentData: {
      id: 'cash',
      reference: 'REC-001',
      creatorId: 'collector',
      status: mock.status,
      amount: 23000,
      remainingAmount: 23000,
      spentAmount: 0,
      depositedAmount: 0,
      inTransitAmount: 0,
      collectedAt: '2026-10-27T09:00:00Z',
      canApprove: mock.canApprove,
      canDeposit: false,
      deposits: [],
      expenses: [],
    },
    isFetching: mock.fetching,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock('./CashCommandDialog', () => ({
  default: () => (
    <div role="dialog" aria-label="Approval form">
      Bank account selection
    </div>
  ),
}));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/detail-view', () => ({
  DetailSection: ({ children }: any) => <section>{children}</section>,
  DetailGrid: ({ children }: any) => <div>{children}</div>,
  DetailField: () => null,
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/screens/finance/policies/components/FinancePolicyDrawerHeader', () => ({
  default: ({ title, titleId }: any) => <h2 id={titleId}>{title}</h2>,
}));
function setup(user = 'collector', granted = true) {
  const store = configureStore({
    reducer: {
      auth: () => ({
        user: { sub: user },
        permissionsInitialized: true,
        loading: false,
        permissions: [{ name: 'Finance.Accounts.CashManagement.Approve', isGranted: granted }],
      }),
    },
  });
  return render(
    <Provider store={store}>
      <CashDetails id="cash" academicYearId="year" onClose={vi.fn()} />
    </Provider>
  );
}
beforeEach(() => {
  mock.canApprove = false;
  mock.status = 0;
  mock.fetching = false;
});
it('explains self-approval instead of silently hiding approval from the collector', () => {
  setup();
  expect(screen.getByRole('button', { name: 'Approve Cash' })).toBeDisabled();
  expect(screen.getByText(/You collected this cash/)).toHaveTextContent(
    /Another user with cash approval permission must approve it/
  );
});
it('explains a missing approval grant without opening the approval form', () => {
  setup('reviewer', false);
  const button = screen.getByRole('button', { name: 'Approve Cash' });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(screen.queryByRole('dialog', { name: 'Approval form' })).not.toBeInTheDocument();
  expect(screen.getByText(/You do not have cash approval permission/)).toBeInTheDocument();
});
it('opens bank selection for an eligible independent reviewer', () => {
  mock.canApprove = true;
  setup('reviewer');
  fireEvent.click(screen.getByRole('button', { name: 'Approve Cash' }));
  expect(screen.getByRole('dialog', { name: 'Approval form' })).toHaveTextContent(
    'Bank account selection'
  );
});
it('uses server eligibility for an administrator approving their own collection', () => {
  mock.canApprove = true;
  setup('collector');
  expect(screen.queryByText(/You collected this cash/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Approve Cash' }));
  expect(screen.getByRole('dialog', { name: 'Approval form' })).toBeInTheDocument();
});
it('keeps server eligibility authoritative for an independent permitted reviewer', () => {
  setup('reviewer');
  expect(screen.getByRole('button', { name: 'Approve Cash' })).toBeDisabled();
  expect(screen.getByText(/Cash approval is unavailable/)).toBeInTheDocument();
});
it('blocks approval while refreshing and omits it after approval', () => {
  mock.canApprove = true;
  mock.fetching = true;
  const view = setup('reviewer');
  expect(screen.getByRole('button', { name: 'Approve Cash' })).toBeDisabled();
  view.unmount();
  mock.fetching = false;
  mock.status = 1;
  setup('reviewer');
  expect(screen.queryByRole('button', { name: 'Approve Cash' })).not.toBeInTheDocument();
});
