import type { ReactNode } from 'react';
import type { LibraryReservation } from 'src/redux/library/reservation-types';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const theme = createTheme(defaultSettings);

export const reservationYear = { id: 'year-id', startDate: '2026-04-01', endDate: '2027-03-31' };
export const reservationMember = {
  id: 'canonical-member',
  memberIdentifier: 'S/42#?',
  memberName: 'Asha Patel',
  role: 0,
  academicYearId: reservationYear.id,
  isEligibleForReservation: true,
};
export const reservationItem: LibraryReservation = {
  id: 'reservation-id',
  bookId: 'book-id',
  memberId: reservationMember.id,
  memberName: reservationMember.memberName,
  memberIdentifier: reservationMember.memberIdentifier,
  role: 0,
  academicYearId: reservationYear.id,
  state: 1,
  requestedDate: '2026-11-17',
  requestExpiryDate: '2026-11-30',
  requestedDateProvenance: 1,
  requestExpiryDateProvenance: 1,
  requiresReview: false,
  revision: 'opened-revision',
  canCancel: true,
  canReview: false,
  hold: {
    id: 'hold-id',
    copyId: 'copy-id',
    accessionNumber: 'વાંચન/42#?',
    state: 0,
    allocatedAt: '2026-11-17T07:00:00Z',
    pickupDeadline: '2026-11-20',
    pickupDeadlineProvenance: 1,
    timeZoneId: 'Asia/Kolkata',
  },
};

export function reservationWrapper(
  actions = ['Library.AllBooks.View', 'Library.IssueReturn.Reserve']
) {
  const store = configureStore({
    reducer: {
      auth: () => ({ permissions: actions.map((name) => ({ name, isGranted: true })) }),
      globalState: () => ({ currentYear: reservationYear }),
      confirmPopup: confirmReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  return {
    store,
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
        </ThemeProvider>
      </Provider>
    ),
  };
}
