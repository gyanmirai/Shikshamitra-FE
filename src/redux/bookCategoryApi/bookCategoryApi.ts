import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const bookCategoryApi = createApi({
  reducerPath: 'BookCategoryApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['BookCategory'],
  endpoints: (builder) => ({
    getBookCategories: builder.query({
      query: (params) => ({
        url: '/book-categories',
        method: 'GET',
        params,
      }),
      providesTags: ['BookCategory'],
    }),
    addBookCategory: builder.mutation({
      query: (data) => {
        const { academicYearId, ...body } = data;
        return {
          url: '/book-categories',
          method: 'POST',
          data: body,
          params: { academicYearId },
        };
      },
      invalidatesTags: ['BookCategory'],
    }),
    updateBookCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/book-categories/${categoryId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['BookCategory'],
    }),
    deleteBookCategory: builder.mutation({
      query: ({ categoryId }) => ({
        url: `/book-categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BookCategory'],
    }),
  }),
});

export const {
  useGetBookCategoriesQuery,
  useAddBookCategoryMutation,
  useUpdateBookCategoryMutation,
  useDeleteBookCategoryMutation,
} = bookCategoryApi;
