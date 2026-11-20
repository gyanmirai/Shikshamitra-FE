import React from 'react';
import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { LibraryChargeStatusType } from 'src/enums/library_charges_type';
import { defaultSettings } from 'src/components/settings/config-settings';

import LibraryChargesTable from './ChargedManagementTable';
import { chargeActionStore, chargeActionPermission } from './ChargeActions.permissions.fixture';

// Only the shared table's presentation/animation is replaced. The owning
// columns, actual amount renderer, row/state selection and summary remain real.
vi.mock('src/components/form-slider', () => ({
  FormSlider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    columns,
    data,
  }: {
    columns: {
      id: string;
      label: string;
      render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
    }[];
    data: Record<string, unknown>[];
  }) => (
    <table aria-label="Charge register">
      <thead>
        <tr>
          {columns
            .filter((column) => column.id === 'fineAmount')
            .map((column) => (
              <th key={column.id}>{column.label}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={String(row.id)}>
            {columns
              .filter((column) => column.id === 'fineAmount')
              .map((column) => (
                <td key={column.id}>
                  {column.render ? column.render(row[column.id], row) : String(row[column.id])}
                </td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

it('preserves paise in the actual charge-register amount cell without rounding the assessment', () => {
  render(
    <Provider store={chargeActionStore([chargeActionPermission.view])}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LibraryChargesTable
          data={[
            {
              id: 'actual-assessment',
              memberId: 'actual-employee',
              memberName: 'Maya José',
              role: 'Staff',
              chargeCategory: 'Damage assessment',
              fineAmount: 100.75,
              reason: 'Reviewed physical damage.',
              status: LibraryChargeStatusType.Paid,
            },
          ]}
          addChargesDialog={{
            value: false,
            onTrue: vi.fn(),
            onFalse: vi.fn(),
            onToggle: vi.fn(),
            setValue: vi.fn(),
          }}
          onCollectCharges={vi.fn()}
          onEditCharge={vi.fn()}
          onDeleteCharge={vi.fn()}
          onViewCharges={vi.fn()}
        />
      </ThemeProvider>
    </Provider>
  );

  const amount = within(screen.getByRole('table', { name: 'Charge register' })).getByRole('cell');
  expect(amount.textContent?.replace(/\s/g, '')).toBe('₹100.75');
});
