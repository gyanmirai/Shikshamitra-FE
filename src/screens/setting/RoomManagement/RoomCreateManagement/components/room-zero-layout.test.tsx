import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { useBoolean } from 'src/hooks/use-boolean';
import { vi, it, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createRoomTestWrapper } from 'src/components/timetable/room-defaults-test-fixture';

import RoomForm from './AddRoomForm';
import { prepareRoomFormNetwork } from './room-form-test-network';

import type { IRoom } from '../types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const onClose = vi.fn();
const room: IRoom = {
  id: 'room-a',
  roomName: 'Activity Hall',
  buildingId: 'building-a',
  buildingName: 'Main',
  floorId: 'floor-a',
  floor: 1,
  roomTypeId: 'type-a',
  roomTypeName: 'Classroom',
  columnRows: [3, 2],
  benchesPerColumn: 2,
  benchesPerRow: 3,
  benchCapacity: 2,
  totalBenches: 5,
  capacity: 10,
  features: [],
  lastModificationTime: null,
  lastModifierId: null,
  creationTime: '2026-10-27T00:00:00Z',
  creatorId: 'test-admin',
};
function Harness({ editData = room }: { editData?: IRoom }) {
  const open = useBoolean(true);
  return <RoomForm open={open} editData={editData} onClose={onClose} />;
}
beforeEach(() => {
  onClose.mockClear();
  prepareRoomFormNetwork();
});

it.each([0, 2])(
  'clears stale rows when columns become zero and saves finite zero totals with bench capacity %i',
  async (capacity) => {
    let saved: Record<string, unknown> | undefined;
    mswServer.use(
      http.put('*/api/institute-setup/rooms/room-a', async ({ request }) => {
        saved = JSON.parse(String((await request.formData()).get('input')));
        return HttpResponse.json({ ...saved, id: room.id });
      })
    );
    render(<Harness />, createRoomTestWrapper());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/^Students per bench/), {
        target: { value: String(capacity) },
      });
      fireEvent.change(screen.getByLabelText(/^Columns/), { target: { value: '0' } });
    });
    expect(screen.queryByLabelText('Column 1 rows')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Total benches')).toHaveValue('0');
    expect(screen.getByLabelText('Total student capacity')).toHaveValue('0');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(saved).toMatchObject({
      columnRows: [],
      benchesPerColumn: 0,
      benchesPerRow: 0,
      benchCapacity: capacity,
      totalBenches: 0,
      capacity: 0,
    });
  }
);

it('keeps configured rows with zero students, previews zero totals and restores seating when students become positive', async () => {
  render(<Harness />, createRoomTestWrapper());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/^Students per bench/), { target: { value: '0' } });
  });
  expect(screen.getByLabelText('Column 1 rows')).toHaveValue(3);
  expect(screen.getByLabelText('Total benches')).toHaveValue('0');
  expect(screen.getByLabelText('Total student capacity')).toHaveValue('0');
  fireEvent.click(screen.getByRole('button', { name: 'Preview room' }));
  expect(await screen.findByText('This room has no bench seating.')).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Room seating diagram' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back to form' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Room Preview' })).not.toBeInTheDocument()
  );
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/^Students per bench/), { target: { value: '2' } });
  });
  expect(screen.getByLabelText('Total benches')).toHaveValue('5');
  expect(screen.getByLabelText('Total student capacity')).toHaveValue('10');
});

it('opens a saved non-bench room with zero values and saves it unchanged', async () => {
  let saved: Record<string, unknown> | undefined;
  mswServer.use(
    http.put('*/api/institute-setup/rooms/room-a', async ({ request }) => {
      saved = JSON.parse(String((await request.formData()).get('input')));
      return HttpResponse.json({ ...saved, id: room.id });
    })
  );
  render(
    <Harness
      editData={{
        ...room,
        columnRows: [],
        benchesPerColumn: 0,
        benchesPerRow: 0,
        benchCapacity: 0,
        totalBenches: 0,
        capacity: 0,
      }}
    />,
    createRoomTestWrapper()
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(screen.getByLabelText(/^Columns/)).toHaveValue(0);
  expect(screen.getByLabelText(/^Students per bench/)).toHaveValue(0);
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(saved).toMatchObject({
    columnRows: [],
    benchesPerRow: 0,
    benchCapacity: 0,
    totalBenches: 0,
    capacity: 0,
  });
});
