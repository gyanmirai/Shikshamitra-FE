import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

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
