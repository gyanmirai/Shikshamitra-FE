import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useConcessionPolicyForm } from './useConcessionPolicyForm';

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

vi.mock('src/redux/finance/concessionPolicy', () => ({
  useGetConcessionPolicyImpactQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
  }),
  useCreateConcessionPolicyMutation: mocks.createHook,
  useUpdateConcessionPolicyMutation: mocks.updateHook,
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: unknown }) =>
    currentQueryAndMutation === mocks.createHook
      ? [mocks.createPolicy, { isLoading: false }]
      : [mocks.updatePolicy, { isLoading: false }],
}));

describe('useConcessionPolicyForm submission validation', () => {
  it('sends a normalized policy name and rejects excessive percentage precision', async () => {
    const { result } = renderHook(() => useConcessionPolicyForm({ open: true, onClose: vi.fn() }));
    await act(async () => {
      await result.current.formik.setValues({
        ...result.current.formik.values,
        policyName: '  Sibling   Tuition\u00a0 Assistance  ',
        maximumPercentage: 0.1111257547,
      });
    });
    await act(async () => {
      await result.current.handleCustomSubmit();
    });
    expect(result.current.formik.errors.maximumPercentage).toBe('Use up to 2 decimal places');
    expect(mocks.createPolicy).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.formik.setFieldValue('maximumPercentage', '0.11');
    });
    expect(result.current.formik.values.maximumPercentage).toBe('0.11');
    await act(async () => {
      await result.current.handleCustomSubmit();
    });
    expect(mocks.createPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        policyName: 'Sibling Tuition Assistance',
        maximumPercentage: 0.11,
      })
    );
  });

  it('keeps server name conflicts inline, preserves the form and emits no duplicate toast', async () => {
    const onClose = vi.fn();
    mocks.createPolicy.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        data: { errorCode: 'Finance:ConcessionPolicy:010005', detail: 'Business rule violated' },
      }),
    });
    const { result } = renderHook(() => useConcessionPolicyForm({ open: true, onClose }));
    await act(async () => {
      await result.current.formik.setValues({
        ...result.current.formik.values,
        policyName: 'Sibling Assistance',
        maximumPercentage: 25,
      });
    });
    await act(async () => {
      await result.current.handleCustomSubmit();
    });
    expect(result.current.formik.touched.policyName).toBe(true);
    expect(result.current.formik.errors.policyName).toContain('Current or Archived');
    expect(result.current.formik.values.maximumPercentage).toBe(25);
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('preserves the paid refund entitlement when automatic request creation is off', async () => {
    const { result } = renderHook(() => useConcessionPolicyForm({ open: true, onClose: vi.fn() }));
    await act(async () => {
      result.current.setSimFeeAmount(10000);
      result.current.setSimAlreadyPaid(4000);
      await result.current.formik.setValues({
        ...result.current.formik.values,
        applyOn: 'AllFees',
        autoCreateRefund: false,
        valueSource: 'PolicyFixed',
        calculationMethod: 'FullWaiver',
      });
    });
    expect(result.current.simulation.concessionAmount).toBe(10000);
    expect(result.current.simulation.refundRequired).toBe(4000);
    expect(result.current.simulation.newOutstanding).toBe(0);
  });
  it('defaults legacy paid policies to automatic refunds and retains explicit manual mode', () => {
    const { result } = renderHook(() =>
      useConcessionPolicyForm({
        open: true,
        onClose: vi.fn(),
        editData: { applyOn: 'AllFees', autoCreateRefund: false } as never,
      })
    );
    expect(result.current.formik.values.autoCreateRefund).toBe(false);
    const legacy = renderHook(() =>
      useConcessionPolicyForm({
        open: true,
        onClose: vi.fn(),
        editData: { applyOn: 'AllFees' } as never,
      })
    );
    expect(legacy.result.current.formik.values.autoCreateRefund).toBe(true);
  });

  it('rejects automatic refunds for unpaid scopes', async () => {
    const { result } = renderHook(() => useConcessionPolicyForm({ open: true, onClose: vi.fn() }));
    await act(async () => {
      await result.current.formik.setFieldValue('autoCreateRefund', true);
    });
    let errors: Record<string, unknown> = {};
    await act(async () => {
      errors = await result.current.formik.validateForm();
    });
    expect(errors.autoCreateRefund).toBe(
      'Automatic refunds require a scope that includes paid installments'
    );
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createPolicy.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    mocks.updatePolicy.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  });

  it('keeps required-field failures inline and does not call the API', async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useConcessionPolicyForm({ open: true, onClose, academicYearId: 'academic-year-1' })
    );

    await act(async () => {
      await result.current.handleCustomSubmit();
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
      useConcessionPolicyForm({
        open: true,
        onClose,
        academicYearId: 'academic-year-1',
        editData: {
          id: 'policy-1',
          policyName: 'Merit Concession',
          status: 'Active',
          valueSource: 'PolicyFixed',
          calculationMethod: 'Percentage',
          percentageValue: 10,
          applyOn: 'AllOutstanding',
        } as never,
      })
    );

    await act(async () => {
      await result.current.handleCustomSubmit();
    });

    expect(result.current.formik.touched.changeReason).toBe(true);
    expect(result.current.formik.errors.changeReason).toBe(
      'Change reason is required for an Active policy'
    );
    expect(mocks.updatePolicy).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('waives only unpaid outstanding and never produces a refund', async () => {
    const { result } = renderHook(() =>
      useConcessionPolicyForm({ open: true, onClose: vi.fn(), academicYearId: 'academic-year-1' })
    );

    await act(async () => {
      result.current.setSimFeeAmount(10000);
      result.current.setSimAlreadyPaid(4000);
      await result.current.formik.setFieldValue('valueSource', 'PolicyFixed');
      await result.current.formik.setFieldValue('calculationMethod', 'FullWaiver');
    });

    expect(result.current.simulation.concessionAmount).toBe(6000);
    expect(result.current.simulation.newOutstanding).toBe(0);
    expect(result.current.simulation.refundRequired).toBe(0);
  });
});
