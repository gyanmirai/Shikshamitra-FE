import { vi, it, expect, describe } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { RoomStudioHarness } from './room-studio-test-harness';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const student = () => screen.getByRole('button', { name: /Ishaan Mehta/ });
const seat = (number: number, status: string) =>
  screen.getByRole('button', { name: `Seat ${number}, ${status}` });

describe('Room studio manual allocation', () => {
  it('keeps physical holes, seat identities, protected occupants and zoom independent of allocations', () => {
    const { container } = render(<RoomStudioHarness />);
    expect(container.querySelectorAll('[data-studio-bench]')).toHaveLength(6);
    expect(container.querySelector('[data-studio-bench="1-1"]')).toBeNull();
    expect(container.querySelectorAll('[data-seat-id]')).toHaveLength(12);
    expect(seat(11, 'unavailable, occupied by another simultaneous exam plan')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('110%')).toBeInTheDocument();
    expect(seat(1, 'occupied by Aarav Shah')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('places by keyboard activation and preserves Undo/Redo and the original seat number', () => {
    render(<RoomStudioHarness />);
    fireEvent.click(student());
    fireEvent.keyDown(seat(2, 'empty'), { key: 'Enter' });
    expect(seat(2, 'occupied by Ishaan Mehta')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ishaan Mehta.*Roll/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(seat(2, 'empty')).toBeInTheDocument();
    expect(student()).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(seat(2, 'occupied by Ishaan Mehta')).toBeInTheDocument();
  });

  it('rejects click placement on reserved, disabled, protected and already occupied seats', () => {
    render(<RoomStudioHarness />);
    fireEvent.click(student());
    [
      seat(6, 'reserved'),
      seat(10, 'disabled'),
      seat(11, 'unavailable, occupied by another simultaneous exam plan'),
      seat(1, 'occupied by Aarav Shah'),
    ].forEach((target) => fireEvent.click(target));
    expect(seat(1, 'occupied by Aarav Shah')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    fireEvent.click(seat(9, 'empty'));
    expect(seat(9, 'occupied by Ishaan Mehta')).toBeInTheDocument();
  });

  it('preserves assignments across room switches, removes through the existing menu and supports undo', () => {
    render(<RoomStudioHarness />);
    fireEvent.click(student());
    fireEvent.click(seat(9, 'empty'));
    fireEvent.click(screen.getByRole('button', { name: 'B105 — 0/2' }));
    expect(seat(1, 'empty')).toHaveAttribute('data-seat-id', 'room-2:1');
    fireEvent.click(screen.getByRole('button', { name: 'B106 — 3/10' }));
    expect(seat(9, 'occupied by Ishaan Mehta')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Seat 9 actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remove from Seat' }));
    expect(seat(9, 'empty')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(seat(9, 'occupied by Ishaan Mehta')).toBeInTheDocument();
  });

  it('reserves and releases through the existing menu and updates usable capacity', () => {
    render(<RoomStudioHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Seat 2 actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Reserve Seat' }));
    expect(seat(2, 'reserved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B106 — 2/9' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Seat 2 actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Unreserve Seat' }));
    expect(seat(2, 'empty')).toBeInTheDocument();
  });

  it('retains the all-students view, search and assigned-card restrictions', () => {
    render(<RoomStudioHarness />);
    fireEvent.click(screen.getByRole('tab', { name: 'All students' }));
    expect(screen.getByRole('tabpanel', { name: 'All students' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aarav Shah.*Roll/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Search students' }), {
      target: { value: 'missing' },
    });
    expect(screen.getByText('No students match this search.')).toBeInTheDocument();
  });

  it('keeps locked and permission-denied presentation read-only', () => {
    render(<RoomStudioHarness readOnly />);
    expect(screen.queryByRole('button', { name: /Seat .* actions/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    const empty = screen.getByRole('img', { name: 'Seat 2, empty' });
    fireEvent.click(empty);
    fireEvent.keyDown(empty, { key: 'Enter' });
    expect(empty).toHaveAttribute('tabindex', '-1');
  });

  it('retains the assigned-seat keyboard drag listener and cancels without changing allocation', async () => {
    render(<RoomStudioHarness />);
    const source = seat(1, 'occupied by Aarav Shah');
    source.focus();
    fireEvent.keyDown(source, { key: ' ', code: 'Space' });
    await waitFor(() => expect(source).toHaveAttribute('aria-pressed', 'true'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(source).not.toHaveAttribute('aria-pressed', 'true'));
    expect(seat(1, 'occupied by Aarav Shah')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  it('preserves Delete removal and never removes a protected occupant', () => {
    render(<RoomStudioHarness />);
    fireEvent.keyDown(seat(11, 'unavailable, occupied by another simultaneous exam plan'), {
      key: 'Delete',
    });
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    fireEvent.keyDown(seat(1, 'occupied by Aarav Shah'), { key: 'Delete' });
    expect(seat(1, 'empty')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(seat(1, 'occupied by Aarav Shah')).toBeInTheDocument();
  });
});
