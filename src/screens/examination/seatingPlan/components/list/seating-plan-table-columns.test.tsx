import type { ReactElement } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { buildSeatingPlanColumns } from './seating-plan-table-columns';

import type { SeatingPlanListRow } from '../../types';

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden="true" />,
}));

const row = {
  id: 'exam-1',
  examName: 'English test',
  status: 'not-started',
} as SeatingPlanListRow;

describe('seating plan row actions', () => {
  it.each(['not-started', 'in-progress'] as const)(
    'uses the same Manage plans button treatment for %s rows',
    (status) => {
      const actionColumn = buildSeatingPlanColumns(true, vi.fn()).find(
        (column) => column.id === 'actions'
      );

      const action = actionColumn?.render?.(undefined, { ...row, status });
      render(action as ReactElement);

      const button = screen.getByRole('button', { name: /manage plans for english test/i });
      expect(button).toHaveClass('MuiButton-outlined');
      expect(button).not.toHaveClass('MuiButton-contained');
    }
  );
});
