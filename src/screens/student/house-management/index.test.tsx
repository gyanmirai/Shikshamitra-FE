import type { IColumn } from 'src/components/customizabaleTable/types';
import type { HouseCataloguePage } from 'src/redux/student/house-management/house-management-types';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import HouseManagement from '.';

const fixture = vi.hoisted(() => ({
  query: 'tab=students',
  permissions: ['Students.Records.HouseManagement.View'],
  push: vi.fn(),
  replace: vi.fn(),
  input: vi.fn(),
  houseCapability: false,
  houses: null as HouseCataloguePage | null,
  housesFetching: false,
  housesError: false,
  academicError: false,
  studentTotal: 1,
  studentsMissing: false,
  studentsFetching: false,
  studentsError: false,
  updateHouse: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(fixture.query),
  usePathname: () => '/student/records/houses',
  useRouter: () => ({ push: fixture.push, replace: fixture.replace }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/hooks/use-student-academic-scope', () => ({
  useStudentAcademicScope: () => ({
    currentYear: { id: 'y1' },
    currentBoard: { id: 'b1' },
    currentMedium: {
      id: 'm1',
      educationMediumStages: [
        { standards: [{ id: 'c1', name: '6', divisions: [{ id: 'd1', name: 'A' }] }] },
      ],
    },
    boards: [{ id: 'b1', name: 'Board' }],
    mediums: [{ id: 'm1', name: 'English' }],
    isLoading: false,
    isError: fixture.academicError,
  }),
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    columns,
    data,
    isLoading,
    isRefreshing,
    noDataText,
  }: {
    columns: IColumn[];
    data: Record<string, unknown>[];
    isLoading: boolean;
    isRefreshing: boolean;
    noDataText: React.ReactNode;
  }) => (
    <section aria-label="Records">
      {isLoading && <div role="progressbar" aria-label="Loading records" />}
      {isRefreshing && <span>Refreshing records</span>}
      {!isLoading && !data.length && noDataText}
      {data.map((row, index) => (
        <div key={index}>
          {columns.map((column) => (
            <span key={column.id}>
              {column.render ? column.render(row[column.id], row) : String(row[column.id] ?? '')}
            </span>
          ))}
        </div>
      ))}
    </section>
  ),
}));
vi.mock('./house-pickers', () => ({ HousePicker: () => null }));
vi.mock('src/redux/student/house-management/house-management-api', () => {
  const result = {
    currentData: { items: [], totalCount: 0 },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  };
  const mutation = () => [vi.fn(() => ({ unwrap: vi.fn() })), { isLoading: false }];
  const studentData = {
    items: [
      {
        enrollmentId: 'e1',
        studentId: 's1',
        studentName: 'Riya',
        standardName: '6',
        houseName: 'Falcon',
        isHouseLeader: false,
        isDivisionLeader: false,
      },
    ],
    totalCount: 1,
  };
  let studentPage = studentData;
  const houseData = [
    { items: [], totalCount: 0, canManage: false },
    { items: [], totalCount: 0, canManage: true },
  ];
  return {
    useGetManagedHousesQuery: () => ({
      ...result,
      currentData: fixture.houses ?? houseData[fixture.houseCapability ? 1 : 0],
      isFetching: fixture.housesFetching,
      isError: fixture.housesError,
    }),
    useGetHouseDivisionsQuery: () => result,
    useGetHouseStudentsQuery: (input: unknown) => {
      fixture.input(input);
      if (studentPage.totalCount !== fixture.studentTotal)
        studentPage = { ...studentData, totalCount: fixture.studentTotal };
      return {
        ...result,
        currentData: fixture.studentsMissing ? undefined : studentPage,
        isFetching: fixture.studentsFetching,
        isError: fixture.studentsError,
      };
    },
    useCreateManagedHouseMutation: mutation,
    useUpdateManagedHouseMutation: () => [fixture.updateHouse, { isLoading: false }],
    useDeleteManagedHouseMutation: mutation,
    usePreviewHouseAssignmentMutation: mutation,
    useCommitHouseAssignmentMutation: mutation,
    useSetHouseLeaderMutation: mutation,
    useSetDivisionLeaderMutation: mutation,
  };
});
function workspace() {
  return (
    <Provider
      store={configureStore({
        reducer: {
          auth: () => ({
            permissions: fixture.permissions.map((name) => ({ name, isGranted: true })),
          }),
          confirmPopup: () => ({ isChanges: false }),
        },
      })}
    >
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <HouseManagement />
      </ThemeProvider>
    </Provider>
  );
}
function mount() {
  return render(workspace());
}
beforeEach(() => {
  fixture.query = 'tab=students';
  fixture.permissions = ['Students.Records.HouseManagement.View'];
  fixture.houseCapability = false;
  fixture.houses = null;
  fixture.housesFetching = false;
  fixture.housesError = false;
  fixture.academicError = false;
  fixture.studentTotal = 1;
  fixture.studentsMissing = false;
  fixture.studentsFetching = false;
  fixture.studentsError = false;
  vi.clearAllMocks();
  fixture.updateHouse.mockImplementation(() => ({ unwrap: () => Promise.resolve() }));
});
it('lets House-only viewers read the scoped roster without exposing write actions', () => {
  mount();
  expect(screen.getByText('Riya')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Assign or move' })).toBeNull();
  expect(screen.queryByRole('checkbox', { name: 'Select Riya' })).toBeNull();
  expect(fixture.input).toHaveBeenCalledWith(expect.objectContaining({ academicMediumId: 'm1' }));
});
it('keeps class filter changes in the URL and resets the page', () => {
  fixture.query = 'tab=students&page=2';
  mount();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Class' }));
  fireEvent.click(screen.getByRole('option', { name: '6' }));
  expect(fixture.push).toHaveBeenCalledWith(expect.stringContaining('class=c1'), { scroll: false });
  expect(fixture.push.mock.calls.at(-1)?.[0]).not.toContain('page=2');
});
it('clears checked students when class context changes', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  const view = mount();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya' }));
  expect(screen.getByText('1 selected')).toBeVisible();
  fixture.query = 'tab=students&class=c1';
  view.rerender(workspace());
  expect(screen.getByText('0 selected')).toBeVisible();
});
it('requires explicit medium capability before allowing house creation with Add', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  fixture.query = 'tab=houses';
  const view = mount();
  expect(screen.getByRole('button', { name: 'Create house' })).toBeDisabled();
  fixture.houseCapability = true;
  view.rerender(workspace());
  expect(screen.getByRole('button', { name: 'Create house' })).toBeEnabled();
});

