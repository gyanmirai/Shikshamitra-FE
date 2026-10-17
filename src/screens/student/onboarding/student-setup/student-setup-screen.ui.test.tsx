import type { ComponentProps } from 'react';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentSetupScreen from './index';
import { useStudentSetupAssignment } from './use-student-setup-assignment';
import { studentOnboardingTestData } from './student-onboarding-test-fixtures';

import type StudentSetupTable from './student-setup-table';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  rows: [] as unknown[],
  dirty: false,
  manualEditing: false,
  casesAvailable: true,
  casesFetching: false,
  casesError: false,
  permissions: [{ name: 'Students.Onboarding.Add', isGranted: true }],
  cancel: vi.fn(),
  clearResults: vi.fn(),
  replace: vi.fn(),
  query: vi.fn(),
  push: vi.fn(),
  options: {
    academicYears: [],
    boards: [{ id: 'board-cbse', name: 'CBSE' }],
    mediums: [{ id: 'medium-cbse-english', name: 'English', parentId: 'board-cbse' }],
    standards: [
      { id: 'grade-6', name: 'Grade 6', parentId: 'medium-cbse-english' },
      { id: 'grade-7', name: 'Grade 7', parentId: 'medium-cbse-english' },
    ],
    divisions: [{ id: 'division-a', name: 'A', parentId: 'grade-6' }],
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  usePathname: () => '/student/onboarding/setup',
  useSearchParams: () => mocks.params,
}));
vi.mock('src/redux/student/onboarding/student-roll-number-batches-api', () => ({
  useGetRollNumberBatchContextQuery: () => ({
    currentData: { unassignedCount: 83, canAssignMissing: true },
    isFetching: false,
    isError: false,
  }),
}));
vi.mock('./student-roll-number-workspace', () => ({
  default: () => <div role="dialog">Roll Number Workspace</div>,
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      globalState: { currentYear: { id: 'year-1' } },
      auth: { permissions: mocks.permissions },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('../onboarding-settings-context', () => ({
  useOnboardingSettings: () => ({ settings: { grNumber: { assignmentMode: 'both' } } }),
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCasesQuery: (args: unknown, options: unknown) => {
    mocks.query(args, options);
    return {
      currentData: mocks.casesAvailable
        ? { items: mocks.rows, totalCount: mocks.rows.length }
        : undefined,
      isLoading: false,
      isFetching: mocks.casesFetching,
      isError: mocks.casesError,
      refetch: vi.fn(),
    };
  },
  useGetStudentOnboardingCaseQuery: () => ({ currentData: undefined }),
  useGetStudentOnboardingFilterOptionsQuery: () => ({
    currentData: mocks.options,
    isLoading: false,
    isFetching: false,
    isError: false,
  }),
  useActivateStudentOnboardingMutation: () => [vi.fn(), { isLoading: false }],
  useRefreshStudentOnboardingReadinessMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('./student-onboarding-model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./student-onboarding-model')>()),
  mapOnboardingCaseToItem: (row: unknown) => row,
}));
vi.mock('./use-student-setup-assignment', () => ({
  useStudentSetupAssignment: vi.fn(({ rows }: { rows: unknown[] }) => ({
    displayedRows: rows,
    busy: false,
    manualEditing: mocks.manualEditing,
    changedCount: 1,
    editableIds: [],
    manualErrors: {},
    manualBlockers: {},
    messages: {},
    results: [],
    needsReason: false,
    eligible: (_mode: string, targets: unknown[]) => targets,
    clearResults: mocks.clearResults,
    startManual: vi.fn(),
    cancel: mocks.cancel,
    runAutomatic: vi.fn(),
    form: {
      dirty: mocks.dirty,
      values: { reason: '', values: {} },
      touched: {},
      errors: {},
      submitCount: 0,
      submitForm: vi.fn(),
      setFieldValue: vi.fn(),
      setFieldTouched: vi.fn(),
    },
  })),
}));
vi.mock('./student-setup-drawer', () => ({
  default: ({ canCancel }: { canCancel: boolean }) => (
    <output data-testid="cancel-onboarding-permission">{String(canCancel)}</output>
  ),
}));
vi.mock('./student-onboarding-operation-dialog', () => ({ default: () => null }));
vi.mock('./student-identifier-lock-controls', () => ({ default: () => null }));
vi.mock('./student-setup-auto-assignment-dialog', () => ({
  default: ({ students, onClose }: { students: Array<{ id: string }>; onClose: () => void }) => (
    <div role="dialog" aria-label="Auto assignment">
      <output data-testid="auto-targets">{students.map((student) => student.id).join(',')}</output>
      <button type="button" onClick={onClose}>
        Close Auto
      </button>
    </div>
  ),
}));
vi.mock('./student-setup-table', () => ({
  default: ({
    showSelection,
    rows,
    selectedStudentIds,
    onToggleSelection,
    onPaginationChange,
    page,
    onColumnFilterChange,
    columnFilters,
    isLoading,
  }: ComponentProps<typeof StudentSetupTable>) => (
    <section
      data-testid="worklist"
      data-selection={String(showSelection)}
      data-page={page}
      data-loading={String(isLoading)}
    >
      <output data-testid="selected-students">{selectedStudentIds.join(',')}</output>
      <output data-testid="column-filters">{JSON.stringify(columnFilters)}</output>
      <button
        type="button"
        onClick={() =>
          onColumnFilterChange([
            { column: 'statusLabel', type: 'equals', value: 'Setup pending', valueType: 'enum' },
          ])
        }
      >
        Filter setup pending
      </button>
      {showSelection &&
        rows.map((row) => (
          <button key={row.id} type="button" onClick={() => onToggleSelection(row.id)}>
            Select {row.id}
          </button>
        ))}
      <button type="button" onClick={() => onPaginationChange(2, 25)}>
        Next page
      </button>
      <button type="button" onClick={() => onPaginationChange(1, 100)}>
        Change page size
      </button>
      <button
        type="button"
        onClick={() =>
          onColumnFilterChange([
            { column: 'ownerName', type: 'contains', value: 'Neha', valueType: 'string' },
          ])
        }
      >
        Filter owner
      </button>
    </section>
  ),
}));

const theme = createTheme(defaultSettings);
const element = (
  <ThemeProvider theme={theme}>
    <StudentSetupScreen />
  </ThemeProvider>
);
const setRoute = (view = 'division', classes = 'grade-6') => {
  mocks.params = new URLSearchParams({ view, board: 'board-cbse', medium: 'medium-cbse-english' });
  if (classes) mocks.params.set('class', classes);
};

describe('Student Setup workspace selection wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permissions = [{ name: 'Students.Onboarding.Add', isGranted: true }];
    mocks.dirty = false;
    mocks.manualEditing = false;
    mocks.casesAvailable = true;
    mocks.casesFetching = false;
    mocks.casesError = false;
    mocks.rows = [
      {
        ...studentOnboardingTestData[0],
        id: 'case-1',
        source: 'onboarding-case',
        backendStatus: 1,
      },
      {
        ...studentOnboardingTestData[0],
        id: 'case-2',
        source: 'onboarding-case',
        backendStatus: 1,
      },
    ];
    setRoute();
    mocks.replace.mockImplementation((href: string) => {
      mocks.params = new URLSearchParams(href.split('?')[1] ?? '');
    });
    mocks.cancel.mockImplementation(() => {
      mocks.dirty = false;
      mocks.manualEditing = false;
    });
  });

  it('maps the simple status label to the existing numeric URL filter', () => {
    setRoute('readiness');
    render(element);
    fireEvent.click(screen.getByRole('button', { name: 'Filter setup pending' }));
    expect(mocks.params.get('status')).toBe('0');
    expect(mocks.params.get('board')).toBe('board-cbse');
    expect(mocks.params.get('class')).toBe('grade-6');
  });

  it.each([
    { action: 'Add', canCancel: true },
    { action: 'Delete', canCancel: false },
    { action: 'View', canCancel: false },
  ])('requires Add/Update for Onboarding cancellation with $action access', ({ action, canCancel }) => {
    mocks.permissions = [{ name: `Students.Onboarding.${action}`, isGranted: true }];
    render(element);
    expect(screen.getByTestId('cancel-onboarding-permission')).toHaveTextContent(String(canCancel));
  });

  it.each([
    ['readiness', 'Setup pending'],
    ['division', 'To Prepare'],
    ['fees', 'To Prepare'],
  ])('keeps status filter chips accurate in %s', (view, label) => {
    setRoute(view);
    mocks.params.set('status', '0');
    render(element);
    expect(JSON.parse(screen.getByTestId('column-filters').textContent!)).toContainEqual(
      expect.objectContaining({ column: 'statusLabel', value: label, displayValue: label })
    );
  });

  it.each([
    ['Class', 'class', 'grade-7'],
    ['Division', 'division', 'division-a'],
    ['table filter', 'ownerName', 'Neha'],
    ['table search', 'search', 'Sharma'],
  ] as const)(
    'changes the controller context for an external %s URL change',
    async (_label, key, value) => {
      mocks.manualEditing = true;
      mocks.dirty = true;
      const { rerender } = render(element);
      const initialKey = vi.mocked(useStudentSetupAssignment).mock.lastCall?.[0].contextKey;
      expect(initialKey).toEqual(expect.any(String));

      const next = new URLSearchParams(mocks.params);
      next.set(key, value);
      mocks.params = next;
      rerender(
        <ThemeProvider theme={theme}>
          <StudentSetupScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        const nextKey = vi.mocked(useStudentSetupAssignment).mock.lastCall?.[0].contextKey;
        expect(nextKey).toEqual(expect.any(String));
        expect(nextKey).not.toBe(initialKey);
      });
    }
  );

  it.each(['Next page', 'Change page size'])(
    'changes the controller context after %s',
    (action) => {
      render(element);
      const initialKey = vi.mocked(useStudentSetupAssignment).mock.lastCall?.[0].contextKey;
      expect(initialKey).toEqual(expect.any(String));
      fireEvent.click(screen.getByRole('button', { name: action }));
      const nextKey = vi.mocked(useStudentSetupAssignment).mock.lastCall?.[0].contextKey;
      expect(nextKey).toEqual(expect.any(String));
      expect(nextKey).not.toBe(initialKey);
    }
  );

  it('shows table loading when current data is missing during a fetch even if isLoading is false', () => {
    mocks.casesAvailable = false;
    mocks.casesFetching = true;
    render(element);

    expect(screen.getByTestId('worklist')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByRole('button', { name: 'Auto' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Manual' })).toBeDisabled();
  });

  it.each(['fetching', 'error'] as const)(
    'disables starting assignments during a read %s with retained rows',
    (state) => {
      mocks.casesFetching = state === 'fetching';
      mocks.casesError = state === 'error';
      render(element);

      expect(screen.getByTestId('worklist')).toHaveAttribute('data-loading', 'false');
      const auto = screen.getByRole('button', { name: 'Auto' });
      expect(auto).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Manual' })).toBeDisabled();
      fireEvent.click(auto);
      expect(mocks.clearResults).not.toHaveBeenCalled();
      expect(screen.queryByTestId('auto-targets')).not.toBeInTheDocument();
    }
  );

  it.each([
    ['division', 'grade-6', true],
    ['division', 'grade-6,grade-7', false],
    ['division', '', false],
    ['readiness', 'grade-6', false],
    ['gr-number', 'grade-6', false],
    ['roll-number', 'grade-6', false],
    ['fees', 'grade-6', false],
    ['credentials', 'grade-6', false],
  ] as const)(
    'shows selection in %s with classes %s only when one Class is selected',
    (view, classes, enabled) => {
      setRoute(view, classes);
      render(element);
      expect(screen.getByTestId('worklist')).toHaveAttribute('data-selection', String(enabled));
    }
  );

  it('limits Auto to selected IDs in the single-Class Division view', () => {
    render(element);
    fireEvent.click(screen.getByRole('button', { name: 'Select case-1' }));
    expect(screen.getByTestId('selected-students')).toHaveTextContent(/^case-1$/);
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(screen.getByTestId('auto-targets')).toHaveTextContent(/^case-1$/);
    expect(mocks.clearResults).toHaveBeenCalledOnce();
  });

  it('shows the Division selection count and clears it without changing the worklist scope', () => {
    render(element);
    fireEvent.click(screen.getByRole('button', { name: 'Select case-1' }));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.getByTestId('selected-students')).toBeEmptyDOMElement();
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('does not replace an unread pending count with zero during assignment loading', () => {
    mocks.casesAvailable = false;
    mocks.casesFetching = true;
    render(element);
    expect(screen.getByLabelText('Loading pending count')).toBeInTheDocument();
    expect(screen.queryByText('0 pending')).not.toBeInTheDocument();
  });

  it('opens the full server roll workspace instead of reusing current-page automatic targets', () => {
    setRoute('roll-number', 'grade-6');
    mocks.params.set('division', 'division-a');
    render(element);
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Roll Number Workspace');
    expect(screen.queryByTestId('auto-targets')).not.toBeInTheDocument();
    expect(mocks.clearResults).not.toHaveBeenCalled();
  });

  it('disables Division Auto when more than one Class is selected', () => {
    setRoute('division', 'grade-6,grade-7');
    render(element);
    expect(screen.getByRole('button', { name: 'Auto' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Select case-1' })).not.toBeInTheDocument();
  });

  it('clears selection on page, column-filter and task-view changes', async () => {
    const { rerender } = render(element);
    fireEvent.click(screen.getByRole('button', { name: 'Select case-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByTestId('worklist')).toHaveAttribute('data-page', '2');
    expect(screen.getByTestId('selected-students')).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'Select case-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Filter owner' }));
    expect(screen.getByTestId('selected-students')).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'Select case-1' }));
    setRoute('gr-number');
    rerender(
      <ThemeProvider theme={theme}>
        <StudentSetupScreen />
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByTestId('selected-students')).toBeEmptyDOMElement());
    expect(screen.getByTestId('worklist')).toHaveAttribute('data-selection', 'false');
    setRoute();
    rerender(
      <ThemeProvider theme={theme}>
        <StudentSetupScreen />
      </ThemeProvider>
    );
    expect(screen.getByTestId('selected-students')).toBeEmptyDOMElement();
  });

  it('clears selection when the real Class filter changes to multiple classes', async () => {
    const user = userEvent.setup();
    render(element);
    fireEvent.click(screen.getByRole('button', { name: 'Select case-1' }));
    await user.click(screen.getByRole('combobox', { name: 'Class' }));
    await user.click(screen.getByRole('option', { name: 'Grade 7' }));
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('selected-students')).toBeEmptyDOMElement();
    expect(screen.getByTestId('worklist')).toHaveAttribute('data-selection', 'false');
  });

  it.each(['division', 'gr-number', 'roll-number', 'fees', 'credentials'])(
    'toggles the %s URL scope, resets pagination and clears selection',
    async (view) => {
      setRoute(view);
      const { rerender } = render(element);
      fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
      if (view === 'division')
        fireEvent.click(screen.getByRole('button', { name: 'Select case-1' }));
      const nextScope = view === 'division' ? 'pending' : 'all';
      fireEvent.click(
        screen.getByRole('button', {
          name: nextScope === 'all' ? 'All Students' : 'Remaining Students',
        })
      );
      expect(mocks.params.get('scope')).toBe(nextScope);
      expect(screen.getByTestId('worklist')).toHaveAttribute('data-page', '1');
      expect(screen.getByTestId('selected-students')).toBeEmptyDOMElement();
      rerender(
        <ThemeProvider theme={theme}>
          <StudentSetupScreen />
        </ThemeProvider>
      );
      fireEvent.click(
        screen.getByRole('button', {
          name: nextScope === 'all' ? 'Remaining Students' : 'All Students',
        })
      );
      expect(mocks.params.get('scope')).toBe(nextScope === 'all' ? 'pending' : 'all');
    }
  );

  it('guards a scope toggle before discarding manual edits', () => {
    mocks.dirty = true;
    mocks.manualEditing = true;
    render(element);
    fireEvent.click(screen.getByRole('button', { name: 'Remaining Students' }));
    expect(screen.getByRole('heading', { name: 'Discard unsaved changes?' })).toBeInTheDocument();
    expect(mocks.params.get('scope')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(mocks.cancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Remaining Students' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(mocks.params.get('scope')).toBe('pending');
    expect(mocks.cancel).toHaveBeenCalledOnce();
  });

  it.each(['division', 'gr-number', 'roll-number', 'fees', 'credentials'])(
    'keeps the %s controls compact without static helper copy',
    (view) => {
      setRoute(view, '');
      render(element);
      expect(screen.queryByText(/Choose one Class to use checkboxes/)).not.toBeInTheDocument();
      expect(screen.queryByText(/eligible for Auto/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Open a student using Review/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Choose one Division to lock/)).not.toBeInTheDocument();
      expect(screen.queryByText('Automatic + manual')).not.toBeInTheDocument();
    }
  );

  it.each([
    'unfinished',
    'attention',
    'ready',
    'documents',
    'credentials',
    'division',
    'gr-number',
    'roll-number',
  ])('preserves the %s dashboard queue without default narrowing', (queue) => {
    mocks.params = new URLSearchParams(`dashboard=${queue}&year=year-2`);
    render(element);
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({ academicYearId: 'year-2', dashboardQueue: queue }),
      expect.objectContaining({ skip: false })
    );
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('uses the real unsaved-navigation guard before abandoning manual edits', () => {
    mocks.dirty = true;
    mocks.manualEditing = true;
    render(element);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByRole('heading', { name: 'Discard unsaved changes?' })).toBeInTheDocument();
    expect(screen.getByTestId('worklist')).toHaveAttribute('data-page', '1');
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByTestId('worklist')).toHaveAttribute('data-page', '1');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(screen.getByTestId('worklist')).toHaveAttribute('data-page', '2');
    expect(mocks.cancel).toHaveBeenCalledOnce();
  });
});
