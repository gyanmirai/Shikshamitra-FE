import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useDivisionRoomDefaults } from './useDivisionRoomDefaults';
import {
  subject,
  roomsUrl,
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

it('preserves a lecture room chosen while the division lookup is still pending', async () => {
  const deferred = deferredResponse();
  let requested = false;
  mswServer.use(
    http.get(divisionUrl, async () => {
      requested = true;
      await deferred.pending;
      return HttpResponse.json({ id: 'division-a', roomId: 'room-a' });
    })
  );
  const onChange = vi.fn();
  const fixture = createRoomTestWrapper();
  const props = { slots: makeRoomSlots(), onChange, divisionId: 'division-a', readOnly: false };
  const { rerender } = renderHook(useDivisionRoomDefaults, { ...fixture, initialProps: props });
  await waitFor(() => expect(requested).toBe(true));
  rerender({
    ...props,
    slots: makeRoomSlots([{ ...subject, roomId: 'laboratory', roomName: 'Science Lab' }]),
  });
  await act(async () => deferred.release());
  await waitFor(() => {
    const queries = Object.values(fixture.store.getState().api.queries);
    expect(queries).toHaveLength(2);
    expect(queries.every((query) => query?.status === 'fulfilled')).toBe(true);
  });
  expect(onChange).not.toHaveBeenCalled();
});

it('does not use the previous division room while a replacement lookup is pending', async () => {
  const fixture = createRoomTestWrapper();
  const onChange = vi.fn();
  const props = { slots: makeRoomSlots(), onChange, divisionId: 'division-a', readOnly: false };
  const { rerender } = renderHook(useDivisionRoomDefaults, { ...fixture, initialProps: props });
  await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  const deferred = deferredResponse();
  let requested = false;
  mswServer.use(
    http.get(divisionUrl, async () => {
      requested = true;
      await deferred.pending;
      return HttpResponse.json({ id: 'division-b', roomId: 'room-b' });
    })
  );
  onChange.mockClear();
  rerender({ ...props, slots: makeRoomSlots(), divisionId: 'division-b' });
  await waitFor(() => expect(requested).toBe(true));
  expect(onChange).not.toHaveBeenCalled();
  await act(async () => deferred.release());
  await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  expect(onChange.mock.calls[0][0].MONDAY[0].subjects[0].roomId).toBe('room-b');
});

it.each(['division', 'room'])(
  'does not apply cached defaults after a failed %s refresh',
  async (lookup) => {
    const fixture = createRoomTestWrapper();
    const onChange = vi.fn();
    const props = { slots: makeRoomSlots(), onChange, divisionId: 'division-a', readOnly: false };
    const first = renderHook(() => useDivisionRoomDefaults(props), fixture);
    await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
    first.unmount();
    mswServer.use(
      http.get(lookup === 'division' ? divisionUrl : `${roomsUrl}/room-a`, () =>
        HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })
      )
    );
    onChange.mockClear();
    renderHook(() => useDivisionRoomDefaults(props), fixture);
    await waitFor(() => {
      const endpointName = lookup === 'division' ? 'getDivisionById' : 'getRoomById';
      const query = Object.values(fixture.store.getState().api.queries).find(
        (item) => item?.endpointName === endpointName
      );
      expect(query?.status).toBe('rejected');
    });
    expect(onChange).not.toHaveBeenCalled();
  }
);
