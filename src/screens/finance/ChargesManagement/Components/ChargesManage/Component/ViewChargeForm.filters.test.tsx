import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { formatNumber } from 'src/utils/formate_number';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import ViewChargeForm from './ViewChargeForm';

const detail = vi.hoisted(() => ({
  students: [
    { id: 'alpha', studentName: 'Alpha Student', grNumber: '1001', collectedAmount: 1000.25, waivedAmount: 0, outstandingAmount: 0 },
    { id: 'beta', studentName: 'Beta Student', grNumber: '1002', collectedAmount: 0, waivedAmount: 0.25, outstandingAmount: 990 },
    { id: 'gamma', studentName: 'Gamma Student', grNumber: '1003', collectedAmount: 1000, waivedAmount: 0, outstandingAmount: 0.25 },
  ].map((student) => ({ ...student, rollNumber: 1, standardName: 'Class 3', divisionName: 'A', workflowStatus: 0, status: 0 })),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({ data: detail, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock('src/redux/finance/ChargeManagement/chargeApi', () => ({ useGetChargeByIdQuery: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./ViewChargeComponent/ChargeDetailsCard', () => ({ default: () => null }));
vi.mock('./ViewChargeComponent/RequestorInfoCard', () => ({ default: () => null }));

const theme = createTheme(defaultSettings);
const allNames = ['Alpha Student', 'Beta Student', 'Gamma Student'];
function show() {
  const store = configureStore({ reducer: { confirmPopup } });
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ViewChargeForm charge={{ chargeId: 'charge', amount: 1000, dueDate: '2026-10-30', purposeDescription: 'QA charge' }} isActionShow={false} />
      </ThemeProvider>
    </Provider>
  );
}
beforeEach(() => localStorage.clear());

it.each([
  { column: 'Collected', operator: 'Greater Than', value: '1000', matches: ['Alpha Student'] },
  { column: 'Waived', operator: 'Between', min: '0.2', max: '0.3', matches: ['Beta Student'] },
  { column: 'Outstanding', operator: 'Greater Than', value: '0', matches: ['Beta Student', 'Gamma Student'] },
])('$column compares raw numeric amounts and Clear restores all students', async ({ column, operator, value, min, max, matches }) => {
  show();
  expect(screen.getByText('1–3 of 3')).toBeInTheDocument();
  const alpha = screen.getByRole('row', { name: /Alpha Student/ });
  expect(within(alpha).getByText(formatNumber(1000.25, 'INR'))).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: `Filter ${column}` }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filter Type *' }));
  fireEvent.click(screen.getByRole('option', { name: operator }));
  if (operator === 'Between') {
    fireEvent.change(screen.getByRole('spinbutton', { name: `${column} Min *` }), { target: { value: min } });
    fireEvent.change(screen.getByRole('spinbutton', { name: `${column} Max *` }), { target: { value: max } });
  } else {
    fireEvent.change(screen.getByRole('spinbutton', { name: `${column} *` }), { target: { value } });
  }
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Apply' })); });
  await waitFor(() => {
    allNames.forEach((name) => {
      if (matches.includes(name)) expect(screen.getByText(name)).toBeInTheDocument();
      else expect(screen.queryByText(name)).not.toBeInTheDocument();
    });
  });
  expect(screen.getByText(`1–${matches.length} of ${matches.length}`)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear (1)' }));
  await waitFor(() => expect(screen.getByText('1–3 of 3')).toBeInTheDocument());
  allNames.forEach((name) => expect(screen.getByText(name)).toBeInTheDocument());
}, 30000);
