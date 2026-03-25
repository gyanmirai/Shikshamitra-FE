import { financeModuleApi } from './financeModuleApi';

export const concessionTypeApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionTypes: builder.query({
      query: ({ academicYearId }: { academicYearId: string }) => ({
        url: `/all-concession-types`,
        method: 'GET',
        params: {
          academicYearId,
        },
      }),
      providesTags: ['Concession-Type'],
    }),
    getConcessionTypeById: builder.query({
      query: ({ concessionTypeId }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'GET',
      }),
      providesTags: ['Concession-Type'],
    }),
    postConcessionType: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/${academicYearId}/concession-types`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Concession-Type'],
    }),
    putConcessionType: builder.mutation({
      query: ({ concessionTypeId, body }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Concession-Type'],
    }),
    deleteConcessionType: builder.mutation({
      query: ({ concessionTypeId }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Concession-Type'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConcessionTypesQuery,
  useGetConcessionTypeByIdQuery,
  usePostConcessionTypeMutation,
  usePutConcessionTypeMutation,
  useDeleteConcessionTypeMutation,
} = concessionTypeApi;
