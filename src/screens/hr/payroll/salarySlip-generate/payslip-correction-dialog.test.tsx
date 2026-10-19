import type { PayslipDocument, PayslipCorrection } from 'src/redux/hr/payslip-api';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import PayslipCorrectionDialog from './payslip-correction-dialog';

vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const state = vi.hoisted(() => ({
  records: [] as PayslipCorrection[],
  error: false,
  start: vi.fn(),
  calculate: vi.fn(),
  review: vi.fn(),
  cancel: vi.fn(),
  apply: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('@mui/icons-material', () => ({
  Close: () => null,
  DeleteOutline: () => null,
  ArrowDownward: () => null,
  ArrowUpward: () => null,
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/redux/hr/payslip-api', () => ({
  useGetPayslipCorrectionsQuery: () => ({
    currentData: state.records,
    isLoading: false,
    isError: state.error,
    refetch: state.refetch,
  }),
  useStartPayslipCorrectionMutation: () => [state.start],
  useCalculatePayslipCorrectionMutation: () => [state.calculate],
  useReviewPayslipCorrectionMutation: () => [state.review],
  useCancelPayslipCorrectionMutation: () => [state.cancel],
  useApplyPayslipCorrectionMutation: () => [state.apply],
}));
const document = { id: 'document-a', revision: 1, paymentStatus: 'Finalized' } as PayslipDocument;
const draft: PayslipCorrection = {
  id: 'correction-a',
  sourceMonth: '2026-10',
  sourceDocumentId: 'document-a',
  reason: 'Correct attendance',
  status: 'DRAFT',
  concurrencyStamp: 'first',
  attendance: [{ date: '2026-10-01', status: 0, timeIn: null, timeOut: null }],
  originalEarnings: 10000,
  originalDeductions: 75,
  originalNetPay: 9925,
  originalEmployerCost: 10325,
  candidate: null,
  reviewedBy: null,
  reviewedAt: null,
  resultDocumentId: null,
  settlementMonth: null,
};
const candidate = {
  totalEarnings: 9500,
  totalDeduction: 72,
  netPay: 9428,
  employerCost: 9809,
  payableDays: 30,
  issueCodes: [],
  earningComponents: [{ name: 'Basic', amount: 9500 }],
  deductionComponents: [{ name: 'ESI', amount: 72 }],
  employerContributions: [{ name: 'ESI', amount: 309 }],
};
const props = { document, canEdit: true, canReview: true, canApply: true, onClose: vi.fn() };
const renderDialog = () => renderThemed(<PayslipCorrectionDialog {...props} />);

describe('payroll correction controls', () => {
  beforeEach(() => {
    state.records = [];
    state.error = false;
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it('uses the payroll issue labels and omits routine comparison information', async () => {
    state.records = [
      {
        ...draft,
        status: 'CALCULATED',
        candidate: { ...candidate, issueCodes: ['LOW_ATTENDANCE', 'NO_PREVIOUS_MONTH_COMPARISON'] },
      },
    ];
    renderDialog();
    expect(await screen.findByRole('alert')).toHaveTextContent('Low attendance');
    expect(
      screen.queryByText(/NO_PREVIOUS_MONTH_COMPARISON|LOW_ATTENDANCE|No previous month/)
    ).not.toBeInTheDocument();
  });

  it('exposes the complete calculated comparison in a keyboard-focusable region', async () => {
    state.records = [{ ...draft, status: 'CALCULATED', candidate }];
    renderDialog();
    const comparison = await screen.findByRole('region', { name: 'Correction comparison' });
    comparison.focus();
    expect(comparison).toHaveFocus();
    const table = within(comparison).getByRole('table', { name: 'Correction comparison table' });
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(within(table).getByRole('columnheader', { name: 'Issued' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Recalculated' })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: 'Net pay ₹9,925 ₹9,428' })).toBeInTheDocument();
    expect(
      within(table).getByRole('row', { name: 'School cost ₹10,325 ₹9,809' })
    ).toBeInTheDocument();
  });

  it('omits empty breakdown sections while keeping explicitly recorded zero components', async () => {
    state.records = [
      {
        ...draft,
        status: 'CALCULATED',
        candidate: {
          ...candidate,
          employerContributions: [],
          deductionComponents: [{ name: 'Recorded exemption', amount: 0 }],
        },
      },
    ];
    renderDialog();
    expect(await screen.findByRole('heading', { name: 'Earnings' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Employer contributions' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Employee deductions' })).toBeInTheDocument();
    expect(screen.getByText('Recorded exemption: ₹0')).toBeInTheDocument();
  });

  it('requires a reason and retries the same start request without losing the draft', async () => {
    state.start
      .mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Synthetic failure')) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve(draft) });
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Start correction' }));
    expect(await screen.findByText('Enter a correction reason.')).toBeInTheDocument();
    expect(state.start).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Correction reason'), {
      target: { value: 'Correct attendance' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start correction' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByLabelText('Correction reason')).toHaveValue('Correct attendance');
    fireEvent.click(screen.getByRole('button', { name: 'Start correction' }));
    await waitFor(() => expect(state.start).toHaveBeenCalledTimes(2));
    expect(state.start.mock.calls[0][0].idempotencyKey).toBe(
      state.start.mock.calls[1][0].idempotencyKey
    );
    expect(await screen.findByRole('button', { name: 'Recalculate' })).toBeInTheDocument();
    // Acknowledged write must not revert to the pre-write query result before refetch completes.
    expect(screen.getByLabelText('Correction reason')).toBeDisabled();
  });

  it('retains authoritative paise in correction totals and components', async () => {
    state.records = [
      {
        ...draft,
        status: 'CALCULATED',
        candidate: {
          ...candidate,
          totalEarnings: 9500.45,
          netPay: 9428.45,
          employerCost: 9809.45,
          earningComponents: [{ name: 'Basic', amount: 9500.45 }],
        },
      },
    ];
    renderDialog();
    const comparison = await screen.findByRole('table', { name: 'Correction comparison table' });
    expect(
      within(comparison).getByRole('row', { name: 'Earned gross ₹10,000 ₹9,500.45' })
    ).toBeInTheDocument();
    expect(
      within(comparison).getByRole('row', { name: 'Net pay ₹9,925 ₹9,428.45' })
    ).toBeInTheDocument();
    expect(
      within(comparison).getByRole('row', { name: 'School cost ₹10,325 ₹9,809.45' })
    ).toBeInTheDocument();
    expect(screen.getByText('Basic: ₹9,500.45')).toBeInTheDocument();
  });

  it('preserves edited attendance on a failed calculation and background refresh', async () => {
    state.records = [draft];
    state.calculate.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Synthetic calculation failure')),
    });
    const view = renderDialog();
    fireEvent.mouseDown(screen.getByLabelText('01 Oct'));
    fireEvent.click(screen.getByRole('option', { name: 'Full-day leave' }));
    state.records = [{ ...draft, concurrencyStamp: 'refreshed' }];
    view.rerender(<PayslipCorrectionDialog {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    await screen.findByRole('alert');
    expect(state.calculate.mock.calls[0][0].attendance[0].status).toBe(2);
    // Dirty edits must retain the concurrency token they were based on.
    expect(state.calculate.mock.calls[0][0].concurrencyStamp).toBe('first');
    expect(screen.getByRole('combobox', { name: /^01 Oct/ })).toHaveTextContent('Full-day leave');
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('requires recalculation after attendance edits and uses the returned token for review and reissue', async () => {
    const calculated = {
      ...draft,
      status: 'CALCULATED' as const,
      candidate,
      concurrencyStamp: 'calculated',
    };
    const reviewed = { ...calculated, status: 'REVIEWED' as const, concurrencyStamp: 'reviewed' };
    state.records = [calculated];
    state.calculate.mockReturnValue({
      unwrap: () => Promise.resolve({ ...calculated, concurrencyStamp: 'recalculated' }),
    });
    state.review.mockReturnValue({ unwrap: () => Promise.resolve(reviewed) });
    state.apply.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ ...reviewed, status: 'APPLIED', resultDocumentId: 'document-b' }),
    });
    renderDialog();
    fireEvent.mouseDown(screen.getByLabelText('01 Oct'));
    fireEvent.click(screen.getByRole('option', { name: 'Full-day leave' }));
    expect(screen.getByRole('button', { name: 'Mark reviewed' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Mark reviewed' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mark reviewed' }));
    expect(await screen.findByRole('button', { name: 'Reissue payslip' })).toBeInTheDocument();
    expect(state.review.mock.calls[0][0].concurrencyStamp).toBe('recalculated');
    fireEvent.click(screen.getByRole('button', { name: 'Reissue payslip' }));
    await waitFor(() => expect(props.onClose).toHaveBeenCalledTimes(1));
    expect(state.apply.mock.calls[0][0].concurrencyStamp).toBe('reviewed');
  });

  it('shows refresh failure separately from a successful write and permits retry', async () => {
    state.start.mockReturnValue({ unwrap: () => Promise.resolve(draft) });
    const view = renderDialog();
    fireEvent.change(screen.getByLabelText('Correction reason'), {
      target: { value: draft.reason },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start correction' }));
    await screen.findByRole('button', { name: 'Recalculate' });
    state.error = true;
    view.rerender(<PayslipCorrectionDialog {...props} />);
    expect(screen.getByText('Correction history could not be refreshed.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recalculate' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
  });

  it('keeps review and reissue disabled when their permissions are absent', () => {
    state.records = [{ ...draft, status: 'REVIEWED', candidate }];
    renderThemed(<PayslipCorrectionDialog {...props} canApply={false} />);
    expect(screen.getByRole('button', { name: 'Reissue payslip' })).toBeDisabled();
  });

  it('adopts a server-side cancellation when the form has no unsaved changes', async () => {
    state.records = [draft];
    const view = renderDialog();
    expect(await screen.findByRole('button', { name: 'Recalculate' })).toBeInTheDocument();
    state.records = [{ ...draft, status: 'CANCELLED', concurrencyStamp: 'cancelled' }];
    view.rerender(<PayslipCorrectionDialog {...props} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Start correction' })).toBeInTheDocument()
    );
    expect(screen.getByLabelText('Correction reason')).toHaveValue('');
    expect(screen.getByText('Cancelled · Correct attendance')).toBeInTheDocument();
  });

  it('protects an unsaved reason on close and allows declining or accepting discard', async () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText('Correction reason'), {
      target: { value: 'Unsaved reason' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(await screen.findByRole('button', { name: 'Keep editing' })).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText('Correction reason')).toHaveValue('Unsaved reason');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('does not cancel a correction until dirty attendance changes are deliberately discarded', async () => {
    state.records = [draft];
    state.cancel.mockReturnValue({
      unwrap: () => Promise.resolve({ ...draft, status: 'CANCELLED' }),
    });
    renderDialog();
    fireEvent.mouseDown(screen.getByLabelText('01 Oct'));
    fireEvent.click(screen.getByRole('option', { name: 'Full-day leave' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel correction' }));
    expect(await screen.findByRole('button', { name: 'Keep editing' })).toBeInTheDocument();
    expect(state.cancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel correction' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(props.onClose).toHaveBeenCalledOnce());
    expect(state.cancel.mock.calls[0][0]).toEqual({
      id: draft.id,
      concurrencyStamp: draft.concurrencyStamp,
    });
  });

  it('requires an explicit attendance status for a missing date instead of defaulting it to Present', async () => {
    state.records = [{ ...draft, attendance: [] }];
    state.calculate.mockReturnValue({
      unwrap: () => Promise.resolve({ ...draft, candidate, status: 'CALCULATED' }),
    });
    renderDialog();
    const add = screen.getByRole('button', { name: 'Add attendance' });
    expect(add).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Attendance date'), { target: { value: '2026-10-02' } });
    expect(add).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Recalculate' })).toBeDisabled();
    fireEvent.mouseDown(screen.getByLabelText('Attendance', { exact: true }));
    fireEvent.click(screen.getByRole('option', { name: 'Full-day leave' }));
    fireEvent.click(add);
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    await waitFor(() => expect(state.calculate).toHaveBeenCalledOnce());
    expect(state.calculate.mock.calls[0][0].attendance).toEqual([
      { date: '2026-10-02', status: 2, timeIn: null, timeOut: null },
    ]);
  });

  it('corrects clock-out while retaining status and exact clock-in evidence after a failed save', async () => {
    state.records = [
      {
        ...draft,
        attendance: [
          {
            date: '2026-10-01',
            status: 0,
            timeIn: '2026-10-01T09:00:12.345Z',
            timeOut: '2026-10-01T19:00:00Z',
          },
        ],
      },
    ];
    state.calculate.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Synthetic save failure')),
    });
    renderDialog();
    fireEvent.change(await screen.findByLabelText('Time out (01 Oct)'), {
      target: { value: '17:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    await screen.findByRole('alert');
    expect(state.calculate.mock.calls[0][0].attendance[0]).toEqual({
      date: '2026-10-01',
      status: 0,
      timeIn: '2026-10-01T09:00:12.345Z',
      timeOut: '2026-10-01T17:00:00Z',
    });
    expect(screen.getByLabelText('Time out (01 Oct)')).toHaveValue('17:00');
    expect(props.onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText('Time out (01 Oct)')).toHaveValue('17:00');
  });

  it('rejects reversed clock times beside the field without submitting and allows a valid retry', async () => {
    state.records = [
      {
        ...draft,
        attendance: [
          {
            date: '2026-10-01',
            status: 0,
            timeIn: '2026-10-01T09:00:00Z',
            timeOut: '2026-10-01T19:00:00Z',
          },
        ],
      },
    ];
    state.calculate.mockReturnValue({
      unwrap: () => Promise.resolve({ ...state.records[0], status: 'CALCULATED', candidate }),
    });
    renderDialog();
    fireEvent.change(await screen.findByLabelText('Time out (01 Oct)'), {
      target: { value: '08:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    expect(await screen.findByText('Time out must be after time in.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Time out (01 Oct)')).toHaveFocus());
    expect(state.calculate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Time out (01 Oct)'), { target: { value: '09:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    expect(await screen.findByText('Time out must be after time in.')).toBeInTheDocument();
    expect(state.calculate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Time out (01 Oct)'), { target: { value: '17:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    await waitFor(() => expect(state.calculate).toHaveBeenCalledOnce());
  });

  it('keeps time edits and their source concurrency token through a background refresh', async () => {
    state.records = [
      {
        ...draft,
        attendance: [
          {
            date: '2026-10-01',
            status: 0,
            timeIn: '2026-10-01T09:00:00Z',
            timeOut: '2026-10-01T19:00:00Z',
          },
        ],
      },
    ];
    state.calculate.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Synthetic stale edit')),
    });
    const view = renderDialog();
    fireEvent.change(await screen.findByLabelText('Time out (01 Oct)'), {
      target: { value: '17:00' },
    });
    state.records = [
      {
        ...state.records[0],
        concurrencyStamp: 'background',
        attendance: [
          {
            date: '2026-10-01',
            status: 0,
            timeIn: '2026-10-01T10:00:00Z',
            timeOut: '2026-10-01T18:00:00Z',
          },
        ],
      },
    ];
    view.rerender(<PayslipCorrectionDialog {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    await screen.findByRole('alert');
    expect(state.calculate.mock.calls[0][0]).toMatchObject({
      concurrencyStamp: 'first',
      attendance: [
        {
          date: '2026-10-01',
          status: 0,
          timeIn: '2026-10-01T09:00:00Z',
          timeOut: '2026-10-01T17:00:00Z',
        },
      ],
    });
    expect(screen.getByLabelText('Time out (01 Oct)')).toHaveValue('17:00');
  });

  it('recalculates untouched valid punches within the same displayed minute without losing their seconds', async () => {
    const attendance = [
      {
        date: '2026-10-01',
        status: 0 as const,
        timeIn: '2026-10-01T09:00:12.345Z',
        timeOut: '2026-10-01T09:00:45.678Z',
      },
    ];
    state.records = [{ ...draft, attendance }];
    state.calculate.mockReturnValue({
      unwrap: () => Promise.resolve({ ...draft, attendance, status: 'CALCULATED', candidate }),
    });
    renderDialog();
    expect(await screen.findByLabelText('Time in (01 Oct)')).toHaveValue('09:00');
    expect(screen.getByLabelText('Time out (01 Oct)')).toHaveValue('09:00');
    fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
    await waitFor(() => expect(state.calculate).toHaveBeenCalledOnce());
    expect(state.calculate.mock.calls[0][0].attendance).toEqual(attendance);
  });
});

function renderThemed(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
    ),
  });
}

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
