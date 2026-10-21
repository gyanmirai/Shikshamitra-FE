import { vi, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { RoomStudioHarness } from './room-studio-test-harness';

vi.mock('src/components/iconify', () => ({ Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} /> }));

it('retains touch activation and cancellation without changing saved occupants', async () => {
  render(<RoomStudioHarness />);
  const source = screen.getByRole('button', { name: 'Seat 1, occupied by Aarav Shah' });
  const touch = { identifier: 1, clientX: 10, clientY: 10, target: source };
  fireEvent.touchStart(source, { touches: [touch], changedTouches: [touch] });
  fireEvent.touchMove(source, { touches: [{ ...touch, clientX: 30 }], changedTouches: [{ ...touch, clientX: 30 }] });
  await waitFor(() => expect(source).toHaveAttribute('aria-pressed', 'true'));
  fireEvent.touchCancel(source, { touches: [], changedTouches: [touch] });
  await waitFor(() => expect(source).not.toHaveAttribute('aria-pressed', 'true'));
  expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  expect(source).toHaveAttribute('data-seat-id', 'room-1:1');
});
