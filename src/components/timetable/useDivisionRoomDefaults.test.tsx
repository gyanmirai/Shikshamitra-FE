import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { waitFor, renderHook } from '@testing-library/react';

import { useDivisionRoomDefaults } from './useDivisionRoomDefaults';
import {
  subject,
  roomsUrl,
  divisionUrl,
  makeRoomSlots,
  prepareRoomNetwork,
  createRoomTestWrapper,
} from './room-defaults-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareRoomNetwork);

it('defaults unassigned lectures even when the division room is outside the first room page', async () => {
  mswServer.use(http.get(roomsUrl, () => HttpResponse.json({ items: [] })));
  const slots = makeRoomSlots();
  slots.MONDAY.push(
    {
      ...slots.MONDAY[0],
      id: 'lab-period',
      sequence: 2,
      subjects: [{ ...subject, roomId: 'laboratory', roomName: 'Science Lab' }],
    },
    { ...slots.MONDAY[0], id: 'empty-period', sequence: 3, subjects: [] },
    { ...slots.MONDAY[0], id: 'break', sequence: 4, type: 'BREAK', subjects: [] }
  );
  const onChange = vi.fn();
  renderHook(
    () =>
      useDivisionRoomDefaults({
        slots,
        onChange,
        divisionId: 'division-a',
        readOnly: false,
      }),
    createRoomTestWrapper()
  );
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  const changed = onChange.mock.calls[0][0];
  expect(changed.MONDAY[0].subjects).toEqual([{ ...subject, roomId: 'room-a', roomName: 'A101' }]);
  expect(changed.MONDAY.slice(1)).toEqual(slots.MONDAY.slice(1));
  expect(slots.MONDAY[0].subjects).toEqual([subject]);
});

it('uses the division room only once within simultaneous elective subjects', async () => {
  const slots = makeRoomSlots([subject, { ...subject, subjectId: 'biology', name: 'Biology' }]);
  const onChange = vi.fn();
  renderHook(
    () =>
      useDivisionRoomDefaults({
        slots,
        onChange,
        divisionId: 'division-a',
        readOnly: false,
      }),
    createRoomTestWrapper()
  );
  await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  expect(onChange.mock.calls[0][0].MONDAY[0].subjects).toEqual([
    { ...subject, roomId: 'room-a', roomName: 'A101' },
    { ...subject, subjectId: 'biology', name: 'Biology' },
  ]);
});

it.each(['no room', 'unknown room', 'failed lookup'])(
  'leaves rooms unchanged for %s',
  async (scenario) => {
    mswServer.use(
      http.get(divisionUrl, () =>
        scenario === 'failed lookup'
          ? HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })
          : HttpResponse.json({
              id: 'division-a',
              roomId: scenario === 'no room' ? null : 'missing',
            })
      )
    );
    const fixture = createRoomTestWrapper();
    const onChange = vi.fn();
    renderHook(
      () =>
        useDivisionRoomDefaults({
          slots: makeRoomSlots(),
          onChange,
          divisionId: 'division-a',
          readOnly: false,
        }),
      fixture
    );
    await waitFor(() => {
      const queries = Object.values(fixture.store.getState().api.queries);
      expect(queries).toHaveLength(scenario === 'unknown room' ? 2 : 1);
      expect(queries.every((query) => query?.status !== 'pending')).toBe(true);
    });
    expect(onChange).not.toHaveBeenCalled();
  }
);

it('never changes a read-only timetable, including after lookup data is cached', async () => {
  const fixture = createRoomTestWrapper();
  const onChange = vi.fn();
  const props = { slots: makeRoomSlots(), onChange, divisionId: 'division-a', readOnly: false };
  const { rerender } = renderHook(useDivisionRoomDefaults, { ...fixture, initialProps: props });
  await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  onChange.mockClear();
  rerender({ ...props, slots: makeRoomSlots(), readOnly: true });
  expect(onChange).not.toHaveBeenCalled();
});

it('defaults a newly scheduled lecture after lookups finish without repeatedly changing it', async () => {
  const fixture = createRoomTestWrapper();
  const onChange = vi.fn();
  const props = { slots: makeRoomSlots([]), onChange, divisionId: 'division-a', readOnly: false };
  const { rerender } = renderHook(useDivisionRoomDefaults, { ...fixture, initialProps: props });
  await waitFor(() => {
    const queries = Object.values(fixture.store.getState().api.queries);
    expect(queries).toHaveLength(2);
    expect(queries.every((query) => query?.status === 'fulfilled')).toBe(true);
  });
  expect(onChange).not.toHaveBeenCalled();
  rerender({ ...props, slots: makeRoomSlots() });
  await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  const slots = onChange.mock.calls[0][0];
  expect(slots.MONDAY[0].subjects[0].roomId).toBe('room-a');
  rerender({ ...props, slots });
  expect(onChange).toHaveBeenCalledOnce();
});
