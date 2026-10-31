import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import RefundWorklist from './RefundWorklist';

const mocks = vi.hoisted(() => ({ actions: ['edit'], edit: vi.fn(), view: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceListActionRow', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) =>
    actions.map((action: any) => (
      <button type="button" key={action.id} onClick={action.onClick}>
        {action.label}
      </button>
    )),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data, getRowAction }: any) => (
    <table>
      <thead>
        <tr>
          {columns.map((column: any) => (
            <th key={column.id}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any) => (
          <tr key={row.id}>
            {columns.map((column: any) => (
              <td key={column.id}>
                {column.render ? column.render(row[column.id], row) : row[column.id]}
              </td>
            ))}
            <td>
              <button type="button" onClick={getRowAction(row).onClick}>Open refund</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));
vi.mock('src/redux/finance/RefundManagement/feeRefundManage', () => ({
  useGetFeeRefundsQuery: ({ status }: any) => {
    const result = {
      totalCount: 1,
      items: [
        {
          id: 'refund',
          studentId: 'student',
          studentName: 'Synthetic student',
          status,
          workflowVersion: 1,
          availableActions: mocks.actions,
          settlements: [],
          approvedAmount: 0,
          calculatedAmount: 250,
          refundMethod: 'Cash',
          creationTime: '2026-10-30T00:00:00Z',
        },
      ],
    };
    return { data: result, currentData: result };
  },
}));

function Worklist() {
  return (
    <RefundWorklist
      filters={{ isReady: true } as any}
      onEdit={mocks.edit}
      onView={mocks.view}
      onApprove={vi.fn()}
      onReject={vi.fn()}
      onRecord={vi.fn()}
      onReplace={vi.fn()}
      onReturn={vi.fn()}
    />
  );
}

describe('refund worklist editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.actions = ['edit'];
  });

  it('opens the selected saved refund through the server-authorized Edit action', () => {
    render(<Worklist />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit for Synthetic student' }));
    expect(mocks.edit).toHaveBeenCalledWith(
      expect.objectContaining({
        _refundRequestId: 'refund',
        _studentId: 'student',
        status: 0,
      })
    );
    expect(mocks.view).not.toHaveBeenCalled();
  });

  it('does not offer Edit when the server has not authorized it', () => {
    mocks.actions = [];
    render(<Worklist />);
    expect(
      screen.queryByRole('button', { name: 'Edit for Synthetic student' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open refund' }));
    expect(mocks.view).toHaveBeenCalledOnce();
  });

  it('keeps the Actions column absent from Completed', () => {
    render(<Worklist />);
    fireEvent.click(screen.getByRole('tab', { name: /Completed/ }));
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
  });
});
