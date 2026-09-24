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

const renderFilters = (onUpdate = vi.fn()) => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <WorkflowListFilters filters={filters} onUpdate={onUpdate} />
      </LocalizationProvider>
    </ThemeProvider>
  );
  return onUpdate;
};

describe('WorkflowListFilters', () => {
  it('keeps advanced filters in an anchored popover and applies staged values', async () => {
    const user = userEvent.setup();
    const onUpdate = renderFilters();

    expect(screen.queryByRole('dialog', { name: 'Workflow filters' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('dialog', { name: 'Workflow filters' })).toBeVisible();

    await user.type(screen.getByRole('spinbutton', { name: 'Version' }), '3');
    expect(onUpdate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ version: '3', status: 'all', usage: 'all' })
      )
    );
  });

  it('clears only the advanced filter values', async () => {
    const user = userEvent.setup();
    const onUpdate = renderFilters();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onUpdate).toHaveBeenCalledWith({
      status: 'all',
      version: '',
      usage: 'all',
      createdFrom: '',
      createdTo: '',
    });
  });
});
