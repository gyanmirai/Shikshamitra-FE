import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// ── Imports after mocks ───────────────────────────────────────────────────────

import AcademicTimetable from 'src/components/studentProfile/academicTimetable';
import { useGetTimetableByStandardDivisionQuery } from 'src/redux/academicAPI/timetableApi/timetableManagementApi';

// AcademicTimetable uses dayjs(t, 'HH:mm') which requires customParseFormat.
// The plugin is normally extended globally in the Next.js app entry point,
// so we must extend it here for the isolated test environment.
dayjs.extend(customParseFormat);

// ── Module mocks (hoisted before imports) ────────────────────────────────────

vi.mock('src/redux/academicAPI/timetableApi/timetableManagementApi', () => ({
  useGetTimetableByStandardDivisionQuery: vi.fn(),
}));

// Lightweight stub for TimeTableView – only renders slot counts and time labels
vi.mock(
  'src/screens/academic/timetable-schedule-management/timeTable/component/timeTableView',
  () => ({
    default: ({
      timeTableData,
    }: {
      timeTableData: Array<{ startTime: string; endTime: string }>;
    }) => (
      <div data-testid="timetable-view" data-slot-count={String(timeTableData.length)}>
        {timeTableData.map((slot, i) => (
          <div key={i} data-testid={`slot-${i}`}>
            {slot.startTime}–{slot.endTime}
          </div>
        ))}
      </div>
    ),
  })
);

const mockQuery = useGetTimetableByStandardDivisionQuery as ReturnType<typeof vi.fn>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeTimetableResponse = (
  days: Record<string, { startTime: string; endTime: string; type?: number; subjects?: any[] }[]>
) => ({
  data: { timetable: days },
  isLoading: false,
});

describe('AcademicTimetable', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Loading state ────────────────────────────────────────────────────────────

  it('renders CircularProgress while loading', () => {
    mockQuery.mockReturnValue({ data: undefined, isLoading: true });

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('timetable-view')).not.toBeInTheDocument();
  });

  // ── Skip logic ────────────────────────────────────────────────────────────────

  it('skips API call when standardId is missing', () => {
    mockQuery.mockReturnValue({ data: undefined, isLoading: false });

    render(<AcademicTimetable divisionId="d1" />);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
  });

  it('skips API call when divisionId is missing', () => {
    mockQuery.mockReturnValue({ data: undefined, isLoading: false });

    render(<AcademicTimetable standardId="s1" />);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
  });

  it('does NOT skip when both standardId and divisionId are provided', () => {
    mockQuery.mockReturnValue({ data: undefined, isLoading: false });

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({ standardId: 's1', divisionId: 'd1' }),
      expect.objectContaining({ skip: false })
    );
  });

  // ── Data display ──────────────────────────────────────────────────────────────

  it('renders TimeTableView once data is loaded', () => {
    mockQuery.mockReturnValue(
      makeTimetableResponse({
        Monday: [
          {
            startTime: '08:00',
            endTime: '08:40',
            type: 0,
            subjects: [{ subjectName: 'Math', teacherName: 'Mr. A' }],
          },
        ],
      })
    );

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByTestId('timetable-view')).toBeInTheDocument();
  });

  it('renders empty timetable (0 slots) when API returns null', () => {
    mockQuery.mockReturnValue({ data: null, isLoading: false });

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    const view = screen.getByTestId('timetable-view');
    expect(view.dataset.slotCount).toBe('0');
  });

  // ── transformToSlots logic ────────────────────────────────────────────────────

  it('groups the same time slot from multiple days into a single TimetableSlot', () => {
    mockQuery.mockReturnValue(
      makeTimetableResponse({
        Monday: [
          { startTime: '09:00', endTime: '09:40', type: 0, subjects: [{ subjectName: 'Math' }] },
        ],
        Tuesday: [
          { startTime: '09:00', endTime: '09:40', type: 0, subjects: [{ subjectName: 'Science' }] },
        ],
        Wednesday: [
          { startTime: '09:00', endTime: '09:40', type: 0, subjects: [{ subjectName: 'English' }] },
        ],
      })
    );

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    // All 3 days share the same time key → 1 merged TimetableSlot
    expect(screen.getByTestId('timetable-view').dataset.slotCount).toBe('1');
  });

  it('creates separate TimetableSlots for different time keys', () => {
    mockQuery.mockReturnValue(
      makeTimetableResponse({
        Monday: [
          { startTime: '08:00', endTime: '08:40', type: 0, subjects: [{ subjectName: 'Math' }] },
          { startTime: '09:00', endTime: '09:40', type: 0, subjects: [{ subjectName: 'Science' }] },
        ],
      })
    );

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    expect(screen.getByTestId('timetable-view').dataset.slotCount).toBe('2');
  });

  it('formats 24-hour API times to 12-hour AM/PM', () => {
    mockQuery.mockReturnValue(
      makeTimetableResponse({
        Monday: [
          { startTime: '08:00', endTime: '08:40', type: 0, subjects: [{ subjectName: 'Math' }] },
        ],
      })
    );

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    expect(screen.getByText('08:00 AM–08:40 AM')).toBeInTheDocument();
  });

  it('formats afternoon times correctly (13:00 → 01:00 PM)', () => {
    mockQuery.mockReturnValue(
      makeTimetableResponse({
        Monday: [
          { startTime: '13:00', endTime: '13:40', type: 0, subjects: [{ subjectName: 'History' }] },
        ],
      })
    );

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    expect(screen.getByText('01:00 PM–01:40 PM')).toBeInTheDocument();
  });

  it('marks type=1 entries as break slots (dayData remains empty)', () => {
    mockQuery.mockReturnValue(
      makeTimetableResponse({
        Monday: [{ startTime: '10:00', endTime: '10:30', type: 1, subjects: [] }],
      })
    );

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    // Break creates 1 TimetableSlot but adds no dayData entries
    const view = screen.getByTestId('timetable-view');
    expect(view.dataset.slotCount).toBe('1');
  });

  it('sorts slots in chronological order', () => {
    mockQuery.mockReturnValue(
      makeTimetableResponse({
        Monday: [
          { startTime: '11:00', endTime: '11:40', type: 0, subjects: [{ subjectName: 'Art' }] },
          { startTime: '08:00', endTime: '08:40', type: 0, subjects: [{ subjectName: 'Math' }] },
          { startTime: '09:30', endTime: '10:10', type: 0, subjects: [{ subjectName: 'English' }] },
        ],
      })
    );

    render(<AcademicTimetable standardId="s1" divisionId="d1" />);

    const slots = screen.getAllByTestId(/^slot-/);
    // First slot should be 08:00 AM, last should be 11:00 AM
    expect(slots[0]).toHaveTextContent('08:00 AM');
    expect(slots[slots.length - 1]).toHaveTextContent('11:00 AM');
  });
});
