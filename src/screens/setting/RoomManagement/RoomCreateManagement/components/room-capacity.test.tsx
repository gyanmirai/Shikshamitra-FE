import { vi, it, expect, beforeEach } from 'vitest';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { capacityNetwork } from './room-capacity-test-network';
import {
  saveBuilding,
  fillRoomDraft,
  expectRoomDraft,
  selectRoomOption,
  openBuildingEditor,
  renderCapacityForm,
  saveBuildingWithNewFloor,
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

it('adds a floor to the building and assigns the retained room draft to it', async () => {
  renderCapacityForm(onClose);
  await fillRoomDraft();
  const editor = await openBuildingEditor();
  expect(within(editor).getByLabelText(/^Building name/)).toHaveValue('Main');
  expect(within(editor).getByLabelText(/^Floor name/)).toHaveValue('First');
  expect(within(editor).getByLabelText(/^Total rooms/)).toHaveAttribute('readonly');
  await saveBuildingWithNewFloor(editor);
  expectRoomDraft();
  await selectRoomOption('Floor', 'Second');
  await waitFor(() => expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument());
  expectRoomDraft('Second');
  expect(network.buildingWrites).toEqual([
    expect.objectContaining({
      floorsToUpdate: [{ id: 'floor-a', floorNo: 1, floorName: 'First', totalRoom: 1 }],
      floorsToAdd: [{ floorNo: 2, floorName: 'Second', totalRoom: 2 }],
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
      floorId: 'floor-b',
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
  fireEvent.change(within(editor).getByLabelText(/^Building name/), { target: { value: 'New name' } });
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
  expect(network.roomWritePaths).toEqual(['/api/institute-setup/rooms/room-a']);
  expect(network.roomWrites[0]).toMatchObject({
    roomName: 'A101 revised',
    floorId: 'floor-a',
  });
});

it('keeps the warning when saving the building does not create a free slot', async () => {
  renderCapacityForm(onClose);
  await fillRoomDraft();
  await saveBuilding(await openBuildingEditor());
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
  await saveBuildingWithNewFloor(editor);
  expect(await screen.findByText(/Room options could not be loaded/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expectRoomDraft();
  network.failBuildings = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.queryByText(/Room options could not be loaded/)).not.toBeInTheDocument());
  await selectRoomOption('Floor', 'Second');
  await waitFor(() => expect(screen.queryByText('Room Limit Reached')).not.toBeInTheDocument());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expectRoomDraft('Second');
});

it('explains who can add a floor when the user cannot edit buildings', async () => {
  renderCapacityForm(onClose, false, false);
  await fillRoomDraft();
  expect(await screen.findByText('Room Limit Reached')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Edit building' })).not.toBeInTheDocument();
  expect(screen.getByText(/Ask a user with building management access/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});
