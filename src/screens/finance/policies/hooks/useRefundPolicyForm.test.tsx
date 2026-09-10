import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { emptyValues, useRefundPolicyForm } from './useRefundPolicyForm';

const mocks = vi.hoisted(() => ({
  createHook: vi.fn(),
  updateHook: vi.fn(),
  createPolicy: vi.fn(),
  updatePolicy: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'academic-year-1' }, academicYears: [] }),
}));

vi.mock('src/hooks/use-boolean', () => ({
  useBoolean: () => ({
    value: false,
    onTrue: vi.fn(),
    onFalse: vi.fn(),
  }),
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

vi.mock('src/redux/feeHeadManage/feeHeadManageApi', () => ({
  useGetActiveFeeHeadsQuery: () => ({
    data: [{ id: 'fh-1', name: 'Tuition Fee' }],
    isLoading: false,
  }),
}));

vi.mock('src/redux/finance/refundPolicy', () => ({
  useGetRefundPolicyByIdQuery: () => ({
    data: undefined,
    isLoading: false,
  }),
  useGetRefundPolicyImpactQuery: () => ({
    data: undefined,
    isLoading: false,
  }),
  useSimulateRefundPolicyMutation: () => [vi.fn(), { data: undefined, isLoading: false }],
  useCreateRefundPolicyMutation: mocks.createHook,
  useUpdateRefundPolicyMutation: mocks.updateHook,
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: unknown }) =>
    currentQueryAndMutation === mocks.createHook
      ? [mocks.createPolicy, { isLoading: false }]
      : [mocks.updatePolicy, { isLoading: false }],
}));

describe('useRefundPolicyForm submission validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createPolicy.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    mocks.updatePolicy.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  });

  it('starts new staff policies with the simple calculation profile', () => {
    const values = emptyValues('academic-year-1');

    expect(values.policyCode).toBe('');
    expect(values.amountMode).toBe('ManualUpToEligible');
    expect(values.maximumPerRequest).toBeNull();
    expect(values.maximumPerStudentYear).toBeNull();
    expect(values.roundingMethod).toBe('None');
    expect(values.deductionType).toBe('None');
    expect(values.processingTargetDays).toBeNull();
    expect(values.allowedPayoutMethods).toEqual([
      'Cash',
      'Cheque',
      'DemandDraft',
      'BankTransfer',
      'Upi',
    ]);
  });

  it('keeps required-field failures inline and does not call the API', async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useRefundPolicyForm({ open: true, onClose, academicYearId: 'academic-year-1' })
    );

    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });

    expect(result.current.formik.touched.policyName).toBe(true);
    expect(result.current.formik.errors.policyName).toBe('Policy name is required');
    expect(mocks.createPolicy).not.toHaveBeenCalled();
    expect(mocks.updatePolicy).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a missing Active-policy change reason on its field without a toast', async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useRefundPolicyForm({
        open: true,
        onClose,
        academicYearId: 'academic-year-1',
        editData: {
          id: 'refund-policy-1',
          policyName: 'Standard Refund Policy',
          status: 'Active',
          amountMode: 'RemainingPaidAmount',
          eligiblePaymentState: 'PartialAndFullPayment',
          feeHeadScope: 'AllFeeHeads',
          allowedPayoutMethods: ['Cash'],
        } as never,
      })
    );

    await act(async () => {
      await result.current.handleCustomSubmit('Active');
    });

    expect(result.current.formik.touched.changeReason).toBe(true);
    expect(result.current.formik.errors.changeReason).toBe(
      'Change reason is required for an Active policy'
    );
    expect(mocks.updatePolicy).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('correctly calculates live client-side simulation values', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useRefundPolicyForm({
        open: true,
        onClose,
        academicYearId: 'academic-year-1',
      })
    );

    // Initial default: settled=10000, prior=0, reserved=0 -> remaining=10000, mode=ManualUpToEligible (10000)
    expect(result.current.liveSimulation.remainingEligible).toBe(10000);
    expect(result.current.liveSimulation.rawRefund).toBe(10000);
    expect(result.current.liveSimulation.deductionAmount).toBe(0);
    expect(result.current.liveSimulation.finalRefund).toBe(10000);
  });
});
