import { it, vi, expect, describe } from 'vitest';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent } from '@testing-library/react';

import { PaginatedSearchSelect } from './paginated-search-select';

type Option = { id: string; name: string };

describe('PaginatedSearchSelect accessibility', () => {
  it('shows all options when reopening a selected definition and filters typed text', async () => {
    const user = userEvent.setup();
    const options = [
      { id: '1', name: 'First workflow' },
      { id: '2', name: 'Second workflow' },
    ];
    const fetchOptions = vi.fn(async (query: string) => ({
      data: options.filter((option) => option.name.toLowerCase().includes(query.toLowerCase())),
      hasMore: false,
    }));
    function Picker() {
      const [value, setValue] = useState<Option | null>(null);
      return (
        <PaginatedSearchSelect<Option>
          label="Workflow"
          value={value}
          onChange={(_, option) => setValue(option)}
          fetchOptions={fetchOptions}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          minChars={0}
          debounceMs={0}
          clearSearchOnOpen
        />
      );
    }
    render(<Picker />);
    const input = screen.getByRole('combobox', { name: 'Workflow' });
    await user.click(input);
    await user.click(await screen.findByRole('option', { name: 'First workflow' }));
    await user.click(input);
    expect(await screen.findByRole('option', { name: 'First workflow' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('option', { name: 'Second workflow' })).toBeVisible();
    await user.type(input, 'Second');
    expect(await screen.findByRole('option', { name: 'Second workflow' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'First workflow' })).not.toBeInTheDocument();
    expect(fetchOptions).toHaveBeenCalledWith('', 1);
  });
  it('loads subsequent pages when keyboard navigation reaches the last option', async () => {
    const user = userEvent.setup();
    const fetchOptions = vi.fn(async (_query: string, page: number) => ({
      data: [{ id: String(page), name: `Staff ${page}` }],
      hasMore: page < 2,
    }));
    render(
      <PaginatedSearchSelect<Option>
        label="Staff"
        value={null}
        fetchOptions={fetchOptions}
        getOptionLabel={(option) => option.name}
      />
    );
    const input = screen.getByRole('combobox', { name: 'Staff' });
    input.focus();
    await screen.findByRole('option', { name: 'Staff 1' });
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('option', { name: 'Staff 2' })).toBeVisible();
    expect(fetchOptions).toHaveBeenCalledWith('', 2);
    await user.keyboard('{Escape}');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('shows a failed lookup before the custom empty mapping message', async () => {
    render(
      <PaginatedSearchSelect<Option>
        label="Teachers"
        value={null}
        minChars={0}
        noOptionsText="No teachers are assigned to this class."
        fetchOptions={async () => {
          throw new Error('Network unavailable');
        }}
        getOptionLabel={(option) => option.name}
        onChange={() => undefined}
      />
    );
    await screen.findByRole('alert');
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Teachers' }));
    expect(await screen.findByText('Results are unavailable. Retry below.')).toBeVisible();
    expect(screen.queryByText('No teachers are assigned to this class.')).not.toBeInTheDocument();
  });

  it('gives every asynchronous progress indicator a meaningful name', async () => {
    render(
      <PaginatedSearchSelect<Option>
        label="Campus"
        value={null}
        loadingLabel="Loading campuses"
        fetchOptions={() => new Promise<never>(() => undefined)}
        getOptionLabel={(option) => option.name}
        onChange={() => undefined}
      />
    );

    expect(
      await screen.findAllByRole('progressbar', { name: 'Loading campuses' })
    ).not.toHaveLength(0);
  });
});
