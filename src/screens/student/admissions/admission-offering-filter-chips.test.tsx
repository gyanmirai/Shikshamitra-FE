import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { FilterChips } from 'src/components/customizabaleTable/components/FilterChips';

import { AdmissionOfferingFilters } from './admission-offering-filters';
import { useAdmissionOfferingsScreen } from './use-admission-offerings-screen';

const mocks = vi.hoisted(() => ({
  query: '',
  replace: vi.fn(),
  getOfferings: vi.fn<(...args: unknown[]) => Record<string, unknown>>(() => ({
    currentData: { items: [], totalCount: 0 },
  })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/student/admissions/settings/offerings',
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('react-redux', () => ({ useSelector: () => undefined }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useGetAdmissionCyclesQuery: () => ({
    data: { items: [{ id: 'cycle-2', academicYearId: 'year-2', status: 1 }] },
  }),
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useGetAdmissionOfferingsQuery: (...args: unknown[]) => mocks.getOfferings(...args),
}));
vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => ({
    currentData: {
      items: [
        {
          id: 'stage-1',
          label: 'Primary',
          boardId: 'board-1',
          boardName: 'GSEB',
          mediumId: 'medium-1',
          mediumName: 'Gujarati',
        },
        {
          id: 'stage-2',
          label: 'Primary',
          boardId: 'board-2',
          boardName: 'CBSE',
          mediumId: 'medium-2',
          mediumName: 'English',
        },
      ],
    },
  }),
}));
vi.mock('src/redux/class/classApi', () => ({
  useGetClassByMediumQuery: () => ({
    currentData: [{ id: 'class-5', name: 'Class 5', educationMediumStageId: 'stage-2' }],
  }),
}));
vi.mock('./use-admission-offering-actions', () => ({
  useAdmissionOfferingActions: () => ({ permissions: { activate: true } }),
}));
vi.mock('./use-bulk-admission-offering-activation', () => ({
  useBulkAdmissionOfferingActivation: () => ({}),
}));

function OfferingFiltersHarness() {
  const state = useAdmissionOfferingsScreen();
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionOfferingFilters
        cycle={state.cycle}
        values={state.filters}
        onChange={state.update}
        filterAction={null}
      />
      <FilterChips
        filters={state.tableFilters}
        onRemoveFilter={(index) =>
          state.applyTableFilters(state.tableFilters.filter((_, position) => position !== index))
        }
        onClearAll={() => state.applyTableFilters([])}
      />
    </ThemeProvider>
  );
}

const readLastUrl = () => new URL(mocks.replace.mock.lastCall![0], 'http://localhost').searchParams;

describe('Offering compulsory academic context and removable filter chips', () => {
  beforeEach(() => {
    mocks.query = 'cycle=cycle-2&board=board-2&medium=medium-2';
    mocks.replace.mockClear();
    mocks.getOfferings.mockClear();
  });

  it('shows the selected compulsory context without an Active Filters row or Clear button', () => {
    render(<OfferingFiltersHarness />);
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('CBSE');
    expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveTextContent('English');
    expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Clear/ })).not.toBeInTheDocument();
  });

  it('removes Class with its keyboard delete action while retaining other criteria and context', async () => {
    const user = userEvent.setup();
    mocks.query += '&standard=class-5&availability=0&page=3';
    render(<OfferingFiltersHarness />);
    await user.click(screen.getByRole('button', { name: /Class → Equals → Class 5/ }));
    await user.keyboard('{Delete}');

    expect(
      screen.queryByRole('button', { name: /Class → Equals → Class 5/ })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear (1)' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('CBSE');
    expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveTextContent('English');
    const params = readLastUrl();
    expect(Object.fromEntries(params)).toEqual({
      cycle: 'cycle-2',
      board: 'board-2',
      medium: 'medium-2',
      availability: '0',
    });
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        admissionCycleId: 'cycle-2',
        boardId: 'board-2',
        mediumId: 'medium-2',
        standardId: undefined,
        availabilityStatus: 0,
        skipCount: 0,
      }),
      { skip: false }
    );
  });

  it('clears every removable chip permanently and retains selected context, search and sorting', async () => {
    const user = userEvent.setup();
    const criteria = JSON.stringify([
      { column: 'applicationCount', type: 'greaterThan', value: 10, valueType: 'number' },
    ]);
    mocks.query += `&standard=class-5&configuration=0&filters=${encodeURIComponent(criteria)}&search=keep&sort=name%20asc&page=3`;
    render(<OfferingFiltersHarness />);
    await user.click(screen.getByRole('button', { name: /^Clear \(/ }));

    expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Clear/ })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('CBSE');
    expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveTextContent('English');
    expect(Object.fromEntries(readLastUrl())).toEqual({
      cycle: 'cycle-2',
      board: 'board-2',
      medium: 'medium-2',
      search: 'keep',
      sort: 'name asc',
    });
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        boardId: 'board-2',
        mediumId: 'medium-2',
        standardId: undefined,
        configurationStatus: undefined,
        columnFilters: undefined,
        search: 'keep',
        sorting: 'name asc',
        skipCount: 0,
      }),
      { skip: false }
    );
  });
});
