import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import libraryData from '../../../libraryData.json';

const isDev = process.env.NODE_ENV === 'development';
export const libraryModuleApi = createApi({
  reducerPath: 'libraryModuleApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        if (url === '/books') {
          return { data: libraryData.books };
        }
        if (url === '/copies') {
          return { data: libraryData.copies };
          // } else if (url === '/copies/[]') {
          //   return { data: libraryData.copies };
        }
        if (url === '/libraryMemberManagementData') {
          return { data: libraryData.libraryMemberManagementData };
        }
        if (url.includes('bookId')) {
          const id = url.split('=')[1];
          return { data: libraryData.copies.filter((item) => item.bookId === id) };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Books', 'Copies', 'Members'],
  endpoints: () => ({}), // inject later
});
