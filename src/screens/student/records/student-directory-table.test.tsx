import type { ComponentProps } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  screen,
  within,
  waitFor,
  fireEvent,
  render as renderComponent,
} from '@testing-library/react';

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
      visible: true,
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

it('shows two direct actions and retains certificate, print and status actions in overflow', async () => {
  render();
  const group = screen.getByRole('region', { name: 'Student actions' });
  expect(
    Array.from(group.querySelectorAll('a, button')).map((action) =>
      action.getAttribute('aria-label')
    )
  ).toEqual([
    'Edit Details for Riya Shah',
    'Attendance History for Riya Shah',
    'More actions for Riya Shah',
  ]);
  expect(screen.getByRole('link', { name: 'Edit Details for Riya Shah' })).toHaveAttribute(
    'href',
    '/student/profile?student=student-1&edit=details'
  );
  expect(screen.getByRole('link', { name: 'Attendance History for Riya Shah' })).toHaveAttribute(
    'href',
    '/student/profile?student=student-1&view=attendance'
  );
  fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Shah' }));
  const menu = screen.getByRole('menu', { name: 'More actions for Riya Shah' });
  expect(
    within(menu)
      .getAllByRole('menuitem')
      .map((action) => action.textContent)
  ).toEqual(['Generate Certificate', 'Print I-Card', 'Change Status']);
  expect(within(menu).getByTestId('menu-action-certificate')).toHaveAccessibleName(
    'Generate Certificate for Riya Shah'
  );
  expect(within(menu).getByRole('menuitem', { name: 'Change Status' })).toHaveAttribute(
    'href',
    '/student/records/changes?student=student-1&section=status'
  );
  fireEvent.click(
    within(menu).getByRole('menuitem', { name: 'Generate Certificate for Riya Shah' })
  );
  expect(props.onDocumentAction).toHaveBeenNthCalledWith(1, 'certificate', [
    expect.objectContaining(student),
  ]);
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Shah' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Print I-Card' }));
  expect(props.onDocumentAction).toHaveBeenNthCalledWith(2, 'id-card', [
    expect.objectContaining(student),
  ]);
  expect(props.onDocumentAction).toHaveBeenCalledTimes(2);
  expect(props.onProfileOpen).not.toHaveBeenCalled();
});

it.each([
  {
    edit: false,
    attendance: false,
    certificate: false,
    direct: ['print-id', 'change-status'],
    overflow: [],
  },
  {
    edit: true,
    attendance: false,
    certificate: false,
    direct: ['edit-details', 'print-id'],
    overflow: ['change-status'],
  },
  {
    edit: false,
    attendance: true,
    certificate: false,
    direct: ['attendance-history', 'print-id'],
    overflow: ['change-status'],
  },
  {
    edit: false,
    attendance: false,
    certificate: true,
    direct: ['certificate', 'print-id'],
    overflow: ['change-status'],
  },
  {
    edit: true,
    attendance: true,
    certificate: false,
    direct: ['edit-details', 'attendance-history'],
    overflow: ['print-id', 'change-status'],
  },
  {
    edit: true,
    attendance: false,
    certificate: true,
    direct: ['edit-details', 'certificate'],
    overflow: ['print-id', 'change-status'],
  },
  {
    edit: false,
    attendance: true,
    certificate: true,
    direct: ['attendance-history', 'certificate'],
    overflow: ['print-id', 'change-status'],
  },
  {
    edit: true,
    attendance: true,
    certificate: true,
    direct: ['edit-details', 'attendance-history'],
    overflow: ['certificate', 'print-id', 'change-status'],
  },
])(
  'preserves action order with edit=$edit, attendance=$attendance, certificate=$certificate',
  ({ edit, attendance, certificate, direct, overflow }) => {
    const actions = props.rowActions!(student);
    props.rowActions = () =>
      actions.filter(
        (action) =>
          (action.id !== 'edit-details' || edit) &&
          (action.id !== 'attendance-history' || attendance)
      );
    props.canGenerateCertificates = certificate;
    render();
    const group = screen.getByRole('region', { name: 'Student actions' });
    expect(
      Array.from(group.querySelectorAll('[data-testid^="table-action-"]')).map((action) =>
        action.getAttribute('data-testid')
      )
    ).toEqual([
      ...direct.map((id) => `table-action-${id}`),
      ...(overflow.length ? ['table-action-more'] : []),
    ]);
    if (overflow.length) {
      fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Shah' }));
      expect(
        screen.getAllByRole('menuitem').map((action) => action.getAttribute('data-testid'))
      ).toEqual(overflow.map((id) => `menu-action-${id}`));
    } else {
      expect(screen.queryByTestId('table-action-more')).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Change Status' })).toHaveAttribute(
        'href',
        '/student/records/changes?student=student-1&section=status'
      );
    }
    ['edit-details', 'attendance-history', 'certificate', 'print-id', 'change-status'].forEach(
      (id) => {
        expect(screen.queryByTestId(`table-action-${id}`) !== null).toBe(direct.includes(id));
        expect(screen.queryByTestId(`menu-action-${id}`) !== null).toBe(overflow.includes(id));
      }
    );
  }
);

it('keeps Print I-Card directly available with only I-Card access', () => {
  props.rowActions = undefined;
  props.canGenerateCertificates = false;
  render();
  fireEvent.click(screen.getByRole('button', { name: 'Print I-Card' }));
  expect(props.onDocumentAction).toHaveBeenCalledExactlyOnceWith('id-card', [
    expect.objectContaining(student),
  ]);
  expect(screen.queryByTestId('table-action-more')).not.toBeInTheDocument();
});

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

it('keeps the non-I-card certificate overflow action disabled during bulk selection', () => {
  props.canPrintIds = false;
  props.selection.selected = [student];
  render();
  expect(screen.getByTestId('table-action-edit-details')).toBeDisabled();
  expect(screen.getByTestId('table-action-attendance-history')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Shah' }));
  expect(screen.getByTestId('menu-action-certificate')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByTestId('menu-action-change-status')).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(screen.getByTestId('menu-action-certificate'));
  expect(props.onDocumentAction).not.toHaveBeenCalled();
});

it('keeps direct and overflow actions disabled during bulk selection', () => {
  props.selection.selected = [student];
  render();
  expect(screen.getByTestId('table-action-edit-details')).toBeDisabled();
  expect(screen.getByTestId('table-action-edit-details')).not.toHaveAttribute('href');
  expect(screen.getByTestId('table-action-attendance-history')).toBeDisabled();
  expect(screen.queryByTestId('table-action-certificate')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Shah' }));
  ['certificate', 'print-id', 'change-status'].forEach((id) => {
    const action = screen.getByTestId(`menu-action-${id}`);
    expect(action).toHaveAttribute('aria-disabled', 'true');
    expect(action).not.toHaveAttribute('href');
    fireEvent.click(action);
  });
  expect(props.onDocumentAction).not.toHaveBeenCalled();
});

it('keeps a promoted Print I-Card action disabled during bulk selection', () => {
  props.rowActions = undefined;
  props.canGenerateCertificates = false;
  props.selection.selected = [student];
  render();
  const action = screen.getByRole('button', { name: 'Print I-Card' });
  expect(action).toBeDisabled();
  fireEvent.click(action);
  expect(props.onDocumentAction).not.toHaveBeenCalled();
  expect(screen.queryByTestId('table-action-more')).not.toBeInTheDocument();
});
