import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';

import { libraryReservationsApi } from './reservations-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
function store() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
}
it('resolves printed IDs as query values under reservation ownership and selected-year context', async () => {
  let captured: URLSearchParams | undefined;
  mswServer.use(
    http.get('http://library.test/api/library/reservations/members/resolve', ({ request }) => {
      captured = new URL(request.url).searchParams;
      return HttpResponse.json({ id: 'canonical-member', isEligibleForReservation: true });
    })
  );
  const state = store();
  const subscription = state.dispatch(
    libraryReservationsApi.endpoints.resolveReservationMember.initiate({
      identifier: 'વાંચન/42#?+',
      academicYearId: 'year-id',
    })
  );
  await expect(subscription.unwrap()).resolves.toMatchObject({ id: 'canonical-member' });
  expect(captured?.get('identifier')).toBe('વાંચન/42#?+');
  expect(captured?.get('academicYearId')).toBe('year-id');
  subscription.unsubscribe();
});

it('refreshes subscribed reservation detail, events and list after revision-checked cancellation', async () => {
  const counts = { detail: 0, events: 0, list: 0 };
  let state = 1;
  mswServer.use(
    http.get('http://library.test/api/library/reservations/reservation-id', () => {
      counts.detail += 1;
      return HttpResponse.json({ id: 'reservation-id', state });
    }),
    http.get('http://library.test/api/library/reservations/reservation-id/events', () => {
      counts.events += 1;
      return HttpResponse.json({ items: [], totalCount: state });
    }),
    http.get('http://library.test/api/library/reservations', () => {
      counts.list += 1;
      return HttpResponse.json({ items: [{ id: 'reservation-id', state }], totalCount: 1 });
    }),
    http.post(
      'http://library.test/api/library/reservations/reservation-id/cancel',
      async ({ request }) => {
        expect(await request.json()).toEqual({
          academicYearId: 'year-id',
          revision: 'opened-revision',
          reason: 'No longer needed',
        });
        state = 3;
        return HttpResponse.json({ id: 'reservation-id', state });
      }
    )
  );
  const stateStore = store();
  const identity = { reservationId: 'reservation-id', academicYearId: 'year-id' };
  const subscriptions = [
    stateStore.dispatch(libraryReservationsApi.endpoints.getLibraryReservation.initiate(identity)),
    stateStore.dispatch(
      libraryReservationsApi.endpoints.getLibraryReservationEvents.initiate({
        ...identity,
        page: 1,
        pageSize: 10,
      })
    ),
    stateStore.dispatch(
      libraryReservationsApi.endpoints.listLibraryReservations.initiate({
        academicYearId: 'year-id',
        bookId: 'book-id',
        page: 1,
        pageSize: 10,
        includeHistory: true,
      })
    ),
  ];
  await Promise.all(subscriptions.map((subscription) => subscription.unwrap()));
  await stateStore
    .dispatch(
      libraryReservationsApi.endpoints.cancelLibraryReservation.initiate({
        reservationId: 'reservation-id',
        body: {
          academicYearId: 'year-id',
          revision: 'opened-revision',
          reason: 'No longer needed',
        },
      })
    )
    .unwrap();
  await waitFor(() => expect(counts).toEqual({ detail: 2, events: 2, list: 2 }));
  await Promise.all(stateStore.dispatch(api.util.getRunningQueriesThunk()));
  subscriptions.forEach((subscription) => subscription.unsubscribe());
});
