import { useSyncExternalStore } from 'react';

// Local-only synthetic fixture. These hooks never call the live API.
type Kind = 'Income' | 'Expense' | 'Bank';
type Row = Record<string, any>;
const seed: Record<Kind, Row[]> = {
  Income: [
    {
      id: 'income-qa',
      name: 'Class 10 शुल्क & Fees',
      tags: ['qa', 'शुल्क'],
      description: 'QA income शुल्क <b>literal</b>',
      isActive: true,
      concurrencyStamp: '1',
      version: 1,
      canDelete: false,
    },
  ],
  Expense: [
    {
      id: 'expense-qa',
      name: 'Class 10 खर्च & Fees',
      tags: ['qa', 'खर्च'],
      description: 'QA expense खर्च <b>literal</b>',
      isActive: true,
      concurrencyStamp: '1',
      version: 1,
      canDelete: false,
    },
  ],
  Bank: [
    {
      id: 'bank-qa',
      bankName: 'QA Bank 10 बैंक & Co',
      branchName: 'QA Branch 2',
      accountHolderName: 'School 10 संस्था',
      accountType: 0,
      accountNumber: '000001',
      maskedAccountNumber: '**0001',
      ifscCode: 'QAAA0123456',
      upiId: 'qa.bank@qa',
      maskedUpiId: '***@qa',
      branchAddress: 'पता <b>literal</b>',
      purpose: 'शुल्क synthetic metadata',
      effectiveFrom: '2026-10-14',
      effectiveTo: '',
      isActive: true,
      concurrencyStamp: '1',
      version: 1,
      canDelete: false,
    },
  ],
};
let state: Record<Kind, Row[]> =
  JSON.parse(localStorage.getItem('accounts-qa-fixture') || 'null') || seed;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function publish(next: typeof state) {
  state = next;
  localStorage.setItem('accounts-qa-fixture', JSON.stringify(state));
  listeners.forEach((listener) => listener());
}
function useRows(kind: Kind) {
  return useSyncExternalStore(subscribe, () => state[kind]);
}
function useList(kind: Kind, params: Row = {}) {
  const rows = useRows(kind);
  const term = String(params.search || '').toLowerCase();
  const matches = rows.filter((row) =>
    (kind === 'Bank' ? `${row.bankName} ${row.branchName} ${row.accountHolderName}` : row.name)
      .toLowerCase()
      .includes(term)
  );
  const pageSize = params.pageSize || 10;
  return {
    data: {
      items: matches
        .slice(((params.page || 1) - 1) * pageSize, (params.page || 1) * pageSize)
        .map((row) =>
          kind === 'Bank'
            ? { ...row, accountNumber: null, upiId: null, ifscCode: 'QAAA*******' }
            : row
        ),
      totalCount: matches.length,
    },
    isLoading: false,
    isFetching: false,
    refetch: () => publish({ ...state }),
  };
}
function useMutation(kind: Kind, action: 'create' | 'update' | 'status' | 'delete') {
  useRows(kind);
  return [
    (args: Row | string) => ({
      unwrap: async () => {
        const input = typeof args === 'string' ? { id: args } : args;
        const id =
          input.id || input.incomeCategoryId || input.expenseCategoryId || input.bankAccountId;
        const body = input.body || {};
        const duplicate = state[kind].some(
          (row) =>
            row.id !== id &&
            (kind === 'Bank'
              ? row.accountNumber === body.accountNumber
              : row.name?.trim().toLowerCase() === body.name?.trim().toLowerCase())
        );
        if (duplicate && action !== 'status' && action !== 'delete')
          throw { data: { error: { code: 'Finance:Accounts:Settings:DuplicateName' } } };
        let result: Row;
        if (action === 'create') {
          result = {
            ...body,
            id: crypto.randomUUID(),
            isActive: true,
            version: 1,
            concurrencyStamp: '1',
            canDelete: false,
          };
          publish({ ...state, [kind]: [...state[kind], result] });
        } else {
          result = { ...state[kind].find((row) => row.id === id), ...body };
          result.version = (result.version || 1) + 1;
          result.concurrencyStamp = String(result.version);
          result.canDelete = !result.isActive;
          if (kind === 'Bank') {
            result.maskedAccountNumber =
              '*'.repeat(Math.max(0, result.accountNumber.length - 4)) +
              result.accountNumber.slice(-4);
            result.maskedUpiId = result.upiId ? '***@' + result.upiId.split('@')[1] : null;
          }
          publish({
            ...state,
            [kind]:
              action === 'delete'
                ? state[kind].filter((row) => row.id !== id)
                : state[kind].map((row) => (row.id === id ? result : row)),
          });
        }
        return result;
      },
    }),
    { isLoading: false },
  ] as const;
}
function useHistory(kind: Kind, id: string) {
  const rows = useRows(kind);
  const row = rows.find((item) => item.id === id);
  return {
    currentData: {
      items: row
        ? [
            {
              id: `${id}-1`,
              versionNumber: 1,
              changeAction: 'created',
              actorName: 'QA Fixture',
              changeTime: '2026-10-14T07:00:00Z',
              changedFields: [],
            },
          ]
        : [],
      totalCount: row ? 1 : 0,
    },
    isFetching: false,
    isError: false,
    refetch: () => {},
  };
}
export const useGetIncomeCategoriesQuery = (params?: Row) => useList('Income', params);
export const useGetExpenseCategoryQuery = (params?: Row) => useList('Expense', params);
export const useGetBankAccountQuery = (params?: Row) => useList('Bank', params);
export const usePostIncomeCategoryMutation = () => useMutation('Income', 'create');
export const usePutIncomeCategoryMutation = () => useMutation('Income', 'update');
export const useDeleteIncomeCategoryMutation = () => useMutation('Income', 'delete');
export const usePatchIncomeCategoryStatusMutation = () => useMutation('Income', 'status');
export const usePostExpenseCategoryMutation = () => useMutation('Expense', 'create');
export const usePutExpenseCategoryMutation = () => useMutation('Expense', 'update');
export const useDeleteExpenseCategoryMutation = () => useMutation('Expense', 'delete');
export const usePatchExpenseCategoryStatusMutation = () => useMutation('Expense', 'status');
export const usePostBankAccountMutation = () => useMutation('Bank', 'create');
export const usePutBankAccountMutation = () => useMutation('Bank', 'update');
export const useDeleteBankAccountMutation = () => useMutation('Bank', 'delete');
export const usePatchBankAccountStatusMutation = () => useMutation('Bank', 'status');
export const useGetIncomeCategoryVersionsQuery = (id: string) => useHistory('Income', id);
export const useGetExpenseCategoryVersionsQuery = (id: string) => useHistory('Expense', id);
export const useGetBankAccountVersionsQuery = (id: string) => useHistory('Bank', id);
export const useLazyGetBankAccountByIdQuery = () =>
  [(id: string) => ({ unwrap: async () => state.Bank.find((row) => row.id === id) })] as const;
const mockApi = { util: { updateQueryData: () => () => ({ undo: () => {} }) } };
export const incomeCategoryApi = mockApi;
export const expenseCategoryApi = mockApi;
export const bankAccountApi = mockApi;
