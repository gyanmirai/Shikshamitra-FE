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
  policyDetail: undefined as any,
  previousPolicyDetail: undefined as any,
  detailFetching: false,
  detailError: false,
  refetchDetail: vi.fn(),
  routingData: {} as any,
  routingFetching: false,
  routingError: false,
  refetchRouting: vi.fn(),
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
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: () => ({
    currentData: mocks.routingData,
    isFetching: mocks.routingFetching,
    isError: mocks.routingError,
    refetch: mocks.refetchRouting,
  }),
}));

vi.mock('src/redux/finance/refundPolicy', () => ({
  useGetRefundPolicyByIdQuery: () => ({
    data: mocks.previousPolicyDetail,
    currentData: mocks.policyDetail,
    isFetching: mocks.detailFetching,
    isError: mocks.detailError,
    refetch: mocks.refetchDetail,
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
    mocks.policyDetail = undefined;
    mocks.previousPolicyDetail = undefined;
    mocks.detailFetching = false;
    mocks.detailError = false;
    mocks.routingData = {};
    mocks.routingFetching = false;
    mocks.routingError = false;
    mocks.createPolicy.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    mocks.updatePolicy.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  });

  it('blocks submit during the initial edit query frame even before fetching starts', async () => {
    const { result } = renderHook(() =>
      useRefundPolicyForm({
        open: true,
        onClose: vi.fn(),
        editData: { id: 'pending-policy', status: 'Draft' } as any,
      })
    );
    expect(result.current.isInitializing).toBe(true);
    await act(async () => {
      await result.current.formik.setFieldValue('policyName', 'Attempted blank overwrite');
    });
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.updatePolicy).not.toHaveBeenCalled();
  });

  it('blocks create until accounting options load and retries their failed request', async () => {
    mocks.routingData = undefined;
    mocks.routingFetching = true;
    const { result, rerender } = renderHook(() =>
      useRefundPolicyForm({ open: true, onClose: vi.fn() })
    );
    expect(result.current.isInitializing).toBe(true);
    await act(async () => {
      await result.current.formik.setFieldValue('policyName', 'New refunds');
    });
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.createPolicy).not.toHaveBeenCalled();
    mocks.routingFetching = false;
    mocks.routingError = true;
    rerender();
    expect(result.current.isLoadError).toBe(true);
    result.current.retryLoading();
    expect(mocks.refetchRouting).toHaveBeenCalledOnce();
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.createPolicy).not.toHaveBeenCalled();
  });

  it('keeps the previous policy out of the edit form while the selected policy loads', () => {
    mocks.previousPolicyDetail = {
      ...emptyValues('academic-year-1'),
      id: 'old-policy',
      policyName: 'Previous policy',
    };
    mocks.detailFetching = true;
    const renders: Array<{ loading: boolean; name: string }> = [];
    const { result, rerender } = renderHook(() => {
      const form = useRefundPolicyForm({
        open: true,
        onClose: vi.fn(),
        editData: { id: 'selected-policy', status: 'Draft' } as any,
      });
      renders.push({ loading: form.isInitializing, name: form.formik.values.policyName });
      return form;
    });
    expect(result.current.isDetailLoading).toBe(true);
    expect(result.current.detail).toBeUndefined();
    expect(result.current.formik.values.policyName).not.toBe('Previous policy');

    mocks.policyDetail = {
      ...emptyValues('academic-year-1'),
      id: 'selected-policy',
      policyName: 'Selected policy',
    };
    mocks.detailFetching = false;
    rerender();
    expect(result.current.isDetailLoading).toBe(false);
    expect(result.current.formik.values.policyName).toBe('Selected policy');
    expect(
      renders
        .filter((render) => !render.loading)
        .every((render) => render.name === 'Selected policy')
    ).toBe(true);
  });

  it('exposes detail failure and retry without presenting stale policy values', () => {
    mocks.detailError = true;
    mocks.previousPolicyDetail = {
      ...emptyValues('academic-year-1'),
      policyName: 'Previous policy',
    };
    const { result } = renderHook(() =>
      useRefundPolicyForm({
        open: true,
        onClose: vi.fn(),
        editData: { id: 'selected-policy', status: 'Draft' } as any,
      })
    );
    expect(result.current.isDetailError).toBe(true);
    expect(result.current.detail).toBeUndefined();
    result.current.refetchDetail();
    expect(mocks.refetchDetail).toHaveBeenCalledOnce();
  });

  it('starts new staff policies with the simple calculation profile', () => {
    const values = emptyValues('academic-year-1');

    expect(values.policyCode).toBe('');
    expect(values.amountMode).toBe('ManualUpToEligible');
    expect(values.maximumPerRequest).toBeNull();
    expect(values.maximumPerStudentYear).toBeNull();
    expect(values.roundingMethod).toBe('RoundUp');
    expect(values.deductionType).toBe('None');
    expect(values.processingTargetDays).toBeNull();
    expect(values).not.toHaveProperty('eligiblePaymentState');
    expect(values).not.toHaveProperty('requestDeadlineDays');
    expect(values.allowedPayoutMethods).toEqual([
      'Cash',
      'Cheque',
      'DemandDraft',
      'BankTransfer',
      'Upi',
    ]);
  });

  it('does not initialize a new policy from a previous edit response', () => {
    mocks.policyDetail = { ...emptyValues('academic-year-1'), policyName: 'Previous edit' };
    const { result } = renderHook(() => useRefundPolicyForm({ open: true, onClose: vi.fn() }));
    expect(result.current.formik.values.policyName).toBe('');
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

  it('saves only selected methods and rejects an empty selection', async () => {
    const { result } = renderHook(() => useRefundPolicyForm({ open: true, onClose: vi.fn() }));
    await act(async () => {
      await result.current.formik.setValues({
        ...result.current.formik.values,
        policyName: 'Cash refunds',
        allowedPayoutMethods: [],
      });
    });
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(result.current.formik.errors.allowedPayoutMethods).toBe(
      'Select at least one payout method'
    );
    expect(mocks.createPolicy).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.formik.setFieldValue('allowedPayoutMethods', ['Cash', 'Upi']);
    });
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.createPolicy).toHaveBeenCalledWith(
      expect.objectContaining({ allowedPayoutMethods: ['Cash', 'Upi'] })
    );
  });

  it('restores saved payment methods when editing a policy', () => {
    mocks.policyDetail = {
      ...emptyValues('academic-year-1'),
      id: 'policy-1',
      policyName: 'Cash refunds',
      allowedPayoutMethods: ['Cash'],
    };
    const { result } = renderHook(() =>
      useRefundPolicyForm({
        open: true,
        onClose: vi.fn(),
        editData: { id: 'policy-1', status: 'Draft' } as never,
      })
    );
    expect(result.current.formik.values.allowedPayoutMethods).toEqual(['Cash']);
  });

  it('shows a missing Active-policy change reason on its field without a toast', async () => {
    mocks.policyDetail = {
      ...emptyValues('academic-year-1'),
      id: 'refund-policy-1',
      policyName: 'Standard Refund Policy',
      status: 'Active',
      allowedPayoutMethods: ['Cash'],
    };
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
