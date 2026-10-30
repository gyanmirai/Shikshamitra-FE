import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import WeeklyLectures from './weeklyLectures';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

const state = vi.hoisted(() => ({
  canAdd: true,
  openCreate: vi.fn(),
  refetch: vi.fn(),
  query: {
    currentData: { items: [] },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: undefined as unknown,
  },
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) =>
    select({
      globalState: { currentMedium: { id: 'medium-one' } },
      auth: { permissions: {} },
    }),
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => state.canAdd }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({ ...state.query, data: state.query.currentData, refetch: state.refetch }),
}));
vi.mock('src/redux/academicAPI/timetableApi/weeklyLecturesApi', () => ({
  useGetWeeklyLectureSlotsQuery: vi.fn(),
}));
vi.mock('src/screens/academic/setup/embedding', () => ({
  AcademicSetupManagerHeader: ({ action }: { action: React.ReactNode }) => <div>{action}</div>,
}));
vi.mock('src/screens/academic/components/AcademicSummaryInsights', () => ({
  TimetableSettingsSummaryCards: () => null,
}));
vi.mock('./hooks/useWeeklyLectureColumns', () => ({ useWeeklyLectureColumns: () => [] }));
vi.mock('./hooks/useWeeklyLecturesDialogs', () => ({
  useWeeklyLecturesDialogs: () => ({
    selected: null,
    formDialog: { value: false },
    viewDialog: { value: false },
    openCreate: state.openCreate,
  }),
}));
vi.mock('./createWeeklyLectures', () => ({ default: () => null }));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    isLoading,
    error,
    onRetry,
    noDataText,
  }: {
    isLoading: boolean;
    error: unknown;
    onRetry: () => void;
    noDataText: React.ReactNode;
  }) => (
    <div>
      {isLoading ? (
        'Loading table'
      ) : error ? (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      ) : (
        noDataText
      )}
    </div>
  ),
}));

describe('Weekly Lectures workspace actions and feedback', () => {
  beforeEach(() => {
    state.canAdd = true;
    state.query = {
      currentData: { items: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: undefined,
    };
    vi.clearAllMocks();
  });

  it('opens the existing creation dialog from the persistent header action', () => {
    render(<WeeklyLectures />);
    fireEvent.click(screen.getByRole('button', { name: 'Weekly Lecture' }));
    expect(state.openCreate).toHaveBeenCalledOnce();
  });

  it('hides both creation actions without Add permission', () => {
    state.canAdd = false;
    render(<WeeklyLectures />);
    expect(
      screen.queryByRole('button', { name: 'Weekly Lecture' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Add Weekly Lectures')).not.toBeInTheDocument();
  });

  it('announces a cached refetch and does not show the empty state', () => {
    state.query.isFetching = true;
    render(<WeeklyLectures />);
    expect(screen.getByRole('progressbar', { name: 'Loading weekly lectures' })).toBeVisible();
    expect(screen.queryByText('Add Weekly Lectures')).not.toBeInTheDocument();
  });

  it('shows a persistent retry action on failure', () => {
    state.query.isError = true;
    state.query.error = { status: 500 };
    render(<WeeklyLectures />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
    expect(screen.queryByText('Add Weekly Lectures')).not.toBeInTheDocument();
  });
});