it('shows loading records for a new query while previous-argument data is unavailable', () => {
  fixture.studentsMissing = true;
  fixture.studentsFetching = true;
  mount();
  expect(screen.getByRole('progressbar', { name: 'Loading records' })).toBeVisible();
  expect(screen.queryByText('No enrolled students in this medium.')).toBeNull();
});

it('keeps current rows visible during a same-query background refresh', () => {
  fixture.studentsFetching = true;
  mount();
  expect(screen.getByText('Riya')).toBeVisible();
  expect(screen.getByText('Refreshing records')).toBeVisible();
  expect(screen.queryByRole('progressbar', { name: 'Loading records' })).toBeNull();
});

it('returns to the last valid house page only after a shrinking refresh settles', () => {
  fixture.query = 'tab=houses&page=1&pageSize=25';
  fixture.houses = { items: [], totalCount: 26, canManage: true };
  const view = mount();
  expect(fixture.replace).not.toHaveBeenCalled();
  fixture.houses = { ...fixture.houses, totalCount: 25 };
  fixture.housesFetching = true;
  view.rerender(workspace());
  expect(fixture.replace).not.toHaveBeenCalled();
  fixture.housesFetching = false;
  view.rerender(workspace());
  expect(fixture.replace).toHaveBeenCalledWith('/student/records/houses?tab=houses&pageSize=25', {
    scroll: false,
  });
});

it('keeps the house filter when membership removal shrinks the last student page', () => {
  fixture.query = 'tab=students&house=h1&houseName=Falcon&page=1&pageSize=25';
  fixture.studentTotal = 26;
  const view = mount();
  expect(fixture.replace).not.toHaveBeenCalled();
  fixture.studentTotal = 25;
  view.rerender(workspace());
  expect(fixture.replace).toHaveBeenCalledWith(
    '/student/records/houses?tab=students&house=h1&houseName=Falcon&pageSize=25',
    { scroll: false }
  );
});

it('preserves a dirty house edit and its reviewed stamp during a background refresh', async () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  fixture.query = 'tab=houses';
  const house = {
    id: 'h1',
    name: 'Falcon',
    color: '#123456',
    memberCount: 0,
    leader: null,
    concurrencyStamp: 'reviewed-stamp',
    canManage: true,
  };
  fixture.houses = { items: [house], totalCount: 1, canManage: true };
  const view = mount();
  fireEvent.click(screen.getByRole('button', { name: 'Edit Falcon' }));
  fireEvent.change(screen.getByLabelText(/House name/), { target: { value: 'Draft name' } });
  fixture.housesFetching = true;
  view.rerender(workspace());
  fixture.houses = {
    ...fixture.houses,
    items: [{ ...house, concurrencyStamp: 'new-server-stamp' }],
  };
  fixture.housesFetching = false;
  view.rerender(workspace());
  expect(screen.getByLabelText(/House name/)).toHaveValue('Draft name');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(fixture.updateHouse).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Draft name', concurrencyStamp: 'reviewed-stamp' })
    )
  );
});

it.each(['catalogue', 'academic'] as const)(
  'preserves a dirty house edit through a transient %s read failure and recovery',
  async (failure) => {
    fixture.permissions.push('Students.Records.HouseManagement.Add');
    fixture.query = 'tab=houses';
    const house = {
      id: 'h1',
      name: 'Falcon',
      color: '#123456',
      memberCount: 0,
      leader: null,
      concurrencyStamp: 'reviewed-stamp',
      canManage: true,
    };
    fixture.houses = { items: [house], totalCount: 1, canManage: true };
    const view = mount();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Falcon' }));
    fireEvent.change(screen.getByLabelText(/House name/), { target: { value: 'Draft name' } });
    if (failure === 'catalogue') fixture.housesError = true;
    else fixture.academicError = true;
    view.rerender(workspace());
    expect(screen.getByLabelText(/House name/)).toHaveValue('Draft name');
    fixture.housesError = false;
    fixture.academicError = false;
    fixture.houses = {
      ...fixture.houses,
      items: [{ ...house, concurrencyStamp: 'new-server-stamp' }],
    };
    view.rerender(workspace());
    expect(screen.getByLabelText(/House name/)).toHaveValue('Draft name');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(fixture.updateHouse).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Draft name', concurrencyStamp: 'reviewed-stamp' })
      )
    );
  }
);

it('clears checked students on a failed roster refresh and keeps them clear after recovery', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  const view = mount();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya' }));
  expect(screen.getByText('1 selected')).toBeVisible();
  fixture.studentsError = true;
  view.rerender(workspace());
  fixture.studentsError = false;
  view.rerender(workspace());
  expect(screen.getByText('0 selected')).toBeVisible();
});
