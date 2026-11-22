import { addIcon } from '@iconify/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { WorkflowListFilters } from './workflow-list-filters';

import type { WorkflowFilters } from './use-workflow-filters';

['filter-variant', 'filter-off-outline', 'check', 'close'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const filters: WorkflowFilters = {
  search: 'regular',
  status: 'all',
  version: '',
  usage: 'all',
  createdFrom: '',
  createdTo: '',
  page: 0,
  rowsPerPage: 10,
};

const renderFilters = (values = filters) => {
  const onUpdate = vi.fn();
  const onClear = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <WorkflowListFilters filters={values} onUpdate={onUpdate} onClear={onClear} />
      </LocalizationProvider>
    </ThemeProvider>
  );
  return { onUpdate, onClear };
};

describe('WorkflowListFilters', () => {
  it('keeps advanced filters in an anchored popover and applies staged values', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderFilters();

    expect(screen.queryByRole('dialog', { name: 'Workflow Filters' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('dialog', { name: 'Workflow Filters' })).toBeVisible();

    await user.type(screen.getByRole('spinbutton', { name: 'Version' }), '3');
    expect(onUpdate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ version: '3', status: 'all', usage: 'all' })
      )
    );
  });

  it('requests clearing all applied filters', async () => {
    const user = userEvent.setup();
    const { onUpdate, onClear } = renderFilters({ ...filters, version: '2' });

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClear).toHaveBeenCalledOnce();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('explains a reversed range and prevents applying it', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderFilters({
      ...filters,
      createdFrom: '2026-11-18',
      createdTo: '2026-11-17',
    });

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    expect(screen.getByText('End date must be on or after the start date.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeDisabled();
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
