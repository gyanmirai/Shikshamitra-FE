import { screen, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

// ── Imports after mocks ───────────────────────────────────────────────────────

import { renderWithProviders } from 'src/test/test-utils';
import { useGetHomeworksQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';
import { useGetAssignmentsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';
import HomeworkAssignmentCards from 'src/screens/academic/homework-assignment-management/dashboard/component/homeworkAssignmentCards';

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api', () => ({
  useGetHomeworksQuery: vi.fn(),
}));

vi.mock('src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api', () => ({
  useGetAssignmentsQuery: vi.fn(),
}));

// Lightweight table stub: renders data-testid per row using the title field present
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, isLoading }: { data: any[]; isLoading: boolean }) => (
    <div data-testid="table" data-loading={String(isLoading)}>
      {(data ?? []).map((row: any, i: number) => (
        <div key={i} data-testid="table-row">
          {row.homeworkTitle ?? row.assignmentTitle ?? ''}
        </div>
      ))}
    </div>
  ),
}));

// Iconify renders as a span to avoid SVG complexity in tests
vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

vi.mock('src/components/three-dots-actions', () => ({
  default: () => <button type="button">actions</button>,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_HOMEWORKS = [
  {
    id: 'hw-1',
    title: 'Algebra Worksheet',
    startDate: '2025-05-01',
    dueDate: '2025-05-10',
    pendingStudents: 5,
  },
  {
    id: 'hw-2',
    title: 'Chemistry Lab Report',
    startDate: '2025-05-02',
    dueDate: '2025-05-11',
    pendingStudents: 3,
  },
];

const MOCK_ASSIGNMENTS = [
  {
    id: 'as-1',
    title: 'Essay on Climate',
    startDate: '2025-05-01',
    dueDate: '2025-05-15',
    pendingStudents: 7,
  },
];

const mockHomeworkQuery = useGetHomeworksQuery as ReturnType<typeof vi.fn>;
const mockAssignmentQuery = useGetAssignmentsQuery as ReturnType<typeof vi.fn>;

describe('HomeworkAssignmentCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHomeworkQuery.mockReturnValue({ data: { items: MOCK_HOMEWORKS }, isLoading: false });
    mockAssignmentQuery.mockReturnValue({ data: { items: MOCK_ASSIGNMENTS }, isLoading: false });
  });

  // ── Default view (assignment) ─────────────────────────────────────────────────

  it('shows the assignment table and heading by default', () => {
    renderWithProviders(<HomeworkAssignmentCards />);

    expect(screen.getByText('Pending Assignment Submission')).toBeInTheDocument();
    expect(screen.getByText('Essay on Climate')).toBeInTheDocument();
    // Homework rows should NOT be visible
    expect(screen.queryByText('Algebra Worksheet')).not.toBeInTheDocument();
  });

  // ── Toggle to homework view ───────────────────────────────────────────────────

  it('switches to homework table when Homework toggle is clicked', () => {
    renderWithProviders(<HomeworkAssignmentCards />);

    fireEvent.click(screen.getByRole('button', { name: /homework/i }));

    expect(screen.getByText('Pending Homework Submission')).toBeInTheDocument();
    expect(screen.getByText('Algebra Worksheet')).toBeInTheDocument();
    expect(screen.getByText('Chemistry Lab Report')).toBeInTheDocument();
    expect(screen.queryByText('Essay on Climate')).not.toBeInTheDocument();
  });

  it('switches back to assignment table when Assignment toggle is clicked after Homework', () => {
    renderWithProviders(<HomeworkAssignmentCards />);

    fireEvent.click(screen.getByRole('button', { name: /homework/i }));
    fireEvent.click(screen.getByRole('button', { name: /assignment/i }));

    expect(screen.getByText('Pending Assignment Submission')).toBeInTheDocument();
    expect(screen.getByText('Essay on Climate')).toBeInTheDocument();
  });

  // ── Query parameter forwarding ───────────────────────────────────────────────

  it('forwards standardId, divisionId, subjectId to both queries', () => {
    renderWithProviders(
      <HomeworkAssignmentCards standardId="std-1" divisionId="div-2" subjectId="sub-3" />
    );

    const expected = expect.objectContaining({
      StandardId: 'std-1',
      DivisionId: 'div-2',
      SubjectId: 'sub-3',
    });

    expect(mockHomeworkQuery).toHaveBeenCalledWith(expected, expect.anything());
    expect(mockAssignmentQuery).toHaveBeenCalledWith(expected, expect.anything());
  });

  it('passes academicMediumId from Redux globalState to both queries', () => {
    renderWithProviders(<HomeworkAssignmentCards />);

    const expected = expect.objectContaining({ academicMediumId: 'medium-1' });

    expect(mockHomeworkQuery).toHaveBeenCalledWith(expected, expect.anything());
    expect(mockAssignmentQuery).toHaveBeenCalledWith(expected, expect.anything());
  });

  // ── Skip when no medium ───────────────────────────────────────────────────────

  it('skips both queries when currentMedium is null', () => {
    renderWithProviders(<HomeworkAssignmentCards />, {
      preloadedState: {
        globalState: { currentMedium: null, currentYear: {}, currentBoard: {} },
        confirmPopup: { isChanges: false },
      },
    });

    const skipOpts = expect.objectContaining({ skip: true });

    expect(mockHomeworkQuery).toHaveBeenCalledWith(expect.anything(), skipOpts);
    expect(mockAssignmentQuery).toHaveBeenCalledWith(expect.anything(), skipOpts);
  });

  // ── Loading states ────────────────────────────────────────────────────────────

  it('shows loading=true on assignment table while assignmentData is loading', () => {
    mockAssignmentQuery.mockReturnValue({ data: undefined, isLoading: true });

    renderWithProviders(<HomeworkAssignmentCards />);

    expect(screen.getByTestId('table').dataset.loading).toBe('true');
  });

  it('shows loading=true on homework table while homeworkData is loading', () => {
    mockHomeworkQuery.mockReturnValue({ data: undefined, isLoading: true });

    renderWithProviders(<HomeworkAssignmentCards />);
    fireEvent.click(screen.getByRole('button', { name: /homework/i }));

    expect(screen.getByTestId('table').dataset.loading).toBe('true');
  });

  // ── Empty data ────────────────────────────────────────────────────────────────

  it('renders no rows when both APIs return empty arrays', () => {
    mockHomeworkQuery.mockReturnValue({ data: { items: [] }, isLoading: false });
    mockAssignmentQuery.mockReturnValue({ data: { items: [] }, isLoading: false });

    renderWithProviders(<HomeworkAssignmentCards />);

    expect(screen.queryAllByTestId('table-row')).toHaveLength(0);
  });

  // ── Data transformation ───────────────────────────────────────────────────────

  it('maps items from data.items (API shape)', () => {
    // The component tries data?.data ?? data?.items ?? []
    mockAssignmentQuery.mockReturnValue({
      data: {
        items: [
          {
            id: 'a1',
            title: 'History Project',
            startDate: '2025-05-01',
            dueDate: '2025-05-20',
            pendingStudents: 2,
          },
        ],
      },
      isLoading: false,
    });

    renderWithProviders(<HomeworkAssignmentCards />);

    expect(screen.getByText('History Project')).toBeInTheDocument();
  });

  it('maps items from data.data (alternative API shape)', () => {
    mockAssignmentQuery.mockReturnValue({
      data: {
        data: [
          {
            id: 'a1',
            title: 'Science Fair',
            startDate: '2025-05-01',
            dueDate: '2025-05-20',
            pendingStudents: 1,
          },
        ],
      },
      isLoading: false,
    });

    renderWithProviders(<HomeworkAssignmentCards />);

    expect(screen.getByText('Science Fair')).toBeInTheDocument();
  });
});
