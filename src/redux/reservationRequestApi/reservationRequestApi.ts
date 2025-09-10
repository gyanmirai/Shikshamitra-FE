import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import issueReturnData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const reservationRequestApi = createApi({
  reducerPath: 'ReservationRequestApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/reservationRequestData') {
          return { data: issueReturnData.reservationRequestData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['ReservationRequest'],
  endpoints: (builder) => ({
    getReservationRequestData: builder.query({
      query: () => ({
        url: '/reservationRequestData',
        method: 'GET',
      }),
      providesTags: ['ReservationRequest'],
    }),
  }),
});

export const { useGetReservationRequestDataQuery } = reservationRequestApi;
