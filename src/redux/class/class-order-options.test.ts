import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { boardApi } from 'src/redux/board/boardApi';
import { divisionApi } from 'src/redux/division/divisionApi';
import { userScopeApi } from 'src/redux/userScope/userScopeApi';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { organizationApi } from 'src/redux/oraganization/oraganization';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { financeFeeStructureApi } from 'src/redux/finance/financeFeeStructure';
import { studentRecordsApi } from 'src/redux/student/records/student-records-api';
import { studentOnboardingApi } from 'src/redux/student/onboarding/student-onboarding-api';
import { studentRecordTransitionsApi } from 'src/redux/student/records/student-record-transitions-api';

import { classApi } from './classApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const createStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof createStore>;
beforeEach(() => {
  store = createStore();
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('academic option cache refresh', () => {
  it.each([
    ['stage', 204],
    ['stage', 400],
    ['class', 204],
    ['class', 400],
    ['division', 204],
    ['division', 400],
  ] as const)(
    'reloads all academic selection options after a %s reorder returns %s',
    async (kind, status) => {
      const counts: Record<string, number> = {};
      const paths = [
        '/app/education-board',
        '/student/onboarding/filter-options',
        '/student/onboarding/case/placement-options',
        '/students/records/directory/options',
        '/students/records/transitions/options',
        '/app/user-scope/user-scope-hierarchy',
        '/fee-structures-metadata',
      ];
      mswServer.use(
        ...paths.map((path) =>
          http.get(`*/api${path}`, () => {
            counts[path] = (counts[path] ?? 0) + 1;
            return HttpResponse.json({ items: counts[path] > 1 ? [{ id: 'fresh-sibling' }] : [] });
          })
        )
      );
      mswServer.use(http.put('*/api/*/order', () => new HttpResponse(null, { status })));
      const queries = [
        store.dispatch(boardApi.endpoints.getBoards.initiate(undefined)),
        store.dispatch(
          studentOnboardingApi.endpoints.getStudentOnboardingFilterOptions.initiate('year')
        ),
        store.dispatch(
          studentOnboardingApi.endpoints.getStudentOnboardingPlacementOptions.initiate('case')
        ),
        store.dispatch(studentRecordsApi.endpoints.getStudentRecordsDirectoryOptions.initiate({})),
        store.dispatch(
          studentRecordTransitionsApi.endpoints.getStudentRecordTransitionOptions.initiate({})
        ),
        store.dispatch(userScopeApi.endpoints.getUserScopeHierarchy.initiate({ userId: 'user' })),
        store.dispatch(financeFeeStructureApi.endpoints.getFeeStructures.initiate({})),
      ];
      await Promise.all(queries.map((query) => query.unwrap()));
      const mutation =
        kind === 'stage'
          ? store.dispatch(
              organizationApi.endpoints.reorderStages.initiate({ mediumId: 'medium', ids: ['old'] })
            )
          : kind === 'class'
            ? store.dispatch(
                classApi.endpoints.reorderClasses.initiate({ stageId: 'stage', ids: ['old'] })
              )
            : store.dispatch(
                divisionApi.endpoints.reorderDivisions.initiate({
                  standardId: 'standard',
                  ids: ['old'],
                })
              );
      if (status === 204) await mutation.unwrap();
      else await expect(mutation.unwrap()).rejects.toMatchObject({ status: 400 });
      await waitFor(() => paths.forEach((path) => expect(counts[path]).toBe(2)), {
        timeout: 10000,
      });
      await waitFor(
        () =>
          expect(
            boardApi.endpoints.getBoards.select(undefined)(store.getState()).data?.items
          ).toEqual([{ id: 'fresh-sibling' }]),
        { timeout: 10000 }
      );
      queries.forEach((query) => query.unsubscribe());
    }
  );
});
