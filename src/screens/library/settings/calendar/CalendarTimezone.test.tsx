import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { CalendarTimezone } from './CalendarTimezone';

vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('does not present an invalid saved Library timezone as confirmed', () => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <CalendarTimezone
        settings={{
          timeZoneId: 'Invalid/Zone',
          source: 'Library',
          needsConfiguration: true,
          hasValidOpenWeekday: true,
          canPublishAutomatedPolicy: false,
          canManageCalendar: true,
          configurationIssues: [],
        }}
      />
    </Provider>
  );
  expect(screen.queryByText(/Confirmed Library timezone/)).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(/invalid/i);
});
