const existing = {
  id: 'synthetic-concession',
  name: 'Synthetic sibling concession',
  description: 'An unused local browser fixture',
  isUsedInDownstream: false,
  concurrencyStamp: 'fixture',
  documents: [
    {
      id: 'synthetic-document',
      documentName: 'Sibling certificate',
      maxFileSizeBytes: 5 * 1024 * 1024,
      acceptedFormats: ['0', '4'],
      isRequired: true,
    },
  ],
};

export const useGetConcessionTypesQuery = () => ({ data: { data: { items: [] } } });
export const useGetConcessionTypeByIdQuery = () => ({ data: { data: existing }, isLoading: false });
export const useGetConcessionTypeVersionHistoryQuery = () => ({
  data: {
    data: {
      totalCount: 3,
      items: [
        {
          id: 'v3',
          versionNumber: 3,
          changeAction: 'updated',
          changeTime: '2026-10-02T10:00:00Z',
          actorName: 'Admin',
          changedFields: [],
        },
        {
          id: 'v2',
          versionNumber: 2,
          changeAction: 'updated',
          changeTime: '2026-10-01T10:00:00Z',
          actorName: 'Admin',
          changedFields: [{ fieldName: 'DiscountType', originalValue: '1', newValue: null }],
        },
        {
          id: 'v1',
          versionNumber: 1,
          changeAction: 'created',
          changeTime: '2026-09-30T10:00:00Z',
          actorName: 'Admin',
          changedFields: [],
        },
      ],
    },
  },
  isFetching: false,
  isError: false,
  refetch: () => {},
});

function useMutation(): any {
  const mutate = (payload: any) => ({
    unwrap: async () => {
      window.dispatchEvent(new CustomEvent('fixture-saved', { detail: payload.body }));
      return { data: payload.body };
    },
  });
  return [mutate, { isLoading: false }];
}

export const usePostConcessionTypeMutation = useMutation;
export const usePutConcessionTypeMutation = useMutation;
