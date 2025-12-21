import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const instituteSetupApi = createApi({
  reducerPath: 'instituteSetupApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/institute-setup`,
  }),
  tagTypes: ['RoomTypes', 'Rooms', 'Buildings', 'Floors', 'Hostels', 'Beds', 'Wings'],
  endpoints: () => ({}), // inject later
});
