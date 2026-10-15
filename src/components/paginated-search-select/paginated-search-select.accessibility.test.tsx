import { it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { PaginatedSearchSelect } from './paginated-search-select';

type Option = { id: string; name: string };

describe('PaginatedSearchSelect accessibility', () => {
  it('shows a failed lookup before the custom empty mapping message', async () => {
    render(
      <PaginatedSearchSelect<Option>
        label="Teachers"
        value={null}
        minChars={0}
        noOptionsText="No teachers are assigned to this class."
        fetchOptions={async () => { throw new Error('Network unavailable'); }}
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
