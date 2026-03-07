import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const libraryModuleApi = createApi({
  reducerPath: 'libraryModuleApi',
  baseQuery: axiosBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api` }),
  tagTypes: [
    'Books',
    'Copies',
    'Members',
    'BookCategory',
    'BookIssue',
    'BookReturn',
    'BookReservation',
    'MemberCharges',
    'BorrowHistory',
    'LibrarySettings',
  ],
  endpoints: () => ({}), // inject later
});
