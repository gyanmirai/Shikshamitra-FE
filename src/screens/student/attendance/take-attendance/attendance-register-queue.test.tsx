import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';

import AttendanceRegisterQueue from './attendance-register-queue';
import { renderAttendanceErrorRecovery } from '../attendance-toast-test-fixture';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  query: vi.fn(),
  replace: vi.fn(),
  retry: vi.fn(),
  error: false,
  contextError: false,
  contextRetry: vi.fn(),
  table: undefined as ICustomizableTableProps | undefined,
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.params,
  usePathname: () => '/student/attendance/take-attendance',
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('react-redux', () => ({
  useSelector: (fn: (value: unknown) => unknown) =>
    fn({ globalState: { currentYear: { id: 'current-year' } } }),
}));
vi.mock('src/redux/student/take-attendance/take-attendace-api', () => ({
  useGetAttendanceContextQuery: () => ({
    currentData: { options: {} },
    isFetching: false,
    isError: mocks.contextError,
    refetch: mocks.contextRetry,
  }),
}));
vi.mock('src/redux/student/take-attendance/attendance-register-queue-api', () => ({
  useGetAttendanceRegisterQueueQuery: (input: unknown, options: unknown) => {
    mocks.query(input, options);
    return {
      currentData: {
        items: [
          {
            standardId: 'class',
            divisionId: 'division',
            className: 'Class 5',
            divisionName: 'A',
            date: '2026-10-14',
            status: 'draft',
            href: '/student/attendance/take-attendance?year=year&class=class&division=division&date=2026-10-14',
          },
        ],
        totalCount: 31,
      },
      isError: mocks.error,
      isFetching: false,
      isLoading: false,
      refetch: mocks.retry,
    };
  },
}));
vi.mock('src/screens/student/records/student-directory-filter-fields', () => ({
  default: () => <div>Academic filters</div>,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: ICustomizableTableProps) => {
    mocks.table = props;
    return (
      <div>
        {props.errorContent}
        {props.data.map((row) => (
          <a key={row.divisionId} href={row.href}>
            {row.className} / {row.divisionName}
          </a>
        ))}
        <button type="button" onClick={() => props.onServerPagination?.(1, 25)}>
          Next page
        </button>
      </div>
    );
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams(
    'dashboard=pending-registers&year=year&board=board&medium=medium&class=class&division=division'
  );
  mocks.error = false;
  mocks.contextError = false;
});

it('requests exactly the dashboard population and preserves scope while paging', () => {
  render(<AttendanceRegisterQueue />);
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({
      academicYearId: 'year',
      boardId: 'board',
      mediumId: 'medium',
      standardId: 'class',
      divisionId: 'division',
      skipCount: 0,
      maxResultCount: 25,
    }),
    expect.objectContaining({ skip: false })
  );
  expect(mocks.table?.totalCount).toBe(31);
  expect(screen.getByRole('link', { name: 'Class 5 / A' })).toHaveAttribute(
    'href',
    expect.stringContaining('date=2026-10-14')
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(mocks.replace).toHaveBeenCalledWith(
    expect.stringContaining('class=class&division=division&page=1&size=25'),
    { scroll: false }
  );
});

it('clears protected cached rows when a queue request fails and retries from its toast', async () => {
  mocks.error = true;
  render(<AttendanceRegisterQueue />);
  expect(screen.queryByRole('link', { name: 'Class 5 / A' })).not.toBeInTheDocument();
  expect(mocks.table?.totalCount).toBe(0);
  await expectStudentErrorToast(
    'Pending registers could not be loaded. Check your access or retry.'
  );
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  const recovery = renderAttendanceErrorRecovery();
  fireEvent.click(within(recovery.container).getByRole('button', { name: 'Retry' }));
  expect(mocks.retry).toHaveBeenCalledOnce();
  expect(mocks.contextRetry).not.toHaveBeenCalled();
  expect(mocks.table?.data).toEqual([]);
});

it('retries failed academic filters from the toast without refetching the queue', async () => {
  mocks.contextError = true;
  render(<AttendanceRegisterQueue />);
  await expectStudentErrorToast('Academic filters could not be loaded.');
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  const recovery = renderAttendanceErrorRecovery();
  fireEvent.click(within(recovery.container).getByRole('button', { name: 'Retry' }));
  expect(mocks.contextRetry).toHaveBeenCalledOnce();
  expect(mocks.retry).not.toHaveBeenCalled();
});

it('displays numeric register dates while retaining the ISO day in its navigation target', () => {
  render(<AttendanceRegisterQueue />);
  const row = mocks.table?.data[0];
  const column = mocks.table?.columns.find((item) => item.id === 'date');
  expect(column?.render?.(row?.date, row!)).toBe('14/10/2026');
  expect(screen.getByRole('link', { name: 'Class 5 / A' })).toHaveAttribute(
    'href',
    expect.stringContaining('date=2026-10-14')
  );
});
