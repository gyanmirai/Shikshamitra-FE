import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, renderHook } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';

const mocks = vi.hoisted(() => ({
  query: 'board=board-1&medium=medium-1&class=class-1&search=ada',
  replace: vi.fn(),
  hierarchyPending: false,
  hierarchyError: false,
  hierarchyEmpty: false,
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ globalState: { currentYear: { id: 'year-1' } } }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/student/admissions/pipeline',
  useSearchParams: () => new URLSearchParams(mocks.query),
}));

vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => ({
    currentData: mocks.hierarchyPending
      ? undefined
      : {
          items: [
            {
              id: 'stage-1',
              label: 'Primary',
              boardId: 'board-1',
              boardName: 'CBSE',
              mediumId: 'medium-1',
              mediumName: 'English',
            },
          ].filter(() => !mocks.hierarchyEmpty),
        },
    isFetching: false,
    isError: mocks.hierarchyError,
    refetch: vi.fn(),
  }),
}));

vi.mock('src/redux/class/classApi', () => ({
  useGetClassByMediumQuery: () => ({
    currentData: [{ id: 'class-1', name: 'Class 1', educationMediumStageId: 'stage-1' }],
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe('admission academic filters', () => {
  beforeEach(() => {
    mocks.replace.mockClear();
    mocks.hierarchyPending = false;
    mocks.hierarchyError = false;
    mocks.hierarchyEmpty = false;
    mocks.query = 'board=board-1&medium=medium-1&class=class-1&search=ada';
  });

  it('uses the global year and clears dependent filters when the board changes', () => {
    const { result } = renderHook(() => useAdmissionAcademicFilters());

    expect(result.current.academicYearId).toBe('year-1');
    act(() => result.current.update('board', 'board-2'));

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?board=board-2&search=ada',
      { scroll: false }
    );
  });

  it('keeps lists loading until the hierarchy and default Board/Medium are resolved', () => {
    mocks.hierarchyPending = true;
    const onLoadingChange = vi.fn();
    const onChange = vi.fn();
    const filters = (boardId = '', mediumId = '') => (
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionAcademicFilters
          boardId={boardId}
          mediumId={mediumId}
          standardId=""
          onChange={onChange}
          onLoadingChange={onLoadingChange}
        />
      </ThemeProvider>
    );
    const view = render(filters());
    expect(onLoadingChange).toHaveBeenLastCalledWith(true);
    mocks.hierarchyPending = false;
    view.rerender(filters());
    expect(onChange).toHaveBeenLastCalledWith('board', 'board-1');
    expect(onLoadingChange).toHaveBeenLastCalledWith(true);
    view.rerender(filters('board-1'));
    expect(onChange).toHaveBeenLastCalledWith('medium', 'medium-1');
    expect(onLoadingChange).toHaveBeenLastCalledWith(true);
    view.rerender(filters('board-1', 'medium-1'));
    expect(onLoadingChange).toHaveBeenLastCalledWith(false);
  });

  it.each(['error', 'empty'] as const)(
    'does not leave lists loading for an %s hierarchy',
    (state) => {
      mocks.hierarchyError = state === 'error';
      mocks.hierarchyPending = state === 'error';
      mocks.hierarchyEmpty = state === 'empty';
      const onLoadingChange = vi.fn();
      render(
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <AdmissionAcademicFilters
            boardId=""
            mediumId=""
            standardId=""
            onChange={vi.fn()}
            onLoadingChange={onLoadingChange}
          />
        </ThemeProvider>
      );
      expect(onLoadingChange).toHaveBeenLastCalledWith(false);
    }
  );

  it('restores an explicit dashboard year and leaves all boards and mediums selected', () => {
    mocks.query = 'dashboard=active-applications&year=year-2&division=division-a';
    const { result } = renderHook(() => useAdmissionAcademicFilters());
    expect(result.current).toMatchObject({
      academicYearId: 'year-2',
      dashboardScope: true,
      boardId: '',
      mediumId: '',
    });
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionAcademicFilters boardId="" mediumId="" standardId="" onChange={onChange} />
      </ThemeProvider>
    );
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current.update('board', 'board-1'));
    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?dashboard=active-applications&year=year-2&board=board-1',
      { scroll: false }
    );
  });

  it('keeps the all-applicants hierarchy when explicitly enabled', () => {
    mocks.query = '';
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionAcademicFilters
          allowAllHierarchy
          boardId=""
          mediumId=""
          standardId=""
          onChange={onChange}
        />
      </ThemeProvider>
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('All boards')).toBeInTheDocument();
  });

  it('retains the default hierarchy selection for other admissions screens', () => {
    mocks.query = '';
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionAcademicFilters boardId="" mediumId="" standardId="" onChange={onChange} />
      </ThemeProvider>
    );
    expect(onChange).toHaveBeenCalledWith('board', 'board-1');
  });

  it('clears the class with its medium and preserves unrelated search', () => {
    const { result } = renderHook(() => useAdmissionAcademicFilters());

    act(() => result.current.update('medium', '__all__'));

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?board=board-1&search=ada',
      { scroll: false }
    );
  });

  it('clears classes while keeping a single Board and Medium and the table search', () => {
    const { result } = renderHook(() => useAdmissionAcademicFilters());

    act(() => result.current.clear());

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?board=board-1&medium=medium-1&search=ada',
      { scroll: false }
    );
  });

  it('places an optional Filters action after Board, Medium and Class', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionAcademicFilters
          boardId="board-1"
          mediumId="medium-1"
          standardId="class-1"
          onChange={vi.fn()}
          filterAction={<button type="button">Filters</button>}
        />
      </ThemeProvider>
    );

    expect(screen.getByRole('combobox', { name: 'Board' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Medium' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Class' })).toBeVisible();
    expect(
      screen
        .getByRole('combobox', { name: 'Class' })
        .compareDocumentPosition(screen.getByRole('button', { name: 'Filters' }))
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('disables academic scope changes and Clear while a bulk command is running', () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionAcademicFilters
          boardId="unavailable-board"
          mediumId="medium-1"
          standardId="class-1"
          onChange={onChange}
          onClear={vi.fn()}
          disabled
        />
      </ThemeProvider>
    );

    ['Board', 'Medium', 'Class'].forEach((name) => {
      expect(screen.getByRole('combobox', { name })).toHaveAttribute('aria-disabled', 'true');
    });
    expect(screen.getByRole('button', { name: 'Clear academic filters' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
