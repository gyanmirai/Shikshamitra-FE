import { financeModuleApi } from './financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


export const financeFeeStructureApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeStructures: builder.query({
      query: (params) => ({
        url: '/fee-structures',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeStructure],
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
      invalidatesTags: [financeModuleType.feeStructure],
    }),
    updateFeeStructure: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/fee-structures/${feeStructureId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [financeModuleType.feeStructure],
    }),

    getFeeStructureDetails: builder.query({
      query: (feeStructureId) => ({
        url: `/fee-structures/${feeStructureId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeStructure],
    }),

    updateFeeStructureStatus: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/fee-structures/${feeStructureId}/status`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [financeModuleType.feeStructure],
    }),

    saveStandardFeeStructures: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/fee-structures/${feeStructureId}/standard-fee-structures`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [financeModuleType.feeStructure],
    }),

    getStandardFeeStructure: builder.query({
      query: ({ standardId }) => ({
        url: `/fee-structures/standards/${standardId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeStructure],
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
