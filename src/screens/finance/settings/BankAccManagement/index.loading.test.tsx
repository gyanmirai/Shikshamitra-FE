import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import BankAccountManagement from './index';

const transport = vi.hoisted(() => ({ calls: [] as any[], fail: false }));
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
            totalCount: 1,
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
vi.mock('./Components/BankManageForm', () => ({ default: () => null }));
vi.mock('./Components/BankAccountActivityDrawer', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button type="button" onClick={onClose}>
      Close activity
    </button>
  ),
}));
vi.mock('../components/AccountSettingVersionDialog', () => ({ default: () => null }));

beforeEach(() => {
  transport.calls = [];
  transport.fail = false;
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
it('keeps the bank activity drawer closed while opening is temporarily disabled', async () => {
  show();
  fireEvent.click(await screen.findByRole('button', { name: 'School bank' }));
  expect(navigation.replace).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Close activity' })).not.toBeInTheDocument();
  expect(new URLSearchParams(window.location.search).has('bankActivity')).toBe(false);
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
