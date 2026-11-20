import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://finance-fixture.test');
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic' }),
  clearCachedAuthSession: vi.fn(),
  isAuthSessionCacheCurrent: () => true,
  getAuthSessionCacheRevision: () => 0,
}));

describe('assignment dependency cache refresh', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refreshes a previously loaded fee head after assigning it to a student', async () => {
    let assigned = false;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        const isAssignment = request.url.endsWith('/student-fee-structure/assign');
        if (isAssignment) assigned = true;
        return new Response(
          JSON.stringify(
            isAssignment
              ? { assignment: {}, concurrencyStamp: 'assigned' }
              : {
                  id: 'head',
                  name: 'FH3',
                  dependencies: { studentCount: assigned ? 1 : 0, isBlocked: assigned },
                }
          ),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    const { api } = await import('src/redux/service');
    const { FeeHeadManagementApi } = await import('src/redux/feeHeadManage/feeHeadManageApi');
    const { studentFeeAssignmentApi } = await import('./studentFeeAssignment');
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (getDefault) => getDefault().concat(api.middleware),
    });
    const subscription = store.dispatch(
      FeeHeadManagementApi.endpoints.getFeeHeadById.initiate('head')
    );
    try {
      const initial = await subscription.unwrap();
      expect(initial.dependencies?.studentCount).toBe(0);
      await store
        .dispatch(
          studentFeeAssignmentApi.endpoints.assignmentCommit.initiate({
            studentId: 'student',
            academicYearId: 'year',
            standardFeeStructureId: 'structure',
            selectedOptionalFeeHeadIds: [],
            servicePeriods: [],
            feeHeadDetails: [],
          })
        )
        .unwrap();
      await waitFor(() =>
        expect(
          FeeHeadManagementApi.endpoints.getFeeHeadById.select('head')(store.getState()).data
            ?.dependencies?.studentCount
        ).toBe(1)
      );
      expect(
        FeeHeadManagementApi.endpoints.getFeeHeadById.select('head')(store.getState()).data
          ?.dependencies?.isBlocked
      ).toBe(true);
    } finally {
      subscription.unsubscribe();
      store.dispatch(api.util.resetApiState());
    }
  });
});

it('refetches only affected student/year contexts after assignment and retains unrelated cached contexts', async () => {
  const calls: Record<string, number> = {};
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      if (request.url.endsWith('/contexts')) {
        const body = await request.json();
        const key = body.academicYearId + ':' + body.studentIds[0];
        calls[key] = (calls[key] ?? 0) + 1;
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({ assignmentId: 'saved', outcome: 'Assigned', assignment: {} }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    })
  );
  const { api } = await import('src/redux/service');
  const { studentFeeAssignmentApi } = await import('./studentFeeAssignment');
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const subscriptions = [
    { academicYearId: 'year', studentIds: ['changed'] },
    { academicYearId: 'year', studentIds: ['unrelated'] },
    { academicYearId: 'other-year', studentIds: ['changed'] },
  ].map((arg) =>
    store.dispatch(studentFeeAssignmentApi.endpoints.assignmentContexts.initiate(arg))
  );
  try {
    await Promise.all(subscriptions.map((s) => s.unwrap()));
    await store
      .dispatch(
        studentFeeAssignmentApi.endpoints.assignmentCommit.initiate({
          studentId: 'changed',
          academicYearId: 'year',
          standardFeeStructureId: 'structure',
          selectedOptionalFeeHeadIds: [],
          servicePeriods: [],
          feeHeadDetails: [],
        })
      )
      .unwrap();
    await waitFor(() => expect(calls['year:changed']).toBe(2));
    expect(calls['year:unrelated']).toBe(1);
    expect(calls['other-year:changed']).toBe(1);
  } finally {
    subscriptions.forEach((s) => s.unsubscribe());
    store.dispatch(api.util.resetApiState());
    vi.unstubAllGlobals();
  }
});
