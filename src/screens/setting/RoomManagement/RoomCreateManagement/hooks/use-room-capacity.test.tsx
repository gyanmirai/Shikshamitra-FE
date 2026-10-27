import { vi, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, waitFor, renderHook } from '@testing-library/react';
import { createRoomTestWrapper } from 'src/components/timetable/room-defaults-test-fixture';

import { useRoomForm } from './useRoomForm';
import { prepareRoomFormNetwork } from '../components/room-form-test-network';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const values = {
  roomName: 'New room',
  building: 'building-a',
  floor: 'floor-a',
  roomType: 'type-a',
  columns: 1,
  columnRows: [2],
  benchCapacity: 2,
  features: [],
};

it('blocks creating on a full floor before sending a request', async () => {
  prepareRoomFormNetwork();
  let writes = 0;
  mswServer.use(
    http.get('*/api/institute-setup/buildings', () =>
      HttpResponse.json([
        {
          id: 'building-a',
          floors: [{ id: 'floor-a', floorName: 'First', totalRoom: 1, roomCount: 1 }],
        },
      ])
    ),
    http.post('*/api/institute-setup/rooms', () => {
      writes += 1;
      return HttpResponse.json({ id: 'room-a' });
    })
  );
  const { result } = renderHook(() => useRoomForm(null, vi.fn()), createRoomTestWrapper());
  await waitFor(() => expect(result.current.loadingOptions).toBe(false));
  await act(async () => {
    await result.current.formik.setValues(values);
  });
  expect(result.current.capacityBlocked).toBe(true);
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(writes).toBe(0);
});

it('refreshes capacity after a server race and retains the room draft', async () => {
  prepareRoomFormNetwork();
  const close = vi.fn();
  let reads = 0;
  mswServer.use(
    http.get('*/api/institute-setup/buildings', () => {
      reads += 1;
      return HttpResponse.json([
        {
          id: 'building-a',
          floors: [
            { id: 'floor-a', floorName: 'First', totalRoom: 1, roomCount: reads > 1 ? 1 : 0 },
          ],
        },
      ]);
    }),
    http.post('*/api/institute-setup/rooms', () =>
      HttpResponse.json(
        {
          errorCode: 'ShikshaMitra.TenantSettings:RoomFloorLimitReached',
          detail: 'The floor is full.',
        },
        { status: 409 }
      )
    )
  );
  const { result } = renderHook(() => useRoomForm(null, close), createRoomTestWrapper());
  await waitFor(() => expect(result.current.loadingOptions).toBe(false));
  await act(async () => {
    await result.current.formik.setValues(values);
  });
  await act(async () => {
    await result.current.formik.submitForm();
  });
  await waitFor(() => expect(result.current.capacityBlocked).toBe(true));
  expect(reads).toBe(2);
  expect(result.current.formik.values.roomName).toBe('New room');
  expect(close).not.toHaveBeenCalled();
});
