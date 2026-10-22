import type { ComponentProps } from 'react';
import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import CustomizableTable from 'src/components/customizabaleTable';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import StudentSetupTable from './student-setup-table';
import { studentOnboardingTestData } from './student-onboarding-test-fixtures';

import type { StudentSetupView } from './student-setup-view';
import type { StudentOnboardingItem, OnboardingChecklistItem } from './student-onboarding-model';

const placements = vi.hoisted(() => ({
  query: vi.fn(),
  refetch: vi.fn(),
  isFetching: false,
  isError: false,
  options: [
    {
      id: 'division-a',
      name: 'A',
      capacity: 30,
      activeEnrollments: 28,
      liveReservations: 0,
      availableSeats: 2,
      isFull: false,
    },
    {
      id: 'division-b',
      name: 'B',
      capacity: 30,
      activeEnrollments: 0,
      liveReservations: 0,
      availableSeats: 30,
      isFull: false,
    },
    {
      id: 'division-full',
      name: 'Full section',
      capacity: 30,
      activeEnrollments: 30,
      liveReservations: 0,
      availableSeats: 0,
      isFull: true,
    },
    {
      id: 'e0170000-0111-0222-8333-044455556666',
      name: 'Current division',
      capacity: 30,
      activeEnrollments: 28,
      liveReservations: 0,
      availableSeats: 2,
      isFull: false,
    },
  ],
}));

vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingPlacementOptionsQuery: (caseId: string, options: unknown) => {
    placements.query(caseId, options);
    return {
      currentData: placements.options,
      isFetching: placements.isFetching,
      isError: placements.isError,
      refetch: placements.refetch,
    };
  },
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (state: unknown) => unknown) =>
    select({ confirmPopup: { isChanges: false } }),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: vi.fn(
    ({
      columns,
      data,
      tableTitle,
      errorContent,
      noDataText,
      rowProps,
    }: ICustomizableTableProps) => (
      <table aria-label={String(tableTitle)}>
        <thead>
          <tr>
            {columns
              .filter((column) => !column.defaultHidden)
              .map((column) => (
                <th key={column.id}>{column.renderColumn?.(column) ?? column.label}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {errorContent ? (
            <tr>
              <td colSpan={columns.length}>{errorContent}</td>
            </tr>
          ) : data.length ? (
            data.map((row, index) => (
              <tr key={String(row.id)} {...rowProps?.(row, index)}>
                {columns
                  .filter((column) => !column.defaultHidden)
                  .map((column) => (
                    <td key={column.id}>
                      {column.render?.(row[column.id], row) ?? String(row[column.id] ?? '')}
                    </td>
                  ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>{noDataText}</td>
            </tr>
          )}
        </tbody>
      </table>
    )
  ),
}));

const theme = createTheme(defaultSettings);
const student = {
  ...studentOnboardingTestData[0],
  id: 'case-1',
  source: 'onboarding-case' as const,
  backendStatus: 1 as const,
};
const views: StudentSetupView[] = [
  'readiness',
  'gr-number',
  'roll-number',
  'division',
  'fees',
  'credentials',
];

const props = (view: StudentSetupView = 'readiness'): ComponentProps<typeof StudentSetupTable> => ({
  rows: [student],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
  view,
  taskScope: 'all',
  tableId: `student-setup-${view}-test`,
  tableTitle: 'Student Setup',
  noDataText: 'No students match the selected filters.',
  onOpen: vi.fn(),
  onOpenTask: vi.fn(),
  selectedStudentIds: [],
  onToggleSelection: vi.fn(),
  allStudentsSelected: false,
  someStudentsSelected: false,
  onToggleAll: vi.fn(),
  totalCount: 1,
  page: 1,
  rowsPerPage: 10,
  searchTerm: '',
  onPaginationChange: vi.fn(),
  onSearchChange: vi.fn(),
  columnFilters: [],
  onColumnFilterChange: vi.fn(),
  sorts: [],
  onSortChange: vi.fn(),
  placementOptions: [],
  isServerBacked: true,
});

const tableElement = (input: ComponentProps<typeof StudentSetupTable>) => (
  <ThemeProvider theme={theme}>
    <StudentSetupTable {...input} />
  </ThemeProvider>
);

const pendingCheck = (key: string, label = key): OnboardingChecklistItem => ({
  key,
  label,
  detail: '',
  status: 'pending',
  blocking: true,
  owner: 'Student onboarding',
});

describe('Student Setup table task interactions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    placements.isFetching = false;
    placements.isError = false;
  });

  it('gives the mobile table a practical height while preserving the desktop flex chain', () => {
    render(tableElement(props('readiness')));
    const tableProps = vi.mocked(CustomizableTable).mock.lastCall?.[0];

    expect(tableProps?.wrapperProps?.sx).toEqual({
      minWidth: 0,
      minHeight: { xs: 360, md: 0 },
      flex: 1,
    });
    expect(tableProps?.tableContainerProps?.sx).toEqual({
      minWidth: 0,
      minHeight: 0,
      height: 1,
    });
  });

  it.each(views)('does not show selection by default in %s', (view) => {
    render(tableElement(props(view)));
    expect(screen.queryByRole('checkbox', { name: /^Select/ })).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', {
        name:
          view === 'readiness'
            ? `Review documents for ${student.studentName}`
            : `Review ${student.studentName}`,
      })
    ).toHaveLength(1);
  });

  it('shows five readable columns by default while retaining optional information and filters', () => {
    render(tableElement(props()));
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Student',
      'Class & Division',
      'Pending work',
      'Status',
      'Action',
    ]);
    expect(screen.getByText(student.applicationNumber)).toBeInTheDocument();
    expect(screen.getByText('Documents need checking')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    const tableProps = vi.mocked(CustomizableTable).mock.lastCall?.[0];
    expect(
      tableProps?.columns.filter((column) => column.defaultHidden).map((column) => column.id)
    ).toEqual(['admissionRoute', 'identifiers', 'accounts']);
    expect(tableProps?.columns.find((column) => column.id === 'ownerName')).toBeUndefined();
    expect(tableProps?.columns.find((column) => column.id === 'pendingWork')).toMatchObject({
      isFilter: false,
      isSort: false,
    });
    expect(tableProps?.columns.find((column) => column.id === 'actions')).toMatchObject({
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
    });
    expect(tableProps?.columns.find((column) => column.id === 'statusLabel')).toMatchObject({
      sticky: true,
      stickyPosition: 'right',
      filterType: 'enum',
    });
  });

  it.each([
    ['documents', 'Review documents', 'readiness'],
    ['roll_number', 'Assign roll no.', 'roll-number'],
    ['gr_number', 'Assign GR no.', 'gr-number'],
    ['placement', 'Assign division', 'division'],
    ['accounts', 'Open App Login', 'credentials'],
    ['fee_structure', 'Open Fees', 'fees'],
    ['finance_accounts_services', 'Open Fees', 'fees'],
  ] as const)('opens the existing %s task from its labeled action', (key, action, view) => {
    const input = {
      ...props(),
      rows: [{ ...student, divisionId: null, readinessItems: [pendingCheck(key)] }],
    };
    render(tableElement(input));
    fireEvent.click(screen.getByRole('button', { name: `${action} for ${student.studentName}` }));
    expect(input.onOpenTask).toHaveBeenCalledExactlyOnceWith(student.id, view);
    expect(input.onOpen).not.toHaveBeenCalled();
  });

  it('opens the existing review for ready students without activating from the table', () => {
    const input = {
      ...props(),
      rows: [{ ...student, status: 'ready-to-activate' as const, readinessItems: [] }],
    };
    render(tableElement(input));
    expect(screen.getByText('Ready for activation review')).toBeVisible();
    expect(screen.getByText('Ready to activate')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: `Review & activate for ${student.studentName}` })
    );
    expect(input.onOpen).toHaveBeenCalledExactlyOnceWith(student.id);
    expect(input.onOpenTask).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /^Activate Student$/ })).not.toBeInTheDocument();
  });

  it('does not suggest activation for already enrolled students with a stale ready status', () => {
    const input = {
      ...props(),
      rows: [
        {
          ...student,
          status: 'ready-to-activate' as const,
          studentEnrollmentId: 'enrollment-1',
          readinessItems: [],
        },
      ],
    };
    render(tableElement(input));
    expect(screen.queryByRole('button', { name: /Review & activate/ })).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: `Check completion for ${student.studentName}` })
    );
    expect(input.onOpen).toHaveBeenCalledExactlyOnceWith(student.id);
  });

  it.each([
    ['provisioning', 'Finishing setup', 'Completion check pending', 'Check completion'],
    ['completed', 'Setup complete', 'No pending work', 'View details'],
    ['cancelled', 'Cancelled', 'Setup cancelled', 'View details'],
  ] as const)(
    'keeps %s separate from other lifecycle states',
    (status, label, pendingText, action) => {
      const input = { ...props(), rows: [{ ...student, status, readinessItems: [] }] };
      render(tableElement(input));
      expect(screen.getByText(label)).toBeVisible();
      expect(screen.getByText(pendingText)).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: `${action} for ${student.studentName}` }));
      expect(input.onOpen).toHaveBeenCalledExactlyOnceWith(student.id);
      expect(input.onOpenTask).not.toHaveBeenCalled();
    }
  );

  it('keeps optional app login pending independently from the completed backend lifecycle', () => {
    const input = {
      ...props(),
      rows: [
        {
          ...student,
          status: 'completed' as const,
          studentEnrollmentId: 'enrollment-1',
          credentialsPending: true,
          readinessItems: [],
        },
      ],
    };
    render(tableElement(input));
    expect(screen.getByText('Setup complete')).toBeVisible();
    expect(screen.getByText('App login needs setup')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: `Open App Login for ${student.studentName}` })
    );
    expect(input.onOpenTask).toHaveBeenCalledExactlyOnceWith(student.id, 'credentials');
    expect(input.onOpen).not.toHaveBeenCalled();
  });

  it('keeps cancelled cases in the review action and preserves access to historical checks', () => {
    const input = { ...props(), rows: [{ ...student, status: 'cancelled' as const }] };
    render(tableElement(input));
    const actionCell = screen.getAllByRole('row')[1].lastElementChild as HTMLElement;
    expect(within(actionCell).getAllByRole('button')).toHaveLength(1);
    fireEvent.click(
      within(actionCell).getByRole('button', { name: `View details for ${student.studentName}` })
    );
    expect(input.onOpen).toHaveBeenCalledExactlyOnceWith(student.id);
    expect(input.onOpenTask).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: `Documents need checking for ${student.studentName}` })
    );
    expect(input.onOpenTask).toHaveBeenCalledExactlyOnceWith(student.id, 'readiness');
  });

  it('shows additional pending work without hover and keeps each task reachable', () => {
    const input = {
      ...props(),
      rows: [
        {
          ...student,
          readinessItems: [
            pendingCheck('documents'),
            pendingCheck('roll_number'),
            pendingCheck('accounts'),
          ],
        },
      ],
    };
    render(tableElement(input));
    expect(
      screen.getByRole('button', { name: `Documents need checking for ${student.studentName}` })
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: `Roll no. not assigned for ${student.studentName}` })
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: `Show all pending work for ${student.studentName}` })
    );
    fireEvent.click(
      screen.getByRole('button', { name: `Roll no. not assigned for ${student.studentName}` })
    );
    expect(input.onOpenTask).toHaveBeenCalledExactlyOnceWith(student.id, 'roll-number');
    expect(
      screen.getByRole('button', { name: `App login needs setup for ${student.studentName}` })
    ).toBeVisible();
  });

  it('locks next-action and pending-task navigation during a blocking operation', () => {
    const input = { ...props(), assignmentBusy: true };
    render(tableElement(input));
    const action = screen.getByRole('button', {
      name: `Review documents for ${student.studentName}`,
    });
    const task = screen.getByRole('button', {
      name: `Documents need checking for ${student.studentName}`,
    });
    expect(action).toBeDisabled();
    expect(task).toBeDisabled();
    fireEvent.click(action);
    fireEvent.click(task);
    expect(input.onOpen).not.toHaveBeenCalled();
    expect(input.onOpenTask).not.toHaveBeenCalled();
  });

  it('keeps readable status filters consistent with their rows and server callbacks', () => {
    const statuses: StudentOnboardingItem['status'][] = [
      'to-prepare',
      'awaiting-approval',
      'ready-to-activate',
      'action-required',
      'completed',
      'cancelled',
      'provisioning',
    ];
    const labels = [
      'Setup pending',
      'In progress',
      'Ready to activate',
      'Needs attention',
      'Setup complete',
      'Cancelled',
      'Finishing setup',
    ];
    const input = {
      ...props(),
      rows: statuses.map((status, index) => ({
        ...student,
        id: `case-${index}`,
        status,
        readinessItems: [],
      })),
      totalCount: 107,
      page: 3,
      searchTerm: 'Aanya',
      isLoading: true,
    };
    render(tableElement(input));
    const tableProps = vi.mocked(CustomizableTable).mock.lastCall?.[0];
    expect(tableProps?.columns.find((column) => column.id === 'statusLabel')?.enumOptions).toEqual(
      labels.map((label) => ({ label, value: label }))
    );
    expect(tableProps?.data.map((row) => row.statusLabel)).toEqual(labels);
    expect(tableProps).toMatchObject({
      isLoading: true,
      serverSide: true,
      serverSidePagination: true,
      serverSideSearch: true,
      serverSideFilter: true,
      serverSideSort: true,
      totalCount: 107,
      page: 2,
      rowsPerPage: 10,
      searchTerm: 'Aanya',
      onServerPagination: input.onPaginationChange,
      onServerSearch: input.onSearchChange,
      onServerFilter: input.onColumnFilterChange,
    });
    const nextSorts = [{ column: 'statusLabel', direction: 'asc' as const }];
    tableProps?.onServerSort?.('statusLabel', nextSorts);
    expect(input.onSortChange).toHaveBeenCalledExactlyOnceWith(nextSorts);
  });

  it('opts Division into selection and disables ineligible or busy rows', () => {
    const input = props('division');
    input.showSelection = true;
    input.rows = [
      student,
      {
        ...student,
        id: 'active-1',
        studentName: 'Active Student',
        studentEnrollmentId: 'enrollment-1',
      },
      { ...student, id: 'completed-1', studentName: 'Completed Student', backendStatus: 4 },
      { ...student, id: 'cancelled-1', studentName: 'Cancelled Student', backendStatus: 5 },
      { ...student, id: 'provisioning-1', studentName: 'Provisioning Student', backendStatus: 6 },
    ];
    const { rerender } = render(tableElement(input));
    fireEvent.click(screen.getByRole('checkbox', { name: `Select ${student.studentName}` }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all visible students' }));
    expect(input.onToggleSelection).toHaveBeenCalledWith(student.id);
    expect(input.onToggleAll).toHaveBeenCalledOnce();
    ['Active Student', 'Completed Student', 'Cancelled Student', 'Provisioning Student'].forEach(
      (name) => {
        expect(screen.getByRole('checkbox', { name: `Select ${name}` })).toBeDisabled();
      }
    );
    expect(input.onOpen).not.toHaveBeenCalled();

    rerender(tableElement({ ...input, assignmentBusy: true }));
    screen.getAllByRole('checkbox', { name: /^Select/ }).forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it.each(['gr-number', 'roll-number', 'division'] as const)(
    'has no Actions column in %s and opens a record through its name',
    (view) => {
      const input = props(view);
      render(tableElement(input));
      expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: `Review ${student.studentName}` }));
      expect(input.onOpen).toHaveBeenCalledWith(student.id);
    }
  );

  it.each([
    ['gr-number', 'GR number', 'GR-2026-00991'],
    ['roll-number', 'Roll number', '17'],
  ] as const)('edits %s in the table and preserves blur validation', (view, label, value) => {
    const input = {
      ...props(view),
      manualEditing: true,
      editableIds: [student.id],
      manualValues: { [student.id]: value },
      onManualChange: vi.fn(),
      onManualBlur: vi.fn(),
    };
    render(tableElement(input));
    const field = screen.getByRole('textbox', { name: `${label} for ${student.studentName}` });
    expect(field).toHaveValue(value);
    fireEvent.change(field, { target: { value: '19' } });
    fireEvent.blur(field);
    expect(input.onManualChange).toHaveBeenCalledWith(student.id, '19');
    expect(input.onManualBlur).toHaveBeenCalledWith(student.id);
  });

  it('edits Division from live case choices, including empty divisions, and disables full divisions', async () => {
    const user = userEvent.setup();
    const input = {
      ...props('division'),
      manualEditing: true,
      editableIds: [student.id],
      manualValues: { [student.id]: 'division-a' },
      onManualChange: vi.fn(),
      onManualBlur: vi.fn(),
    };
    render(tableElement(input));
    await user.click(screen.getByRole('combobox', { name: 'Division' }));
    expect(placements.query).toHaveBeenCalledWith(student.id, { refetchOnMountOrArgChange: true });
    expect(screen.getByRole('option', { name: /Full section/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('option', { name: 'B' }));
    expect(input.onManualChange).toHaveBeenCalledWith(student.id, 'division-b');
    await user.tab();
    expect(input.onManualBlur).toHaveBeenCalledWith(student.id);
  });

  it('mounts only the Division editor and keeps failed results in the Division cell', () => {
    const divisionId = 'e0170000-0111-0222-8333-044455556666';
    const input = {
      ...props('division'),
      rows: [{ ...student, divisionId, rollNo: 17 }],
      manualEditing: true,
      editableIds: [student.id],
      manualValues: { [student.id]: divisionId },
      manualBlockers: { [student.id]: 'Division capacity changed.' },
      assignmentMessages: {
        [student.id]: { status: 'failed' as const, message: 'Division could not be saved.' },
      },
      onManualChange: vi.fn(),
    };
    render(tableElement(input));

    const division = screen.getByRole('combobox', { name: 'Division' });
    expect(division).toHaveTextContent('Current division');
    expect(
      screen.queryByRole('textbox', { name: /Roll number|GR number/ })
    ).not.toBeInTheDocument();
    expect(input.onManualChange).not.toHaveBeenCalled();
    expect(screen.getAllByText('Division capacity changed.')).toHaveLength(1);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Division could not be saved.');
    expect(screen.getByRole('alert').closest('td')).toContainElement(division);
  });

  it('locks Division while live choices load and offers Retry after a choice-query error', () => {
    const input = { ...props('division'), manualEditing: true, editableIds: [student.id] };
    placements.isFetching = true;
    const { rerender } = render(tableElement(input));
    expect(screen.queryByRole('combobox', { name: 'Division' })).not.toBeInTheDocument();
    placements.isFetching = false;
    placements.isError = true;
    rerender(tableElement(input));
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('Could not load available divisions.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry divisions' }));
    expect(placements.refetch).toHaveBeenCalledOnce();
  });

  it.each(['gr-number', 'roll-number', 'division'] as const)(
    'locks the %s field and record action during assignment',
    (view) => {
      render(
        tableElement({
          ...props(view),
          manualEditing: true,
          editableIds: [student.id],
          assignmentBusy: true,
        })
      );
      expect(screen.getByRole('button', { name: `Review ${student.studentName}` })).toBeDisabled();
      if (view === 'division') {
        expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute(
          'aria-disabled',
          'true'
        );
      } else {
        const label = view === 'gr-number' ? 'GR number' : 'Roll number';
        expect(
          screen.getByRole('textbox', { name: `${label} for ${student.studentName}` })
        ).toBeDisabled();
      }
    }
  );

  it('shows row validation, blockers and saved or failed assignment results', () => {
    const input = {
      ...props('gr-number'),
      manualEditing: true,
      editableIds: [student.id],
      manualErrors: { [student.id]: 'GR number is required.' },
      manualBlockers: { [student.id]: 'Another assignment is in progress.' },
      assignmentMessages: {
        [student.id]: { status: 'failed' as const, message: 'GR number is already assigned.' },
      },
    };
    const { rerender } = render(tableElement(input));
    expect(
      screen.getByRole('textbox', { name: `GR number for ${student.studentName}` })
    ).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('GR number is required.')).toBeInTheDocument();
    expect(screen.getByText('Another assignment is in progress.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('GR number is already assigned.');

    rerender(
      tableElement({
        ...input,
        manualErrors: {},
        assignmentMessages: { [student.id]: { status: 'saved', message: 'GR number saved.' } },
      })
    );
    expect(screen.getByRole('status')).toHaveTextContent('GR number saved.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('preserves empty-filter recovery and renders an error with Retry', () => {
    const input = {
      ...props('division'),
      rows: [],
      totalCount: 0,
      onClearWorklistFilters: vi.fn(),
    };
    const { rerender } = render(tableElement(input));
    expect(screen.getByText(input.noDataText)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(input.onClearWorklistFilters).toHaveBeenCalledOnce();

    rerender(tableElement({ ...input, isError: true }));
    expect(screen.getByRole('alert')).toHaveTextContent('Onboarding cases could not be loaded.');
    expect(screen.queryByText(input.noDataText)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(input.onRetry).toHaveBeenCalledOnce();
  });

  it.each(['division', 'gr-number', 'roll-number'] as const)(
    'keeps %s compact with optional owner and lifecycle columns still available',
    (view) => {
      render(tableElement(props(view)));
      const columns = vi.mocked(CustomizableTable).mock.lastCall?.[0].columns ?? [];
      expect(columns.find((column) => column.id === 'ownerName')).toBeUndefined();
      expect(columns.find((column) => column.id === 'statusLabel')).toMatchObject({
        defaultHidden: true,
        label: 'Setup status',
      });
      expect(columns.find((column) => column.id === 'assignmentStatus')).toMatchObject({
        defaultHidden: false,
        sticky: true,
        stickyPosition: 'right',
        isFilter: false,
        isSort: false,
      });
      expect(screen.getAllByRole('columnheader', { name: 'Status' })).toHaveLength(1);
      expect(screen.queryByRole('columnheader', { name: 'Owner' })).not.toBeInTheDocument();
    }
  );

  it.each(['gr-number', 'roll-number'] as const)(
    'shows unsaved %s changes only once in the status column',
    (view) => {
      render(
        tableElement({
          ...props(view),
          manualEditing: true,
          editableIds: [student.id],
          manualValues: { [student.id]: view === 'gr-number' ? 'GR-NEW' : '27' },
        })
      );
      expect(screen.getAllByText('Not saved')).toHaveLength(1);
      const row = vi.mocked(CustomizableTable).mock.lastCall?.[0].data[0];
      expect(row?.assignmentStatus).toBe('Not saved');
    }
  );

  it('keeps Division selection fixed while a Manual draft is open', () => {
    render(tableElement({ ...props('division'), showSelection: true, manualEditing: true }));
    screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeDisabled());
  });

  it('offers View all students after the remaining assignment list is empty', () => {
    const onViewAllStudents = vi.fn();
    render(tableElement({ ...props('gr-number'), rows: [], totalCount: 0, onViewAllStudents }));
    fireEvent.click(screen.getByRole('button', { name: 'View all students' }));
    expect(onViewAllStudents).toHaveBeenCalledOnce();
  });
});
