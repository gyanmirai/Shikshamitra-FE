import { bookCategoryOptionsType } from 'src/redux/tagTypes';

import { api } from '../service';

const isDev = process.env.NODE_ENV === 'development';

export const bookCategoryOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBookCategoryOptions: builder.query({
      query: () => ({
        url: '/bookCategoryOptionsData',
        method: 'GET',
      }),
      providesTags: [bookCategoryOptionsType.bookCategoryOptions],
    }),
  }),
});

export const { useGetBookCategoryOptionsQuery } = bookCategoryOptionsApi;
