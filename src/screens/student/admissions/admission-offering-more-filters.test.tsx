import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { addIcon } from '@iconify/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionOfferingMoreFilters } from './admission-offering-more-filters';

import type { AdmissionOfferingFilters } from './use-admission-offering-filters';

vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => ({
    data: { items: [] },
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('src/redux/class/classApi', () => ({
  useGetClassByMediumQuery: () => ({
    data: [],
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('src/redux/student/admissions/admission-campuses-api', () => ({
  useGetAdmissionCampusQuery: () => ({ data: null }),
}));

vi.mock('./use-admission-campus-options', () => ({
  useAdmissionCampusOptions: () => async () => ({ data: [], hasMore: false }),
}));

['filter-variant', 'filter-off-outline', 'check', 'close'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const values: AdmissionOfferingFilters = {
  admissionCycleId: 'cycle-1',
  campusId: '',
  boardId: '',
  mediumId: '',
  stageId: '',
  standardId: '',
  isActive: '',
  availabilityStatus: '',
  configurationStatus: '',
  search: 'grade',
  sorting: '',
  page: 0,
  rowsPerPage: 10,
};

const renderFilters = (filters = values) => {
  const onChange = vi.fn();
  const cycles = [
    { id: 'cycle-1', name: 'Admissions 2026–27' },
    { id: 'cycle-2', name: 'Admissions 2027–28' },
  ] as AdmissionCycle[];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionOfferingMoreFilters cycle={cycles[0]} values={filters} onChange={onChange} />
    </ThemeProvider>
  );
  return onChange;
};

describe('AdmissionOfferingMoreFilters', () => {
  it('stages advanced selections until Apply filters is clicked', async () => {
    const user = userEvent.setup();
    const onChange = renderFilters();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('combobox', { name: 'Active status' }));
    await user.click(screen.getByRole('option', { name: /^Active$/ }));

    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onChange).toHaveBeenCalledWith({
      campusId: '',
      availabilityStatus: '',
      stageId: '',
      isActive: 'true',
      configurationStatus: '',
    });
  });

  it('clears only the advanced values', async () => {
    const user = userEvent.setup();
    const onChange = renderFilters({ ...values, isActive: 'true' });

    await user.click(screen.getByRole('button', { name: 'Filters (1)' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenCalledWith({
      campusId: '',
      availabilityStatus: '',
      stageId: '',
      isActive: '',
      configurationStatus: '',
    });
  });

  it('keeps cycle in the main context and applies availability without changing academic selections', async () => {
    const user = userEvent.setup();
    const onChange = renderFilters({
      ...values,
      campusId: 'campus-1',
      boardId: 'board-1',
      mediumId: 'medium-1',
      stageId: 'stage-1',
      standardId: 'class-5',
    });

    await user.click(screen.getByRole('button', { name: 'Filters (2)' }));
    expect(screen.queryByRole('combobox', { name: 'Admission cycle' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Availability' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Campus' })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'Board' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Availability' }));
    await user.click(screen.getByRole('option', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(onChange).toHaveBeenCalledWith({
      campusId: 'campus-1',
      availabilityStatus: '2',
      stageId: 'stage-1',
      isActive: '',
      configurationStatus: '',
    });
  });
});
