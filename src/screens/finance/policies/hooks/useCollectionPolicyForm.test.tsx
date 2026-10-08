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

  it('allows editing legacy unused zero formulas while keeping an active zero invalid', async () => {
    const { result } = renderHook(() =>
      useCollectionPolicyForm({
        open: true,
        onClose: vi.fn(),
        editData: {
          id: 'legacy-policy',
          policyName: 'Legacy policy',
          status: 'Draft',
          enableLateFee: true,
          lateFeeType: 'PerDay',
          amountPerDay: 50,
          flatAmount: 0,
          percentage: 0,
          amountPerWeek: 0,
          amountPerMonth: 0,
          lateFeeApplyOnFeeHeads: ['fee-head-1'],
        } as never,
      })
    );
    expect(result.current.formik.values.flatAmount).toBeNull();
    expect(result.current.formik.values.percentage).toBeNull();
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.updatePolicy).toHaveBeenCalled();
    await act(async () => {
      await result.current.formik.setFieldValue('amountPerDay', 0);
    });
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(result.current.formik.errors.amountPerDay).toBeTruthy();
    expect(mocks.updatePolicy).toHaveBeenCalledTimes(1);
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

  it.each([
    ['Flat', 'flatAmount', 1000000],
    ['PerDay', 'amountPerDay', 1000000],
    ['PerWeek', 'amountPerWeek', 1000000],
    ['PerMonth', 'amountPerMonth', 1000000],
    ['Percentage', 'percentage', 100.01],
    ['Compound', 'percentage', Infinity],
    ['Flat', 'flatAmount', '1e2'],
    ['Flat', 'maximumLateFeeAmount', 0],
    ['Flat', 'maximumChargingDays', 366],
    ['Flat', 'gracePeriodDays', 1.5],
  ])(
    'blocks invalid %s %s supplied through existing records or programmatic input',
    async (type, field, value) => {
      const { result } = renderHook(() =>
        useCollectionPolicyForm({ open: true, onClose: vi.fn() })
      );
      await act(async () => {
        await result.current.formik.setValues({
          ...result.current.formik.values,
          policyName: 'Standard Collection Policy',
          enableLateFee: true,
          lateFeeApplyOnFeeHeads: ['fee-head-1'],
          lateFeeType: type as never,
          flatAmount: 100,
          [field]: value,
        });
      });
      await act(async () => {
        await result.current.handleCustomSubmit('Draft');
      });
      expect(
        result.current.formik.errors[field as keyof typeof result.current.formik.errors]
      ).toBeTruthy();
      expect(mocks.createPolicy).not.toHaveBeenCalled();
      expect(result.current.checks.numericValid).toBe(false);
      expect(Number.isFinite(result.current.calculatedLateFee)).toBe(false);
    }
  );

  it('does not display arbitrary clamped totals for valid compound growth beyond safe preview precision', async () => {
    const { result } = renderHook(() => useCollectionPolicyForm({ open: true, onClose: vi.fn() }));
    await act(async () => {
      await result.current.formik.setValues({
        ...result.current.formik.values,
        enableLateFee: true,
        lateFeeType: 'Compound',
        percentage: 100,
      });
      result.current.setCalcDaysLate(365);
    });
    expect(result.current.checks.numericValid).toBe(true);
    expect(Number.isFinite(result.current.calculatedLateFee)).toBe(false);
    expect(Number.isFinite(result.current.allocatedPayment)).toBe(false);
    expect(Number.isFinite(result.current.remainingBalance)).toBe(false);
    await act(async () => {
      await result.current.formik.setFieldValue('maximumLateFeeAmount', 999999);
    });
    expect(result.current.calculatedLateFee).toBe(999999);
  });
});
