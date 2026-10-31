import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ReconciliationStatusType } from 'src/enums/reconciliation-status-type';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import FinanceReconciliation from './index';
import WalletTable from './Component/WalletTable';
import OnlineGatewayTable from './Component/OnlineGatewayTable';
import { api, requests } from '../../../../e2e/fixtures/finance-table-search/mock-service';

vi.mock('src/redux/service', async () => {
  const { api: fixtureApi } = await import('../../../../e2e/fixtures/finance-table-search/mock-service');
  return { api: fixtureApi };
});
vi.mock('src/hooks/use-search-param', () => ({ useNewSearchParam: () => [{}, vi.fn()] }));
vi.mock('src/hooks/use-finance-form-close', () => ({ useFinanceFormClose: () => ({ handleClose: vi.fn(), confirmation: null }) }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/custom-select', () => ({ default: ({ label, value, options, onChange }: any) => (
  <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option: any) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
) }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./Component/ReconciliationReceiptDialog', () => ({ default: () => null }));

const stores: Array<ReturnType<typeof makeStore>> = [];
function makeStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      confirmPopup,
      globalState: () => ({ currentYear: { id: 'year', name: '2026-2027', startDate: '2026-06-01', endDate: '2027-05-31' } }),
      auth: () => ({ permissionsInitialized: true, permissions: [] }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
}
function show(child: React.ReactNode) {
  requests.length = 0;
  const store = makeStore();
  stores.push(store);
  render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}><LocalizationProvider dateAdapter={AdapterDayjs}>{child}</LocalizationProvider></ThemeProvider></Provider>);
}
afterEach(() => { cleanup(); stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState())); });
const listRequests = () => requests.filter((request) => request.url === '/v1/finance/reconciliations');

it.each([
  ['Cheque', ReconciliationStatusType.Cheque],
  ['Demand Draft', ReconciliationStatusType.DemandDraft],
  ['Bank Transfer', ReconciliationStatusType.BankTransfer],
  ['Credit Card', ReconciliationStatusType.CreditCard],
  ['Debit Card', ReconciliationStatusType.DebitCard],
  ['UPI', ReconciliationStatusType.UPI],
] as const)('%s parent tab sends numeric method and actual shared-table criteria before count/page', async (label, method) => {
  show(<FinanceReconciliation />);
  fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-10' } });
  fireEvent.click(screen.getByRole('tab', { name: new RegExp(`^${label}`) }));
  await waitFor(() => expect(listRequests().at(-1)?.params.paymentMethod).toBe(method));
  await screen.findByText('1–10 of 76');
  fireEvent.click(screen.getByRole('button', { name: 'Filter Amount' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filter Type *' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Greater Than' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Amount *' }), { target: { value: '7500' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  await waitFor(() => expect(listRequests().at(-1)?.params).toMatchObject({ paymentMethod: method, page: 1, filters: '[{"column":"amount","type":"greaterThan","value":"7500"}]' }));
  await screen.findByText('1–1 of 1');
  expect(screen.getByText(/Zoya Shah/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear (1)' }));
  await waitFor(() => expect(listRequests().at(-1)?.params.filters).toBeUndefined());
  await screen.findByText('1–10 of 76');
}, 120000);

it.each([['OnlineGateway', 7, OnlineGatewayTable], ['Wallet', 8, WalletTable]] as const)('%s has no unsupported column menus in the real shared table', async (_label, method, Component) => {
  show(<Component queryParams={{ academicYearId: 'year', month: 10, year: 2026, paymentMethod: method }} />);
  await screen.findByText('1–10 of 76');
  expect(screen.queryAllByRole('button', { name: /^Filter / })).toHaveLength(0);
  expect(listRequests().at(-1)?.params.filters).toBeUndefined();
}, 120000);
