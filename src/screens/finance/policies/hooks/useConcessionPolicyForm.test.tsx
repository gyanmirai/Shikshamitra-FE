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
