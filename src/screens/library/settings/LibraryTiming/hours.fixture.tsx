import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import LibraryTimingCreation from './index';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from '../catalogue-configuration/catalogue-test-fixture';

export const savedHours = () => [
  { day: 'Monday', startTime: '09:10:00', endTime: '12:20:00', status: 0 },
  ...['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({
    day,
    startTime: '00:00:00',
    endTime: '00:00:00',
    status: day === 'Sunday' ? 2 : 1,
  })),
];
export const hoursResponse = (items = savedHours()) => ({
  items,
  canManageHours: true,
  totalCount: items.length,
  currentPage: 1,
  pageSize: 7,
  totalPages: 1,
});
export const serveHours = () =>
  mswServer.use(
    http.get('http://library.test/api/library/library-hours', () =>
      HttpResponse.json(hoursResponse())
    )
  );
export function mountHours(
  permissions = ['Library.Settings.LibraryHours.View', 'Library.Settings.LibraryHours.Add']
) {
  const store = catalogueTestStore(permissions);
  return {
    store,
    ...render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <LibraryTimingCreation />
      </LocalizationProvider>,
      { wrapper: catalogueTestWrapper(store) }
    ),
  };
}
