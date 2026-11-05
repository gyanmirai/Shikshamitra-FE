import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AdjustmentView from './AdjustmentView';
import { AdjustmentStatusEnum } from '../enums/adjustment.enum';

const state = vi.hoisted(() => ({
  detail: undefined as any,
  error: false,
  actor: 'checker',
  canApprove: true,
  canReject: true,
  retry: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { user: { sub: state.actor } } }),
}));
vi.mock('../../hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({
    canView: true,
    canApprove: state.canApprove,
    canReject: state.canReject,
  }),
}));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({
  useGetFeeAdjustmentQuery: vi.fn(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({
    data: state.detail,
    currentData: state.detail,
    isLoading: false,
    isFetching: false,
    isError: state.error,
    refetch: state.retry,
  }),
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));

beforeEach(() => {
  state.error = false;
  state.actor = 'checker';
  state.canApprove = true;
  state.canReject = true;
  state.retry.mockClear();
  state.detail = {
    id: 'request',
    studentName: 'Aanya Example',
    studentGrNo: 10260,
    className: 'Class 1',
    divisionName: 'A',
    voucherNumber: 'ADJ-QA',
    requestedAmount: 100,
    appliedAmount: 0,
    remainingAmount: 100,
    requestedByUserId: 'maker',
    status: 0,
    availableActions: ['Approve', 'Reject'],
    createdAt: '2026-11-03T09:00:00Z',
    sourceLines: [],
    targetAllocations: [],
  };
});
const show = () =>
  render(
    <AdjustmentView
      adjustmentId="request"
      viewMeta={{ id: 'request', status: AdjustmentStatusEnum.Pending, requestedByUserId: 'maker' }}
      onClose={vi.fn()}
      onApprove={vi.fn()}
      onReject={vi.fn()}
      showApprove
      showReject
    />
  );

it('opens contextual details in a named drawer with shared student and adjustment sections', () => {
  show();
  expect(screen.getByRole('dialog', { name: 'View Adjustment Request' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Student Information' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Adjustment Information' })).toBeInTheDocument();
  expect(screen.getByText('ADJ-QA')).toBeInTheDocument();
});
it('shows a recoverable detail error instead of an endless skeleton', () => {
  state.detail = undefined;
  state.error = true;
  show();
  expect(screen.getByRole('alert')).toHaveTextContent(/could not load adjustment/i);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(state.retry).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: /Approve/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
});
it.each(['maker', 'view-only'])(
  'keeps decision buttons unavailable for %s even when the caller requests them',
  (actor) => {
    if (actor === 'maker') state.actor = 'maker';
    else {
      state.canApprove = false;
      state.canReject = false;
    }
    show();
    expect(screen.queryByRole('button', { name: /Approve/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  }
);
it('uses the freshly loaded terminal status instead of stale list metadata', () => {
  state.detail.status = 1;
  show();
  expect(screen.getByText('Rejected')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Approve/ })).not.toBeInTheDocument();
});
it('hides decisions when the server returns no available actions and explains why', () => {
  state.detail.availableActions = [];
  state.detail.unavailableReason = 'Paid credit is unavailable for transfer.';
  show();
  expect(screen.queryByRole('button', { name: /Approve/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  expect(screen.getByText('Paid credit is unavailable for transfer.')).toBeInTheDocument();
});
