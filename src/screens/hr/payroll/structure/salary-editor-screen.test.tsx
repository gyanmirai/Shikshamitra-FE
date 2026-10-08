import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import SalaryEditorScreen from './salary-editor-screen';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  prefetch: vi.fn(),
  query: '',
  canRead: true,
  loading: false,
  employeeQuery: vi.fn(),
  refetch: vi.fn(),
  employeeError: false,
}));
vi.mock('./use-salary-editor-prefetch', () => ({
  useSalaryEditorPrefetch: () => mocks.prefetch,
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(mocks.query) }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('react-redux', () => ({
  useSelector: () => ({ permissions: [], loading: mocks.loading, permissionsInitialized: true }),
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => mocks.canRead }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, links }: any) => (
    <nav>
      <h1>{heading}</h1>
      {links
        .filter((link: any) => link.href)
        .map((link: any) => (
          <a key={link.name} href={link.href}>
            {link.name}
          </a>
        ))}
    </nav>
  ),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title }: any) => (
    <div role="dialog" aria-label={title}>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/redux/hr/employeeApi', () => ({
  useGetEmployeeByIdQuery: (employeeId: string) => {
    mocks.employeeQuery(employeeId);
    return {
      currentData: {
        id: employeeId,
        fullName: 'Test Staff',
        employeeIdentifier: 'STAFF001',
        status: 0,
      },
      isLoading: false,
      isError: mocks.employeeError,
      refetch: mocks.refetch,
    };
  },
}));
vi.mock('./SalaryStructureBuilder', async () => {
  const { createPortal } = await import('react-dom');
  return {
    SalaryStructureBuilder: ({ actionContainer, onEditorStateChange }: any) => (
      <>
        <button type="button" onClick={() => onEditorStateChange({ dirty: true, busy: false })}>
          Change input
        </button>
        <button type="button" onClick={() => onEditorStateChange({ dirty: true, busy: true })}>
          Start saving
        </button>
        <button type="button" onClick={() => onEditorStateChange({ dirty: false, busy: false })}>
          Finish saving
        </button>
        {actionContainer &&
          createPortal(
            <>
              <button type="button">Calculate salary</button>
              <button type="button">Save salary</button>
            </>,
            actionContainer
          )}
      </>
    ),
  };
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query = '';
  mocks.canRead = true;
  mocks.loading = false;
  mocks.employeeError = false;
});

it('renders a page, staff identity and persistent actions without a salary dialog', () => {
  render(<SalaryEditorScreen employeeId="staff" />);
  expect(screen.getByRole('heading', { name: 'Edit Salary' })).toBeVisible();
  expect(mocks.prefetch).toHaveBeenCalled();
  expect(screen.getByText('Test Staff · STAFF001')).toBeVisible();
  expect(screen.getByTestId('salary-editor-footer')).toContainElement(
    screen.getByRole('button', { name: 'Save salary' })
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Manage one-time/ })).toHaveAttribute(
    'href',
    '/hr/payroll/run-payroll'
  );
});
it('does not load protected staff content before permission initialization or when denied', () => {
  mocks.loading = true;
  const result = render(<SalaryEditorScreen employeeId="staff" />);
  expect(mocks.employeeQuery).not.toHaveBeenCalled();
  mocks.loading = false;
  mocks.canRead = false;
  result.rerender(<SalaryEditorScreen employeeId="staff" />);
  expect(mocks.employeeQuery).not.toHaveBeenCalled();
  expect(screen.getByText(/do not have permission/)).toBeVisible();
  expect(screen.queryByText('Test Staff · STAFF001')).not.toBeInTheDocument();
});
it('hides cached staff content and offers retry after a failed employee read', () => {
  mocks.employeeError = true;
  render(<SalaryEditorScreen employeeId="staff" />);
  expect(screen.queryByRole('button', { name: 'Save salary' })).not.toBeInTheDocument();
  expect(screen.queryByText('Test Staff · STAFF001')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
});
it('retains a draft when Back is cancelled and returns to the origin only after discard', async () => {
  const returnTo = '/hr/employee?employee=staff&tab=personalInformation&infoTab=payroll';
  mocks.query = new URLSearchParams({ returnTo }).toString();
  render(<SalaryEditorScreen employeeId="staff" />);
  fireEvent.click(screen.getByRole('button', { name: 'Change input' }));
  fireEvent.click(screen.getByRole('button', { name: /^Back$/ }));
  expect(mocks.push).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('button', { name: 'Change input' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /^Back$/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith(returnTo));
});
it('guards breadcrumb and payroll links and blocks Back during saving', () => {
  render(<SalaryEditorScreen employeeId="staff" />);
  fireEvent.click(screen.getByRole('button', { name: 'Change input' }));
  fireEvent.click(screen.getByRole('link', { name: 'Payroll Structure' }));
  expect(screen.getByRole('dialog')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  fireEvent.click(screen.getByRole('link', { name: /Manage one-time/ }));
  expect(screen.getByRole('dialog')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  fireEvent.click(screen.getByRole('button', { name: 'Start saving' }));
  expect(screen.getByRole('button', { name: /^Back$/ })).toBeDisabled();
  expect(mocks.push).not.toHaveBeenCalled();
});
it('returns safely after saving without prompting and rejects external return URLs', () => {
  mocks.query = 'returnTo=https%3A%2F%2Fattacker.example%2Fhr%2Femployee';
  render(<SalaryEditorScreen employeeId="staff" />);
  fireEvent.click(screen.getByRole('button', { name: 'Change input' }));
  fireEvent.click(screen.getByRole('button', { name: 'Finish saving' }));
  fireEvent.click(screen.getByRole('button', { name: /^Back$/ }));
  expect(mocks.push).toHaveBeenCalledWith('/hr/payroll/structure?employeeId=staff');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
