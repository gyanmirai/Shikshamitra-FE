import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';
import { lectureSlotsApi as api } from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

import { useWeeklyLectureForm } from './useWeeklyLectureForm';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  getAuthSessionCacheRevision: () => 1,
  isAuthSessionCacheCurrent: () => true,
}));

const endpoint = 'http://localhost:5000/api';
const medium = {
  id: 'medium-gseb-english-2026',
  educationMediumStages: [
    {
      standards: [
        { id: 'std-4', name: 'Std 4' },
        { id: 'std-5', name: 'Std 5' },
      ],
    },
  ],
};
const stores: Array<ReturnType<typeof createStore>> = [];
function createStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: (state: { currentMedium: typeof medium | null } | undefined, action) =>
        action.type === 'test/setMedium'
          ? { currentMedium: action.payload as typeof medium | null }
          : (state ?? { currentMedium: medium }),
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
}
function setup() {
  const store = createStore();
  stores.push(store);
  mswServer.use(
    http.get(`${endpoint}/academics/timetable/settings/lecture-slots`, ({ request }) => {
      expect(new URL(request.url).searchParams.get('AcademicMediumId')).toBe(medium.id);
      return HttpResponse.json({
        totalCount: 1,
        items: [{ id: 'slots-4', standardId: 'std-4', weeklyTeachingCapacity: 39 }],
      });
    }),
    http.get(`${endpoint}/academics/curriculum/:standardId/subject-assignments`, ({ params }) =>
      HttpResponse.json({
        data: {
          totalCount: 1,
          items: [
            {
              id: `assignment-${params.standardId}`,
              status: 1,
              subjectType: 0,
              color: '',
              subjects: [{ subjectId: `math-${params.standardId}`, subjectName: 'Mathematics' }],
            },
          ],
        },
      })
    )
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, wrapper };
}
afterEach(async () => {
  cleanup();
  await act(async () => {
    await Promise.all(stores.flatMap((store) => store.dispatch(api.util.getRunningQueriesThunk())));
    stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  });
});

it('detects saved slots for the dropdown selection without an initial class prop', async () => {
  const { wrapper } = setup();
  const { result } = renderHook(
    () => useWeeklyLectureForm({ editData: null, tableData: [], onClose: vi.fn() }),
    { wrapper }
  );
  await waitFor(() => expect(result.current.formik.values.subjects).toHaveLength(1));
  expect(result.current.formik.values.classId).toBe('std-4');
  expect(result.current.hasSlots).toBe(true);
  expect(result.current.availableCapacity).toBe(39);
  await act(async () => {
    await result.current.formik.setFieldValue('classId', 'std-5');
  });
  await waitFor(() =>
    expect(result.current.formik.values.subjects[0]?.subjectId).toBe('math-std-5')
  );
  expect(result.current.hasSlots).toBe(false);
  expect(result.current.availableCapacity).toBe(0);
  await act(async () => {
    await result.current.formik.setFieldValue('classId', 'std-4');
  });
  await waitFor(() =>
    expect(result.current.formik.values.subjects[0]?.subjectId).toBe('math-std-4')
  );
  expect(result.current.hasSlots).toBe(true);
});

it('refreshes capacity after a slot save without resetting entered lecture targets', async () => {
  const { store, wrapper } = setup();
  const { result } = renderHook(() => useWeeklyLectureForm({ editData: null, tableData: [] }), {
    wrapper,
  });
  await waitFor(() => expect(result.current.formik.values.subjects).toHaveLength(1));
  await act(async () => {
    await result.current.formik.setFieldValue('subjects[0].noOfLecture', '5');
  });
  mswServer.use(
    http.get(`${endpoint}/academics/timetable/settings/lecture-slots`, () =>
      HttpResponse.json({
        totalCount: 1,
        items: [{ id: 'slots-4', standardId: 'std-4', weeklyTeachingCapacity: 42 }],
      })
    )
  );
  await act(async () => {
    store.dispatch(api.util.invalidateTags(['LectureSlot']));
  });
  await waitFor(() => expect(result.current.availableCapacity).toBe(42));
  expect(result.current.formik.values.subjects[0].noOfLecture).toBe('5');
});

it('reports subject request failures separately and recovers on retry', async () => {
  const { wrapper } = setup();
  let fail = true;
  mswServer.use(
    http.get(`${endpoint}/academics/curriculum/:standardId/subject-assignments`, () =>
      fail
        ? HttpResponse.json({ title: 'Assignments unavailable' }, { status: 503 })
        : HttpResponse.json({ data: { totalCount: 0, items: [] } })
    )
  );
  const { result } = renderHook(() => useWeeklyLectureForm({ editData: null, tableData: [] }), {
    wrapper,
  });
  await waitFor(() => expect(result.current.subjectsError).toBe(true));
  expect(result.current.hasSlots).toBe(true);
  expect(result.current.formik.values.subjects).toEqual([]);
  fail = false;
  await act(async () => {
    await result.current.refetchSubjects();
  });
  await waitFor(() => expect(result.current.subjectsError).toBe(false));
  expect(result.current.formik.values.subjects).toEqual([]);
  expect(result.current.classContext).toBe('Std 4');
});

it('loads classes when the academic context arrives after the dialog opens', async () => {
  const { store, wrapper } = setup();
  store.dispatch({ type: 'test/setMedium', payload: null });
  const { result } = renderHook(() => useWeeklyLectureForm({ editData: null, tableData: [] }), {
    wrapper,
  });
  expect(result.current.allClass).toEqual([]);
  await act(async () => {
    store.dispatch({ type: 'test/setMedium', payload: medium });
  });
  await waitFor(() => expect(result.current.formik.values.classId).toBe('std-4'));
  await waitFor(() => expect(result.current.formik.values.subjects).toHaveLength(1));
  expect(result.current.hasSlots).toBe(true);
});

it('loads saved targets without depending on the create-only subject assignment request', async () => {
  const { wrapper } = setup();
  let assignmentRequests = 0;
  mswServer.use(
    http.get(`${endpoint}/academics/timetable/settings/weekly-lecture-slots/weekly-4`, () =>
      HttpResponse.json({
        id: 'weekly-4',
        standardId: 'std-4',
        standardName: 'Std 4',
        subjects: [{ subjectId: 'math-std-4', subjectName: 'Mathematics', weeklyLectures: 5 }],
      })
    ),
    http.get(`${endpoint}/academics/curriculum/:standardId/subject-assignments`, () => {
      assignmentRequests += 1;
      return HttpResponse.json({ title: 'Unavailable' }, { status: 503 });
    })
  );
  const editData = {
    id: 'weekly-4',
    standardId: 'std-4',
    classId: 'std-4',
    className: 'Std 4',
    subjects: [],
    totalLectures: 5,
  };
  const { result } = renderHook(() => useWeeklyLectureForm({ editData, tableData: [] }), {
    wrapper,
  });
  await waitFor(() => expect(result.current.formik.values.subjects[0]?.noOfLecture).toBe(5));
  await waitFor(() => expect(result.current.isSubjectsLoading).toBe(false));
  expect(assignmentRequests).toBe(0);
  expect(result.current.subjectsError).toBe(false);
});
