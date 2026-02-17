import { financeModuleApi } from './financeModuleApi';

export const financeFeeStructureApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeStructures: builder.query({
      query: (params) => ({
        url: '/fee-structures',
        method: 'GET',
        params,
      }),
      providesTags: ['FeeStructure'],
    }),

    createFeeStructure: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/fee-structures',
        method: 'POST',
        data: body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: ['FeeStructure'],
    }),
    updateFeeStructure: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/fee-structures/${feeStructureId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['FeeStructure'],
    }),

    getFeeStructureDetails: builder.query({
      query: (feeStructureId) => ({
        url: `/fee-structures/${feeStructureId}`,
        method: 'GET',
      }),
      providesTags: ['FeeStructure'],
    }),

    updateFeeStructureStatus: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/fee-structures/${feeStructureId}/status`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['FeeStructure'],
    }),

    saveStandardFeeStructures: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/fee-structures/${feeStructureId}/standard-fee-structures`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['FeeStructure'],
    }),

    getStandardFeeStructure: builder.query({
      query: ({ standardId }) => ({
        url: `/fee-structures/standards/${standardId}`,
        method: 'GET',
      }),
      providesTags: ['FeeStructure'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeeStructuresQuery,
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  useGetFeeStructureDetailsQuery,
  useUpdateFeeStructureStatusMutation,
  useSaveStandardFeeStructuresMutation,
  useGetStandardFeeStructureQuery,
} = financeFeeStructureApi;
