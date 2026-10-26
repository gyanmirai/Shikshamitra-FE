import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { instituteFieldFormattingApi } from './institute-field-formatting-api';

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

describe('institute field formatting API', () => {
  it('saves one scope without replacing another scope or refreshing its active query', async () => {
    const reads = { buildings: 0, shifts: 0 };
    let buildingFields = { buildingName: 0, floorName: 0, description: 0 };
    const shiftFields = { shiftName: 3 };
    let submitted: unknown;
    mswServer.use(
      http.get('*/api/app/institute-field-formatting/buildings', () => {
        reads.buildings += 1;
        return HttpResponse.json({ fields: buildingFields });
      }),
      http.get('*/api/app/institute-field-formatting/shifts', () => {
        reads.shifts += 1;
        return HttpResponse.json({ fields: shiftFields });
      }),
      http.put('*/api/app/institute-field-formatting/buildings', async ({ request }) => {
        submitted = await request.json();
        buildingFields = { ...buildingFields, buildingName: 4 };
        return HttpResponse.json({ fields: buildingFields });
      })
    );
    const building = store.dispatch(
      instituteFieldFormattingApi.endpoints.getInstituteFieldFormatting.initiate('buildings')
    );
    const shift = store.dispatch(
      instituteFieldFormattingApi.endpoints.getInstituteFieldFormatting.initiate('shifts')
    );
    await Promise.all([building.unwrap(), shift.unwrap()]);
    await store
      .dispatch(
        instituteFieldFormattingApi.endpoints.updateInstituteFieldFormatting.initiate({
          scope: 'buildings',
          fields: { ...buildingFields, buildingName: 4 },
        })
      )
      .unwrap();
    expect(submitted).toEqual({ fields: { buildingName: 4, floorName: 0, description: 0 } });
    await waitFor(() => expect(reads.buildings).toBe(2));
    expect(reads.shifts).toBe(1);
    expect(
      instituteFieldFormattingApi.endpoints.getInstituteFieldFormatting.select('shifts')(
        store.getState()
      ).data
    ).toEqual({ fields: shiftFields });
    building.unsubscribe();
    shift.unsubscribe();
  });

  it('keeps current settings in the cache after a failed write', async () => {
    const initial = { fields: { roomName: 2, featureName: 0 } };
    mswServer.use(
      http.get('*/api/app/institute-field-formatting/rooms', () => HttpResponse.json(initial)),
      http.put('*/api/app/institute-field-formatting/rooms', () =>
        HttpResponse.json({}, { status: 503 })
      )
    );
    const subscription = store.dispatch(
      instituteFieldFormattingApi.endpoints.getInstituteFieldFormatting.initiate('rooms')
    );
    await subscription.unwrap();
    await expect(
      store
        .dispatch(
          instituteFieldFormattingApi.endpoints.updateInstituteFieldFormatting.initiate({
            scope: 'rooms',
            fields: { roomName: 4, featureName: 0 },
          })
        )
        .unwrap()
    ).rejects.toMatchObject({ status: 503 });
    expect(
      instituteFieldFormattingApi.endpoints.getInstituteFieldFormatting.select('rooms')(
        store.getState()
      ).data
    ).toEqual(initial);
    subscription.unsubscribe();
  });

  it('uses the owning scope for authoritative Unicode previews', async () => {
    let submitted: unknown;
    mswServer.use(
      http.post(
        '*/api/app/institute-field-formatting/schoolDocuments/preview',
        async ({ request }) => {
          submitted = await request.json();
          return HttpResponse.json({ value: 'ÉCOLE PRIMAIRE' });
        }
      )
    );
    const result = await store
      .dispatch(
        instituteFieldFormattingApi.endpoints.getInstituteFieldPreview.initiate({
          scope: 'schoolDocuments',
          value: 'école primaire',
          textCase: 4,
        })
      )
      .unwrap();
    expect(submitted).toEqual({ value: 'école primaire', textCase: 4 });
    expect(result).toEqual({ value: 'ÉCOLE PRIMAIRE' });
  });
});
