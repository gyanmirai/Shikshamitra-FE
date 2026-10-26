import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { capacityNetwork } from './room-capacity-test-network';
import {
  fillRoomDraft,
  expectRoomDraft,
  selectRoomOption,
  openBuildingEditor,
  renderCapacityForm,
  saveBuildingCapacity,
} from './room-capacity-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.setConfig({ testTimeout: 20000 });
let network: ReturnType<typeof capacityNetwork>;
const onClose = vi.fn();
beforeEach(() => {
  onClose.mockClear();
  network = capacityNetwork();
});

const errorCode = 'ShikshaMitra.TenantSettings:RoomFloorLimitReached';
const data = {
  BuildingId: 'building-a',
  FloorId: 'floor-a',
  FloorName: 'First',
  RoomLimit: 1,
  RoomCount: 1,
};

it.each([
  ['ABP', { error: { code: errorCode, message: 'Room floor limit reached.', data } }],
  ['problem details', { errorCode, detail: 'Room floor limit reached.', data }],
])(
  'recovers from a %s capacity race through building editing with the room draft intact',
  async (_, error) => {
    network.roomCount = 0;
    let attempts = 0;
    mswServer.use(
      http.post('*/api/app/room', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        network.roomWrites.push(body);
        attempts += 1;
        if (attempts === 1) {
          network.roomCount = 1;
          return HttpResponse.json(error, { status: 400 });
        }
        return HttpResponse.json({ ...body, id: 'new-room' });
      })
    );
    renderCapacityForm(onClose);
    await fillRoomDraft();
    expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Room Limit Reached')).toBeInTheDocument();
    expectRoomDraft();
    expect(onClose).not.toHaveBeenCalled();
    expect(network.roomWrites).toHaveLength(1);
    const editor = await openBuildingEditor();
    await saveBuildingCapacity(editor, 2);
    await waitFor(() => expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument());
    expectRoomDraft();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(network.roomWrites).toHaveLength(2);
    expect(network.roomWrites[1]).toMatchObject({
      roomName: 'A102',
      floorId: 'floor-a',
      columnRows: [3, 2],
      features: ['Whiteboard'],
    });
  }
);

it('clears the full-floor warning when a floor with capacity is selected', async () => {
  network.otherFloor = true;
  renderCapacityForm(onClose);
  await fillRoomDraft();
  expect(await screen.findByText('Room Limit Reached')).toBeInTheDocument();
  await selectRoomOption('Floor', 'Second');
  expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(network.roomWrites[0]).toMatchObject({
    roomName: 'A102',
    floorId: 'floor-b',
    columnRows: [3, 2],
    features: ['Whiteboard'],
  });
});

it('allows retry when refreshing a capacity rejection finds an available slot', async () => {
  network.roomCount = 0;
  mswServer.use(
    http.post('*/api/app/room', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      network.roomWrites.push(body);
      return network.roomWrites.length === 1
        ? HttpResponse.json(
            { errorCode, detail: 'Room floor limit reached.', data },
            { status: 400 }
          )
        : HttpResponse.json({ ...body, id: 'new-room' });
    })
  );
  renderCapacityForm(onClose);
  await fillRoomDraft();
  const { buildingReads } = network;
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(network.buildingReads).toBeGreaterThan(buildingReads));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument();
  expectRoomDraft();
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(network.roomWrites).toHaveLength(2);
});
