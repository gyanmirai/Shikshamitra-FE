import type { GlobalAcademicSearchOption } from 'src/layouts/components/global-academic-search/types';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import globalReducer, { setCurrentYear } from 'src/redux/globalState/globalSlice';
import { useAcademicConfirmation } from 'src/layouts/components/global-academic-search/use-academic-confirmation';

import LibraryTimingCreation from './index';

const nextYear = {
  value: 'year-2',
  label: '2027-28',
  academicYear: { id: 'year-2', name: '2027-28' },
  board: {},
  medium: {},
} as GlobalAcademicSearchOption;
export function mountHoursContext() {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: () => ({
        permissions: [
          'Library.Settings.LibraryHours.View',
          'Library.Settings.LibraryHours.Add',
        ].map((name) => ({ name, isGranted: true })),
      }),
      globalState: globalReducer,
      confirmPopup: confirmReducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  store.dispatch(setCurrentYear({ id: 'year-id', name: '2026-27' }));
  function LibraryYearSelection() {
    // These are the actual Library flags emitted by useAcademicOptions.
    const { changeSelection } = useAcademicConfirmation({
      isYearOnly: true,
      isStudentModule: false,
      selectedOption: null,
      options: [nextYear],
      applyAcademicOption: (option) => store.dispatch(setCurrentYear(option?.academicYear ?? {})),
    });
    return (
      <button type="button" onClick={() => changeSelection(nextYear)}>
        Change academic year
      </button>
    );
  }
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <LibraryYearSelection />
          <LibraryTimingCreation />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
  return store;
}
