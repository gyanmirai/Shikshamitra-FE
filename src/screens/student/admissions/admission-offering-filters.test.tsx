import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionOfferingFilters } from './admission-offering-filters';

import type { AdmissionOfferingFilters as FilterValues } from './use-admission-offering-filters';

vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => ({
    currentData: {
      items: [
        {
          id: 'stage-1',
          label: 'Primary',
          boardId: 'board-1',
          boardName: 'CBSE',
          mediumId: 'medium-1',
          mediumName: 'English',
        },
      ],
    },
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('src/redux/class/classApi', () => ({
  useGetClassByMediumQuery: () => ({
    currentData: [
      { id: 'class-5', name: 'Class 5', educationMediumStageId: 'stage-1' },
      { id: 'class-10', name: 'Class 10', educationMediumStageId: 'stage-2' },
    ],
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

const cycle = { id: 'cycle-1', academicYearId: 'year-1' } as AdmissionCycle;
const values: FilterValues = {
  admissionCycleId: 'cycle-1',
  campusId: '',
  boardId: '',
  mediumId: '',
  stageId: '',
  standardId: '',
  isActive: '',
  availabilityStatus: '',
  configurationStatus: '',
  search: '',
  sorting: '',
  page: 0,
  rowsPerPage: 10,
};

const renderFilters = (filters: FilterValues) => {
  const onChange = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionOfferingFilters
        cycle={cycle}
        values={filters}
        onChange={onChange}
        filterAction={<button type="button">Filters</button>}
      />
    </ThemeProvider>
  );
  return onChange;
};

describe('Admission Offering primary filters', () => {
  it('shows Board, Medium, and Class outside advanced filters and resets descendants on Board change', async () => {
    const user = userEvent.setup();
    const onChange = renderFilters(values);

    expect(screen.getByRole('combobox', { name: 'Board' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Medium' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Class' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'Admission cycle' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Board' }));
    await user.click(screen.getByRole('option', { name: 'CBSE' }));
    expect(onChange).toHaveBeenCalledWith({
      boardId: 'board-1',
      mediumId: '',
      stageId: '',
      standardId: '',
    });
  });

  it('allows choosing Class without first selecting the advanced School level', async () => {
    const user = userEvent.setup();
    const onChange = renderFilters({ ...values, boardId: 'board-1', mediumId: 'medium-1' });

    await user.click(screen.getByRole('combobox', { name: 'Class' }));
    await user.click(screen.getByRole('option', { name: 'Class 5' }));
    expect(onChange).toHaveBeenCalledWith({ standardId: 'class-5' });
  });
});
