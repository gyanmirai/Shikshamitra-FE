import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent, configure } from '@testing-library/react';

import BankAccountManagement from './index';

const transport = vi.hoisted(() => ({ calls: [] as any[], fail: false, detailFail: false, detailYear: 'year', totalCount: 1 }));
const navigation = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => navigation,
  usePathname: () => '/finance/settings/bank-account-management',
  useSearchParams: () => new URLSearchParams(window.location.search),
}));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      endpoints: () => ({}),
      baseQuery: async (args: any) => {
        transport.calls.push(args);
        if (transport.fail)
          return { error: { status: 500, data: { detail: 'Bank list unavailable' } } };
        if (transport.detailFail && args.url === '/bank-accounts/off-page-bank') return { error: { status: 500, data: { detail: 'Selected bank unavailable' } } };
        if (args.url.startsWith('/bank-accounts/') && !args.url.endsWith('/versions')) return { data: { id: args.url.split('/').at(-1), academicYearId: transport.detailYear, bankName: 'Selected bank', maskedAccountNumber: '****9999', isActive: true } };
        return {
          data: {
            items: [
              {
                id: 'bank',
                bankName: 'School bank',
                branchName: 'Town',
                accountHolderName: 'School',
                accountType: 1,
                maskedAccountNumber: '****1234',
                isActive: true,
              },
            ],
            totalCount: transport.totalCount,
          },
        };
      },
    }),
  };
});
vi.mock('src/hooks/useAccountSettingPermissions', () => ({
  useAccountSettingPermissions: () => ({ canView: true, canAdd: true, canEdit: true }),
}));
vi.mock('src/hooks/use-finance-form-close', () => ({
  useFinanceFormClose: () => ({ handleClose: vi.fn(), confirmation: null }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/finance/setup/embedding/FinanceSetupManagerHeader', () => ({
  FinanceSetupManagerHeader: ({ heading, action }: { heading: string; action?: ReactNode }) => (
    <header><h1>{heading}</h1>{action}</header>
  ),
}));
vi.mock('./Components/BankManageForm', () => ({ default: () => null }));
vi.mock('./Components/BankAccountActivityDrawer', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button type="button" onClick={onClose}>
      Close activity
    </button>
  ),
}));
vi.mock('../components/AccountCategoryVersionDrawer', () => ({ default: () => null }));

// Cold lazy imports can exceed the default DOM-query deadline on the local Windows test host.
beforeAll(() => configure({ asyncUtilTimeout: 10000 }));
afterAll(() => configure({ asyncUtilTimeout: 1000 }));

beforeEach(() => {
  transport.calls = [];
  transport.fail = false;
  transport.detailFail = false;
  transport.detailYear = 'year';
  transport.totalCount = 1;
  navigation.replace.mockReset();
  window.history.replaceState({}, '', '/finance/settings/bank-account-management');
});
function show(yearId = 'year') {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: (
        state: { currentYear: { id: string } } | undefined,
        action: { type: string; payload?: string }
      ) =>
        action.type === 'changeYear'
          ? { currentYear: { id: action.payload || '' } }
          : (state ?? { currentYear: { id: yearId } }),
      confirmPopup: () => ({ isChanges: false }),
      auth: () => ({ permissions: [] }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BankAccountManagement />
      </ThemeProvider>
    </Provider>
  );
  return { ...view, store };
}
it('does not navigate the route when the academic year hydrates', async () => {
  const { store } = show('');
  act(() => {
    store.dispatch({ type: 'changeYear', payload: 'year' });
  });
  await screen.findByRole('button', { name: 'School bank' });
  expect(navigation.replace).not.toHaveBeenCalled();
});
it('opens bank activity and restores the list when closed', async () => {
  show();
  fireEvent.click(await screen.findByRole('button', { name: 'School bank' }));
  expect(navigation.replace).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByRole('button', { name: 'Close activity' }));
  expect(new URLSearchParams(window.location.search).has('bankActivity')).toBe(false);
  expect(screen.queryByRole('button', { name: 'Close activity' })).not.toBeInTheDocument();
});
it('settles the real bank table after the initial request without repeated requests', async () => {
  show();
  await screen.findByRole('button', { name: 'School bank' });
  await waitFor(() => expect(screen.getByText('1–1 of 1')).toBeVisible());
  expect(transport.calls.filter((call) => call.url === '/bank-accounts')).toHaveLength(1);
  expect(transport.calls[0].timeout).toBe(30000);
});
it('shows a failed request with Retry rather than the no-accounts message', async () => {
  transport.fail = true;
  show();
  await screen.findByText('Bank list unavailable');
  expect(screen.queryByText(/Bank Account Data Not Found/)).not.toBeInTheDocument();
  transport.fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await screen.findByRole('button', { name: 'School bank' });
  expect(transport.calls.filter((call) => call.url === '/bank-accounts')).toHaveLength(2);
});
it('waits for academic context without reporting an empty bank list', () => {
  show('');
  expect(screen.getByText(/Select an academic year to load bank accounts/)).toBeVisible();
  expect(screen.queryByText(/Bank Account Data Not Found/)).not.toBeInTheDocument();
  expect(transport.calls).toHaveLength(0);
});

it('restores a bank selected directly outside the current list page and clears it on year change', async () => {
  window.history.replaceState({}, '', '/finance/settings/bank-account-management?bankActivity=off-page-bank');
  const { store } = show();
  await screen.findByRole('button', { name: 'Close activity' });
  expect(transport.calls.filter((call) => call.url === '/bank-accounts/off-page-bank')).toHaveLength(1);
  act(() => { store.dispatch({ type: 'changeYear', payload: 'new-year' }); });
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Close activity' })).not.toBeInTheDocument());
  expect(new URLSearchParams(window.location.search).has('bankActivity')).toBe(false);
});

it('retries a failed saved bank request and preserves a later list page with the unchanged search', async () => {
  window.history.replaceState({}, '', '/finance/settings/bank-account-management?bankActivity=off-page-bank&bankListSearch=school&bankListPage=2');
  transport.totalCount = 100;
  transport.detailFail = true;
  show();
  await screen.findByText('The selected bank account could not be loaded. Please try again.');
  expect(screen.queryByRole('button', { name: 'Close activity' })).not.toBeInTheDocument();
  transport.detailFail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry selected bank' }));
  await screen.findByRole('button', { name: 'Close activity' });
  expect(new URLSearchParams(window.location.search).get('bankListSearch')).toBe('school');
  expect(new URLSearchParams(window.location.search).get('bankListPage')).toBe('2');
  expect(transport.calls.filter((call) => call.url === '/bank-accounts').every((call) => call.params.page === 2)).toBe(true);
  expect(navigation.replace).not.toHaveBeenCalled();
  expect(transport.calls.filter((call) => call.url === '/bank-accounts/off-page-bank')).toHaveLength(2);
});
it('clears a saved bank from a different academic year without opening its activity', async () => {
  window.history.replaceState({}, '', '/finance/settings/bank-account-management?bankActivity=off-page-bank');
  transport.detailYear = 'different-year';
  show();
  await screen.findByText('The selected bank account is unavailable in the current academic year.');
  expect(screen.queryByRole('button', { name: 'Close activity' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
  expect(new URLSearchParams(window.location.search).has('bankActivity')).toBe(false);
  expect(screen.queryByText('The selected bank account is unavailable in the current academic year.')).not.toBeInTheDocument();
});
