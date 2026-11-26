import type { ReactNode } from 'react';
import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { studentPermissions } from 'src/constants/student-menu';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import StudentBirthdays from './student-birthdays';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
  replace: vi.fn(),
  year: 'year1',
  permissions: [] as { name: string; isGranted: boolean }[],
  options: {} as Record<string, unknown>,
  optionsSkip: false,
  query: {} as Record<string, unknown>,
  queryInput: {} as Record<string, unknown>,
  querySkip: false,
  refetch: vi.fn(),
  toastError: vi.fn(
    (_payload: { message: ReactNode; alertProps: (id: string) => { action: ReactNode } }) =>
      'toast-id'
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
  usePathname: () => '/student/records/birthdays',
  useSearchParams: () => mocks.params,
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: { permissions: mocks.permissions },
      globalState: { currentYear: mocks.year ? { id: mocks.year } : null },
    }),
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.toastError, dismiss: vi.fn() },
}));

vi.mock('src/routes/components', () => ({
  RouterLink: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({
    heading,
    links,
  }: {
    heading: string;
    links: { name: string; href?: string }[];
  }) => (
    <>
      <h1>{heading}</h1>
      <nav aria-label="Breadcrumb">
        {links.map(({ name, href }) =>
          href ? (
            <a href={href} key={name}>
              {name}
            </a>
          ) : (
            <span key={name}>{name}</span>
          )
        )}
      </nav>
    </>
  ),
}));

vi.mock('./student-directory-academic-filters', () => ({
  default: () => <div>Academic filters</div>,
}));

vi.mock('src/components/custom-date-range-picker', () => ({
  CustomDateRangePicker: ({ label, helperText }: { label: string; helperText?: string }) => (
    <div>
      {label} {helperText}
    </div>
  ),
}));

vi.mock('src/redux/student/records/student-birthdays-api', () => ({
  useGetStudentBirthdayOptionsQuery: (_: unknown, { skip }: { skip: boolean }) => {
    mocks.optionsSkip = skip;
    return mocks.options;
  },
  useGetStudentBirthdaysQuery: (query: Record<string, unknown>, { skip }: { skip: boolean }) => {
    mocks.queryInput = query;
    mocks.querySkip = skip;
    return mocks.query;
  },
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: (props: ICustomizableTableProps) => (
    <section aria-label="Student birthdays">
      <button type="button" onClick={() => props.onServerSearch?.('Diya')}>
        Search Diya
      </button>
      {props.errorContent ||
        (props.isLoading
          ? 'Loading birthdays'
          : props.data.map((row) => (
              <div key={row.id}>{props.columns[0].render?.(row.studentName, row)}</div>
            )))}
    </section>
  ),
}));

const options = {
  boards: [{ id: 'board1' }],
  mediums: [{ id: 'medium1', parentId: 'board1' }],
  standards: [{ id: 'class1', parentId: 'medium1' }],
  divisions: [{ id: 'division1', parentId: 'class1' }],
};

const roster = {
  schoolDate: '2026-11-25',
  startDate: '2026-11-25',
  endDate: '2026-11-25',
  totalCount: 2,
  items: [
    {
      studentId: 'student1',
      studentName: 'Diya Patel',
      occurrenceDate: '2026-11-25',
      canOpenProfile: true,
    },
    {
      studentId: 'student2',
      studentName: 'Kavya Desai',
      occurrenceDate: '2026-11-25',
      canOpenProfile: false,
    },
  ],
};

const renderBirthdays = () =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentBirthdays />
    </ThemeProvider>
  );

const pushedParams = () =>
  new URL(mocks.push.mock.calls.at(-1)?.[0], 'https://school.test').searchParams;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams({ year: 'year1' });
  mocks.year = 'year1';
  mocks.permissions = [{ name: studentPermissions.records.birthdays, isGranted: true }];
  mocks.options = { currentData: options, isError: false, refetch: mocks.refetch };
  mocks.query = { currentData: roster, isError: false, refetch: mocks.refetch };
});

