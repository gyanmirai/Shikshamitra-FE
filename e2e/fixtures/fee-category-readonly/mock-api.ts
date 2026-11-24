import React from 'react';
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
const deleteSurface = new URLSearchParams(window.location.search).get('delete');

function createDeleteFixture<Row extends { id: string }>(
  rows: Row[],
  conflictId: string,
  conflictMessage: string
) {
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const makeResult = (items: Row[]) => {
    const data = { items, totalCount: items.length };
    return { ...listResult, data, currentData: data };
  };
  let result = makeResult(rows);
  const getSnapshot = () => result;

  return {
    useQuery: () => React.useSyncExternalStore(subscribe, getSnapshot),
    useDelete: () =>
      [
        ({ id }: { id: string }) => ({
          unwrap: async () => {
            if (id === conflictId) throw { status: 409, data: { detail: conflictMessage } };
            if (!deleteSurface) return;
            result = makeResult(result.data.items.filter((row) => row.id !== id));
            listeners.forEach((listener) => listener());
          },
        }),
        { isLoading: false },
      ] as const,
  };
}

const categoryRows = [
  { id: 'disposable-category', name: 'Unused Fee Category' },
  { id: 'linked-category', name: 'Fee Category With New Dependency' },
].map((row) => ({
  ...currentCategory,
  ...row,
  academicYearId: 'year',
  isUsedInDownstream: false,
  totalFeeHeads: 0,
}));
const headRows = [
  { id: 'disposable-head', name: 'Unused Fee Head' },
  { id: 'linked-head', name: 'Fee Head With New Dependency' },
].map((row) => ({
  ...row,
  isActive: true,
  isUsedInDownstream: false,
  feeCategoryName: 'Fixture Tuition',
  incomeCategoryName: 'Tuition',
  description: 'Synthetic fee head',
}));
const receiptBookRows = [
  { id: 'disposable-book', name: 'Unused Receipt Book' },
  { id: 'linked-book', name: 'Receipt Book With New Dependency' },
].map((row) => ({
  ...row,
  isActive: true,
  description: 'Synthetic receipt book',
  prefix: 'QA',
  suffix: '2026',
  boardName: 'CBSE',
  mediumName: 'English',
  mediumStageName: 'Primary',
  startingNumber: 1,
  endingNumber: 100,
}));
const categoryFixture = createDeleteFixture(
  deleteSurface === 'fee-category' ? categoryRows : listData.items,
  'linked-category',
  'This fee category is now used by a fee structure.'
);
const headFixture = createDeleteFixture(
  headRows,
  'linked-head',
  'This fee head is now used by a fee structure.'
);
const receiptBookFixture = createDeleteFixture(
  receiptBookRows,
  'linked-book',
  'This receipt book has issued receipts and cannot be deleted.'
);
export const useGetFeeCategoriesQuery = categoryFixture.useQuery;
export const useDeleteFeeCategoryMutation = categoryFixture.useDelete;
export const useGetFeeCategoryOptionsQuery = categoryFixture.useQuery;
export const useGetFeeHeadsQuery = headFixture.useQuery;
export const useDeleteFeeHeadMutation = headFixture.useDelete;
export const useGetFeeHeadByIdQuery = (id: string, options?: { skip?: boolean }) => {
  const data = options?.skip ? undefined : headRows.find((row) => row.id === id);
  return { ...listResult, data, currentData: data };
};
export const useAddFeeHeadMutation = () => {};
export const useUpdateFeeHeadMutation = () => {};
export const useGetReceiptBooksQuery = receiptBookFixture.useQuery;
export const useDeleteReceiptBookMutation = receiptBookFixture.useDelete;
export const useAddReceiptBookMutation = () => {};
export const usePatchReceiptBookMutation = () => {};
export const useUpdateReceiptBookMutation = () => {};

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
        : currentQueryAndMutation(params);
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
