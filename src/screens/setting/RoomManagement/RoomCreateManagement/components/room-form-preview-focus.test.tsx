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

const room: IRoom = {
  id: 'room-a',
  roomName: 'A101',
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

function Harness() {
  const open = useBoolean(true);
  return <RoomForm open={open} editData={room} onClose={vi.fn()} />;
}

beforeEach(prepareRoomFormNetwork);

it('allows preview after invalid submission and focuses the first error again on resubmission', async () => {
  render(<Harness />, createRoomTestWrapper());
  const submit = screen.getByRole('button', { name: 'Submit' });
  await waitFor(() => expect(submit).toBeEnabled());
  const columns = screen.getByLabelText(/^Columns/);
  const students = screen.getByLabelText(/^Students per bench/);
  await act(async () => {
    fireEvent.change(columns, { target: { value: '' } });
  });
  fireEvent.click(submit);
  expect(await screen.findByText('Columns is required')).toBeInTheDocument();
  await waitFor(() => expect(columns).toHaveFocus());
  await act(async () => students.focus());
  await waitFor(() => expect(students).toHaveFocus());

  fireEvent.click(screen.getByRole('button', { name: 'Preview room' }));
  expect(await screen.findByRole('dialog', { name: 'Room Preview' })).toBeInTheDocument();
  expect(screen.getByText('Enter a valid column count to preview the room.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back to form' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Room Preview' })).not.toBeInTheDocument()
  );
  expect(screen.getByRole('dialog', { name: 'Update Room' })).toBeInTheDocument();
  fireEvent.click(submit);
  await waitFor(() => expect(columns).toHaveFocus());
}, 30000);
