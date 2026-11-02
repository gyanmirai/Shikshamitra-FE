import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { divisionApi } from 'src/redux/division/divisionApi';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useDivisionRoomDefaults } from './useDivisionRoomDefaults';
import {
  subject,
  divisionUrl,
  makeRoomSlots,
  deferredResponse,
  prepareRoomNetwork,
  createRoomTestWrapper,
} from './room-defaults-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareRoomNetwork);

it.each(['room-b', null])(
  'uses the updated division default %s for new lectures in an open timetable',
  async (nextRoom) => {
    let roomId: string | null = 'room-a';
    mswServer.use(
      http.get(divisionUrl, () => HttpResponse.json({ id: 'division-a', roomId })),
      http.put(divisionUrl, () => {
        roomId = nextRoom;
        return HttpResponse.json({ id: 'division-a', roomId });
      })
    );
    const fixture = createRoomTestWrapper();
    const onChange = vi.fn();
    const props = { slots: makeRoomSlots([]), onChange, divisionId: 'division-a', readOnly: false };
    const { rerender } = renderHook(useDivisionRoomDefaults, { ...fixture, initialProps: props });
    await waitFor(() => {
      expect(Object.values(fixture.store.getState().api.queries)).toHaveLength(2);
      expect(
        Object.values(fixture.store.getState().api.queries).every(
          (query) => query?.status === 'fulfilled'
        )
      ).toBe(true);
    });

    await act(async () => {
      await fixture.store
        .dispatch(
          divisionApi.endpoints.updateDivision.initiate({
            id: 'division-a',
            body: { roomNumber: nextRoom ?? '' },
          })
        )
        .unwrap();
    });
    await waitFor(() => {
      expect(
        divisionApi.endpoints.getDivisionById.select('division-a')(fixture.store.getState()).data
          ?.roomId
      ).toBe(nextRoom);
    });

    const slots = makeRoomSlots();
    slots.MONDAY.push({
      ...slots.MONDAY[0],
      id: 'saved-lab',
      subjects: [{ ...subject, roomId: 'laboratory', roomName: 'Science Lab' }],
    });
    rerender({ ...props, slots });
    if (nextRoom) {
      await waitFor(() => expect(onChange).toHaveBeenCalled());
      const updated = onChange.mock.lastCall![0];
      expect(updated.MONDAY[0].subjects[0].roomId).toBe(nextRoom);
      expect(updated.MONDAY[1]).toEqual(slots.MONDAY[1]);
    } else {
      expect(onChange).not.toHaveBeenCalled();
    }
  }
);

it.each(['success', 'failure'])(
  'waits for a division refresh and avoids stale rooms on %s',
  async (outcome) => {
    const fixture = createRoomTestWrapper();
    const onChange = vi.fn();
    const props = { slots: makeRoomSlots([]), onChange, divisionId: 'division-a', readOnly: false };
    const { rerender } = renderHook(useDivisionRoomDefaults, { ...fixture, initialProps: props });
    await waitFor(() => {
      const queries = Object.values(fixture.store.getState().api.queries);
      expect(queries).toHaveLength(2);
      expect(queries.every((query) => query?.status === 'fulfilled')).toBe(true);
    });
    const deferred = deferredResponse();
    let refreshing = false;
    mswServer.use(
      http.get(divisionUrl, async () => {
        refreshing = true;
        await deferred.pending;
        return outcome === 'success'
          ? HttpResponse.json({ id: 'division-a', roomId: 'room-b' })
          : HttpResponse.json({ detail: 'Unavailable' }, { status: 500 });
      })
    );
    await act(async () => {
      fixture.store.dispatch(divisionApi.util.invalidateTags(['Division']));
    });
    await waitFor(() => expect(refreshing).toBe(true));
    rerender({ ...props, slots: makeRoomSlots() });
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => deferred.release());
    await waitFor(() =>
      expect(
        divisionApi.endpoints.getDivisionById.select('division-a')(fixture.store.getState()).status
      ).toBe(outcome === 'success' ? 'fulfilled' : 'rejected')
    );
    if (outcome === 'success') {
      await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
      expect(onChange.mock.lastCall![0].MONDAY[0].subjects[0].roomId).toBe('room-b');
    } else {
      rerender({ ...props, slots: makeRoomSlots() });
      expect(onChange).not.toHaveBeenCalled();
    }
  }
);
