import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export const financeFeeStructureApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeStructures: builder.query({
      query: (params) => ({
        url: '/fee-structures-metadata',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeStructure],
    }),

    createFeeStructure: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/fee-structures',
        method: 'POST',
        body,
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
        body,
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
        body,
      }),
      invalidatesTags: [financeModuleType.feeStructure],
    }),

    saveStandardFeeStructures: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/fee-structures/${feeStructureId}/standard-fee-structures`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.feeStructure],
    }),

    getStandardFeeStructure: builder.query({
      query: ({ standardId }) => ({
        url: `/fee-structures`,
        method: 'GET',
        params: { standardId },
      }),
      providesTags: (_result, _error, { standardId }) => [
        { type: financeModuleType.classWiseFeeStructure, id: standardId },
      ],
    }),

    generateFeeStructure: builder.mutation({
      query: ({ academicYearId }) => ({
        url: '/fee-structures-metadata/generate',
        method: 'POST',
        params: { academicYearId },
      }),
      invalidatesTags: [financeModuleType.feeStructure],
    }),

    // ── Independent class-wise fee structure endpoints ─────────────────────

    getClassWiseFeeStructures: builder.query({
      query: ({ feeStructureId, classId }) => ({
        url: `/fee-structures/${feeStructureId}/class-wise/${classId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { classId }) => [
        { type: financeModuleType.classWiseFeeStructure, id: classId },
      ],
    }),

    createClassWiseFeeStructure: builder.mutation({
      query: ({ feeStructureMetaDataId, standardId, name, feeHeads }) => ({
        url: `/fee-structures`,
        method: 'POST',
        params: { feeStructureMetadataId: feeStructureMetaDataId },
        body: {
          standardId,
          standardFeeStructures: { name, feeHeads },
        },
      }),
      invalidatesTags: (_result, _error, { standardId }) => [
        { type: financeModuleType.classWiseFeeStructure, id: standardId },
      ],
    }),

    updateClassWiseFeeStructure: builder.mutation({
      query: ({ structureId, body }) => ({
        url: `/fee-structures/${structureId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { classId }) => [
        { type: financeModuleType.classWiseFeeStructure, id: classId },
      ],
    }),

    deleteClassWiseFeeStructure: builder.mutation({
      query: ({ structureId }) => ({
        url: `/fee-structures/${structureId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { classId }) => [
        { type: financeModuleType.classWiseFeeStructure, id: classId },
      ],
    }),

    lockClassWiseFeeStructure: builder.mutation({
      query: ({ structureId }) => ({
        url: `/fee-structures/${structureId}/lock`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { classId }) => [
        { type: financeModuleType.classWiseFeeStructure, id: classId },
      ],
    }),

    unlockClassWiseFeeStructure: builder.mutation({
      query: ({ structureId }) => ({
        url: `/fee-structures/${structureId}/lock`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { classId }) => [
        { type: financeModuleType.classWiseFeeStructure, id: classId },
      ],
    }),

    getAcademicYearMonths: builder.query({
      query: (params) => ({
        url: '/fee-structures/academic-year-months',
        method: 'GET',
        params,
      }),
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
  useGenerateFeeStructureMutation,
  useGetClassWiseFeeStructuresQuery,
  useCreateClassWiseFeeStructureMutation,
  useUpdateClassWiseFeeStructureMutation,
  useDeleteClassWiseFeeStructureMutation,
  useLockClassWiseFeeStructureMutation,
  useUnlockClassWiseFeeStructureMutation,
  useGetAcademicYearMonthsQuery,
} = financeFeeStructureApi;
