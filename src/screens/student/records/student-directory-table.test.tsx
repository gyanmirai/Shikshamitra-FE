import type { ComponentProps } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { screen, within, fireEvent, render as renderComponent } from '@testing-library/react';

import StudentDirectoryTable from './student-directory-table';

type Props = ComponentProps<typeof StudentDirectoryTable>;
const student: StudentDirectoryItem = {
  id: 'student-1',
  studentId: 'student-1',
  firstName: 'Riya',
  lastName: 'Shah',
  status: 6,
  entrySource: 'ActiveStudentList',
  hasPhoto: false,
  maskedFields: [],
};

vi.mock('src/hooks/use-responsive', () => ({ useResponsive: () => false }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: { columns: IColumn[]; data: StudentDirectoryItem[] }) => (
    <section aria-label="Student actions">
      {columns.find((column) => column.id === 'actions')?.render?.(undefined, data[0])}
    </section>
  ),
}));

let props: Props;
beforeEach(() => {
  props = {
    hasFilters: false,
    query: {
      currentData: { items: [student], totalCount: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn<Props['query']['refetch']>(),
    },
    page: 0,
    pageSize: 25,
    search: '',
    sorting: '',
    columnFilters: [],
    update: vi.fn(),
    population: 'Active',
    academicYearReady: true,
    profileHref: (id) => `/student/profile?student=${id}`,
    rowActions: () => [
      {
        id: 'edit-details',
        label: 'Edit Details for Riya Shah',
        icon: 'mdi:pencil',
        href: '/student/profile?student=student-1&edit=details',
      },
      {
        id: 'attendance-history',
        label: 'Attendance History for Riya Shah',
        icon: 'mdi:calendar-check-outline',
        href: '/student/profile?student=student-1&view=attendance',
      },
      {
        id: 'change-status',
        label: 'Change Status',
        icon: 'mdi:account-edit-outline',
        href: '/student/records/changes?student=student-1&section=status',
      },
    ],
    onClearFilters: vi.fn(),
    onProfileOpen: vi.fn(),
    onExport: vi.fn(),
    canPrintIds: true,
    canGenerateCertificates: true,
    onDocumentAction: vi.fn(),
    selection: {
      selected: [],
      enabled: true,
      disabledReason: '',
      onToggle: vi.fn(),
      onTogglePage: vi.fn(),
    },
  };
});

function render() {
  return renderComponent(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentDirectoryTable {...props} />
    </ThemeProvider>
  );
}

it('shows three direct shortcuts and keeps concise print/status actions in the contextual menu', () => {
  render();
  const group = screen.getByRole('region', { name: 'Student actions' });
  expect(
    Array.from(group.querySelectorAll('a, button')).map((action) =>
      action.getAttribute('aria-label')
    )
  ).toEqual([
    'Edit Details for Riya Shah',
    'Attendance History for Riya Shah',
    'Generate Certificate for Riya Shah',
    'More actions for Riya Shah',
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'Generate Certificate for Riya Shah' }));
  expect(props.onDocumentAction).toHaveBeenCalledWith('certificate', [
    expect.objectContaining(student),
  ]);
  expect(props.onProfileOpen).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Shah' }));
  const menu = screen.getByRole('menu', { name: 'More actions for Riya Shah' });
  expect(
    within(menu)
      .getAllByRole('menuitem')
      .map((action) => action.textContent)
  ).toEqual(['Print I-card', 'Change Status']);
  expect(within(menu).getByRole('menuitem', { name: 'Change Status' })).toHaveAttribute(
    'href',
    '/student/records/changes?student=student-1&section=status'
  );
  fireEvent.click(within(menu).getByRole('menuitem', { name: 'Print I-card' }));
  expect(props.onDocumentAction).toHaveBeenLastCalledWith('id-card', [
    expect.objectContaining(student),
  ]);
});

it.each([
  [false, false, false],
  [true, false, false],
  [false, true, false],
  [false, false, true],
  [true, true, false],
  [true, false, true],
  [false, true, true],
  [true, true, true],
])(
  'keeps overflow fixed with edit=%s, attendance=%s, certificate=%s',
  (edit, attendance, certificate) => {
    const actions = props.rowActions!(student);
    props.rowActions = () =>
      actions.filter(
        (action) =>
          (action.id !== 'edit-details' || edit) &&
          (action.id !== 'attendance-history' || attendance)
      );
    props.canGenerateCertificates = certificate;
    render();
    expect(screen.queryByTestId('table-action-edit-details') !== null).toBe(edit);
    expect(screen.queryByTestId('table-action-attendance-history') !== null).toBe(attendance);
    expect(screen.queryByTestId('table-action-certificate') !== null).toBe(certificate);
    expect(screen.queryByTestId('table-action-print-id')).not.toBeInTheDocument();
    expect(screen.queryByTestId('table-action-change-status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Shah' }));
    expect(screen.getByTestId('menu-action-print-id')).toHaveTextContent('Print I-card');
    expect(screen.getByTestId('menu-action-change-status')).toHaveTextContent('Change Status');
  }
);

it('omits the menu when only certificate access exists', () => {
  props.rowActions = undefined;
  props.canPrintIds = false;
  render();
  expect(screen.getByRole('button', { name: 'Generate Certificate for Riya Shah' })).toBeVisible();
  expect(screen.queryByTestId('table-action-more')).not.toBeInTheDocument();
});

it('omits all actions when no action is permitted', () => {
  props.rowActions = undefined;
  props.canPrintIds = false;
  props.canGenerateCertificates = false;
  render();
  expect(screen.getByRole('region', { name: 'Student actions' })).toBeEmptyDOMElement();
});

it('keeps direct and overflow actions disabled during bulk selection', () => {
  props.selection.selected = [student];
  render();
  expect(screen.getByTestId('table-action-edit-details')).toBeDisabled();
  expect(screen.getByTestId('table-action-edit-details')).not.toHaveAttribute('href');
  expect(screen.getByTestId('table-action-attendance-history')).toBeDisabled();
  expect(screen.getByTestId('table-action-certificate')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Shah' }));
  expect(screen.getByTestId('menu-action-print-id')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByTestId('menu-action-change-status')).toHaveAttribute('aria-disabled', 'true');
  expect(props.onDocumentAction).not.toHaveBeenCalled();
});
