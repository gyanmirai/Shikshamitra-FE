import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { studentType, studentOnboardingType } from 'src/redux/tagTypes';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { studentSetupApi as api } from './api';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
const createStore = () => configureStore({ reducer: { [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware) });
let store: ReturnType<typeof createStore>;
const scope = { tenantCacheKey: 'school-a', academicYearId: 'year-a', academicMediumId: 'medium-a', standardId: 'class-a' };
const state = { academicYearId: 'year-a', concurrencyStamp: 'v1', currentStageKey: 'welcome',
  currentSettingKey: null, deferredSettingKeys: [], reviewedAt: null, settings: [] };
const progress = { concurrencyStamp: 'v1', currentStageKey: 'admissions', currentSettingKey: 'admission-periods',
  deferredSettingKeys: ['admission-periods'], finishReview: false, academicMediumId: 'medium-a', standardId: 'class-a' };
beforeEach(() => {
  store = createStore(); clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => { store.dispatch(api.util.resetApiState()); clearCachedAuthSession(); });

describe('Student setup client persistence', () => {
  it.each([
    { type: studentType.student, id: 'HOUSE-MANAGEMENT' },
    { type: studentOnboardingType.onboardingSettings, id: 'SCOPES' },
    { type: studentType.student, id: 'RECORDS-SETTINGS-school' },
    { type: studentType.student, id: 'RECORDS-SETTINGS-year-a' },
  ])('refreshes setup checks after the owning setting invalidates $id', async (tag) => {
    let reads = 0;
    mswServer.use(http.get('*/api/student/setup/year-a', () => {
      reads += 1;
      return HttpResponse.json(state);
    }));
    const subscription = store.dispatch(api.endpoints.studentSetupState.initiate(scope));
    await subscription.unwrap();
    expect(reads).toBe(1);
    store.dispatch(api.util.invalidateTags([tag]));
    await waitFor(() => expect(reads).toBe(2));
    subscription.unsubscribe();
  });

  it('separates school caches and never sends cache identity in the URL', async () => {
    const urls: string[] = [];
    mswServer.use(http.get('*/api/student/setup/visit-status', ({ request }) => {
      urls.push(request.url);
      return HttpResponse.json({ hasVisitedConfiguration: urls.length === 1, canAccessSetup: true, firstVisitedAt: null });
    }));
    const a = await store.dispatch(api.endpoints.studentSetupVisitStatus.initiate('school-a')).unwrap();
    const b = await store.dispatch(api.endpoints.studentSetupVisitStatus.initiate('school-b')).unwrap();
    expect(a.hasVisitedConfiguration).toBe(true); expect(b.hasVisitedConfiguration).toBe(false);
    expect(urls).toHaveLength(2); expect(urls.every((url) => !url.includes('school-'))).toBe(true);
  });

  it('posts a visit explicitly and refreshes status after it succeeds', async () => {
    let visited = false; let reads = 0;
    mswServer.use(
      http.get('*/api/student/setup/visit-status', () => { reads += 1;
        return HttpResponse.json({ hasVisitedConfiguration: visited, canAccessSetup: true, firstVisitedAt: null }); }),
      http.post('*/api/student/setup/visit', async ({ request }) => {
        expect(await request.json()).toEqual({ settingKey: 'admission-periods' }); visited = true;
        return HttpResponse.json({ firstVisit: true, hasVisitedConfiguration: true, firstVisitedAt: '2026-10-28T00:00:00Z' });
      })
    );
    const subscription = store.dispatch(api.endpoints.studentSetupVisitStatus.initiate('school-a'));
    await subscription.unwrap(); expect(visited).toBe(false);
    await store.dispatch(api.endpoints.recordStudentSetupVisit.initiate({ settingKey: 'admission-periods' })).unwrap();
    await waitFor(() => expect(reads).toBe(2)); subscription.unsubscribe();
  });

  it('saves only guide metadata with its concurrency stamp and updates the active scoped cache', async () => {
    let submitted: unknown; let readUrl = '';
    mswServer.use(
      http.get('*/api/student/setup/year-a', ({ request }) => { readUrl = request.url; return HttpResponse.json(state); }),
      http.put('*/api/student/setup/year-a/progress', async ({ request }) => {
        submitted = await request.json(); return HttpResponse.json({ ...state, ...progress, concurrencyStamp: 'v2' });
      })
    );
    await store.dispatch(api.endpoints.studentSetupState.initiate(scope)).unwrap();
    await store.dispatch(api.endpoints.saveStudentSetupProgress.initiate({ scope, progress })).unwrap();
    expect(submitted).toEqual(progress); expect(readUrl).toContain('standardId=class-a');
    expect(readUrl).not.toContain('tenantCacheKey');
    await waitFor(() => expect(api.endpoints.studentSetupState.select(scope)(store.getState()).data?.concurrencyStamp).toBe('v2'));
  });

  it('keeps cached saved progress after a rejected stale write', async () => {
    mswServer.use(
      http.get('*/api/student/setup/year-a', () => HttpResponse.json(state)),
      http.put('*/api/student/setup/year-a/progress', () => HttpResponse.json({}, { status: 409 }))
    );
    await store.dispatch(api.endpoints.studentSetupState.initiate(scope)).unwrap();
    await expect(store.dispatch(api.endpoints.saveStudentSetupProgress.initiate({ scope, progress })).unwrap()).rejects.toMatchObject({ status: 409 });
    expect(api.endpoints.studentSetupState.select(scope)(store.getState()).data).toEqual(state);
  });
});

