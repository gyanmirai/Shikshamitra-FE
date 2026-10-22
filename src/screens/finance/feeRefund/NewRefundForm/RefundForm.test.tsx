import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RefundForm from './RefundForm';

const mocks = vi.hoisted(() => ({
  year: { id: 'year', name: '2026–27' },
  detail: {} as any,
  eligibility: vi.fn(),
  mutation: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({ globalState: { currentYear: mocks.year }, auth: { permissions: [] } }),
}));
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: null, status: 'authenticated' }) }));
vi.mock('framer-motion', () => ({
  motion: { form: ({ children, onSubmit }: any) => <form onSubmit={onSubmit}>{children}</form> },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/form-busy-region', () => ({
  FormBusyRegion: ({ children }: any) => children,
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: any) => currentQueryAndMutation(),
}));
vi.mock('src/redux/finance/RefundManagement/feeRefundManage', () => ({
  useGetFeeRefundByIdQuery: () => mocks.detail,
  useLazyGetRefundEligibilityQuery: () => [mocks.eligibility, {}],
  useGetRefundEligibilityQuery: () => ({}),
  useCreateFeeRefundMutation: () => [mocks.mutation, {}],
  useUpdateFeeRefundMutation: () => [mocks.mutation, {}],
  useSubmitFeeRefundMutation: () => [mocks.mutation, {}],
  usePreviewFeeRefundMutation: () => [mocks.mutation, {}],
}));
vi.mock('./RefundGeneralInfoCard', () => ({ default: () => <span>Student form ready</span> }));
vi.mock('./FeeRefundDetailForm', () => ({
  default: ({ formik }: any) => (
    <span>
      Loaded allocations: {formik.values.feeHeadRefunds.flatMap((head: any) => head.months).length}
    </span>
  ),
}));

const detail = {
  studentId: 'student',
  studentName: 'Synthetic student',
  allowedPayoutMethods: ['Cash'],
  lines: [{ dueFeeId: 'due', sourceAllocationId: 'allocation', amount: 200 }],
};
const eligibility = {
  feeHeads: [
    {
      feeHeadId: 'exam',
      months: [
        {
          month: 11,
          year: 2026,
          dueFeeId: 'due',
          sourceAllocationId: 'allocation',
          sourceReceiptId: 'receipt',
          receiptNumber: 'FIN-1',
        },
      ],
    },
  ],
};

describe('refund edit loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.detail = { currentData: undefined, isLoading: true, isFetching: true, refetch: vi.fn() };
    mocks.eligibility.mockReturnValue({ unwrap: () => Promise.resolve(eligibility) });
  });

  it('shows all section skeletons until saved allocations have loaded', async () => {
    let resolveEligibility!: (value: any) => void;
    mocks.eligibility.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          resolveEligibility = resolve;
        }),
    });
    const view = render(<RefundForm isEdit editRefundId="refund" />);
    expect(screen.getByRole('status', { name: 'Loading refund request' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Student information' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Refund payment details' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    mocks.detail = { ...mocks.detail, currentData: detail, isLoading: false, isFetching: false };
    view.rerender(<RefundForm isEdit editRefundId="refund" />);
    expect(screen.getByRole('status', { name: 'Loading refund request' })).toBeVisible();
    await act(async () => resolveEligibility(eligibility));
    await waitFor(() => expect(screen.getByText('Loaded allocations: 1')).toBeVisible());
    expect(
      screen.queryByRole('status', { name: 'Loading refund request' })
    ).not.toBeInTheDocument();
  });

  it('shows retry after a record load error instead of an endless skeleton', () => {
    mocks.detail = { ...mocks.detail, isLoading: false, isFetching: false, isError: true };
    render(<RefundForm isEdit editRefundId="refund" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load the refund request');
    expect(
      screen.queryByRole('status', { name: 'Loading refund request' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.detail.refetch).toHaveBeenCalledOnce();
  });

  it('recovers from an eligibility load failure without exposing an empty edit form', async () => {
    mocks.detail = { ...mocks.detail, currentData: detail, isLoading: false, isFetching: false };
    mocks.eligibility.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('offline')) });
    render(<RefundForm isEdit editRefundId="refund" />);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to load the refund request')
    );
    expect(screen.queryByText('Student form ready')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('Loaded allocations: 1')).toBeVisible());
  });
});
