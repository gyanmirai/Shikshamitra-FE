import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, fireEvent } from '@testing-library/react';
import globalStateReducer from 'src/redux/globalState/globalSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import {
  curriculumTimeline,
  CurriculumRegressionTestFixture,
} from './curriculum-regression-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function renderTimeline() {
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  const store = configureStore({
    reducer: {
      globalState: globalStateReducer,
      confirmPopup: confirmPopupReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CurriculumRegressionTestFixture />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

describe('Daily Timeline numeric API data and request failures', () => {
  it('opens lesson details from the numeric Approved API enum without fetching again', async () => {
    let requestCount = 0;
    mswServer.use(
      http.get('*/api/academic/curriculum/lesson-plans/timeline', () => {
        requestCount += 1;
        return HttpResponse.json(curriculumTimeline);
      })
    );
    renderTimeline();

    fireEvent.click(await screen.findByRole('button', { name: 'View' }));

    expect(screen.getByRole('heading', { name: 'Lesson & Diary Details' })).toBeVisible();
    expect(screen.getAllByText('Approved').at(-1)).toBeVisible();
    expect(screen.getByRole('group', { name: 'Learning Objective' })).toHaveTextContent(
      'Explain the origins of nationalism'
    );
    expect(screen.getByRole('group', { name: 'Resources Required' })).toHaveTextContent(
      'Textbook and map'
    );
    expect(requestCount).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Close lesson and diary details' }));
    expect(screen.getByRole('button', { name: 'View' })).toBeVisible();
  });

  it.each([404, 500])(
    'keeps the timeline mounted after %s and retries successfully',
    async (status) => {
      let fail = true;
      mswServer.use(
        http.get('*/api/academic/curriculum/lesson-plans/timeline', () =>
          fail
            ? HttpResponse.json({ message: 'Request failed' }, { status })
            : HttpResponse.json(curriculumTimeline)
        )
      );
      renderTimeline();

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Failed to load lesson details. Please try again.'
      );
      expect(screen.getByRole('button', { name: 'Today' })).toBeVisible();
      expect(screen.queryByText('No Lessons Scheduled for Today')).not.toBeInTheDocument();

      fail = false;
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(await screen.findByRole('button', { name: 'View' })).toBeVisible();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
  );
});
