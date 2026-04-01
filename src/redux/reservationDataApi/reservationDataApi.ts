import { api } from 'src/redux/service';
import { reservationDataType } from 'src/redux/tagTypes';

import reservationData from '../../../issueReturnData.json';


export const reservationDataApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReservations: builder.query({
      query: () => ({
        url: '/reservationData',
        method: 'GET',
      }),
      providesTags: [reservationDataType.reservation],
    }),
  }),
});

export const { useGetReservationsQuery } = reservationDataApi;
