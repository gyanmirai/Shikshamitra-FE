import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import FeeStructureReviewStep from './FeeStructureReviewStep';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns }: any) => (
    <table>
      <thead>
        <tr>
          {columns.map((column: any) => (
            <th key={column.id}>{column.label}</th>
          ))}
        </tr>
      </thead>
    </table>
  ),
}));

afterEach(cleanup);

it('reveals all installment details by expanding the schedule without another details toggle', () => {
  const onNavigate = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FeeStructureReviewStep
        candidate={{ name: 'Annual fees', feeHeads: [] } as any}
        preview={
          {
            isReady: true,
            errors: [],
            warnings: ['Optional heads need student selection.'],
            coverage: [],
            schedules: [
              {
                feeHeadId: 'tuition',
                feeHeadName: 'Tuition',
                paymentTermName: 'Annual',
                versionNumber: 1,
                installments: [
                  {
                    sequence: 1,
                    name: 'Annual',
                    demandDate: '2026-04-01',
                    dueDate: '2026-04-10',
                    allocationPercentage: 100,
                    calculatedAmount: 1000,
                  },
                ],
              },
            ],
          } as any
        }
        impacts={[]}
        writable
        locked={false}
        busy={false}
        previewing={false}
        tableId="review"
        onReview={vi.fn()}
        onNavigate={onNavigate}
      />
    </ThemeProvider>
  );
  expect(screen.queryByRole('button', { name: 'Show Details' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /Tuition/ }));
  expect(screen.getByRole('columnheader', { name: 'Demand date' })).toBeVisible();
  expect(screen.getByRole('columnheader', { name: 'Allocation (%)' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: '1 warning' }));
  expect(screen.getByText('Optional heads need student selection.')).toBeVisible();
  const edit = screen.getByRole('button', { name: 'Edit fee heads' });
  expect(edit).not.toHaveTextContent(/edit/i);
  fireEvent.click(edit);
  expect(onNavigate).toHaveBeenCalledWith(0);
});
