import type { StructureLine, StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import React from 'react';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { render, screen, within, fireEvent } from '@testing-library/react';

import StructureScheduleDialog from './StructureScheduleDialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: vi.fn() }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns, tableTitle }: any) => (
    <table aria-label={`${tableTitle} table`}>
      <thead>
        <tr>
          {columns.map((column: any) => (
            <th key={column.id}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any) => (
          <tr key={row.sourcePaymentTermInstallmentId}>
            {columns.map((column: any) => (
              <td key={column.id}>
                {column.render ? column.render(row[column.id], row) : row[column.id]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));
// Calendar internals are covered by the real-browser smoke test; keep this suite on the dialog contract.
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ value, disabled, slotProps }: any) => (
    <input
      readOnly
      disabled={disabled}
      value={value?.format('DD/MM/YYYY') ?? ''}
      aria-label={slotProps.textField.inputProps['aria-label']}
    />
  ),
}));

const line: StructureLine = {
  feeHeadId: 'school',
  feeHeadName: 'School Fees',
  amount: 1000,
  isOneTime: false,
  isOptional: false,
  payableMonth: 0,
  payableYear: 0,
  paymentTermId: 'term',
  paymentTermVersionId: 'version',
  scheduleMode: 'Inherited',
  installmentOverrides: [],
};
const term: StructureSettings['terms'][number] = {
  id: 'term',
  versionId: 'version',
  name: 'Monthly',
  versionNumber: 1,
  isCurrent: true,
  demandGenerationRule: 'OnInstallmentStartDate',
  installments: Array.from({ length: 12 }, (_, index) => {
    const start = dayjs('2026-06-01').add(index, 'month');
    return {
      sourcePaymentTermInstallmentId: String(index),
      sequence: index + 1,
      name: start.format('MMM YYYY'),
      coverageStartDate: start.format('YYYY-MM-DD'),
      coverageEndDate: start.endOf('month').format('YYYY-MM-DD'),
      demandDate: start.format('YYYY-MM-DD'),
      dueDate: start.endOf('month').format('YYYY-MM-DD'),
      allocationPercentage: index === 11 ? 8.37 : 8.33,
    };
  }),
};
function setup(overrides: Partial<StructureLine> = {}, readOnly = false) {
  const onSave = vi.fn();
  render(
    <Provider store={configureStore({ reducer: { confirmPopup } })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StructureScheduleDialog
          line={{ ...line, ...overrides }}
          term={term}
          readOnly={readOnly}
          onClose={vi.fn()}
          onSave={onSave}
        />
      </ThemeProvider>
    </Provider>
  );
  return { onSave };
}

it('shows all twelve installments and the rounded amounts without changing the saved contract', () => {
  const { onSave } = setup();
  const table = screen.getByRole('table', { name: 'Payment term installments table' });
  expect(within(table).getAllByRole('row')).toHaveLength(13);
  expect(within(table).getByRole('row', { name: /May 2027/ })).toHaveTextContent('₹87');
  expect(screen.getByText('Total amount: ₹1,000')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Use this schedule' }));
  expect(onSave).toHaveBeenCalledWith(term.installments, true);
});

it('withholds misleading amounts during an invalid allocation edit and blocks saving', () => {
  const { onSave } = setup();
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Jun 2026 allocation percentage' }), {
    target: { value: '20' },
  });
  expect(screen.getByText('Total amount: —')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Use this schedule' }));
  expect(screen.getByText('Installment allocations must total exactly 100%.')).toBeTruthy();
  expect(onSave).not.toHaveBeenCalled();
});

it('keeps locked allocations disabled and variable amounts deferred to assignment', () => {
  setup({ isVariable: true, amount: null }, true);
  expect(screen.getAllByText('Calculated during assignment')).toHaveLength(12);
  expect(screen.getByRole('spinbutton', { name: 'Jun 2026 allocation percentage' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Use this schedule' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
});
