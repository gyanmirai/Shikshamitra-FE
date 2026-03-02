import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import libraryData from '../../../libraryData.json';

const isDev = process.env.NODE_ENV === 'development';
export const libraryModuleApi = createApi({
  reducerPath: 'libraryModuleApi',
  baseQuery: !isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        if (url === '/books') {
          return { data: libraryData.books };
        }
        if (url === '/copies') {
          return { data: libraryData.copies };
        }
        if (url === '/libraryMemberManagementData') {
          return { data: libraryData.libraryMemberManagementData };
        }
        if (url.includes('bookId')) {
          const id = url.split('=')[1];
          return { data: libraryData.copies.filter((item) => item.bookId === id) };
        }
        // Member Management mock routes
        if (url === '/library/members') {
          return { data: libraryData.libraryMemberManagementData };
        }
        const memberDetailMatch = url.match(/^\/library\/members\/([^/]+)\/details$/);
        if (memberDetailMatch) {
          const memberId = memberDetailMatch[1];
          const member = libraryData.libraryMemberManagementData.find((m) => m.id === memberId);
          return { data: member || null };
        }
        const borrowedMatch = url.match(/^\/library\/members\/([^/]+)\/borrowed$/);
        if (borrowedMatch) {
          const memberId = borrowedMatch[1];
          return {
            data: libraryData.memberBorrowedBooks.filter((item) => item.memberId === memberId),
          };
        }
        const reservedMatch = url.match(/^\/library\/members\/([^/]+)\/reserved$/);
        if (reservedMatch) {
          const memberId = reservedMatch[1];
          return {
            data: libraryData.memberReservedBooks.filter((item) => item.memberId === memberId),
          };
        }
        const chargesMatch = url.match(/^\/library\/members\/([^/]+)\/charges$/);
        if (chargesMatch) {
          const memberId = chargesMatch[1];
          return {
            data: libraryData.memberCharges.filter((item) => item.memberId === memberId),
          };
        }
        const borrowHistoryMatch = url.match(/^\/library\/members\/([^/]+)\/borrow-history$/);
        if (borrowHistoryMatch) {
          const memberId = borrowHistoryMatch[1];
          return {
            data: libraryData.memberBorrowHistory.filter((item) => item.memberId === memberId),
          };
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
