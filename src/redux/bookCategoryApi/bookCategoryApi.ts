import { bookCategoryType } from 'src/redux/tagTypes';

import { api } from '../service';

export const bookCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBookCategories: builder.query({
      query: (params) => ({
        url: '/book-categories',
        method: 'GET',
        params,
      }),
      providesTags: [bookCategoryType.bookCategory],
    }),
    addBookCategory: builder.mutation({
      query: (data) => {
        const { academicYearId, ...body } = data;
        return {
          url: '/book-categories',
          method: 'POST',
          body,
          params: { academicYearId },
        };
      },
      invalidatesTags: [bookCategoryType.bookCategory],
    }),
    updateBookCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/book-categories/${categoryId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: [bookCategoryType.bookCategory],
    }),
    deleteBookCategory: builder.mutation({
      query: ({ categoryId }) => ({
        url: `/book-categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [bookCategoryType.bookCategory],
    }),
  }),
});

export const {
  useGetBookCategoriesQuery,
  useAddBookCategoryMutation,
  useUpdateBookCategoryMutation,
  useDeleteBookCategoryMutation,
} = bookCategoryApi;
