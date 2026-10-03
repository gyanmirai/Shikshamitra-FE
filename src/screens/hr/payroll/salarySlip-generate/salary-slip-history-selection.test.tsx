import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import PaySlipGenerationScreen from './salarySlipGenerate';

const state = vi.hoisted(() => ({ failed: false }));
vi.mock('@mui/icons-material', () => ({ ExpandMore: () => null }));
vi.mock('react-redux', () => ({ useSelector: () => ({}) }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock('src/redux/hr/employeeApi', () => ({ useLazyGetEmployeeQuery: () => [vi.fn()] }));
vi.mock('src/components/paginated-search-select', () => ({
  PaginatedSearchSelect: ({ onChange }: { onChange: (event: null, value: { id: string; label: string }) => void }) => <>
    <button type="button" onClick={() => onChange(null, { id: 'employee-a', label: 'Employee A' })}>Select employee A</button>
    <button type="button" onClick={() => onChange(null, { id: 'employee-b', label: 'Employee B' })}>Select employee B</button>
  </>,
}));
vi.mock('src/redux/runPayroll/runPayrollApi', () => ({
  useGetEmployeeSalarySlipQuery: () => ({ currentData: null }),
  useLazyGetEmployeeSalarySlipPreviewPdfQuery: () => [vi.fn()],
}));
vi.mock('./payslip-settings-form', () => ({ default: () => null }));
vi.mock('./payslip-document-action-dialog', () => ({ default: () => null }));
vi.mock('./payslip-settlement-controls', () => ({ default: () => null }));
vi.mock('./use-payslip-actions', () => ({ usePayslipActions: () => ({ pdfUrl: null, isLoading: false, error: null }) }));
vi.mock('src/redux/hr/payslip-api', () => ({
  useGetPayslipDocumentsQuery: (args: { employeeId?: string }) => ({
    currentData: args?.employeeId ? [{ id: `document-${args.employeeId}`, salarySlipId: `slip-${args.employeeId}`,
      isCurrent: true, revision: 1, paymentStatus: 'Finalized', recipientEmail: `${args.employeeId}@example.test`,
      issuedAt: '2026-10-03T08:00:00Z' }] : [], isSuccess: true,
  }),
  useGetPayslipDeliveriesQuery: (slipId: string) => {
    const previous = [{ id: 'attempt-a', documentId: 'document-employee-a', revision: 1,
      recipient: 'previous-recipient@example.test', status: 'PROVIDER_ACCEPTED', requestedAt: '2026-10-03T08:00:00Z' }];
    const switching = slipId === 'slip-employee-b';
    return { data: previous, currentData: switching ? undefined : previous,
      isFetching: switching && !state.failed, isError: switching && state.failed, refetch: vi.fn() };
  },
  useLazyGetPayslipDocumentPdfQuery: () => [vi.fn()],
  useSendPayslipMutation: () => [vi.fn(), { isLoading: false }],
}));

describe('delivery history belongs to the selected employee', () => {
  beforeEach(() => { state.failed = false; });
  afterEach(cleanup);

  it.each([false, true])('does not show the prior employee history while the next query is pending or failed (%s)', (failed) => {
    render(<PaySlipGenerationScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    expect(screen.getByText(/previous-recipient@example.test/)).toBeInTheDocument();
    state.failed = failed;
    fireEvent.click(screen.getByRole('button', { name: 'Select employee B' }));
    expect(screen.queryByText(/previous-recipient@example.test/)).not.toBeInTheDocument();
  });

  it('handles interrupted and repeated selections without borrowing cached history', () => {
    render(<PaySlipGenerationScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select employee B' }));
    expect(screen.queryByText(/previous-recipient@example.test/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    expect(screen.getByText(/previous-recipient@example.test/)).toBeInTheDocument();
    state.failed = true;
    fireEvent.click(screen.getByRole('button', { name: 'Select employee B' }));
    expect(screen.queryByText(/previous-recipient@example.test/)).not.toBeInTheDocument();
    expect(screen.getByText('History could not be loaded.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delivery history' }));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
