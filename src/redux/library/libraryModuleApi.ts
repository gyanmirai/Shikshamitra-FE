import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import libraryData from '../../../libraryData.json';

const isDev = process.env.NODE_ENV === 'development';
console.log('libraryData:', libraryData.books);
console.log('ENV:', process.env.NODE_ENV);
console.log('isDev==library000', isDev);
export const libraryModuleApi = createApi({
  reducerPath: 'libraryModuleApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        switch (url) {
          case '/books':
            console.log('libraryData.books:', libraryData.books);
            return { data: libraryData.books };
          case '/copies':
            return { data: libraryData.copies };
          default:
            return {
              error: {
                status: 404,
                data: 'No mock data found for this route',
              },
            };
        }
      },
  tagTypes: ['Books', 'Copies'],
  endpoints: () => ({}), // inject later
});
