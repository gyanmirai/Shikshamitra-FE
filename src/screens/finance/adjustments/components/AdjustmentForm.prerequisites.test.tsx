import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import AdjustmentForm from './AdjustmentForm';

const state = vi.hoisted(() => ({ year: { id: 'year' }, eligibility: {} as any }));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: state.year }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({
  useGetAdjustmentEligibilityQuery: () => state.eligibility,
}));
vi.mock('./AdjustmentGeneralInfoCard', () => ({ default: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('../../feeRefund/NewRefundForm/FeeHeadRefundTable', () => ({
  default: () => <div>Paid source selection</div>,
}));

beforeEach(() => {
  state.eligibility = { currentData: { totalAdjustable: 0, feeHeads: [] } };
});

it('blocks an adjustment without an eligible paid source while retaining source selection and Cancel', () => {
  render(
    <AdjustmentForm
      hideStudentInfoForm
      initialData={{ studentId: 'student' }}
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
    />
  );
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  expect(screen.getByText('Paid source selection')).toBeInTheDocument();
});

it('does not reuse a paid source from the previous student during a scope transition', () => {
  state.eligibility = { data: { totalAdjustable: 100 }, currentData: undefined, isFetching: true };
  render(
    <AdjustmentForm
      hideStudentInfoForm
      initialData={{ studentId: 'student' }}
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
    />
  );
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

it('waits for a successful save before resetting or closing and locks Cancel while saving', async () => {
  state.eligibility = {
    currentData: { totalAdjustable: 100, feeHeads: [{ months: [{ adjustable: 100 }] }] },
  };
  let finish!: () => void;
  const onSubmit = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  const onCancel = vi.fn();
  render(
    <AdjustmentForm
      hideStudentInfoForm
      initialData={{
        studentId: 'student',
        remarks: 'QA adjustment',
        feeHeadRefunds: [
          { feeHeadId: 'head', months: [{ month: 'June 2026', dueFeeId: 'source', amount: '1' }] },
        ],
      }}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onCancel).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await act(async () => finish());
  await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
});

it('keeps the entered source and remarks after a rejected save so the user can retry', async () => {
  state.eligibility = {
    currentData: { totalAdjustable: 100, feeHeads: [{ months: [{ adjustable: 100 }] }] },
  };
  const onSubmit = vi
    .fn()
    .mockRejectedValueOnce(new Error('Save failed'))
    .mockResolvedValueOnce(undefined);
  const onCancel = vi.fn();
  render(
    <AdjustmentForm
      hideStudentInfoForm
      initialData={{
        studentId: 'student',
        remarks: 'QA adjustment',
        feeHeadRefunds: [
          { feeHeadId: 'head', months: [{ month: 'June 2026', dueFeeId: 'source', amount: '1' }] },
        ],
      }}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onCancel).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
  expect(onSubmit.mock.calls[1][0]).toMatchObject({
    remarks: 'QA adjustment',
    feeHeadRefunds: [{ months: [{ amount: '1', dueFeeId: 'source' }] }],
  });
});
