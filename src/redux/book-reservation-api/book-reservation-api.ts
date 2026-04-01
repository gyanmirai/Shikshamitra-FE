import { reservationBookType } from 'src/redux/tagTypes';

import { api } from '../service';

export const reservationBookApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReservationBooks: builder.query({
      query: () => ({
        url: '/reservedBookData',
        method: 'GET',
      }),
      providesTags: [reservationBookType.reservationBook],
    }),
  }),
});

export const { useGetReservationBooksQuery } = reservationBookApi;
