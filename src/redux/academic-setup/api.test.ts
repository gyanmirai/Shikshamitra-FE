import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { academicSetupApi as api } from './api';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
const createStore = () => configureStore({ reducer: { [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware) });
let store: ReturnType<typeof createStore>;
const scope = { tenantCacheKey: 'school-a', academicYearId: 'year-a', academicMediumId: 'medium-a', standardId: 'class-a' };
const state = { academicYearId: 'year-a', concurrencyStamp: 'v1', currentStageKey: 'welcome',
  currentSettingKey: null, deferredSettingKeys: [], reviewedAt: null, settings: [] };
const progress = { concurrencyStamp: 'v1', currentStageKey: 'curriculum', currentSettingKey: 'subjects',
  deferredSettingKeys: ['subjects'], finishReview: false, academicMediumId: 'medium-a', standardId: 'class-a' };
beforeEach(() => {
  store = createStore(); clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => { store.dispatch(api.util.resetApiState()); clearCachedAuthSession(); });

describe('Academic setup client persistence', () => {
  it('separates school caches and never sends cache identity in the URL', async () => {
    const urls: string[] = [];
    mswServer.use(http.get('*/api/academics/setup/visit-status', ({ request }) => {
      urls.push(request.url);
      return HttpResponse.json({ hasVisitedConfiguration: urls.length === 1, canAccessSetup: true, firstVisitedAt: null });
    }));
    const a = await store.dispatch(api.endpoints.academicSetupVisitStatus.initiate('school-a')).unwrap();
    const b = await store.dispatch(api.endpoints.academicSetupVisitStatus.initiate('school-b')).unwrap();
    expect(a.hasVisitedConfiguration).toBe(true); expect(b.hasVisitedConfiguration).toBe(false);
    expect(urls).toHaveLength(2); expect(urls.every((url) => !url.includes('school-'))).toBe(true);
  });

  it('posts a visit explicitly and refreshes status after it succeeds', async () => {
    let visited = false; let reads = 0;
    mswServer.use(
      http.get('*/api/academics/setup/visit-status', () => { reads += 1;
        return HttpResponse.json({ hasVisitedConfiguration: visited, canAccessSetup: true, firstVisitedAt: null }); }),
      http.post('*/api/academics/setup/visit', async ({ request }) => {
        expect(await request.json()).toEqual({ settingKey: 'subjects' }); visited = true;
        return HttpResponse.json({ firstVisit: true, hasVisitedConfiguration: true, firstVisitedAt: '2026-10-28T00:00:00Z' });
      })
    );
    const subscription = store.dispatch(api.endpoints.academicSetupVisitStatus.initiate('school-a'));
    await subscription.unwrap(); expect(visited).toBe(false);
    await store.dispatch(api.endpoints.recordAcademicSetupVisit.initiate({ settingKey: 'subjects' })).unwrap();
    await waitFor(() => expect(reads).toBe(2)); subscription.unsubscribe();
  });

  it('saves only guide metadata with its concurrency stamp and updates the active scoped cache', async () => {
    let submitted: unknown; let readUrl = '';
    mswServer.use(
      http.get('*/api/academics/setup/year-a', ({ request }) => { readUrl = request.url; return HttpResponse.json(state); }),
      http.put('*/api/academics/setup/year-a/progress', async ({ request }) => {
        submitted = await request.json(); return HttpResponse.json({ ...state, ...progress, concurrencyStamp: 'v2' });
      })
    );
    await store.dispatch(api.endpoints.academicSetupState.initiate(scope)).unwrap();
    await store.dispatch(api.endpoints.saveAcademicSetupProgress.initiate({ scope, progress })).unwrap();
    expect(submitted).toEqual(progress); expect(readUrl).toContain('standardId=class-a');
    expect(readUrl).not.toContain('tenantCacheKey');
    await waitFor(() => expect(api.endpoints.academicSetupState.select(scope)(store.getState()).data?.concurrencyStamp).toBe('v2'));
  });

  it('keeps cached saved progress after a rejected stale write', async () => {
    mswServer.use(
      http.get('*/api/academics/setup/year-a', () => HttpResponse.json(state)),
      http.put('*/api/academics/setup/year-a/progress', () => HttpResponse.json({}, { status: 409 }))
    );
    await store.dispatch(api.endpoints.academicSetupState.initiate(scope)).unwrap();
    await expect(store.dispatch(api.endpoints.saveAcademicSetupProgress.initiate({ scope, progress })).unwrap()).rejects.toMatchObject({ status: 409 });
    expect(api.endpoints.academicSetupState.select(scope)(store.getState()).data).toEqual(state);
  });
});
