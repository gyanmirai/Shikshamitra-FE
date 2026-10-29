import React from 'react';
export const useGetFeeCategoriesQuery = () => {};
export const useDeleteFeeCategoryMutation = () => {};
export const usePatchFeeCategoryStatusMutation = () => {};
export const usePatchFeeHeadMutation = () => {};
export const useAddFeeCategoryMutation = () => {};
export const useUpdateFeeCategoryMutation = () => {};
export const useGetFinanceRoutingOptionsQuery = () => {};
export const feeCategoryApi = {
  util: {
    invalidateTags: () => ({ type: 'fixture/invalidate' }),
    updateQueryData: () => ({ type: 'fixture/update' }),
  },
};
const dependencyMode = new URLSearchParams(window.location.search).has('dependencies');
export const category: any = dependencyMode
  ? {
      id: 'mapped-category',
      name: '8th Fee Category',
      isActive: true,
      isUsedInDownstream: true,
      academicYearId: 'year',
      description: 'Synthetic dependency case',
      feeHeads: [
        {
          id: 'assigned-head',
          name: 'FH3',
          isActive: true,
          incomeCategoryId: 'income-1',
          incomeCategoryName: 'Tuition',
          isConcessionApplied: false,
          isUsedInDownstream: true,
          dependencies: {
            studentCount: 1,
            assignmentCount: 1,
            feeStructureCount: 1,
            paymentTermCount: 1,
            isBlocked: true,
          },
        },
        {
          id: 'unused-head',
          name: 'Unused head',
          isActive: true,
          incomeCategoryId: 'income-1',
          incomeCategoryName: 'Tuition',
          isConcessionApplied: false,
          isUsedInDownstream: false,
          dependencies: {
            studentCount: 0,
            assignmentCount: 0,
            feeStructureCount: 0,
            paymentTermCount: 0,
            isBlocked: false,
          },
        },
      ],
    }
  : {
      id: 'archived-category',
      name: 'Archived test category',
      isActive: false,
      description: 'Synthetic archived category',
      feeHeads: [
        {
          id: 'readonly-head',
          name: 'Read only fee head',
          isActive: false,
          incomeCategoryName: 'Tuition',
          isConcessionApplied: false,
        },
      ],
    };
const stableRefetch = () => {};
const unifiedMode = new URLSearchParams(window.location.search).has('unified');
const currentCategory = {
  ...category,
  id: 'active-category',
  name: 'Active test category',
  isActive: true,
  feeHeads: [],
};
const listData = unifiedMode
  ? { items: [currentCategory, category], totalCount: 2 }
  : { items: [category], totalCount: 1 };
const routingData = {
  items:
    new URLSearchParams(window.location.search).get('income') === 'empty'
      ? []
      : [
          { id: 'income-aaa', name: 'AAA Income' },
          { id: 'income-none', name: 'None' },
          { id: 'income-1', name: 'Tuition' },
        ],
};
const listResult = {
  data: listData,
  currentData: listData,
  refetch: stableRefetch,
  isLoading: false,
  isFetching: false,
  isError: false,
};
const routingResult = { ...listResult, data: routingData, currentData: routingData };
const detailResult = { ...listResult, data: category, currentData: category };
export function useGetFeeCategoryByIdQuery(id: string, options?: any) {
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (!id || options?.skip) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, [id, options?.skip]);
  return {
    currentData: !id || options?.skip ? undefined : category,
    data: category,
    isFetching: loading,
    isLoading: false,
    isError: false,
    refetch: stableRefetch,
  };
}
(window as any).__feeHeadMutationCount = 0;
export default function useQueryAndMutation({ type, currentQueryAndMutation, params }: any) {
  if (type === 'query') {
    return currentQueryAndMutation === useGetFinanceRoutingOptionsQuery
      ? routingResult
      : currentQueryAndMutation === useGetFeeCategoryByIdQuery
        ? detailResult
        : listResult;
  }

  return [
    (args: any) => {
      (window as any).__feeHeadMutationCount += 1;
      window.dispatchEvent(new Event('fixture-mutation'));
      return { unwrap: async () => args };
    },
    { isLoading: false },
  ];
}
