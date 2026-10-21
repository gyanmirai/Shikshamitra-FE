import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { useBoolean } from 'src/hooks/use-boolean';
import userEvent from '@testing-library/user-event';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createRoomTestWrapper } from 'src/components/timetable/room-defaults-test-fixture';

import RoomForm from './AddRoomForm';
import { prepareRoomFormNetwork } from './room-form-test-network';

import type { IRoom } from '../types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const onClose = vi.fn();
const room = {
  id: 'room-a',
  roomName: 'A101',
  buildingId: 'building-a',
  floorId: 'floor-a',
  roomTypeId: 'type-a',
  columnRows: [2],
  benchesPerColumn: 1,
  benchCapacity: 2,
  features: [],
} as unknown as IRoom;
function Harness({ hasImage = false }: { hasImage?: boolean }) {
  const open = useBoolean(true);
  return <RoomForm open={open} editData={{ ...room, hasImage }} onClose={onClose} />;
}
beforeEach(() => {
  onClose.mockClear();
  prepareRoomFormNetwork();
});

async function choose(file: File) {
  const button = screen.getByRole('button', { name: /^(Upload|Replace) room image$/ });
  await userEvent.setup({ applyAccept: false }).upload(button.querySelector('input')!, file);
}

it('previews a selected photo, preserves it after failure, and submits its content on retry', async () => {
  let saved: Record<string, unknown> | undefined;
  mswServer.use(
    http.put('*/api/app/room/room-a', () =>
      HttpResponse.json({ detail: 'Try saving again.' }, { status: 500 })
    )
  );
  render(<Harness />, createRoomTestWrapper());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  await choose(new File(['photo bytes'], 'room.png', { type: 'image/png' }));
  expect(await screen.findByAltText('Room image preview')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Try saving again.')).toBeInTheDocument();
  expect(screen.getByAltText('Room image preview')).toBeInTheDocument();
  mswServer.use(
    http.put('*/api/app/room/room-a', async ({ request }) => {
      saved = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(saved);
    })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(saved).toMatchObject({
    image: { fileName: 'room.png', content: btoa('photo bytes') },
    removeImage: false,
  });
});

it('loads an existing photo and saves explicit removal', async () => {
  let saved: Record<string, unknown> | undefined;
  mswServer.use(
    http.get('*/api/institute-setup/rooms/room-a/image', () =>
      HttpResponse.json({ contentType: 'image/png', content: 'cGhvdG8=' })
    ),
    http.put('*/api/app/room/room-a', async ({ request }) => {
      saved = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(saved);
    })
  );
  render(<Harness hasImage />, createRoomTestWrapper());
  expect(await screen.findByAltText('Room image preview')).toHaveAttribute(
    'src',
    'data:image/png;base64,cGhvdG8='
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove room image' }));
  expect(screen.queryByAltText('Room image preview')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(saved).toMatchObject({ removeImage: true });
  expect(saved).not.toHaveProperty('image');
});

it('rejects unsupported and oversized files without selecting a photo', async () => {
  render(<Harness />, createRoomTestWrapper());
  await choose(new File(['pdf'], 'room.pdf', { type: 'application/pdf' }));
  expect(await screen.findByText('Choose one JPG or PNG image up to 5 MB.')).toBeInTheDocument();
  await choose(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'room.png', { type: 'image/png' }));
  expect(screen.queryByAltText('Room image preview')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Remove room image' })).not.toBeInTheDocument();
});
