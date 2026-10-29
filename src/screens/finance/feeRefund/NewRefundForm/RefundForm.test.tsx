import { it, vi, expect, describe, beforeEach } from 'vitest';
import { financePermissions } from 'src/constants/finance-menu';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import RefundForm from './RefundForm';

const mocks = vi.hoisted(() => ({
  year: { id: 'year', name: '2026–27' },
  detail: {} as any,
  eligibility: vi.fn(),
  mutation: vi.fn(),
  preview: vi.fn(),
  createEligibility: {} as any,
  session: null as any,
  permissions: [] as any[],
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({ globalState: { currentYear: mocks.year }, auth: { permissions: mocks.permissions } }),
}));
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: mocks.session, status: 'authenticated' }),
}));
vi.mock('framer-motion', () => ({
  motion: { form: ({ children, onSubmit }: any) => <form onSubmit={onSubmit}>{children}</form> },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../../components/FinancePrerequisiteState', () => ({
  default: ({ requirements }: any) => (
    <div>{requirements.map((item: any) => item.key).join(',')}</div>
  ),
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: any) => children,
}));
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
  useGetRefundEligibilityQuery: () => mocks.createEligibility,
  useCreateFeeRefundMutation: () => [mocks.mutation, {}],
  useUpdateFeeRefundMutation: () => [mocks.mutation, {}],
  useSubmitFeeRefundMutation: () => [mocks.mutation, {}],
  usePreviewFeeRefundMutation: () => [mocks.preview, {}],
}));
vi.mock('./RefundGeneralInfoCard', () => ({
  default: ({ formik }: any) => (
    <div>
      <span>Student form ready</span>
      <button type="button" onClick={() => formik.setFieldValue('studentId', 'student')}>
        Choose student
      </button>
    </div>
  ),
}));
vi.mock('./FeeRefundDetailForm', () => ({
  default: ({ formik }: any) => (
    <div>
      Loaded allocations: {formik.values.feeHeadRefunds.flatMap((head: any) => head.months).length}
      {[false, true].map((complete) => (
        <button
          key={String(complete)}
          type="button"
          onClick={() =>
            formik.setValues({
              ...formik.values,
              boardId: 'board',
              mediumId: 'medium',
              standardId: 'class',
              divisionId: 'division',
              studentId: 'student',
              refundMethod: 'Cash',
              paymentDetails: { receivedBy: 'Parent' },
              notes: 'Excess fee payment',
              feeHeadRefunds: [
                {
                  feeHeadId: 'FH1',
                  months: [
                    {
                      month: 'June',
                      dueFeeId: 'due-1',
                      sourceAllocationId: 'allocation-1',
                      sourceReceiptId: 'receipt',
                      amount: 500,
                    },
                  ],
                },
                {
                  feeHeadId: 'FH2',
                  months: [
                    {
                      month: 'June',
                      dueFeeId: 'due-2',
                      sourceAllocationId: 'allocation-2',
                      sourceReceiptId: 'receipt',
                      amount: complete ? 200 : '',
                    },
                  ],
                },
              ],
            })
          }
        >
          {complete ? 'Complete selected amounts' : 'Select incomplete amounts'}
        </button>
      ))}
    </div>
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
    mocks.year = { id: 'year', name: '2026–27' };
    mocks.detail = { currentData: undefined, isLoading: true, isFetching: true, refetch: vi.fn() };
    mocks.eligibility.mockReturnValue({ unwrap: () => Promise.resolve(eligibility) });
    mocks.session = null;
    mocks.permissions = [];
    mocks.createEligibility = {};
  });

  it('does not reuse a submission prerequisite from a different academic year', async () => {
    mocks.detail = { isLoading: false, isFetching: false };
    mocks.createEligibility = {
      currentData: {
        totalRefundable: 1000,
        allowedPayoutMethods: ['Cash'],
        feeHeads: [{ months: [{ refundable: 1000 }] }],
      },
    };
    mocks.preview.mockReturnValue({
      unwrap: () =>
        Promise.reject(Object.assign(new Error('Missing refund policy.'), {
          data: { errorCode: 'Finance:FeeRefund:010010', detail: 'Missing refund policy.' },
        })),
    });
    const view = render(<RefundForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Complete selected amounts' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByText('refund-policy-assignment')).toBeVisible());
    mocks.year = { id: 'next-year', name: '2027–28' };
    view.rerender(<RefundForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose student' }));
    await waitFor(() =>
      expect(screen.queryByText('refund-policy-assignment')).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Complete selected amounts' })).toBeVisible();
  });

  it('replaces refund fields with a review state after a selected student resolves without eligible paid fees', async () => {
    mocks.createEligibility = { currentData: { totalRefundable: 0, feeHeads: [] } };
    render(<RefundForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Complete selected amounts' }));
    await waitFor(() => expect(screen.getByText('paid-receipt')).toBeInTheDocument());
    expect(screen.getByText('Student form ready')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Complete selected amounts' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
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

  it('blocks confirmation and even direct form submission until every selected installment is complete', async () => {
    mocks.detail = { isLoading: false, isFetching: false };
    mocks.session = { profile: { role: ['admin'] } };
    mocks.permissions = [{ name: financePermissions.fees.refundActions.approve, isGranted: true }];
    mocks.createEligibility = {
      currentData: {
        totalRefundable: 1000,
        allowedPayoutMethods: ['Cash'],
        feeHeads: [{ months: [{ refundable: 1000 }] }],
      },
    };
    mocks.preview.mockReturnValue({
      unwrap: () => Promise.resolve({ isAllowed: true, maximumAllowedAmount: 700 }),
    });
    render(<RefundForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Select incomplete amounts' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '1 selected installment needs a refund amount'
      )
    );
    const submit = screen.getByRole('button', { name: 'Submit' });
    expect(submit).toBeDisabled();
    await act(async () => {
      fireEvent.submit(submit.closest('form')!);
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled());
    await waitFor(() => expect(mocks.preview).not.toHaveBeenCalled());
    expect(mocks.mutation).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Complete selected amounts' }));
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Submit and Approve Refund?' })).toBeVisible()
    );
    expect(mocks.preview).toHaveBeenCalledOnce();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });
});
