import type { IColumn, ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type { HouseDivision, HouseCataloguePage } from 'src/redux/student/house-management/house-management-types';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import HouseManagement from '.';

const fixture = vi.hoisted(() => ({
  query: 'tab=students',
  permissions: ['Students.Records.HouseManagement.View'],
  push: vi.fn(),
  replace: vi.fn(),
  input: vi.fn(),
  divisionInput: vi.fn(),
  divisions: [] as HouseDivision[],
  houseCapability: false,
  houses: null as HouseCataloguePage | null,
  housesFetching: false,
  housesError: false,
  academicError: false,
  scopeRevision: 'original-scope',
  studentTotal: 1,
  studentsMissing: false,
  studentsFetching: false,
  studentsError: false,
  columns: vi.fn<(columns: IColumn[]) => void>(),
  updateHouse: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(fixture.query),
  usePathname: () => '/student/records/houses',
  useRouter: () => ({ push: fixture.push, replace: fixture.replace }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/hooks/use-student-academic-scope', () => {
  const english = {
    id: 'm1',
    name: 'English',
    educationMediumStages: [
      { standards: [{ id: 'c1', name: '6', divisions: [{ id: 'd1', name: 'A' }] }] },
    ],
  };
  const board = { id: 'b1', name: 'Board', educationMediums: [english] };
  return {
    useStudentAcademicScope: () => ({
      currentYear: { id: 'y1' },
      currentBoard: board,
      currentMedium: english,
      boards: [
        board,
        {
          id: 'b2',
          name: 'Board 2',
          educationMediums: [{ id: 'm2', name: 'Hindi', educationMediumStages: [] }],
        },
      ],
      isLoading: false,
      isError: fixture.academicError,
      scopeRevision: fixture.scopeRevision,
    }),
  };
});
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
    rowProps,
  }: {
    columns: IColumn[];
    data: Record<string, unknown>[];
    isLoading: boolean;
    isRefreshing: boolean;
    noDataText: React.ReactNode;
    rowProps: ICustomizableTableProps['rowProps'];
  }) => {
    fixture.columns(columns);
    return (
      <section aria-label="Records">
        {isLoading && <div role="progressbar" aria-label="Loading records" />}
        {isRefreshing && <span>Refreshing records</span>}
        {!isLoading && !data.length && noDataText}
        {data.map((row, index) => (
          <div key={index} data-leadership={rowProps?.(row, index)?.['data-leadership']}>
            {columns.map((column) => (
              <span key={column.id}>
                {column.render ? column.render(row[column.id] ?? '-', row) : String(row[column.id] ?? '')}
              </span>
            ))}
          </div>
        ))}
      </section>
    );
  },
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
        divisionName: 'A',
        houseName: 'Falcon',
        isHouseLeader: true,
        isDivisionLeader: true,
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
    useGetHouseLogoQuery: () => ({ currentData: undefined }),
    useUploadHouseLogoMutation: mutation,
    useGetHouseDivisionsQuery: (input: unknown) => {
      fixture.divisionInput(input);
      return { ...result, currentData: { items: fixture.divisions, totalCount: fixture.divisions.length } };
    },
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
          [api.reducerPath]: api.reducer,
        },
        middleware: (defaults) => defaults().concat(api.middleware),
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
  fixture.divisions = [];
  fixture.housesFetching = false;
  fixture.housesError = false;
  fixture.academicError = false;
  fixture.scopeRevision = 'original-scope';
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

