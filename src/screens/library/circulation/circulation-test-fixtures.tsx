import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

export function makeCirculationTestWrapper(
  permissions: { name: string; isGranted: boolean }[] = []
) {
  const store = configureStore({
    reducer: { auth: () => ({ permissions }), [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  return {
    store,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  };
}
export const lookupBook = {
  bookId: 'book-id',
  accessionNo: 'વાંચન/#42',
  title: 'Stories',
  author: 'Asha Patel',
  category: 'Fiction',
  language: 'Gujarati',
};
export const lookupMember = {
  id: 'canonical-member-id',
  memberName: 'Asha Patel',
  memberIdentifier: 'S-42',
  role: 'Student',
  statistics: { currentIssue: 1, reservedBooks: 0, overdueReturnBooks: 0 },
};
