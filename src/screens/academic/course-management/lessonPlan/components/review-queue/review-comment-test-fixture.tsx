import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { GlobalIcons } from 'src/utils/icons';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { loadIcons, _api as iconifyApi } from '@iconify/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  useGetLessonPlansQuery,
  useRejectLessonPlanMutation,
  useApproveLessonPlanMutation,
  useRequestPlanChangesMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import { ReviewQueueTab } from '../ReviewQueueTab';

import type { LessonPlanRow } from '../../lessonPlanData';

export const reviewPlan: LessonPlanRow = {
  id: 'review-plan',
  academicYear: '2026-27',
  teacherId: 'teacher-one',
  teacherName: 'Review teacher',
  classId: 'class-one',
  className: '7',
  divisionId: 'division-a',
  divisionName: 'A',
  subjectId: 'maths',
  subjectName: 'Mathematics',
  chapterId: 'fractions',
  chapterName: 'Fractions',
  plannedDate: '2026-09-16',
  periodId: 'period-2',
  period: 'Period 2',
  plannedTime: '10:00-10:45',
  topic: 'Adding fractions',
  learningObjective: 'Add fractions using LCM',
  teachingMethod: 'ExplanationBoardWork',
  plannedCompletionPercentage: 40,
  resourcesRequired: '',
  planStatus: 'Submitted',
  diaryStatus: 'NotSubmitted',
  approvalStatus: 'Pending',
  actualCompletionPercentage: 0,
  existingChapterProgress: 0,
  source: 'Manual',
  isAiGenerated: false,
  executionStatus: 'OnTrack',
  status: 'Submitted',
  reviewStatus: 'Pending',
};
export const plansUrl = '*/api/academic/curriculum/lesson-plans';
export const reviewUrl = `${plansUrl}/${reviewPlan.id}`;

export async function prepareReviewNetwork() {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(plansUrl, () => HttpResponse.json({ items: [reviewPlan] })),
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
        GlobalIcons.cancel,
        GlobalIcons.submit,
        GlobalIcons.info,
        'mdi:check',
        'mdi:close',
        'mdi:swap-horizontal',
        'mdi:information-outline',
        'solar:widget-5-bold-duotone',
        'solar:list-bold-duotone',
        'solar:magnifer-linear',
        'solar:users-group-two-rounded-bold-duotone',
        'solar:notebook-bold-duotone',
        'solar:calendar-bold-duotone',
        'solar:clock-circle-bold-duotone',
        'solar:check-circle-bold-duotone',
        'solar:close-circle-bold-duotone',
        'solar:alt-arrow-right-bold-duotone',
      ],
      (_loaded, _missing, pending) => {
        if (!pending.length) resolve();
      }
    );
  });
}

function ReviewQueueWithApi() {
  const { data, isLoading } = useGetLessonPlansQuery({});
  const [approve, approval] = useApproveLessonPlanMutation();
  const [reject, rejection] = useRejectLessonPlanMutation();
  const [requestChanges, request] = useRequestPlanChangesMutation();
  return (
    <ReviewQueueTab
      lessonPlans={data?.items ?? []}
      canReviewSubmissions
      isLoading={isLoading}
      isApproving={approval.isLoading}
      isRejecting={rejection.isLoading}
      isRequesting={request.isLoading}
      onApprove={async (target, comment) => {
        await approve({ id: target.id, body: { comment } }).unwrap();
        return true;
      }}
      onReject={async (target, comment) => {
        await reject({ id: target.id, body: { comment } }).unwrap();
        return true;
      }}
      onRequestChanges={async (target, comment) => {
        await requestChanges({ id: target.id, body: { comment } }).unwrap();
        return true;
      }}
    />
  );
}

export function renderReviewQueue() {
  const store = configureStore({
    reducer: { confirmPopup: confirmPopupReducer, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ReviewQueueWithApi />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}
