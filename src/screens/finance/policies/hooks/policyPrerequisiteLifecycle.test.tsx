import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useRefundPolicyForm } from './useRefundPolicyForm';
import { useProrationPolicyForm } from './useProrationPolicyForm';
import { useCollectionPolicyForm } from './useCollectionPolicyForm';

const mocks = vi.hoisted(() => ({
  heads: [] as any[],
  routing: {} as any,
  detail: undefined as any,
  refetchHeads: vi.fn(),
  refetchRouting: vi.fn(),
  save: vi.fn(),
  fetching: false,
  error: false,
}));
vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'year' }, academicYears: [] }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/redux/feeHeadManage/feeHeadManageApi', () => ({
  useGetActiveFeeHeadsQuery: () => ({
    currentData: mocks.heads,
    isFetching: mocks.fetching,
    isLoading: false,
    isError: mocks.error,
    refetch: mocks.refetchHeads,
  }),
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: () => ({
    currentData: mocks.routing,
    refetch: mocks.refetchRouting,
  }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [mocks.save, { isLoading: false }],
}));
vi.mock('src/redux/finance/refundPolicy', () => ({
  useGetRefundPolicyByIdQuery: () => ({ currentData: mocks.detail }),
  useGetRefundPolicyImpactQuery: () => ({}),
  useCreateRefundPolicyMutation: vi.fn(),
  useUpdateRefundPolicyMutation: vi.fn(),
  useSimulateRefundPolicyMutation: () => [vi.fn(), {}],
}));
vi.mock('src/redux/finance/collectionPolicy', () => ({
  useGetCollectionPoliciesQuery: () => ({}),
  useCreateCollectionPolicyMutation: vi.fn(),
  useUpdateCollectionPolicyMutation: vi.fn(),
}));
vi.mock('src/redux/finance/prorationPolicy', () => ({
  useGetProrationPolicyByIdQuery: () => ({ data: mocks.detail }),
  useGetProrationPoliciesQuery: () => ({}),
  useCreateProrationPolicyMutation: () => [mocks.save, {}],
  useUpdateProrationPolicyMutation: () => [mocks.save, {}],
}));

describe('policy prerequisite lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.heads = [];
    mocks.detail = undefined;
    mocks.fetching = false;
    mocks.error = false;
    mocks.routing = { incomeCategories: [], expenseCategories: [], bankAccounts: [] };
    mocks.save.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });
  it('guards selected-head refund submit, then permits an all-head draft without clearing entered values', async () => {
    const { result } = renderHook(() => useRefundPolicyForm({ open: true, onClose: vi.fn() }));
    await act(async () => {
      await result.current.formik.setValues({
        ...result.current.formik.values,
        policyName: 'Refund terms',
        feeHeadScope: 'SelectedFeeHeads',
      });
    });
    expect(result.current.prerequisites).toEqual([{ key: 'fee-head' }]);
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.save).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.formik.setFieldValue('feeHeadScope', 'AllFeeHeads');
    });
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(mocks.refetchHeads).toHaveBeenCalledOnce();
    expect(mocks.refetchRouting).toHaveBeenCalledOnce();
    expect(result.current.formik.values.policyName).toBe('Refund terms');
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.save).toHaveBeenCalledOnce();
  });
  it('guards enabled late fees with no heads and allows turning them off', async () => {
    const { result } = renderHook(() => useCollectionPolicyForm({ open: true, onClose: vi.fn() }));
    await act(async () => {
      await result.current.formik.setValues({
        ...result.current.formik.values,
        policyName: 'Collection terms',
        enableLateFee: true,
        flatAmount: 10,
      });
    });
    expect(result.current.prerequisites).toEqual([{ key: 'fee-head' }]);
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.save).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.formik.setFieldValue('enableLateFee', false);
    });
    await act(async () => {
      await result.current.handleCustomSubmit('Draft');
    });
    expect(mocks.save).toHaveBeenCalledOnce();
  });
  it('refreshes proration heads without resetting policy identity or erasing existing rules', async () => {
    mocks.detail = {
      policyName: 'Saved terms',
      academicYearId: 'year',
      status: 'Draft',
      feeHeadRules: [
        {
          feeHeadId: 'inactive',
          feeHeadName: 'Historical tuition',
          feeType: 'Recurring',
          ruleType: 'DailyProration',
          configuration: { minimumChargeDays: 0 },
          applyOnAdmission: true,
        },
      ],
    };
    const { result, rerender } = renderHook(() =>
      useProrationPolicyForm({
        open: true,
        onClose: vi.fn(),
        editData: { id: 'saved', status: 'Draft' } as any,
      })
    );
    expect(result.current.formik.values.feeHeadRules[0].feeHeadId).toBe('inactive');
    expect(result.current.prerequisites).toEqual([]);
    await act(async () => {
      await result.current.formik.setFieldValue('policyName', 'Unsaved terms');
    });
    mocks.heads = [{ id: 'new', name: 'New tuition' }];
    rerender();
    await waitFor(() => expect(result.current.formik.values.feeHeadRules).toHaveLength(2));
    expect(result.current.formik.values.policyName).toBe('Unsaved terms');
    expect(
      result.current.formik.values.feeHeadRules.some((rule) => rule.feeHeadId === 'inactive')
    ).toBe(true);
  });
  it('does not infer missing proration setup from a failed or fetching lookup', () => {
    mocks.fetching = true;
    const { result, rerender } = renderHook(() =>
      useProrationPolicyForm({ open: true, onClose: vi.fn() })
    );
    expect(result.current.prerequisites).toEqual([]);
    mocks.fetching = false;
    mocks.error = true;
    rerender();
    expect(result.current.prerequisites).toEqual([]);
  });

  it('keeps typed proration values when the first mounted cached lookup finishes refreshing', async () => {
    mocks.heads = [{ id: 'head', name: 'Tuition' }];
    mocks.fetching = true;
    const { result, rerender } = renderHook(() =>
      useProrationPolicyForm({ open: true, onClose: vi.fn() })
    );
    await act(async () => {
      await result.current.formik.setFieldValue('policyName', 'Unsaved cached lookup draft');
    });
    mocks.fetching = false;
    rerender();
    await waitFor(() =>
      expect(result.current.formik.values.policyName).toBe('Unsaved cached lookup draft')
    );
  });
});
