import { api } from 'src/redux/service';
import { yearType } from 'src/redux/tagTypes';

export const yearApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getYear: builder.query({
      query: () => ({ url: '/app/academic-year?Sorting=name' }),
      providesTags: [yearType.year],
    }),
    getYearById: builder.query({
      query: (id) => ({ url: `/app/academic-year/${id}` }),
      providesTags: [yearType.year],
    }),
    addYear: builder.mutation({
      query: (body) => ({
        url: '/app/academic-year',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [yearType.year],
    }),
    updateYear: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/academic-year/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [yearType.year],
    }),
    deleteYear: builder.mutation({
      query: (id) => ({
        url: `/app/academic-year/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [yearType.year],
    }),
  }),
});

export const {
  useGetYearQuery,
  useGetYearByIdQuery,
  useAddYearMutation,
  useUpdateYearMutation,
  useDeleteYearMutation,
} = yearApi;
