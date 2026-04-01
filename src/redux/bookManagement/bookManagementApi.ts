import { bookManagementType } from 'src/redux/tagTypes';

import { api } from '../service';

export const bookManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: () => ({
        url: '/bookTitleData',
        method: 'GET',
      }),
      providesTags: [bookManagementType.bookManagement],
    }),
  }),
});

export const { useGetBooksQuery } = bookManagementApi;
