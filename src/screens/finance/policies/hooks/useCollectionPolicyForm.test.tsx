import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useCollectionPolicyForm } from './useCollectionPolicyForm';

const mocks = vi.hoisted(() => ({
  createHook: vi.fn(),
  updateHook: vi.fn(),
  createPolicy: vi.fn(),
  updatePolicy: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'academic-year-1' } }),
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
  useGetActiveFeeHeadsQuery: () => ({ data: [] }),
}));

vi.mock('src/redux/finance/collectionPolicy', () => ({
  useGetCollectionPoliciesQuery: () => ({ data: { items: [] } }),
  useCreateCollectionPolicyMutation: mocks.createHook,
  useUpdateCollectionPolicyMutation: mocks.updateHook,
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: unknown }) =>
    currentQueryAndMutation === mocks.createHook
      ? [mocks.createPolicy, { isLoading: false }]
      : [mocks.updatePolicy, { isLoading: false }],
}));

describe('useCollectionPolicyForm submission validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createPolicy.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    mocks.updatePolicy.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  });

  it('blocks Save Draft when Grace Period is empty and shows only inline Formik errors', async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useCollectionPolicyForm({ open: true, onClose, academicYearId: 'academic-year-1' })
    );

    await act(async () => {
      await result.current.formik.setValues({
        ...result.current.formik.values,
        policyName: 'Standard Collection Policy',
        enableLateFee: true,
        gracePeriodDays: '' as never,
        lateFeeApplyOnFeeHeads: ['fee-head-1'],
        lateFeeType: 'Flat',
        flatAmount: 100,
      });
    });

    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });

    expect(result.current.formik.errors.gracePeriodDays).toBe('Grace Period is required');
    expect(result.current.formik.touched.gracePeriodDays).toBe(true);
    expect(mocks.createPolicy).not.toHaveBeenCalled();
    expect(mocks.updatePolicy).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