it('requires a specific division before selecting students for either membership action', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  const view = mount();
  expect(screen.getByText('Select a division to change house membership.')).toBeVisible();
  expect(screen.queryByRole('checkbox', { name: 'Select Riya' })).not.toBeInTheDocument();
  expect(fixture.columns.mock.lastCall?.[0]).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ id: 'selected' })])
  );
  expect(screen.getByRole('button', { name: 'Assign or move' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Remove from house' })).toBeDisabled();

  fixture.query = 'tab=students&class=c1&division=d1';
  view.rerender(workspace());
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya' }));
  expect(screen.getByRole('button', { name: 'Assign or move' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Remove from house' })).toBeEnabled();

  fixture.query = 'tab=students';
  view.rerender(workspace());
  expect(screen.queryByRole('checkbox', { name: 'Select Riya' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Assign or move' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Remove from house' })).toBeDisabled();
});

it('ignores a Division URL value without its parent class', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  fixture.query = 'tab=students&division=d1';
  mount();
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent('All divisions');
  expect(screen.queryByRole('checkbox', { name: 'Select Riya' })).not.toBeInTheDocument();
  expect(fixture.input).toHaveBeenLastCalledWith(expect.objectContaining({ divisionId: undefined }));
});

it('enables each academic filter only after its parent is selected', () => {
  fixture.query = 'tab=students&board=unavailable&medium=m1&class=c1&division=d1';
  const view = mount();
  const field = (name: string) => screen.getByRole('combobox', { name });
  expect(field('Medium')).toHaveAttribute('aria-disabled', 'true');
  expect(field('Class')).toHaveAttribute('aria-disabled', 'true');
  expect(field('Division')).toHaveAttribute('aria-disabled', 'true');

  fireEvent.mouseDown(field('Board'));
  fireEvent.click(screen.getByRole('option', { name: 'Board' }));
  expect(fixture.push).toHaveBeenLastCalledWith('/student/records/houses?tab=students&board=b1', {
    scroll: false,
  });
  fixture.query = 'tab=students&board=b1';
  view.rerender(workspace());
  expect(field('Medium')).not.toHaveAttribute('aria-disabled');
  expect(field('Class')).toHaveAttribute('aria-disabled', 'true');
  expect(field('Division')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByText('Select a medium to view records.')).toBeVisible();

  fixture.query = 'tab=students&board=b1&medium=m1';
  view.rerender(workspace());
  expect(field('Class')).not.toHaveAttribute('aria-disabled');
  expect(field('Division')).toHaveAttribute('aria-disabled', 'true');

  fixture.query = 'tab=students&board=b1&medium=m1&class=c1&division=d1';
  view.rerender(workspace());
  expect(field('Division')).not.toHaveAttribute('aria-disabled');
  fireEvent.mouseDown(field('Board'));
  fireEvent.click(screen.getByRole('option', { name: 'Board 2' }));
  expect(fixture.push).toHaveBeenLastCalledWith('/student/records/houses?tab=students&board=b2', {
    scroll: false,
  });
});

it('shows and exports class with division under the existing class sort field', () => {
  mount();
  const columns = fixture.columns.mock.lastCall?.[0] ?? [];
  expect(columns.map((column) => column.id)).toEqual([
    'studentName',
    'admissionNumber',
    'standardName',
    'rollNumber',
    'houseName',
  ]);
  const classColumn = columns.find((column) => column.id === 'standardName');
  expect(classColumn).toMatchObject({ label: 'Class / Division', isSort: true });
  expect(classColumn?.exportValue?.('6', { divisionName: 'A' })).toBe('6 / A');
  expect(classColumn?.exportValue?.('6', { divisionName: null })).toBe('6');
  expect(screen.getByText('6 / A')).toBeVisible();
});

it('shows separate role icons beside a dual leader with hover and keyboard tooltips', async () => {
  const user = userEvent.setup();
  mount();
  const house = screen.getByRole('img', { name: 'House leader · Falcon' });
  const division = screen.getByRole('img', { name: 'Division leader · 6 / A' });
  const identity = screen.getByText('Riya').parentElement;
  expect(identity?.closest('[data-leadership]')).toHaveAttribute('data-leadership', 'both');
  expect(identity).toContainElement(house);
  expect(identity).toContainElement(division);

  await user.hover(house);
  expect(await screen.findByRole('tooltip', { name: 'House leader · Falcon' })).toBeVisible();
  await user.keyboard('{Escape}');
  await user.unhover(house);

  act(() => house.focus());
  await user.tab();
  expect(division).toHaveFocus();
  expect(await screen.findByRole('tooltip', { name: 'Division leader · 6 / A' })).toBeVisible();
});

it('shows both leadership positions with the incumbent house while filtering divisions', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  fixture.query = 'tab=divisions&class=c1&division=d1&leaderHouse=h1&leaderHouseName=Falcon';
  fixture.divisions = [{
    id: 'd1', name: 'A', standardId: 'c1', standardName: '6', studentCount: 20,
    leader: null,
    houseLeader: {
      enrollmentId: 'e2', studentId: 's2', studentName: 'Mira', standardId: 'c1', standardName: '6',
      houseName: 'Ocean', isHouseLeader: true, isDivisionLeader: false, concurrencyStamp: 'v1',
    },
    concurrencyStamp: 'v1', canManage: true,
  }];
  mount();
  expect(screen.getByRole('tab', { name: 'Assign Leaders' })).toHaveAttribute('aria-selected', 'true');
  expect(fixture.divisionInput).toHaveBeenCalledWith(expect.objectContaining({
    standardId: 'c1', divisionId: 'd1', houseId: 'h1',
  }));
  expect(screen.getByText('Mira')).toBeVisible();
  expect(screen.getByText('Ocean')).toBeVisible();
  expect(screen.getByText('Vacant')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Manage leaders for 6 / A' })).toBeEnabled();
});

it('uses short house row action labels and opens Assign Leaders for that house', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add', 'Students.Records.HouseManagement.Delete');
  fixture.query = 'tab=houses';
  fixture.houses = { items: [{
    id: 'h1', name: 'Falcon', color: '#123456', memberCount: 0, houseLeaderCount: 0,
    concurrencyStamp: 'v1', canManage: true,
  }], totalCount: 1, canManage: true };
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'More actions for Falcon' }));
  expect(screen.getByRole('menuitem', { name: 'Delete Falcon' })).toHaveTextContent(/^Delete$/);
  const manageLeader = screen.getByRole('menuitem', { name: 'Manage leader for Falcon' });
  expect(manageLeader).toHaveTextContent(/^Manage leader$/);
  fireEvent.click(manageLeader);
  expect(fixture.push).toHaveBeenCalledWith(
    '/student/records/houses?tab=divisions&leaderHouse=h1&leaderHouseName=Falcon',
    { scroll: false }
  );
});

