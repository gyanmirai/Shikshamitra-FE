import { screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

// ── Imports after mocks ───────────────────────────────────────────────────────

import { renderWithProviders } from 'src/test/test-utils';
import { useGetHomeworksQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';
import MyHomeworkSubmission from 'src/screens/academic/homework-assignment-management/mySubmission/myHomeworkSubmission';

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api', () => ({
  useGetHomeworksQuery: vi.fn(),
}));

// CustomizableTable stub – renders rows with a data-testid per row
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, isLoading }: { data: any[]; isLoading: boolean }) => (
    <div data-testid="table" data-loading={String(isLoading)}>
      {(data ?? []).map((row: any) => (
        <div key={row.id} data-testid="table-row">
          {row.title}
        </div>
      ))}
    </div>
  ),
}));

// DatePicker stub – renders a plain input so tests can assert its presence
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, value, onChange }: any) => (
    <input
      data-testid="date-picker"
      aria-label={label}
      defaultValue={value?.format?.('YYYY-MM-DD') ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

// CustomDialog – only renders children when open (mirrors MUI Dialog default behaviour)
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
}));

// CustomTooltip – transparent wrapper
vi.mock('src/components/custom-tooltip', () => ({
  default: ({ children }: any) => <>{children}</>,
}));

// Dialog child components – not rendered on initial load (dialogs are closed) but
// their modules are imported so we stub them to avoid complex peer dependencies.
vi.mock(
  'src/screens/academic/homework-assignment-management/homeworkCreation/component/assignGradeForm',
  () => ({ default: () => <div>AssignGrade</div> })
);
vi.mock(
  'src/screens/academic/homework-assignment-management/mySubmission/homeworkSubmission/submitHomeworkFile',
  () => ({ SubmitHomeworkFile: () => <div>SubmitFile</div> })
);
vi.mock(
  'src/screens/academic/homework-assignment-management/homeworkCreation/component/assignMarksForText',
  () => ({ default: () => <div>AssignMarks</div> })
);
vi.mock(
  'src/screens/academic/homework-assignment-management/mySubmission/homeworkSubmission/submitHomeworkContent',
  () => ({ SubmitHomeworkContent: () => <div>SubmitContent</div> })
);
vi.mock(
  'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails',
  () => ({ default: () => <div>ViewDetails</div> })
);

const mockQuery = useGetHomeworksQuery as ReturnType<typeof vi.fn>;

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** submissionStatus 0 = Pending (ScheduleExamStatus.Pending) */
const PENDING_ITEM = {
  id: 'hw-1',
  title: 'Algebra Worksheet',
  subjectName: 'Mathematics',
  teacherName: 'Mr. Singh',
  homeworkType: 'Regular',
  startDate: '2025-05-01',
  dueDate: '2025-05-10',
  submissionType: 0,
  submissionStatus: 0,
  feedback: '',
};

/** submissionStatus 3 = Submitted (ScheduleExamStatus.Submitted) */
const SUBMITTED_ITEM = {
  id: 'hw-2',
  title: 'Essay on Forests',
  subjectName: 'Science',
  teacherName: 'Ms. Patel',
  homeworkType: 'Regular',
  startDate: '2025-05-03',
  dueDate: '2025-05-12',
  submissionType: 1,
  submissionStatus: 3,
  feedback: 'Good work',
};

describe('MyHomeworkSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockReturnValue({
      data: { items: [PENDING_ITEM, SUBMITTED_ITEM] },
      isLoading: false,
    });
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  it('renders the date picker on initial load', () => {
    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  it('renders the homework table on initial load', () => {
    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  // ── API call ──────────────────────────────────────────────────────────────────

  it('calls useGetHomeworksQuery with the current medium id from Redux', () => {
    renderWithProviders(<MyHomeworkSubmission />);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({ academicMediumId: 'medium-1' }),
      expect.anything()
    );
  });

  it('skips the query when currentMedium is null', () => {
    renderWithProviders(<MyHomeworkSubmission />, {
      preloadedState: {
        globalState: { currentMedium: null, currentYear: {}, currentBoard: {} },
        confirmPopup: { isChanges: false },
      },
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
  });

  // ── Loading state ─────────────────────────────────────────────────────────────

  it('passes isLoading=true to the table while fetching', () => {
    mockQuery.mockReturnValue({ data: undefined, isLoading: true });

    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.getByTestId('table').dataset.loading).toBe('true');
  });

  it('passes isLoading=false to the table when data is ready', () => {
    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.getByTestId('table').dataset.loading).toBe('false');
  });

  // ── Client-side tab filtering ─────────────────────────────────────────────────

  it('shows only Pending items (submissionStatus=0) by default', () => {
    renderWithProviders(<MyHomeworkSubmission />);

    const rows = screen.getAllByTestId('table-row');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('Algebra Worksheet');
  });

  it('does NOT show Submitted items on the Pending tab', () => {
    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.queryByText('Essay on Forests')).not.toBeInTheDocument();
  });

  // ── Data mapping ──────────────────────────────────────────────────────────────

  it('maps API title field to table row title', () => {
    mockQuery.mockReturnValue({
      data: {
        items: [{ ...PENDING_ITEM, title: 'Custom Homework Title', submissionStatus: 0 }],
      },
      isLoading: false,
    });

    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.getByText('Custom Homework Title')).toBeInTheDocument();
  });

  it('falls back to data.data shape (alternative API response)', () => {
    mockQuery.mockReturnValue({
      data: {
        data: [{ ...PENDING_ITEM, title: 'Alt Shape HW', submissionStatus: 0 }],
      },
      isLoading: false,
    });

    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.getByText('Alt Shape HW')).toBeInTheDocument();
  });

  it('shows empty table when API returns empty items', () => {
    mockQuery.mockReturnValue({ data: { items: [] }, isLoading: false });

    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.queryAllByTestId('table-row')).toHaveLength(0);
  });

  // ── No dialogs on initial load ────────────────────────────────────────────────

  it('does not render any dialog on initial load', () => {
    renderWithProviders(<MyHomeworkSubmission />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
