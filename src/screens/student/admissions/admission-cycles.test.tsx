import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import AdmissionCyclesScreen from './admission-cycles';

type Filters = {
  academicYearId: string;
  status: '' | 0 | 1 | 2 | 3;
  windowStatus: '' | 0 | 1 | 2 | 3 | 4;
  search: string;
  columnFilters: string;
  page: number;
  rowsPerPage: number;
};

const mocks = vi.hoisted(() => ({
  filters: {
    academicYearId: '',
    status: '',
    windowStatus: '',
    search: '',
    columnFilters: '',
    page: 0,
    rowsPerPage: 10,
  } as Filters,
  update: vi.fn(),
  clear: vi.fn(),
  query: vi.fn(),
  result: {
    data: { items: [] as AdmissionCycle[], totalCount: 0 } as
      { items: AdmissionCycle[]; totalCount: number } | undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  errorToast: vi.fn(),
  dismissToast: vi.fn(),
}));

vi.mock('./use-admission-cycle-filters', () => ({
  useAdmissionCycleFilters: () => ({
    filters: mocks.filters,
    update: mocks.update,
    clear: mocks.clear,
  }),
}));
vi.mock('src/redux/year/yearApi', () => ({
  useGetYearQuery: () => ({
    data: { items: [{ id: 'year-1', name: '2027-2028', startDate: '2027-04-01' }] },
    isLoading: false,
    isError: false,
  }),
}));
vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useGetAdmissionCyclesQuery: (args: unknown) => {
    mocks.query(args);
    return mocks.result;
  },
  ...Object.fromEntries(
    [
      'Create',
      'Update',
      'Publish',
      'Close',
      'Reopen',
      'Archive',
      'Delete',
      'Clone',
      'UpdateAdmissionCycleWindow',
      'Schedule',
      'Validate',
    ].map((action) => [
      action === 'UpdateAdmissionCycleWindow'
        ? 'useUpdateAdmissionCycleWindowMutation'
        : `use${action}AdmissionCycleMutation`,
      () => [vi.fn(), { isLoading: false }],
    ])
  ),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.errorToast, dismiss: mocks.dismissToast },
}));
// Dialog workflows have their own tests. Keep the real table, toolbar, row actions,
// skeletons, empty-state illustration and Student error presentation mounted here.
vi.mock('./admission-cycle-dialog', () => ({ AdmissionCycleDialog: () => null }));
vi.mock('./admission-cycle-action-dialog', () => ({ AdmissionCycleActionDialog: () => null }));
vi.mock('./admission-cycle-configuration-dialog', () => ({
  AdmissionCycleConfigurationDialog: () => null,
}));
vi.mock('./admission-numbering-dialog', () => ({ AdmissionNumberingDialog: () => null }));

// Register decorative icons locally so real components do not fetch Iconify data.
[
  ...Object.values(GlobalIcons),
  'mdi:cog-outline',
  'mdi:plus',
  'solar:restart-bold',
  'solar:magnifer-linear',
  'mingcute:close-line',
  'lucide:info',
  'eva:arrow-back-fill',
  'solar:pen-bold',
  'solar:trash-bin-trash-bold',
  'eva:more-vertical-fill',
  'solar:menu-dots-bold',
  'mdi:lock-open-outline',
  'fluent:filter-12-filled',
].forEach((name) => addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 }));

const cycle: AdmissionCycle = {
  id: 'cycle-1',
  name: 'Fresh Admission',
  code: 'ADM27',
  academicYearId: 'year-1',
  academicYearName: '2027-2028',
  startDate: '2027-01-01',
  endDate: '2027-03-31',
  status: 0,
  windowStatus: 0,
  isAcceptingApplications: false,
  linkedOfferingCount: 2,
  activeOfferingCount: 1,
  applicationCount: 12,
  concurrencyStamp: 'stamp-1',
};

const theme = createTheme(defaultSettings);
function renderScreen(grants = ['Students.Admissions.Add', 'Students.Admissions.Delete']) {
  const state = {
    globalState: { currentYear: { id: 'year-1' } },
    auth: { permissions: grants.map((name) => ({ name, isGranted: true })) },
  };
  const store = configureStore({ reducer: () => state });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AdmissionCyclesScreen />
      </ThemeProvider>
    </Provider>
  );
}

