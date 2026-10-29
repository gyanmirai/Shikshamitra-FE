import { skipToken } from '@reduxjs/toolkit/query';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import PaySlipGenerationScreen from './salarySlipGenerate';

vi.mock('./payslip-availability-notice', () => ({
  default: () => <p>Payroll is not locked for this staff member.</p>,
}));
const summaryRead = vi.hoisted(() => vi.fn());

const state = vi.hoisted(() => ({ failed: false, refreshing: false, documentFailed: false, pdfReady: false, hasDocument: true }));
vi.mock('next/dynamic', async () => {
  const { useEffect } = await import('react');
  return { default: () => function PdfReadyProbe({ url, onReady }: { url: string; onReady: (url: string) => void }) {
    useEffect(() => { onReady(url); }, [url, onReady]);
    return <div role="region" aria-label="Payslip PDF viewer">Stored PDF ready</div>;
  } };
});
vi.mock('../../employee/employee-account-email-action', async () => {
  const { useState } = await import('react');
  return { default: function AccountEmailDraftProbe({ disabled }: { disabled: boolean }) {
    const [draft, setDraft] = useState('');
    return <><button type="button" disabled={disabled}>Change account email</button>
      <input aria-label="Controlled account email draft" value={draft} onChange={(event) => setDraft(event.target.value)} /></>;
  } };
});
vi.mock('@mui/icons-material', () => ({ ExpandMore: () => null }));
vi.mock('react-redux', () => ({ useSelector: () => ({}) }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock('src/redux/hr/employeeApi', () => ({ useLazyGetEmployeeOptionsQuery: () => [vi.fn()] }));
vi.mock('src/components/paginated-search-select', () => ({
  PaginatedSearchSelect: ({ onChange, id }: { id?: string; onChange: (event: null, value: { id: string; label: string }) => void }) => <>
    <input id={id} aria-label="Staff member" readOnly />
    <button type="button" onClick={() => onChange(null, { id: 'employee-a', label: 'Employee A' })}>Select employee A</button>
    <button type="button" onClick={() => onChange(null, { id: 'employee-b', label: 'Employee B' })}>Select employee B</button>
  </>,
}));
vi.mock('src/redux/runPayroll/runPayrollApi', () => ({
  useGetEmployeeSalarySlipQuery: (args: unknown) => {
    summaryRead(args);
    return { currentData: null, isSuccess: true, refetch: vi.fn() };
  },
  useLazyGetEmployeeSalarySlipPreviewPdfQuery: () => [vi.fn()],
}));
vi.mock('./payslip-settings-form', () => ({ default: () => null }));
vi.mock('./payslip-document-action-dialog', () => ({ default: ({ onClose }: { onClose: () => void }) =>
  <button type="button" onClick={onClose}>Finish document action</button> }));
vi.mock('./payslip-correction-dialog', () => ({ default: ({ onClose }: { onClose: () => void }) =>
  <button type="button" onClick={onClose}>Finish correction</button> }));
vi.mock('./payslip-settlement-controls', () => ({ default: () => null }));
vi.mock('./use-payslip-actions', () => ({ usePayslipActions: () => ({ pdfUrl: state.pdfReady ? 'blob:stored-pdf' : null, isLoading: false, error: null }) }));
vi.mock('src/redux/hr/payslip-api', () => ({
  useGetPayslipDocumentsQuery: (args: { employeeId?: string }) => ({
    currentData: args?.employeeId && state.hasDocument ? [{ id: `document-${args.employeeId}`, salarySlipId: `slip-${args.employeeId}`,
      isCurrent: true, revision: 1, paymentStatus: 'Finalized', recipientEmail: `${args.employeeId}@example.test`,
      issuedAt: '2026-10-03T08:00:00Z' }] : [], isSuccess: !state.documentFailed, isFetching: state.refreshing,
    isError: state.documentFailed, error: state.documentFailed ? { status: 'FETCH_ERROR' } : undefined, refetch: vi.fn(),
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
  beforeEach(() => { state.failed = false; state.refreshing = false; state.documentFailed = false; state.pdfReady = false; state.hasDocument = true; });
  afterEach(cleanup);

  it('keeps expected pre-lock periods out of the issued-only summary endpoint', () => {
    summaryRead.mockClear();
    state.hasDocument = false;
    render(<PaySlipGenerationScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    expect(summaryRead.mock.calls.every(([args]) => args === skipToken)).toBe(true);
    expect(screen.getByText(/Payroll is not locked/)).toBeVisible();
    expect(screen.queryByText('The payslip could not be loaded.')).not.toBeInTheDocument();
  });

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

  it('retains the mounted controlled-account draft while document metadata refreshes', () => {
    const view = render(<PaySlipGenerationScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    fireEvent.change(screen.getByLabelText('Controlled account email draft'), { target: { value: 'verified@example.test' } });
    state.refreshing = true;
    view.rerender(<PaySlipGenerationScreen />);
    expect(screen.getByLabelText('Controlled account email draft')).toHaveValue('verified@example.test');
    expect(screen.getByRole('button', { name: 'Change account email' })).toBeDisabled();
    state.refreshing = false;
    view.rerender(<PaySlipGenerationScreen />);
    expect(screen.getByLabelText('Controlled account email draft')).toHaveValue('verified@example.test');
    expect(screen.getByRole('button', { name: 'Change account email' })).toBeEnabled();
  });

  it.each(['Record payment', 'Replace document details', 'Correct payroll'])('restores the %s opening control after closing during a metadata refresh', async (name) => {
    const view = render(<PaySlipGenerationScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    const opener = screen.getByRole('button', { name });
    opener.focus();
    fireEvent.click(opener);
    state.refreshing = true;
    view.rerender(<PaySlipGenerationScreen />);
    const finish = screen.getByRole('button', { name: name === 'Correct payroll' ? 'Finish correction' : 'Finish document action' });
    finish.focus();
    fireEvent.click(finish);
    expect(opener).toBeDisabled();
    state.refreshing = false;
    view.rerender(<PaySlipGenerationScreen />);
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('restores focus to the first document action after Retry disappears and the current PDF is ready', async () => {
    state.documentFailed = true;
    const view = render(<PaySlipGenerationScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    const retry = screen.getByRole('button', { name: /^Retry$/ });
    retry.focus();
    fireEvent.click(retry);
    state.documentFailed = false;
    state.refreshing = true;
    view.rerender(<PaySlipGenerationScreen />);
    expect(screen.getByRole('button', { name: /^Print$/ })).toBeDisabled();
    state.refreshing = false;
    state.pdfReady = true;
    view.rerender(<PaySlipGenerationScreen />);
    await waitFor(() => expect(screen.getByRole('button', { name: /^Print$/ })).toHaveFocus());
  });

  it.each(['another control', 'another employee'])('does not steal focus when Retry is followed by %s', async (destination) => {
    state.documentFailed = true;
    const view = render(<PaySlipGenerationScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    const retry = screen.getByRole('button', { name: /^Retry$/ });
    retry.focus();
    fireEvent.click(retry);
    const target = screen.getByRole('button', { name: destination === 'another employee' ? 'Select employee B' : 'Select employee A' });
    target.focus();
    if (destination === 'another employee') fireEvent.click(target);
    state.documentFailed = false;
    state.pdfReady = true;
    view.rerender(<PaySlipGenerationScreen />);
    await waitFor(() => expect(screen.getByRole('button', { name: /^Print$/ })).toBeEnabled());
    expect(target).toHaveFocus();
  });

  it('returns focus to staff selection when Retry resolves to an empty payroll period', async () => {
    state.documentFailed = true;
    const view = render(<PaySlipGenerationScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Select employee A' }));
    const retry = screen.getByRole('button', { name: /^Retry$/ });
    retry.focus();
    fireEvent.click(retry);
    state.documentFailed = false;
    state.hasDocument = false;
    view.rerender(<PaySlipGenerationScreen />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Staff member' })).toHaveFocus());
    expect(screen.getByRole('button', { name: /^Print$/ })).toBeDisabled();
  });
});
// Route/month behavior is covered by use-payroll-month and the browser workflow suite.
vi.mock('../payroll-cycle/use-payroll-month', async () => {
  const { useState } = await import('react');
  const { default: payrollDate } = await import('dayjs');
  return { usePayrollMonth: () => useState(payrollDate().startOf('month')) };
});
