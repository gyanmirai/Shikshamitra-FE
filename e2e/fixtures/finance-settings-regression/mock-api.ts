import { useSyncExternalStore } from 'react';
const description =
  'A complete description that is intentionally long enough to truncate in the table while remaining available in its tooltip and the exported report.';
let categories: any[] = [
  {
    id: 'charge',
    name: 'Test Charge',
    description,
    incomeCategoryId: 'income',
    incomeCategoryName: '10th Income Category',
    isAccountingReady: true,
    isApprovalRequired: false,
    isActive: true,
  },
];
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export function useGetChargeCategoriesQuery(params: any = {}) {
  const rows = useSyncExternalStore(subscribe, () => categories);
  const items = rows.filter(
    (row) =>
      (params.isActive === undefined || row.isActive === params.isActive) &&
      (!params.search ||
        `${row.name} ${row.incomeCategoryName} ${row.description}`
          .toLowerCase()
          .includes(params.search.toLowerCase()))
  );
  return {
    data: { items, totalCount: items.length },
    isLoading: false,
    isFetching: false,
    refetch: () => {},
  };
}
const mutation = () => [
  (input: any) => ({
    unwrap: async () => {
      if (input.body?.name)
        categories = input.chargeCategoryId
          ? categories.map((row) =>
              row.id === input.chargeCategoryId ? { ...row, ...input.body } : row
            )
          : [
              ...categories,
              {
                id: `charge-${categories.length}`,
                ...input.body,
                isAccountingReady: true,
                incomeCategoryName: '10th Income Category',
                isActive: true,
              },
            ];
      (window as any).financeSettingsWrites = [
        ...((window as any).financeSettingsWrites ?? []),
        input,
      ];
      listeners.forEach((fn) => fn());
      return input.body;
    },
  }),
  { isLoading: false },
];
export const usePostChargeCategoryMutation = mutation;
export const usePutChargeCategoryMutation = mutation;
export const useDeleteChargeCategoryMutation = mutation;
export const usePatchChargeCategoryStatusMutation = mutation;
export const usePatchConcessionTypeStatusMutation = mutation;
export const useDeleteConcessionTypeMutation = mutation;
export const usePostConcessionTypeMutation = mutation;
export const usePutConcessionTypeMutation = mutation;
export const useGetConcessionTypesQuery = (params: any = {}) => {
  const items =
    params.isActive === false
      ? []
      : [
          {
            id: 'concession',
            name: 'Merit Concession',
            description,
            documents: [
              {
                documentName:
                  'Complete academic achievement document with a long descriptive name.pdf',
              },
            ],
            deactivationReason: null,
            isActive: true,
            isUsedInDownstream: true,
          },
        ];
  return {
    data: { data: { items, totalCount: items.length } },
    isLoading: false,
    isFetching: false,
    refetch: () => {},
  };
};
export const useGetFinanceRoutingOptionsQuery = () => ({
  data: { items: [{ id: 'income', name: '10th Income Category' }] },
  isLoading: false,
});
export const useGetConcessionTypeVersionsQuery = () => ({ data: { items: [] }, isLoading: false });
export const useGetConcessionTypeVersionHistoryQuery = useGetConcessionTypeVersionsQuery;
export const useGetConcessionTypeByIdQuery = () => ({ data: {}, isLoading: false });
export const chargeCategoryApi = { util: { updateQueryData: () => ({ type: 'fixture' }) } };
export const concessionTypeApi = chargeCategoryApi;
