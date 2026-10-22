import type { StructureLine, StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import React from 'react';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
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
  const onClose = vi.fn();
  render(
    <Provider store={configureStore({ reducer: { confirmPopup } })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StructureScheduleDialog
          line={{ ...line, ...overrides }}
          term={term}
          readOnly={readOnly}
          onClose={onClose}
          onSave={onSave}
        />
      </ThemeProvider>
    </Provider>
  );
  return { onSave, onClose };
}

it('shows all twelve installments and the rounded amounts without changing the saved contract', () => {
  const { onSave } = setup();
  const table = screen.getByRole('table', { name: 'Payment term installments table' });
  expect(within(table).getAllByRole('row')).toHaveLength(13);
  expect(within(table).getByRole('row', { name: /May 2027/ })).toHaveTextContent('₹ 87');
  expect(screen.getByText('Total amount: ₹ 1,000')).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('button', { name: 'Fee Head Details information' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Installment Breakdown information' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(onSave).toHaveBeenCalledWith(term.installments, true);
});

it('withholds misleading amounts during an invalid allocation edit and blocks saving', () => {
  const { onSave } = setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Jun 2026 allocation percentage' }), {
    target: { value: '20' },
  });
  expect(screen.getByText('Total amount: —')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(screen.getByText('Installment allocations must total exactly 100%.')).toBeTruthy();
  expect(onSave).not.toHaveBeenCalled();
});

it('shows locked details as read-only values and defers variable amounts to assignment', () => {
  const { onSave } = setup({ isVariable: true, amount: null }, true);
  expect(screen.getAllByText('Calculated during assignment')).toHaveLength(12);
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getAllByText('8.33%')).toHaveLength(11);
  expect(screen.getAllByText('01 Jun 2026').length).toBeGreaterThan(0);
  expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  expect(onSave).not.toHaveBeenCalled();
});

it('keeps edited allocations until changes are explicitly discarded', async () => {
  const { onClose, onSave } = setup();
  const allocation = screen.getByRole('textbox', { name: 'Jun 2026 allocation percentage' });
  fireEvent.change(allocation, { target: { value: '20' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep Editing' }));
  expect(allocation).toHaveValue('20%');
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(onSave).not.toHaveBeenCalled();
});

it('views saved installment overrides with the fee-head details and reconciled total', () => {
  const { onSave } = setup(
    {
      categoryName: 'School fees',
      isOptional: true,
      scheduleMode: 'Customized',
      installmentOverrides: [{ ...term.installments[0], dueDate: '2026-06-15' }],
    },
    true
  );
  expect(screen.getByText('Fee Head Details')).toBeTruthy();
  expect(screen.getByText('School fees')).toBeTruthy();
  expect(screen.getByText('Optional')).toBeTruthy();
  expect(screen.getByText('15 Jun 2026')).toBeTruthy();
  expect(screen.getByText('Total amount: ₹ 1,000')).toBeTruthy();
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(onSave).not.toHaveBeenCalled();
});
