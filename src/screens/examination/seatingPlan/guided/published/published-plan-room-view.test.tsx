import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { toSeatingRoomLayout } from '../../utils/room-layout';
import { PublishedPlanRoomView } from './published-plan-room-view';
import { usePublishedSeatingData } from './use-published-seating-data';

import type { PublishedRoomGroup } from './published-room-groups';

vi.mock('./use-published-seating-data', () => ({ usePublishedSeatingData: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} /> }));

const room = toSeatingRoomLayout({ room: {
  capacity: 36, totalBenches: 18, benchesPerRow: 4, benchesPerColumn: 6, benchCapacity: 2,
} }, 'room-b003', 'B003');
const students = [
  { studentId: 'student-1', studentName: 'Published student one', rollNo: 1, divisionName: 'Computer Science, Hindi · Shared plan' },
  { studentId: 'student-2', studentName: 'Published student two', rollNo: 2, divisionName: 'Other simultaneous plan', isExternalExamOccupied: true },
];
const assignments = students.map((student, index) => ({ studentId: student.studentId, roomId: room.roomId,
  seatId: `${room.roomId}:${index ? 11 : 1}`, seatNumber: index ? 11 : 1, assignedBy: 'manual' as const,
  isExternalExamOccupied: student.isExternalExamOccupied,
}));
const group = { roomId: room.roomId, roomName: room.roomName, anchorPlan: { seatingPlanId: 'published-plan' } } as PublishedRoomGroup;
const retry = vi.fn();
const data = { rooms: [room], students, assignments, isLoading: false, error: '', canRetry: false, retry };

function View() {
  return <ThemeProvider theme={createTheme(defaultSettings)}>
    <PublishedPlanRoomView examId="exam-1" standardId="class-1" group={group} />
  </ThemeProvider>;
}

describe('published Room studio seating', () => {
  it('renders the physical design on the actual published surface, preserving legacy and combined-plan seats', () => {
    vi.mocked(usePublishedSeatingData).mockReturnValue(data);
    const { container } = render(<View />);
    expect(screen.getByLabelText('Room studio')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-studio-bench]')).toHaveLength(18);
    expect(container.querySelectorAll('[data-seat-id]')).toHaveLength(36);
    expect(container.querySelector('[data-studio-bench="4-2"]')).toBeNull();
    expect(screen.getByRole('img', { name: 'Seat 1, occupied by Published student one' })).toHaveAttribute('data-seat-id', 'room-b003:1');
    expect(screen.getByRole('img', { name: 'Seat 11, unavailable, occupied by Other simultaneous plan' })).toHaveAttribute('data-seat-id', 'room-b003:11');
    expect(container.querySelector('[data-seat-id="room-b003:1"]')).toHaveTextContent('Computer Science, Hindi · Shared plan');
    expect(screen.getByRole('button', { name: 'B003 — 2/36' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('110%')).toBeInTheDocument();
  });

  it('exposes no editing or dragging and preserves occupants after click and keyboard input', () => {
    vi.mocked(usePublishedSeatingData).mockReturnValue(data);
    const { container } = render(<View />);
    expect(screen.queryByRole('button', { name: /Seat .* actions/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Auto-arrange|Undo|Redo|Clear placements/ })).not.toBeInTheDocument();
    expect(container.querySelector('[aria-roledescription="draggable"]')).toBeNull();
    const occupant = screen.getByRole('img', { name: 'Seat 1, occupied by Published student one' });
    fireEvent.click(occupant);
    fireEvent.keyDown(occupant, { key: 'Delete' });
    fireEvent.keyDown(occupant, { key: 'Backspace' });
    fireEvent.keyDown(occupant, { key: ' ', code: 'Space' });
    fireEvent.keyDown(screen.getByRole('img', { name: 'Seat 2, empty' }), { key: 'Enter' });
    expect(occupant).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('img', { name: 'Seat 1, occupied by Published student one' })).toBeInTheDocument();
  });

  it('retains published loading and retry states', () => {
    vi.mocked(usePublishedSeatingData).mockReturnValue({ ...data, isLoading: true });
    const { rerender } = render(<View />);
    expect(screen.getByLabelText('Loading published seating for room B003')).toBeInTheDocument();
    vi.mocked(usePublishedSeatingData).mockReturnValue({ ...data, error: 'Unable to load published seating.', canRetry: true });
    rerender(<View />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load published seating.');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
