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
const room = {
  id: 'room-a',
  roomName: 'A101',
  buildingId: 'building-a',
  floorId: 'floor-a',
  roomTypeId: 'type-a',
  columnRows: [3, 2, 4],
  benchesPerColumn: 3,
  benchesPerRow: 4,
  benchCapacity: 2,
  totalBenches: 9,
  capacity: 18,
  features: ['Whiteboard'],
} as IRoom;
const onClose = vi.fn();
function Harness({ create = false }: { create?: boolean }) {
  const open = useBoolean(true);
  return <RoomForm open={open} editData={create ? undefined : room} onClose={onClose} />;
}
beforeEach(() => {
  onClose.mockClear();
  prepareRoomFormNetwork();
});

it('shows required-field errors and focuses the first invalid field', async () => {
  render(<Harness create />, createRoomTestWrapper());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Room name is required')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByLabelText(/^Room name/)).toHaveFocus());
  expect(onClose).not.toHaveBeenCalled();
});

it('adds row fields per column, preserves existing counts, and previews the exact capacity', async () => {
  render(<Harness />, createRoomTestWrapper());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.change(screen.getByLabelText(/^Columns/), { target: { value: '4' } });
  expect(screen.getByLabelText(/^Column 1 rows/)).toHaveValue(3);
  expect(screen.getByLabelText(/^Column 4 rows/)).toHaveValue(null);
  fireEvent.change(screen.getByLabelText(/^Column 4 rows/), { target: { value: '1' } });
  const previewButton = screen.getByRole('button', { name: 'Preview room' });
  act(() => previewButton.focus());
  fireEvent.click(previewButton);
  expect(await screen.findByRole('dialog', { name: 'Room Preview' })).toBeInTheDocument();
  expect(
    await screen.findByRole('img', { name: /column 4 has 1 benches.*Total capacity 20/ })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back to form' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Room Preview' })).not.toBeInTheDocument()
  );
  expect(screen.getByRole('dialog', { name: 'Update Room' })).toBeInTheDocument();
  expect(screen.getByLabelText(/^Column 4 rows/)).toHaveValue(1);
  await waitFor(() => expect(previewButton).toHaveFocus());
  expect(screen.getByLabelText('Total benches')).toHaveValue('10');
  expect(screen.getByLabelText('Total student capacity')).toHaveValue('20');
});

it('adjusts each column independently and respects the row limits', async () => {
  render(<Harness />, createRoomTestWrapper());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Increase rows in column 1' }));
  await waitFor(() => expect(screen.getByLabelText('Column 1 rows')).toHaveValue(4));
  expect(screen.getByLabelText('Column 2 rows')).toHaveValue(2);
  fireEvent.click(screen.getByRole('button', { name: 'Decrease rows in column 1' }));
  await waitFor(() => expect(screen.getByLabelText('Column 1 rows')).toHaveValue(3));
  await act(async () => {
    fireEvent.change(screen.getByLabelText('Column 1 rows'), { target: { value: '100' } });
  });
  expect(screen.getByRole('button', { name: 'Increase rows in column 1' })).toBeDisabled();
  await act(async () => {
    fireEvent.change(screen.getByLabelText('Column 1 rows'), { target: { value: '1' } });
  });
  expect(screen.getByRole('button', { name: 'Decrease rows in column 1' })).toBeDisabled();
});

it('zooms the seating diagram and closes only the preview with Escape', async () => {
  render(<Harness />, createRoomTestWrapper());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Preview room' }));
  const dialog = await screen.findByRole('dialog', { name: 'Room Preview' });
  fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
  expect(screen.getByText('125%')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Fit room' }));
  expect(screen.getByText('Fit')).toBeInTheDocument();
  fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Room Preview' })).not.toBeInTheDocument()
  );
  expect(screen.getByRole('dialog', { name: 'Update Room' })).toBeInTheDocument();
});

it('saves a custom feature to the catalogue and selects the returned name', async () => {
  let savedName = '';
  mswServer.use(
    http.post('*/api/institute-setup/rooms/features', async ({ request }) => {
      savedName = ((await request.json()) as { name: string }).name;
      return HttpResponse.json({ id: 'smart', name: savedName });
    })
  );
  render(<Harness />, createRoomTestWrapper());
  await screen.findByRole('checkbox', { name: 'Whiteboard' });
  fireEvent.change(screen.getByLabelText('Extra feature'), { target: { value: ' smart Board ' } });
  expect(screen.getByLabelText('Extra feature')).toHaveValue(' smart Board ');
  fireEvent.click(screen.getByRole('button', { name: 'Add feature' }));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'smart Board' })).toBeChecked());
  expect(savedName).toBe('smart Board');
});

it('uses the server-formatted feature even when the entered name matches an existing raw option', async () => {
  const addFeature = vi.fn();
  mswServer.use(
    http.get('*/api/institute-setup/rooms/features', () =>
      HttpResponse.json({ items: [{ id: 'reading', name: 'reading corner' }] })
    ),
    http.post('*/api/institute-setup/rooms/features', async ({ request }) => {
      addFeature(await request.json());
      return HttpResponse.json({ id: 'formatted-reading', name: 'ReadingCorner' });
    })
  );
  render(<Harness />, createRoomTestWrapper());
  await screen.findByRole('checkbox', { name: 'reading corner' });
  fireEvent.change(screen.getByLabelText('Extra feature'), {
    target: { value: ' reading corner ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add feature' }));
  await waitFor(() => expect(addFeature).toHaveBeenCalledWith({ name: 'reading corner' }));
  expect(await screen.findByRole('checkbox', { name: 'ReadingCorner' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'reading corner' })).not.toBeChecked();
});

it('keeps values after failed submission, then saves the layout on retry', async () => {
  mswServer.use(
    http.put('*/api/institute-setup/rooms/room-a', () =>
      HttpResponse.json({ detail: 'Room save failed.' }, { status: 500 })
    )
  );
  render(<Harness />, createRoomTestWrapper());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Room save failed.')).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/^Column 2 rows/)).toHaveValue(2);
  let saved: Record<string, unknown> | undefined;
  mswServer.use(
    http.put('*/api/institute-setup/rooms/room-a', async ({ request }) => {
      saved = JSON.parse(String((await request.formData()).get('input'))) as Record<
        string,
        unknown
      >;
      return HttpResponse.json({ ...saved, id: room.id });
    })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(saved).toMatchObject({ columnRows: [3, 2, 4], totalBenches: 9, capacity: 18 });
});
