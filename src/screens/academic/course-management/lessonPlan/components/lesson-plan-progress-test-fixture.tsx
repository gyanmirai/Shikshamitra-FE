import type { ComponentProps } from 'react';

import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { loadIcons, _api as iconifyApi } from '@iconify/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import globalStateReducer from 'src/redux/globalState/globalSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import AddLessonPlanModal from './AddLessonPlanModal';

export const progressUrl = '*/api/academic/curriculum/lesson-plans/chapter-progress';
export const progressContext = {
  academicYearId: 'year-2026',
  standardId: 'class-12',
  divisionId: 'division-b',
  subjectId: 'mathematics',
  chapterId: 'chapter-one',
};
export const prefill = {
  ...progressContext,
  teacherId: 'teacher-one',
  teacherName: 'Teacher',
  className: 'Class 12',
  divisionName: 'B',
  subjectName: 'Core Mathematics',
  timetableSlotId: 'period-4',
  period: 'Period 4',
  chapterName: 'Core Maths ONE',
  topic: 'Topic two',
  plannedDate: dayjs('2026-09-09'),
};

export async function prepareProgressNetwork() {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academic/curriculum/chapters', () =>
      HttpResponse.json([
        { id: 'chapter-one', chapterName: 'Core Maths ONE' },
        { id: 'chapter-two', chapterName: 'Core Maths TWO' },
      ])
    ),
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
  await new Promise<void>((resolve) => {
    loadIcons(
      [
        'lucide:info',
        'mdi:information-outline',
        'mdi:close',
        'mdi:content-save-outline',
        'material-symbols-light:save',
        'solar:calendar-date-bold-duotone',
        'solar:notebook-bold-duotone',
        'solar:presentation-graph-bold-duotone',
      ],
      (_loaded, _missing, pending) => {
        if (!pending.length) resolve();
      }
    );
  });
}

export function renderProgressModal(
  props: Partial<ComponentProps<typeof AddLessonPlanModal>> = {}
) {
  const store = configureStore({
    reducer: {
      globalState: globalStateReducer,
      confirmPopup: confirmPopupReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AddLessonPlanModal
            open
            academicYearId={progressContext.academicYearId}
            currentTeacher={{ value: prefill.teacherId, label: prefill.teacherName }}
            timelinePrefill={prefill}
            lessonPlans={[]}
            onSave={() => {}}
            onClose={() => {}}
            {...props}
          />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
  return { ...view, store };
}