it('keeps class filter changes in the URL and resets the page', () => {
  fixture.query = 'tab=students&page=2';
  mount();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Class' }));
  fireEvent.click(screen.getByRole('option', { name: '6' }));
  expect(fixture.push).toHaveBeenCalledWith(expect.stringContaining('class=c1'), { scroll: false });
  expect(fixture.push.mock.calls.at(-1)?.[0]).not.toContain('page=2');
});
it('clears checked students when the class filter is reset', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  fixture.query = 'tab=students&class=c1&division=d1';
  const view = mount();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya' }));
  expect(screen.getByText('1 selected')).toBeVisible();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Class' }));
  fireEvent.click(screen.getByRole('option', { name: 'All classes' }));
  expect(fixture.push).toHaveBeenLastCalledWith('/student/records/houses?tab=students', {
    scroll: false,
  });
  fixture.query = 'tab=students';
  view.rerender(workspace());
  expect(screen.queryByRole('checkbox', { name: 'Select Riya' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute('aria-disabled', 'true');
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

it('discards an open house draft when academic access changes and keeps it closed on return', () => {
  fixture.permissions.push('Students.Records.HouseManagement.Add');
  fixture.query = 'tab=houses';
  fixture.houseCapability = true;
  const view = mount();
  fireEvent.click(screen.getByRole('button', { name: 'Create house' }));
  expect(screen.getByRole('dialog', { name: 'Add House' })).toBeVisible();

  fixture.scopeRevision = 'changed-scope';
  view.rerender(workspace());
  expect(screen.queryByRole('dialog', { name: 'Add House' })).not.toBeInTheDocument();

  fixture.scopeRevision = 'original-scope';
  view.rerender(workspace());
  expect(screen.queryByRole('dialog', { name: 'Add House' })).not.toBeInTheDocument();
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
    houseLeaderCount: 0,
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
      houseLeaderCount: 0,
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
  fixture.query = 'tab=students&class=c1&division=d1';
  const view = mount();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya' }));
  expect(screen.getByText('1 selected')).toBeVisible();
  fixture.studentsError = true;
  view.rerender(workspace());
  fixture.studentsError = false;
  view.rerender(workspace());
  expect(screen.getByText('0 selected')).toBeVisible();
});
