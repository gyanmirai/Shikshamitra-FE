import type { ReactNode } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import SeatingPlanTable from './SeatingPlanTable';

vi.mock('src/hooks/use-responsive', () => ({
  useResponsive: () => false,
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ noDataText }: { noDataText: ReactNode }) => <div>{noDataText}</div>,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden="true" />,
}));

describe('SeatingPlanTable empty state', () => {
  it('matches the examination table empty-state hierarchy', () => {
    render(
      <SeatingPlanTable
        rows={[]}
        canAdd
        isFiltered={false}
        onClearFilter={vi.fn()}
        onRowClick={vi.fn()}
        onPrimaryAction={vi.fn()}
      />
    );

    expect(screen.getByText('Seating Plan Data Not Found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open examination schedule' })).toBeInTheDocument();
  });
});
