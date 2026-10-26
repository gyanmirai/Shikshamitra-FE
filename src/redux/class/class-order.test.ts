import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { boardApi } from 'src/redux/board/boardApi';
import { divisionApi } from 'src/redux/division/divisionApi';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { organizationApi } from 'src/redux/oraganization/oraganization';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { memberManagementApi } from 'src/redux/memberManagement/memberManagementApi';

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

describe('academic order API cache behavior', () => {
  it('uses the backend class order without an alphabetical override', async () => {
    let search = '';
    mswServer.use(
      http.get('*/api/app/standard', ({ request }) => {
        ({ search } = new URL(request.url));
        return HttpResponse.json({ items: [{ id: 'ukg' }, { id: 'nursery' }] });
      })
    );
    const query = store.dispatch(classApi.endpoints.getClass.initiate(undefined));
    expect(await query.unwrap()).toEqual({ items: [{ id: 'ukg' }, { id: 'nursery' }] });
    expect(search).toBe('');
    query.unsubscribe();
  });

  it.each(['stage', 'class', 'division'] as const)(
    'refreshes hierarchy and active selection lists after saving %s order',
    async (kind) => {
      const requests: Record<string, number> = {};
      const paths = [
        '/app/education-board',
        '/app/education-medium-stage',
        '/app/standard',
        '/app/division',
        '/classOptions',
        '/divisionOptions',
      ];
      mswServer.use(
        ...paths.map((path) =>
          http.get(`*/api${path}`, () => {
            requests[path] = (requests[path] ?? 0) + 1;
            return HttpResponse.json({ items: [] });
          })
        )
      );
      mswServer.use(http.put('*/api/*/order', () => new HttpResponse(null, { status: 204 })));
      const subscriptions = [
        store.dispatch(boardApi.endpoints.getBoards.initiate(undefined)),
        store.dispatch(organizationApi.endpoints.getOrganization.initiate(undefined)),
        store.dispatch(classApi.endpoints.getClass.initiate(undefined)),
        store.dispatch(divisionApi.endpoints.getDivision.initiate(undefined)),
        store.dispatch(memberManagementApi.endpoints.getClassOptions.initiate(undefined)),
        store.dispatch(memberManagementApi.endpoints.getDivisionOptions.initiate(undefined)),
      ];
      await Promise.all(subscriptions.map((query) => query.unwrap()));
      if (kind === 'stage')
        await store
          .dispatch(
            organizationApi.endpoints.reorderStages.initiate({
              mediumId: 'medium',
              ids: ['b', 'a'],
            })
          )
          .unwrap();
      else if (kind === 'class')
        await store
          .dispatch(
            classApi.endpoints.reorderClasses.initiate({ stageId: 'stage', ids: ['b', 'a'] })
          )
          .unwrap();
      else
        await store
          .dispatch(
            divisionApi.endpoints.reorderDivisions.initiate({
              standardId: 'standard',
              ids: ['b', 'a'],
            })
          )
          .unwrap();
      await waitFor(() => paths.forEach((path) => expect(requests[path]).toBe(2)), {
        timeout: 10000,
      });
      subscriptions.forEach((query) => query.unsubscribe());
    }
  );
});
