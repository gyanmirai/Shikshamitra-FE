import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PaginatedSearchSelect } from './paginated-search-select';

type Option = { id: string; name: string };

describe('PaginatedSearchSelect accessibility', () => {
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
