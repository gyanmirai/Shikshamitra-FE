import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import issueReturnFormData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const reservationBookApi = createApi({
  reducerPath: 'ReservationBookApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/reservedBookData') {
          return { data: issueReturnFormData.reservedBookData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['ReservationBook'],
  endpoints: (builder) => ({
    getReservationBooks: builder.query({
      query: () => ({
        url: '/reservedBookData',
        method: 'GET',
      }),
      providesTags: ['ReservationBook'],
    }),
  }),
});

export const { useGetReservationBooksQuery } = reservationBookApi;
