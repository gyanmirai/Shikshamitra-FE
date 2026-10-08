export const useGetFeeCategoriesQuery = () => {};
export const useDeleteFeeCategoryMutation = () => {};
export const usePatchFeeCategoryStatusMutation = () => {};
export const usePatchFeeHeadMutation = () => {};
export const feeCategoryApi = { util: { invalidateTags: () => ({ type: 'fixture/invalidate' }) } };
const category = { id: 'archived-category', name: 'Archived test category', isActive: false,
  description: 'Synthetic archived category', feeHeads: [{ id: 'readonly-head', name: 'Read only fee head',
  isActive: false, incomeCategoryName: 'Tuition', isConcessionApplied: false }] };
(window as any).__feeHeadMutationCount = 0;
export default function useQueryAndMutation({ type }: any) {
  if (type === 'query') return { data: { items: [category], totalCount: 1 }, refetch: () => {},
    isLoading: false, isFetching: false };
  return [(args: any) => {
    (window as any).__feeHeadMutationCount += 1;
    window.dispatchEvent(new Event('fixture-mutation'));
    return { unwrap: async () => args };
  }, { isLoading: false }];
}
