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
    currentData: {
      items: [
        {
          id: 'stage-1',
          label: 'Primary',
          boardId: 'board-1',
          boardName: 'CBSE',
          mediumId: 'medium-1',
          mediumName: 'English',
        },
      ],
    },
    isFetching: false,
    isError: false,
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
