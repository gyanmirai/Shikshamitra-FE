import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { _api as iconifyApi } from '@iconify/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { academicPermissions } from 'src/constants/academic-menu';
import globalStateReducer from 'src/redux/globalState/globalSlice';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import authReducer, { setPermissions } from 'src/redux/auth/authSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';

import ScheduledExamTable from './scheduleExamTable';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

describe('exam list and preview date range', () => {
  it.each([
    ['2026-09-08T18:40:00+00:00', '08-09-2026'],
    ['2026-09-10T18:40:00+00:00', '08-09-2026 - 10-09-2026'],
  ])(
    'preserves calendar dates in both views when the final slot ends at %s',
    async (endDate, label) => {
      const subjects = [
        {
          subjectId: 'english',
          subjectName: 'English',
          examDate: '2026-09-08T00:00:00+00:00',
          startTime: '2026-09-08T18:00:00+00:00',
          endTime: '2026-09-08T18:40:00+00:00',
        },
      ];
      if (endDate.startsWith('2026-09-10')) {
        subjects.push({
          subjectId: 'maths',
          subjectName: 'Maths',
          examDate: '2026-09-10T00:00:00+00:00',
          startTime: '2026-09-10T18:00:00+00:00',
          endTime: endDate,
        });
      }
      const exam = {
        examId: 'date-range-exam',
        examName: '11th ENG exam _9',
        examTypeName: 'Final Exam',
        standardName: 'Class 11',
        divisions: ['A', 'B'],
        status: examScheduledStatus.Pending,
        subjectCount: subjects.length,
        startDate: '2026-09-08T00:00:00+00:00',
        endDate,
      };
      // Iconify captures fetch at import time; use the MSW-intercepted fetch so
      // these component tests never depend on its external icon CDN.
      iconifyApi.setFetch((...args) => fetch(...args));
      mswServer.use(
        http.get('https://api.iconify.design/:collection', ({ request, params }) =>
          HttpResponse.json({
            prefix: String(params.collection).replace('.json', ''),
            icons: {},
            not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
          })
        ),
        http.get('*/api/auth/session', () => HttpResponse.json(null)),
        http.get('*/api/academics/exams/date-range-exam/basic-details', () =>
          HttpResponse.json({ id: exam.examId, examName: exam.examName, divisionIds: ['A', 'B'] })
        ),
        http.get('*/api/academics/exams/date-range-exam/schedule', () =>
          HttpResponse.json({ subjects })
        ),
        http.get('*/api/academics/exams/date-range-exam/subjects', () =>
          HttpResponse.json(subjects)
        ),
        http.get('*/api/academics/exams/date-range-exam/rooms', () =>
          HttpResponse.json({ isRoomAssigned: false, subjects: [] })
        )
      );
      const store = configureStore({
        reducer: {
          auth: authReducer,
          globalState: globalStateReducer,
          confirmPopup: confirmPopupReducer,
          [api.reducerPath]: api.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
      });
      store.dispatch(
        setPermissions([
          { name: `${academicPermissions.examination.schedule}.View`, isGranted: true },
        ])
      );
      const { unmount } = render(
        <Provider store={store}>
          <ThemeProvider theme={createTheme(defaultSettings)}>
            <ScheduledExamTable
              getExams={{
                data: { items: [exam], totalCount: 1, pendingCount: 1 },
                isLoading: false,
              }}
              onDelete={vi.fn()}
              onViewTimetable={vi.fn()}
            />
          </ThemeProvider>
        </Provider>
      );

      const row = screen.getByRole('row', { name: /11th ENG exam _9/ });
      expect(within(row).getByText(label, { exact: true })).toBeVisible();
      fireEvent.click(within(row).getByRole('button', { name: 'View' }));

      const heading = await screen.findByRole('heading', { name: exam.examName });
      const header = heading.closest('header');
      expect(header).not.toBeNull();
      expect(within(header!).getByText(label, { exact: true })).toBeVisible();
      await screen.findByText('English', { exact: true });
      expect(screen.getAllByText('06:00 PM – 06:40 PM')).toHaveLength(subjects.length);
      expect(screen.getAllByText('40 min')).toHaveLength(subjects.length);
      expect(within(header!).getByText(label, { exact: true })).toBeVisible();
      unmount();
      store.dispatch(api.util.resetApiState());
    }
  );
});
