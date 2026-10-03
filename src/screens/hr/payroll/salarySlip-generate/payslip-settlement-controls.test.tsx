import type { PayslipCorrection } from 'src/redux/hr/payslip-api';

import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import PayslipSettlementControls from './payslip-settlement-controls';

const state = vi.hoisted(() => ({ start: vi.fn(), settle: vi.fn(), year: 'year-1',
  status: { currentData: { id: 'target-1', month: '2026-11', status: 'SUCCEEDED', isCurrent: true }, isFetching: false, isError: false } }));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: state.year } }) }));
vi.mock('src/redux/hr/payslip-api', () => ({ useSettlePayslipCorrectionMutation: () => [state.settle, { isLoading: false }] }));
vi.mock('src/redux/runPayroll/payroll-preview-run-api', () => ({
  useStartPayrollPreviewMutation: () => [state.start, { isLoading: false }],
  usePayrollPreviewStatusQuery: () => state.status,
}));
const correction = { id: 'correction-1', sourceMonth: '2026-10', concurrencyStamp: 'reviewed-1' } as PayslipCorrection;
const props = { correction, disabled: false, onSettled: vi.fn(), onBusy: vi.fn(), onDirty: vi.fn() };
beforeEach(() => {
  vi.clearAllMocks(); state.year = 'year-1'; state.status.currentData = { id: 'target-1', month: '2026-11', status: 'SUCCEEDED', isCurrent: true };
  state.start.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'target-1' }) });
  state.settle.mockReturnValue({ unwrap: () => Promise.resolve(correction) });
});
afterEach(cleanup);

it('requires a current target preview and submits its id with the reviewed correction token', async () => {
  render(<PayslipSettlementControls {...props} />);
  expect(screen.getByRole('button', { name: 'Apply settlement' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Calculate target payroll' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Apply settlement' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Apply settlement' }));
  await waitFor(() => expect(props.onSettled).toHaveBeenCalledOnce());
  expect(state.settle).toHaveBeenCalledExactlyOnceWith({ id: 'correction-1', concurrencyStamp: 'reviewed-1', targetMonth: '2026-11', previewRunId: 'target-1' });
});

it('preserves the selected target after a failed settlement and blocks a superseded preview', async () => {
  state.settle.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Synthetic settlement failure')) });
  const view = render(<PayslipSettlementControls {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Calculate target payroll' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Apply settlement' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Apply settlement' }));
  await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  expect(props.onSettled).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Settlement month')).toHaveValue('2026-11');
  state.status.currentData = { ...state.status.currentData, status: 'SUPERSEDED', isCurrent: false };
  view.rerender(<PayslipSettlementControls {...props} />);
  expect(screen.getByRole('button', { name: 'Apply settlement' })).toBeDisabled();
});

it('ignores a target response after the selected academic year changes', async () => {
  let finish!: (value: { id: string }) => void;
  state.start.mockReturnValue({ unwrap: () => new Promise<{ id: string }>((resolve) => { finish = resolve; }) });
  const view = render(<PayslipSettlementControls {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Calculate target payroll' }));
  await waitFor(() => expect(state.start).toHaveBeenCalledOnce());
  state.year = 'year-2'; view.rerender(<PayslipSettlementControls {...props} />);
  finish({ id: 'old-year-run' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Apply settlement' })).toBeDisabled());
  expect(state.settle).not.toHaveBeenCalled();
});
