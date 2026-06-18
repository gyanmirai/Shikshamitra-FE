import { reservationBookType } from 'src/redux/tagTypes';
import { mapBookReservationDto, toLibraryPaginatedList } from 'src/redux/library/library-adapters';

import { api } from '../service';

export const reservationBookApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReservationBooks: builder.query({
      query: (arg: any = {}) => {
        const { bookId, ...params } = arg;
        return {
          url: bookId ? `/library/books/${bookId}/reservations` : '/library/issue-returns',
          method: 'GET',
          params,
        };
      },
      transformResponse: (response, meta, arg: any) =>
        arg?.bookId
          ? toLibraryPaginatedList(response, mapBookReservationDto)
          : toLibraryPaginatedList([]),
      providesTags: [reservationBookType.reservationBook],
    }),
  }),
});

export const { useGetReservationBooksQuery } = reservationBookApi;
