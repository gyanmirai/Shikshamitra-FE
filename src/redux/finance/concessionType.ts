import { financeModuleApi } from './financeModuleApi';

export const concessionTypeApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionTypes: builder.query({
      query: (academicYearId: string) => ({
        url: `/finance/academic-years/${academicYearId}/concession-types`,
        method: 'GET',
      }),
      providesTags: ['Concession-Type'],
    }),
    getConcessionTypeById: builder.query({
      query: ({ academicYearId, concessionTypeId }) => ({
        url: `/finance/academic-years/${academicYearId}/concession-types/${concessionTypeId}`,
        method: 'GET',
      }),
      providesTags: ['Concession-Type'],
    }),
    postConcessionType: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/finance/academic-years/${academicYearId}/concession-types`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Concession-Type'],
    }),
    putConcessionType: builder.mutation({
      query: ({ academicYearId, concessionTypeId, body }) => ({
        url: `/finance/academic-years/${academicYearId}/concession-types/${concessionTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Concession-Type'],
    }),
    deleteConcessionType: builder.mutation({
      query: ({ academicYearId, concessionTypeId }) => ({
        url: `/finance/academic-years/${academicYearId}/concession-types/${concessionTypeId}`,
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
