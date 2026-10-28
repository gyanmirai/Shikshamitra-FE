import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { academicDashboardApi as api } from './academicDashboardApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
  process.env.NEXT_PUBLIC_USE_ACADEMIC_DASHBOARD_MOCKS = 'false';
});

const payloads = {
  curriculum: {
    curriculumCompletion: 0,
    totalStudents: 0,
    totalTeachers: 0,
    assignedSubjects: 0,
    electiveGroups: 0,
    pendingElectiveGroups: 0,
    insights: [],
    configurationStatus: [],
  },
  timetable: {
    timetableRate: 0,
    activeTimetables: 0,
    pendingTimetables: 0,
    conflictsCount: 0,
    insights: [],
    configurationStatus: [],
    operationalStatus: [],
  },
  assessment: {
    readinessRate: 0,
    pendingGradeEntries: 0,
    pendingEvaluations: 0,
    upcomingExams: 0,
    insights: [],
    operationalStatus: [],
  },
};
const sections = ['curriculum', 'timetable', 'assessment'] as const;
const createStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof createStore>;
const requestSection = {
  curriculum: () =>
    store.dispatch(api.endpoints.getAdminAcademicDashboardCurriculum.initiate()).unwrap(),
  timetable: () =>
    store.dispatch(api.endpoints.getAdminAcademicDashboardTimetable.initiate()).unwrap(),
  assessment: () =>
    store.dispatch(api.endpoints.getAdminAcademicDashboardAssessment.initiate()).unwrap(),
};
beforeEach(() => {
  store = createStore();
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('Academic dashboard section response contracts', () => {
  it.each(sections)('rejects a paginated list returned instead of %s metrics', async (section) => {
    mswServer.use(
      http.get(`*/api/academic/dashboard/admin/${section}`, () =>
        HttpResponse.json({ items: [], totalCount: 0 })
      )
    );
    await expect(requestSection[section]()).rejects.toMatchObject({ status: 'CUSTOM_ERROR' });
  });

  it.each(sections)('preserves legitimate zero values in the %s section', async (section) => {
    mswServer.use(
      http.get(`*/api/academic/dashboard/admin/${section}`, () =>
        HttpResponse.json(payloads[section])
      )
    );
    await expect(requestSection[section]()).resolves.toEqual(payloads[section]);
  });

  it.each([null, '80'])(
    'rejects an invalid readiness rate (%s) without fabricating zero',
    async (readinessRate) => {
      mswServer.use(
        http.get('*/api/academic/dashboard/admin/assessment', () =>
          HttpResponse.json({ ...payloads.assessment, readinessRate })
        )
      );
      await expect(
        store.dispatch(api.endpoints.getAdminAcademicDashboardAssessment.initiate()).unwrap()
      ).rejects.toMatchObject({ status: 'CUSTOM_ERROR' });
      expect(
        api.endpoints.getAdminAcademicDashboardAssessment.select()(store.getState()).data
      ).toBeUndefined();
    }
  );

  it('keeps an ordinary backend failure as an error', async () => {
    mswServer.use(
      http.get('*/api/academic/dashboard/admin/timetable', () =>
        HttpResponse.json({}, { status: 503 })
      )
    );
    await expect(
      store.dispatch(api.endpoints.getAdminAcademicDashboardTimetable.initiate()).unwrap()
    ).rejects.toMatchObject({ status: 503 });
  });
});
