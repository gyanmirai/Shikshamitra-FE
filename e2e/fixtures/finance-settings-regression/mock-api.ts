import { useSyncExternalStore } from 'react';
const description =
  'A complete description that is intentionally long enough to truncate in the table while remaining available in its tooltip and the exported report.';
let categories: any[] = [
  {
    id: 'used-charge-category',
    name: '8th Charge Category',
    description: 'Used by Test Chare One for three students.',
    incomeCategoryId: 'income',
    incomeCategoryName: '10th Income Category',
    isAccountingReady: true,
    isApprovalRequired: true,
    isActive: true,
  },
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

export interface ChargeCategoryUsage {
  categoryId: string;
  categoryName: string;
  chargeCount: number;
  studentAssignmentCount: number;
  chargeNames: string[];
  canDelete: boolean;
}

const getUsage = (id: string): ChargeCategoryUsage => {
  const category = categories.find((row) => row.id === id);
  if (!category) throw { data: { detail: 'The charge category was not found.' } };
  const used = id === 'used-charge-category';
  return {
    categoryId: id,
    categoryName: category.name,
    chargeCount: used ? 1 : 0,
    studentAssignmentCount: used ? 3 : 0,
    chargeNames: used ? ['Test Chare One'] : [],
    canDelete: !used,
  };
};

export const useLazyGetChargeCategoryUsageQuery = () => [
  (id: string) => ({
    unwrap: async () => {
      (window as any).financeSettingsUsageReads = [
        ...((window as any).financeSettingsUsageReads ?? []),
        id,
      ];
      return getUsage(id);
    },
  }),
  { isLoading: false, isFetching: false },
] as const;
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
export const useDeleteChargeCategoryMutation = () => [
  (input: { chargeCategoryId: string }) => ({
    unwrap: async () => {
      (window as any).financeSettingsWrites = [
        ...((window as any).financeSettingsWrites ?? []),
        input,
      ];
      const usage = getUsage(input.chargeCategoryId);
      if (!usage.canDelete) {
        throw { data: { error: { code: 'Finance:Charge:010028', message: `${usage.categoryName} is used by ${usage.chargeCount} charge(s).` } } };
      }
      categories = categories.filter((row) => row.id !== input.chargeCategoryId);
      listeners.forEach((fn) => fn());
      return undefined;
    },
  }),
  { isLoading: false },
] as const;
export const usePatchChargeCategoryStatusMutation = mutation;
export const usePatchConcessionTypeStatusMutation = mutation;
export const usePostConcessionTypeMutation = mutation;
export const usePutConcessionTypeMutation = mutation;
let concessionTypes = [
  {
    id: 'concession',
    name: 'Merit Concession',
    description,
    documents: [
      {
        documentName: 'Complete academic achievement document with a long descriptive name.pdf',
      },
    ],
    deactivationReason: null,
    isActive: true,
    isUsedInDownstream: true,
    canDelete: false,
  },
  {
    id: 'unused-concession',
    name: 'Unused Concession',
    description: 'An archived test record with no dependencies.',
    documents: [],
    deactivationReason: 'Verification fixture',
    isActive: false,
    isUsedInDownstream: false,
    canDelete: true,
  },
  {
    id: 'conflicting-concession',
    name: 'Concession With New Dependency',
    description: 'A dependency is added after its list data is loaded.',
    documents: [],
    deactivationReason: 'Verification fixture',
    isActive: false,
    isUsedInDownstream: false,
    canDelete: true,
  },
];
export const useDeleteConcessionTypeMutation = () => [
  ({ concessionTypeId }: { concessionTypeId: string }) => ({
    unwrap: async () => {
      if (concessionTypeId === 'conflicting-concession') {
        throw { status: 409, data: { detail: 'This concession type is used by a concession request.' } };
      }
      concessionTypes = concessionTypes.filter((row) => row.id !== concessionTypeId);
      listeners.forEach((fn) => fn());
    },
  }),
  { isLoading: false },
] as const;
export const useGetConcessionTypesQuery = (params: any = {}) => {
  const rows = useSyncExternalStore(subscribe, () => concessionTypes);
  const items = rows.filter((row) =>
    (params.includeInactive || row.isActive) &&
    (!params.searchTerm || row.name.toLowerCase().includes(params.searchTerm.toLowerCase()))
  );
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
let exceptionWindows = [
  {
    id: 'unused-window',
    startDate: '2026-12-01',
    endDate: '2026-12-02',
    effect: 'SuspendLateFeeAccrual',
    scope: 'SchoolWide',
    reason: 'Disposable verification window',
    isActive: true,
  },
  {
    id: 'conflicting-window',
    startDate: '2026-12-10',
    endDate: '2026-12-11',
    effect: 'SuspendLateFeeAccrual',
    scope: 'SchoolWide',
    reason: 'Window already used by a scheduled calculation',
    isActive: true,
  },
];
export const useGetExceptionWindowsQuery = () => ({
  data: useSyncExternalStore(subscribe, () => exceptionWindows),
  isLoading: false,
});
export const useCreateExceptionWindowMutation = () => [
  (input: Omit<(typeof exceptionWindows)[number], 'id' | 'isActive'>) => ({
    unwrap: async () => {
      const entry = { ...input, id: crypto.randomUUID(), isActive: true };
      exceptionWindows = [...exceptionWindows, entry];
      listeners.forEach((fn) => fn());
      return entry;
    },
  }),
  { isLoading: false },
] as const;
export const useDeleteExceptionWindowMutation = () => [
  (id: string) => ({
    unwrap: async () => {
      if (id === 'conflicting-window') {
        throw { status: 409, data: { detail: 'This exception window is used by a scheduled calculation.' } };
      }
      exceptionWindows = exceptionWindows.filter((window) => window.id !== id);
      listeners.forEach((fn) => fn());
    },
  }),
  { isLoading: false },
] as const;
export const chargeCategoryApi = { util: { updateQueryData: () => ({ type: 'fixture' }) } };
export const concessionTypeApi = chargeCategoryApi;
