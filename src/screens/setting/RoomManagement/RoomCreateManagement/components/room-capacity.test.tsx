import { vi, it, expect, beforeEach } from 'vitest';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { capacityNetwork } from './room-capacity-test-network';
import {
  fillRoomDraft,
  expectRoomDraft,
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

it('warns as soon as a full floor is selected and prevents creating another room', async () => {
  renderCapacityForm(onClose);
  await fillRoomDraft();
  expect(await screen.findByText('Room Limit Reached')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit building' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  await act(async () => {
    fireEvent.submit(screen.getByRole('dialog', { name: 'Add Room' }).querySelector('form')!);
  });
  expect(network.roomWrites).toHaveLength(0);
  expect(onClose).not.toHaveBeenCalled();
});

it('edits the existing building and refreshes capacity without losing the room draft', async () => {
  renderCapacityForm(onClose);
  await fillRoomDraft();
  const editor = await openBuildingEditor();
  expect(within(editor).getByLabelText(/^Building name/)).toHaveValue('Main');
  expect(within(editor).getByLabelText(/^Floor name/)).toHaveValue('First');
  await saveBuildingCapacity(editor, 2);
  await waitFor(() => expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument());
  expectRoomDraft();
  expect(network.buildingWrites).toEqual([
    expect.objectContaining({
      floorsToUpdate: [{ id: 'floor-a', floorNo: 1, floorName: 'First', totalRoom: 2 }],
    }),
  ]);
  const {buildingReads} = network;
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  await waitFor(() => expect(network.buildingReads).toBeGreaterThan(buildingReads));
  expect(network.roomWrites).toEqual([
    expect.objectContaining({
      roomName: 'A102',
      buildingId: 'building-a',
      floorId: 'floor-a',
      roomTypeId: 'type-a',
      columnRows: [3, 2],
      benchCapacity: 2,
      features: ['Whiteboard'],
    }),
  ]);
});

it('keeps the room draft and warning when building editing is cancelled', async () => {
  renderCapacityForm(onClose);
  await fillRoomDraft();
  const editor = await openBuildingEditor();
  fireEvent.click(within(editor).getByRole('button', { name: 'Cancel' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Edit Building' })).not.toBeInTheDocument()
  );
  expect(screen.getByText('Room Limit Reached')).toBeInTheDocument();
  expectRoomDraft();
  expect(network.buildingWrites).toHaveLength(0);
  expect(onClose).not.toHaveBeenCalled();
});

it('retains the warning and room draft after a failed building update', async () => {
  network.failBuildingSave = true;
  renderCapacityForm(onClose);
  await fillRoomDraft();
  const editor = await openBuildingEditor();
  fireEvent.change(within(editor).getByLabelText(/^Total rooms/), { target: { value: '2' } });
  fireEvent.click(within(editor).getByRole('button', { name: 'Submit' }));
  expect(await within(editor).findByText('Building save failed.')).toBeInTheDocument();
  fireEvent.click(within(editor).getByRole('button', { name: 'Cancel' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Edit Building' })).not.toBeInTheDocument()
  );
  expect(screen.getByText('Room Limit Reached')).toBeInTheDocument();
  expectRoomDraft();
  expect(network.roomWrites).toHaveLength(0);
});

it('allows editing a room that already occupies its full floor', async () => {
  renderCapacityForm(onClose, true);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/^Room name/), { target: { value: 'A101 revised' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(network.roomWrites[0]).toMatchObject({
    id: 'room-a',
    roomName: 'A101 revised',
    floorId: 'floor-a',
  });
});

it('keeps the warning when saving the building does not create a free slot', async () => {
  renderCapacityForm(onClose);
  await fillRoomDraft();
  await saveBuildingCapacity(await openBuildingEditor(), 1);
  expect(screen.getByText('Room Limit Reached')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expectRoomDraft();
  expect(network.roomWrites).toHaveLength(0);
});

it('retries a failed capacity refresh after building save without discarding the room', async () => {
  renderCapacityForm(onClose);
  await fillRoomDraft();
  const editor = await openBuildingEditor();
  network.failBuildings = true;
  await saveBuildingCapacity(editor, 2);
  expect(await screen.findByText(/Room options could not be loaded/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expectRoomDraft();
  network.failBuildings = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expectRoomDraft();
});

it('explains who can raise capacity when the user cannot edit buildings', async () => {
  renderCapacityForm(onClose, false, false);
  await fillRoomDraft();
  expect(await screen.findByText('Room Limit Reached')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Edit building' })).not.toBeInTheDocument();
  expect(screen.getByText(/Ask a user with building management access/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});