describe('Student Birthday workspace', () => {
  it('uses the selected academic scope and the school date preset', () => {
    renderBirthdays();

    expect(mocks.optionsSkip).toBe(false);
    expect(mocks.querySkip).toBe(false);
    expect(mocks.queryInput).toMatchObject({
      academicYearId: 'year1',
      boardId: 'board1',
      mediumId: 'medium1',
      period: 'today',
      skipCount: 0,
      maxResultCount: 25,
    });
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Wed, 25 Nov 2026')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Diya Patel' })).toBeNull();
    expect(screen.queryByRole('link', { name: /^Student$/ })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Student Records' })).toBeNull();
  });

  it('opens only profiles allowed by both the actual permission and the server row', () => {
    mocks.permissions.push(
      { name: studentPermissions.records.studentList, isGranted: true },
      { name: studentPermissions.dashboard, isGranted: true }
    );
    renderBirthdays();

    expect(screen.getByRole('link', { name: /^Student$/ })).toHaveAttribute(
      'href',
      '/student/dashboard'
    );
    expect(screen.getByRole('link', { name: 'Diya Patel' })).toHaveAttribute(
      'href',
      '/student/profile?student=student1&view=overview'
    );
    expect(screen.getByText('Kavya Desai')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Kavya Desai' })).toBeNull();
  });

  it('resets the page while keeping class and period filters in the URL for search', () => {
    mocks.params = new URLSearchParams('year=year1&class=class1&period=next7Days&page=2');
    mocks.query.currentData = { ...roster, totalCount: 100 };
    renderBirthdays();

    expect(mocks.queryInput).toMatchObject({
      standardId: 'class1',
      period: 'next7Days',
      skipCount: 50,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search Diya' }));
    expect(pushedParams().get('search')).toBe('Diya');
    expect(pushedParams().get('class')).toBe('class1');
    expect(pushedParams().get('period')).toBe('next7Days');
    expect(pushedParams().has('page')).toBe(false);
  });

  it('waits for a valid custom date range and keeps older results hidden', () => {
    mocks.params = new URLSearchParams(
      'year=year1&period=custom&startDate=2026-11-25&endDate=2026-11-24'
    );
    renderBirthdays();

    expect(mocks.querySkip).toBe(true);
    expect(screen.getByText(/Choose an end date on or after/)).toBeVisible();
    expect(screen.queryByText('Diya Patel')).toBeNull();
  });

  it('moves a stale page into range while keeping its active search and class', () => {
    mocks.params = new URLSearchParams('year=year1&class=class1&search=Diya&page=5');
    mocks.query.currentData = { ...roster, items: [], totalCount: 31 };
    renderBirthdays();

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/records/birthdays?year=year1&class=class1&search=Diya&page=1',
      { scroll: false }
    );
  });

  it('clears academic filters from a different year before reading new results', () => {
    mocks.params = new URLSearchParams('year=year0&class=oldClass&page=2&period=thisMonth');
    renderBirthdays();

    expect(mocks.querySkip).toBe(true);
    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/records/birthdays?year=year1&period=thisMonth',
      { scroll: false }
    );
    expect(screen.queryByText('Diya Patel')).toBeNull();
  });

  it('skips both reads when Birthday View is missing', () => {
    mocks.permissions = [];
    renderBirthdays();

    expect(mocks.optionsSkip).toBe(true);
    expect(mocks.querySkip).toBe(true);
    expect(screen.getByText('You do not have access to student birthdays.')).toBeVisible();
    expect(screen.queryByText('Diya Patel')).toBeNull();
  });

  it('handles server access changes and request failures without showing old records', () => {
    mocks.query = { ...mocks.query, isError: true, error: { status: 403 } };
    const view = renderBirthdays();
    expect(screen.getByText('You do not have access to student birthdays.')).toBeVisible();
    expect(screen.queryByText('Diya Patel')).toBeNull();
    view.unmount();

    mocks.query = { ...mocks.query, error: { status: 500 } };
    renderBirthdays();
    expect(screen.queryByText('Birthdays could not be loaded.')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(mocks.toastError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Birthdays could not be loaded.' })
    );
    const { action } = mocks.toastError.mock.calls[0][0].alertProps('toast-id');
    render(<ThemeProvider theme={createTheme(defaultSettings)}>{action}</ThemeProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(screen.queryByText('Diya Patel')).toBeNull();
  });
});
