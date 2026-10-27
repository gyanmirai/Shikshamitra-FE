import { toast, Toaster } from 'sonner';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach } from 'vitest';
import { roomsApi, useDeleteRoomMutation } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { createRoomTestWrapper } from 'src/components/timetable/room-defaults-test-fixture';
import {
  act,
  render,
  screen,
  within,
  waitFor,
  fireEvent,
  renderHook,
} from '@testing-library/react';

import { useConfirmWithUndo } from './useConfirmWithUndo';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
afterEach(() => toast.dismiss());

it('undoes the earlier removal while committing a later removal independently', async () => {
  const deleted: string[] = [];
  const removed = new Set<string>();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.delete('*/api/app/room/:id', ({ params }) => {
      deleted.push(String(params.id));
      return new HttpResponse(null, { status: 204 });
    })
  );
  const wrapper = createRoomTestWrapper();
  render(<Toaster />, wrapper);
  const { result } = renderHook(
    () => ({ undo: useConfirmWithUndo(), remove: useDeleteRoomMutation()[0] }),
    wrapper
  );
  act(() => {
    ['room-a', 'room-b'].forEach((id) =>
      result.current.undo.confirmWithUndo({
        item: id,
        duration: 700,
        message: `Removed ${id}`,
        onOptimisticRemove: () => {
          removed.add(id);
        },
        onUndoRestore: () => {
          removed.delete(id);
        },
        onCommit: () => result.current.remove(id),
      })
    );
  });
  const message = await screen.findByText(/^Removed room-a/);
  fireEvent.click(within(message.parentElement!).getByRole('button', { name: 'UNDO' }));
  await waitFor(() => expect(deleted).toEqual(['room-b']), { timeout: 1500 });
  expect(removed.has('room-a')).toBe(false);
  expect(removed.has('room-b')).toBe(true);
  wrapper.store.dispatch(roomsApi.util.resetApiState());
});
