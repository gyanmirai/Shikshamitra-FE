import { api } from 'src/redux/service';
import { reservationRequestType } from 'src/redux/tagTypes';

import issueReturnData from '../../../issueReturnData.json';


export const reservationRequestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReservationRequestData: builder.query({
      query: () => ({
        url: '/reservationRequestData',
        method: 'GET',
      }),
      providesTags: [reservationRequestType.reservationRequest],
    }),
  }),
});

export const { useGetReservationRequestDataQuery } = reservationRequestApi;