describe('Admission periods table states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.filters = {
      academicYearId: '',
      status: '',
      windowStatus: '',
      search: '',
      columnFilters: '',
      page: 0,
      rowsPerPage: 10,
    };
    Object.assign(mocks.result, {
      data: { items: [], totalCount: 0 },
      isLoading: false,
      isFetching: false,
      isError: false,
    });
  });

  it.each(['isLoading', 'isFetching'] as const)(
    'keeps the known header, filters, table columns and pagination during %s without claiming empty',
    (loadingFlag) => {
      mocks.result.data = undefined;
      mocks.result[loadingFlag] = true;
      renderScreen();

      expect(screen.getByRole('heading', { name: 'Admission periods' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add cycle' })).toBeEnabled();
      expect(screen.getByRole('combobox', { name: 'Academic year' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Search table' })).toBeInTheDocument();
      const table = screen.getByRole('table');
      // Responsive status columns remain mounted while CSS chooses their visibility.
      expect(within(table).getAllByRole('columnheader', { hidden: true })).toHaveLength(8);
      const rows = table.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(10);
      rows.forEach((row) => expect(row.querySelectorAll('td')).toHaveLength(8));
      expect(table.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument();
      expect(screen.queryByText(/No admission periods/)).not.toBeInTheDocument();
    }
  );

  it('renders supplied records and server totals without adding table utilities', () => {
    mocks.result.data = { items: [cycle], totalCount: 36 };
    renderScreen();

    const table = screen.getByRole('table');
    expect(within(table).getByText('Fresh Admission')).toBeInTheDocument();
    const row = within(table).getByText('Fresh Admission').closest('tr')!;
    expect(within(row).getByText('2')).toBeInTheDocument();
    expect(within(row).getByText('12')).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Start date' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'End date' })).toBeInTheDocument();
    expect(within(table).getByText('01-01-2027')).toBeInTheDocument();
    expect(within(table).getByText('31-03-2027')).toBeInTheDocument();
    expect(screen.getByText('1–10 of 36')).toBeInTheDocument();
    expect(table.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Columns' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /full.?screen/i })).not.toBeInTheDocument();
  });

  it('shows the successful first-use empty state only after loading completes', () => {
    renderScreen();

    expect(screen.getByText('No admission periods have been created yet.')).toBeInTheDocument();
    expect(
      screen.queryByText('No admission periods match the selected filters.')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('table').querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('keeps domain filters visible with a clear-filters action for their empty result', () => {
    mocks.filters.status = 2;
    renderScreen();

    expect(screen.getByRole('combobox', { name: 'Lifecycle' })).toHaveTextContent('Closed');
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(
      screen.queryByText('No admission periods have been created yet.')
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole('table')).getByRole('button', { name: 'Clear filters' })
    );
    expect(mocks.update).toHaveBeenCalledWith({
      search: '',
      status: '',
      windowStatus: '',
      columnFilters: '',
    });
    expect(mocks.query).toHaveBeenLastCalledWith(expect.objectContaining({ status: 2 }));
  });

  it('announces API failure through the Student toast without a successful-empty result', async () => {
    mocks.result.data = undefined;
    mocks.result.isError = true;
    renderScreen();

    await waitFor(() =>
      expect(mocks.errorToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unable to load this enrollment data.',
        })
      )
    );
    expect(screen.getByRole('heading', { name: 'Admission periods' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry|reload/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Unable to load this enrollment data.')).not.toBeInTheDocument();
    expect
      .soft(screen.queryByText('No admission periods have been created yet.'))
      .not.toBeInTheDocument();
    expect
      .soft(screen.queryByText('No admission periods match the selected filters.'))
      .not.toBeInTheDocument();
    // EmptyContent's shared decorative illustration also signals a successful empty result.
    expect
      .soft(screen.getByRole('table').querySelector('svg[viewBox="0 0 320 280"]'))
      .not.toBeInTheDocument();
    expect(screen.getByRole('table').querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
  });

  it('preserves exact Add/Delete permission gating on page and row actions', () => {
    mocks.result.data = { items: [cycle], totalCount: 1 };
    renderScreen(['Students.Admissions.View']);

    expect(screen.getByRole('button', { name: 'Add cycle' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Numbering settings' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /More actions/ })).not.toBeInTheDocument();
    expect(screen.getByText('Fresh Admission')).toBeInTheDocument();
  });

  it('connects the rendered pagination and search to server query state', async () => {
    mocks.result.data = { items: [cycle], totalCount: 36 };
    renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(mocks.update).toHaveBeenCalledWith({ page: 1, rowsPerPage: 10 });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search table' }), {
      target: { value: '  Fresh Admission  ' },
    });
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ search: 'Fresh Admission' }));
  });

  it.each([
    { heading: 'Status', option: 'Draft', changes: { status: 0, windowStatus: '' } },
    { heading: 'Window', option: 'Archived', changes: { status: '', windowStatus: 4 } },
  ])('applies the $heading header filter to server state', async ({ heading, option, changes }) => {
    mocks.result.data = { items: [cycle], totalCount: 36 };
    renderScreen();

    fireEvent.click(screen.getByRole('button', { name: `Filter ${heading}`, hidden: true }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: `${heading} *` }));
    fireEvent.click(await screen.findByRole('option', { name: option }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({ ...changes, columnFilters: '' })
    );
    expect(screen.queryByRole('button', { name: 'Filter Actions' })).not.toBeInTheDocument();
  });

  it('restores both status chips from the same filters used by selectors and the server', () => {
    mocks.filters.status = 0;
    mocks.filters.windowStatus = 4;
    renderScreen();

    expect(screen.getByRole('combobox', { name: 'Lifecycle' })).toHaveTextContent('Draft');
    expect(screen.getByRole('combobox', { name: 'Application window' })).toHaveTextContent(
      'Archived'
    );
    expect(screen.getByRole('button', { name: /Status.*Equals.*Draft/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Window.*Equals.*Archived/ })).toBeInTheDocument();
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 0, windowStatus: 4 })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear (2)' }));
    expect(mocks.update).toHaveBeenCalledWith({ status: '', windowStatus: '', columnFilters: '' });
  });

  it('sends restored name and date criteria to the API rather than filtering the loaded page', () => {
    mocks.filters.columnFilters =
      '[{"column":"name","type":"contains","value":"Fresh","valueType":"string"},{"column":"endDate","type":"before","value":"01-04-2027","valueType":"date"}]';
    mocks.filters.page = 2;
    mocks.result.data = { items: [cycle], totalCount: 36 };
    renderScreen();

    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.objectContaining({
        columnFilters: mocks.filters.columnFilters,
        skipCount: 20,
      })
    );
    ['Cycle', 'Start date', 'End date', 'Offerings', 'Applications', 'Window', 'Status'].forEach(
      (heading) =>
        expect(
          screen.getByRole('button', { name: `Filter ${heading}`, hidden: true })
        ).toBeInTheDocument()
    );
  });

  it('applies an applications range including zero through the shared numeric editor', async () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'Filter Applications' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filter Type *' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Between' }));
    fireEvent.change(await screen.findByRole('spinbutton', { name: 'Applications Min *' }), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Applications Max *' }), {
      target: { value: '12' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({
        status: '',
        windowStatus: '',
        columnFilters:
          '[{"column":"applicationCount","type":"between","value":{"min":0,"max":12},"valueType":"number"}]',
      })
    );
  });

  it('clears an empty search without dropping the selected academic year', () => {
    mocks.filters.academicYearId = 'year-1';
    mocks.filters.search = 'missing';
    renderScreen();
    fireEvent.click(
      within(screen.getByRole('table')).getByRole('button', { name: 'Clear search' })
    );
    expect(mocks.update).toHaveBeenCalledWith({ search: '' });
    expect(mocks.clear).not.toHaveBeenCalled();
  });
});
