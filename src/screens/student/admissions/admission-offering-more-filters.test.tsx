import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { addIcon } from '@iconify/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
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
  useGetAdmissionCampusQuery: () => ({ currentData: null }),
  useLazyGetAdmissionCampusesQuery: () => [campusMocks.search],
}));

const campusMocks = vi.hoisted(() => ({
  search: vi.fn(),
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
  const campus = { id: 'campus-1', name: 'North Campus', code: 'NORTH', isActive: true };

  beforeEach(() => {
    campusMocks.search.mockReset();
    campusMocks.search.mockImplementation(({ search }) => ({
      unwrap: async () =>
        search && !campus.name.toLowerCase().includes(String(search).toLowerCase())
          ? { items: [], totalCount: 0 }
          : { items: [campus], totalCount: 1 },
    }));
  });

  it('loads active campus choices with All Campuses selected and allows removing just that restriction', async () => {
    const user = userEvent.setup();
    const onChange = renderFilters();
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const campusField = screen.getByRole('combobox', { name: 'Campus' });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('option', { name: 'North Campus · NORTH' })).toBeVisible();
    expect(campusField).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(campusField).toHaveAttribute('aria-expanded', 'false');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByRole('option', { name: 'North Campus · NORTH' }));
    await user.click(screen.getByRole('combobox', { name: 'Campus' }));
    await user.click(await screen.findByRole('option', { name: 'All Campuses' }));
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ campusId: '' }));
    expect(campusMocks.search).not.toHaveBeenCalledWith(
      expect.objectContaining({ search: 'All Campuses' })
    );
    expect(campusMocks.search).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true, skipCount: 0 })
    );
  });

  it('applies a selected campus by its ID', async () => {
    const user = userEvent.setup();
    const onChange = renderFilters();
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('combobox', { name: 'Campus' }));
    await user.click(await screen.findByRole('option', { name: 'North Campus · NORTH' }));
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ campusId: campus.id }));
  });

  it('disables campus selection after a confirmed empty result', async () => {
    campusMocks.search.mockReturnValue({ unwrap: async () => ({ items: [], totalCount: 0 }) });
    const user = userEvent.setup();
    renderFilters();
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(await screen.findByText('No active campuses are configured.')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Campus' })).toBeDisabled();
  });

  it('can remove a saved campus restriction even when no active campuses remain', async () => {
    campusMocks.search.mockReturnValue({ unwrap: async () => ({ items: [], totalCount: 0 }) });
    const user = userEvent.setup();
    const onChange = renderFilters({ ...values, campusId: campus.id });
    await user.click(screen.getByRole('button', { name: 'Filters (1)' }));
    expect(await screen.findByText('No active campuses are configured.')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Campus' })).toBeEnabled();
    await user.click(screen.getByRole('combobox', { name: 'Campus' }));
    await user.click(await screen.findByRole('option', { name: 'All Campuses' }));
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ campusId: '' }));
  });

  it('reports a search with no matches without disabling an available catalogue', async () => {
    const user = userEvent.setup();
    renderFilters();
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const field = screen.getByRole('combobox', { name: 'Campus' });
    await user.clear(field);
    await user.type(field, 'Unknown Campus');
    expect(await screen.findByText('No matching active campuses')).toBeVisible();
    expect(field).toBeEnabled();
    expect(screen.queryByText('No active campuses are configured.')).not.toBeInTheDocument();
  });

  it('distinguishes a failed catalogue request from a confirmed empty result', async () => {
    campusMocks.search.mockReturnValue({ unwrap: () => Promise.reject(new Error('403 Forbidden')) });
    const user = userEvent.setup();
    renderFilters();
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('combobox', { name: 'Campus' }));
    expect((await screen.findAllByRole('button', { name: 'Retry results' }))[0]).toBeVisible();
    expect(screen.queryByText('No active campuses are configured.')).not.toBeInTheDocument();
  });

  it('stages advanced selections until Apply filters is clicked', async () => {
    const user = userEvent.setup();
    const onChange = renderFilters();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('combobox', { name: 'Active Status' }));
    await user.click(screen.getByRole('option', { name: /^Active$/ }));

    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
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
    expect(screen.queryByRole('combobox', { name: 'Admission Cycle' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Availability' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Campus' })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'Board' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Availability' }));
    await user.click(screen.getByRole('option', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));

    expect(onChange).toHaveBeenCalledWith({
      campusId: 'campus-1',
      availabilityStatus: '2',
      stageId: 'stage-1',
      isActive: '',
      configurationStatus: '',
    });
  });
});
