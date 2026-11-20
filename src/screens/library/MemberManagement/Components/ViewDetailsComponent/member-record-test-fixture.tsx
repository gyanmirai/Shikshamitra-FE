import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import type { IMember } from '../type';

const theme = createTheme(defaultSettings);
export const recordMember: IMember = {
  id: 'canonical-member',
  name: 'Asha Patel',
  role: 'Student',
  memberIdentifier: 'S/42',
  currentIssue: 1,
  overdueReturn: 0,
  reservedBooks: 1,
  memberStatus: 'Active',
};
export const memberRecord = {
  id: 'loan-id',
  borrowId: 'loan-id',
  bookId: 'book-id',
  copyId: 'copy-id',
  bookTitle: 'Recorded Library Title',
  bookCategory: 'Reading',
  accessionNo: 'વાંચન/42',
  issuedOn: '2001-01-01T18:30:00Z',
  dueOn: '2001-01-08T18:30:00Z',
  reservedOn: '2001-01-01T18:30:00Z',
  schoolIssueDate: '2026-11-17',
  schoolDueDate: '2026-11-24',
  issueDateProvenance: 1,
  dueDateProvenance: 1,
  rawIssueDate: '2001-01-01T18:30:00Z',
  rawDueDate: '2001-01-08T18:30:00Z',
  requestedDate: '2026-11-17',
  requestedDateProvenance: 1,
  requestExpiryDate: '2026-11-30',
  state: 0,
  academicYearId: 'saved-year-id',
};
export function memberRecordWrapper() {
  const store = configureStore({
    reducer: {
      auth: () => ({ permissions: [{ name: 'Library.LibraryMembers.View', isGranted: true }] }),
      globalState: (
        state = { currentYear: { id: 'current-context-year', name: 'Current context' } },
        action: { type: string }
      ) =>
        action.type === 'member-test/change-year'
          ? { currentYear: { id: 'next-context-year', name: 'Next context' } }
          : state,
      confirmPopup: confirmReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  return {
    store,
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    ),
  };
}
