import dayjs from 'dayjs';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import PayrollSummary from './payroll-summary';

const state = vi.hoisted(() => ({
  query: {} as any,
  documents: {} as any,
  canView: true,
  pdf: {} as any,
  summary: vi.fn(),
  loadPdf: vi.fn(),
  download: vi.fn(),
  retry: vi.fn(),
  reload: vi.fn(),
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => state.canView }));
vi.mock('framer-motion', () => ({ motion: { div: ({ children }: any) => <div>{children}</div> } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/components/dashboard-card/dashboard-card', () => ({
  DashboardCard: ({ title, value }: any) => (
    <div>
      {title}: {value}
    </div>
  ),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children, handleClose }: any) =>
    open ? (
      <div role="dialog" aria-label="Payslip preview">
        {children}
        <button type="button" onClick={handleClose}>Close preview</button>
      </div>
    ) : null,
}));
vi.mock('next/dynamic', () => ({
  default:
    () =>
    ({ url }: any) => <div>Issued PDF: {url}</div>,
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange(dayjs('2026-11-01'))}>Select November</button>
  ),
}));
vi.mock('src/redux/runPayroll/runPayrollApi', () => ({
  useGetEmployeeSalarySlipQuery: (...args: any[]) => {
    state.summary(...args);
    return state.query;
  },
  useLazyGetEmployeeSalarySlipPdfQuery: () => [state.loadPdf, {}],
}));
vi.mock('src/redux/hr/payslip-api', () => ({
  useGetPayslipDocumentsQuery: () => state.documents,
  useLazyGetPayslipDocumentPdfQuery: () => [state.loadPdf],
}));
vi.mock('../payroll/salarySlip-generate/use-payslip-actions', () => ({
  usePayslipActions: () => state.pdf,
}));
vi.mock('../payroll/salarySlip-generate/payslip-availability-notice', () => ({
  default: ({ monthYear }: any) => <div>Payroll is not locked: {monthYear}</div>,
}));

const view = () => <PayrollSummary employee={{ id: 'staff-a', fullName: 'Staff A' }} />;
beforeEach(() => {
  vi.clearAllMocks();
  state.canView = true;
  const slip = {
    employeeId: 'staff-a',
    monthYear: dayjs().format('MMMM-YYYY').toUpperCase(),
    totalEarning: 12345,
  };
  state.query = {
    data: slip,
    currentData: slip,
    isSuccess: true,
    isFetching: false,
    isError: false,
    refetch: state.reload,
  };
  state.documents = {
    currentData: [{ id: 'doc-a', isCurrent: true, revision: 1 }],
    isSuccess: true,
    isFetching: false,
    isError: false,
    refetch: state.reload,
  };
  state.pdf = {
    pdfUrl: 'blob:issued',
    isLoading: false,
    error: null,
    handleDownload: state.download,
    retry: state.retry,
  };
});

it.each(['pending', 'failed'])(
  'disables PDF actions when the next selection is %s without borrowing the prior slip',
  (status) => {
    const page = render(view());
    state.query = {
      ...state.query,
      currentData: undefined,
      isFetching: status === 'pending',
      isError: status === 'failed',
    };
    state.documents = {
      ...state.documents,
      currentData: undefined,
      isFetching: status === 'pending',
      isError: status === 'failed',
    };
    page.rerender(view());
    fireEvent.click(screen.getByRole('button', { name: 'Select November' }));
    expect(screen.getByRole('button', { name: /^Download$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^Preview$/ })).toBeDisabled();
    expect(screen.queryByText(/Total Salary:/)).not.toBeInTheDocument();
  }
);

it('opens an issued PDF preview and clears it when employee changes', () => {
  const page = render(view());
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
  expect(screen.getByRole('dialog', { name: 'Payslip preview' })).toHaveTextContent(
    'Issued PDF: blob:issued'
  );
  page.rerender(<PayrollSummary employee={{ id: 'staff-b' }} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
});

it('shows PDF failure with a real retry and prevents downloading it', () => {
  state.pdf = { ...state.pdf, pdfUrl: null, error: 'The payslip PDF could not be loaded.' };
  render(view());
  expect(screen.getByRole('alert')).toHaveTextContent('The payslip PDF could not be loaded.');
  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry PDF' }));
  expect(state.retry).toHaveBeenCalledOnce();
});

it('does not expose payslip reads or actions without the exact view grant', () => {
  state.canView = false;
  render(view());
  expect(screen.getByText(/You do not have access to payslips/)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
});
