import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import reservationData from '../../../reservationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const reservationDataApi = createApi({
  reducerPath: 'ReservationDataApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/reservationData') {
          return { data: reservationData.reservationData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Reservation'],
  endpoints: (builder) => ({
    getReservations: builder.query({
      query: () => ({
        url: '/reservationData',
        method: 'GET',
      }),
      providesTags: ['Reservation'],
    }),
  }),
});

export const { useGetReservationsQuery } = reservationDataApi;
