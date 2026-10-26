import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { tagTypes, academicCalendarType } from 'src/redux/tagTypes';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { academicFieldFormattingApi } from './academic-field-formatting-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const initial = { board: 0, medium: 0, stage: 0, standard: 0, division: 0 };
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

describe('academic field formatting API', () => {
  it('registers its cache tag without replacing existing academic settings tags', () => {
    expect(tagTypes).toContain('AcademicFieldFormatting');
    expect(tagTypes).toContain(academicCalendarType.settings);
  });
  it('uses school-scoped GET and PUT and refreshes subscribed settings after save', async () => {
    let reads = 0;
    let saved = initial;
    let submitted: unknown;
    mswServer.use(
      http.get('*/api/app/academic-field-formatting', ({ request }) => {
        reads += 1;
        expect(new URL(request.url).search).toBe('');
        return HttpResponse.json(saved);
      }),
      http.put('*/api/app/academic-field-formatting', async ({ request }) => {
        submitted = await request.json();
        saved = { ...initial, stage: 2 };
        return HttpResponse.json(saved);
      })
    );
    const subscription = store.dispatch(
      academicFieldFormattingApi.endpoints.getAcademicFieldFormatting.initiate()
    );
    expect(await subscription.unwrap()).toEqual(initial);
    const change = { ...initial, stage: 2 };
    expect(
      await store
        .dispatch(
          academicFieldFormattingApi.endpoints.updateAcademicFieldFormatting.initiate(change)
        )
        .unwrap()
    ).toEqual(change);
    expect(submitted).toEqual(change);
    await waitFor(() => expect(reads).toBe(2));
    subscription.unsubscribe();
  });

  it('preserves loaded settings when a save fails', async () => {
    mswServer.use(
      http.get('*/api/app/academic-field-formatting', () => HttpResponse.json(initial)),
      http.put('*/api/app/academic-field-formatting', () =>
        HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 500 })
      )
    );
    const subscription = store.dispatch(
      academicFieldFormattingApi.endpoints.getAcademicFieldFormatting.initiate()
    );
    await subscription.unwrap();
    await expect(
      store
        .dispatch(
          academicFieldFormattingApi.endpoints.updateAcademicFieldFormatting.initiate({
            ...initial,
            medium: 3,
          })
        )
        .unwrap()
    ).rejects.toMatchObject({ status: 500 });
    expect(
      academicFieldFormattingApi.endpoints.getAcademicFieldFormatting.select()(store.getState())
        .data
    ).toEqual(initial);
    subscription.unsubscribe();
  });
});
