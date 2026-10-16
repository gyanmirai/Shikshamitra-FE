import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import { academicDashboardApi } from './academicDashboardApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: vi.fn().mockResolvedValue(null),
  clearCachedAuthSession: vi.fn(),
  getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));

const createDashboardStore = () =>
  configureStore({
    reducer: { [academicDashboardApi.reducerPath]: academicDashboardApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(academicDashboardApi.middleware),
  });

describe('academic dashboard endpoint compatibility', () => {
  it('requests each supported role section independently', async () => {
    const requests: string[] = [];
    mswServer.use(
      http.get('*/api/academic/dashboard/:role/:section', ({ params }) => {
        requests.push(`${params.role}/${params.section}`);
        return HttpResponse.json({ assignedClassesCount: 2, totalStudents: 270 });
      })
    );

    const store = createDashboardStore();
    const queries = [
      store.dispatch(
        academicDashboardApi.endpoints.getPrincipalAcademicDashboardPerformance.initiate()
      ),
      store.dispatch(
        academicDashboardApi.endpoints.getPrincipalAcademicDashboardCurriculum.initiate()
      ),
      store.dispatch(
        academicDashboardApi.endpoints.getPrincipalAcademicDashboardOperations.initiate()
      ),
      store.dispatch(
        academicDashboardApi.endpoints.getTeacherAcademicDashboardAssignments.initiate()
      ),
      store.dispatch(
        academicDashboardApi.endpoints.getTeacherAcademicDashboardAssessment.initiate()
      ),
      store.dispatch(
        academicDashboardApi.endpoints.getTeacherAcademicDashboardAttention.initiate()
      ),
    ];
    await Promise.all(queries.map((query) => query.unwrap()));

    expect(requests.sort()).toEqual([
      'principal/curriculum',
      'principal/operations',
      'principal/performance',
      'teacher/assessment',
      'teacher/assignments',
      'teacher/attention',
    ]);
    queries.forEach((query) => query.unsubscribe());
  });

  it('loads teacher overview and deferred charts from the legacy endpoint when split routes return 404', async () => {
    let legacyRequests = 0;
    const legacyData = {
      assignedClassesCount: 2,
      performanceDistribution: { excellent: 1, good: 2, average: 0, needsImprovement: 0 },
      chapterProgressChart: { standardNames: ['Math'], completionPercentages: [80] },
    };
    mswServer.use(
      http.get(
        '*/api/academic/dashboard/teacher/overview',
        () => new HttpResponse(null, { status: 404 })
      ),
      http.get(
        '*/api/academic/dashboard/teacher/analytics',
        () => new HttpResponse(null, { status: 404 })
      ),
      http.get('*/api/academic/dashboard/teacher', () => {
        legacyRequests += 1;
        return HttpResponse.json(legacyData);
      })
    );

    const store = createDashboardStore();
    const overview = store.dispatch(
      academicDashboardApi.endpoints.getTeacherAcademicDashboardOverview.initiate()
    );
    const analytics = store.dispatch(
      academicDashboardApi.endpoints.getTeacherAcademicDashboardAnalytics.initiate()
    );

    expect((await overview.unwrap()).assignedClassesCount).toBe(2);
    expect((await analytics.unwrap()).chapterProgressChart.standardNames).toEqual(['Math']);
    expect(legacyRequests).toBe(2);
    overview.unsubscribe();
    analytics.unsubscribe();
  });

  it('uses the split principal endpoint when the updated backend supports it', async () => {
    let legacyRequests = 0;
    mswServer.use(
      http.get('*/api/academic/dashboard/principal/overview', () =>
        HttpResponse.json({ totalStudents: 270 })
      ),
      http.get('*/api/academic/dashboard/principal', () => {
        legacyRequests += 1;
        return HttpResponse.json({ totalStudents: 1 });
      })
    );

    const store = createDashboardStore();
    const overview = store.dispatch(
      academicDashboardApi.endpoints.getPrincipalAcademicDashboardOverview.initiate()
    );

    expect((await overview.unwrap()).totalStudents).toBe(270);
    expect(legacyRequests).toBe(0);
    overview.unsubscribe();
  });

  it('loads principal details from the legacy route when its split route returns 404', async () => {
    let legacyRequests = 0;
    mswServer.use(
      http.get(
        '*/api/academic/dashboard/principal/analytics',
        () => new HttpResponse(null, { status: 404 })
      ),
      http.get('*/api/academic/dashboard/principal', () => {
        legacyRequests += 1;
        return HttpResponse.json({
          chapterCompletionChart: { standardNames: ['Class 10'], completionPercentages: [75] },
        });
      })
    );

    const store = createDashboardStore();
    const analytics = store.dispatch(
      academicDashboardApi.endpoints.getPrincipalAcademicDashboardAnalytics.initiate()
    );

    expect((await analytics.unwrap()).chapterCompletionChart.standardNames).toEqual(['Class 10']);
    expect(legacyRequests).toBe(1);
    analytics.unsubscribe();
  });

  it('does not retry the legacy route when the teacher endpoint denies access', async () => {
    let legacyRequests = 0;
    mswServer.use(
      http.get(
        '*/api/academic/dashboard/teacher/overview',
        () => new HttpResponse(null, { status: 403 })
      ),
      http.get('*/api/academic/dashboard/teacher', () => {
        legacyRequests += 1;
        return HttpResponse.json({ assignedClassesCount: 2 });
      })
    );

    const store = createDashboardStore();
    const overview = store.dispatch(
      academicDashboardApi.endpoints.getTeacherAcademicDashboardOverview.initiate()
    );

    await expect(overview.unwrap()).rejects.toMatchObject({ status: 403 });
    expect(legacyRequests).toBe(0);
    overview.unsubscribe();
  });
});
