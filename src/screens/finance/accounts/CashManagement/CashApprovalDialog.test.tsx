import React from 'react';
import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import CashApprovalDialog from './CashApprovalDialog';

const state = vi.hoisted(() => ({
  data: { reference: 'Original cash' } as any,
  fetching: false,
  error: false,
  refetch: vi.fn(),
}));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useGetCashDetailQuery: () => ({
    currentData: state.data,
    isFetching: state.fetching,
    isError: state.error,
    refetch: state.refetch,
  }),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: any) => <div role="dialog">{children}</div>,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('./CashCommandDialog', () => ({
  default: ({ data }: any) => (
    <div role="dialog">
      <span>{data.reference}</span>
      <input aria-label="Approval draft" defaultValue="" />
    </div>
  ),
}));
beforeEach(() => {
  state.data = { reference: 'Original cash' };
  state.fetching = false;
  state.error = false;
  vi.clearAllMocks();
});
it('waits for fresh evidence before opening the approval form', () => {
  state.fetching = true;
  const view = render(<CashApprovalDialog id="cash" academicYearId="year" onClose={vi.fn()} />);
  expect(screen.getByRole('status', { name: 'Loading cash for approval' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Approval draft')).not.toBeInTheDocument();
  state.fetching = false;
  state.data = { reference: 'Refreshed cash' };
  view.rerender(<CashApprovalDialog id="cash" academicYearId="year" onClose={vi.fn()} />);
  expect(screen.getByText('Refreshed cash')).toBeInTheDocument();
});
it('retains the mounted command draft while a refresh is in flight', () => {
  const view = render(<CashApprovalDialog id="cash" academicYearId="year" onClose={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Approval draft'), { target: { value: 'Count checked' } });
  state.fetching = true;
  view.rerender(<CashApprovalDialog id="cash" academicYearId="year" onClose={vi.fn()} />);
  expect(screen.getByLabelText('Approval draft')).toHaveValue('Count checked');
});
it('offers retry when fresh cash evidence cannot be loaded', () => {
  state.error = true;
  render(<CashApprovalDialog id="cash" academicYearId="year" onClose={vi.fn()} />);
  expect(screen.queryByLabelText('Approval draft')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(state.refetch).toHaveBeenCalledOnce();
});
