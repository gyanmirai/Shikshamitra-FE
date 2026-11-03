import type { ReactNode } from 'react';
import type { FinanceSetupState } from 'src/redux/finance/setup/types';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import FinanceSetupWorkspace from './FinanceSetupWorkspace';
import { useFinanceSetupEmbedding } from './embedding/FinanceSetupEmbeddingProvider';

const mocks = vi.hoisted(() => ({
  search: '',
  save: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  refetch: vi.fn(),
  query: {} as {
    currentData?: FinanceSetupState;
    data?: FinanceSetupState;
    isFetching: boolean;
    isError: boolean;
    isUninitialized: boolean;
    refetch: () => unknown;
  },
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}));
vi.mock('src/redux/finance/setup/api', () => ({
  useFinanceSetupStateQuery: () => mocks.query,
  useSaveFinanceSetupProgressMutation: () => [mocks.save, { isLoading: false }],
}));
vi.mock('./FinanceSetupManager', () => ({
  default: function MockFinanceManager({ setting }: { setting: string }) {
    const embedding = useFinanceSetupEmbedding();
    return (
      <div>
        <span>Inline manager: {setting}</span>
        <button type="button" onClick={() => embedding.setEditorOpen?.(true)}>
          Open native editor
        </button>
        <button type="button" onClick={() => embedding.setEditorOpen?.(false)}>
          Close native editor
        </button>
        <input aria-label="Native draft" />
      </div>
    );
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/setup-flow', () => ({
  SetupFlowShell: ({ children, footer }: { children: ReactNode; footer: ReactNode }) => (
    <>
      <main>{children}</main>
      <footer>{footer}</footer>
    </>
  ),
}));
vi.mock('src/layouts/components/global-academic-search', () => ({
  default: () => <div>Selected academic year</div>,
}));

const state: FinanceSetupState = {
  academicYearId: 'year-a',
  concurrencyStamp: 'v1',
  currentStageKey: 'accounts',
  currentSettingKey: 'income-categories',
  deferredSettingKeys: [],
  reviewedAt: null,
  settings: [
    { key: 'income-categories', canView: true, canManage: true, configurationState: 'empty' },
    { key: 'expense-categories', canView: true, canManage: true, configurationState: 'empty' },
  ],
};
const props = {
  scope: { tenantCacheKey: 'tenant:user', academicYearId: 'year-a' },
  returnTo: '/finance/dashboard',
  permissions: [
    { name: 'Finance.Accounts.Settings.IncomeCategory.View', isGranted: true },
    { name: 'Finance.Accounts.Settings.ExpenseCategory.View', isGranted: true },
  ],
};
const theme = createTheme(defaultSettings);
const store = configureStore({ reducer: { confirmPopup } });
function renderGuide(input: React.ComponentProps<typeof FinanceSetupWorkspace>) {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <FinanceSetupWorkspace {...input} />
      </ThemeProvider>
    </Provider>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = '';
  mocks.query = {
    currentData: state,
    data: state,
    isFetching: false,
    isError: false,
    isUninitialized: false,
    refetch: mocks.refetch,
  };
  mocks.save.mockReturnValue({ unwrap: () => Promise.resolve(state) });
});

describe('Finance setup guide', () => {
  it('starts at accounts and embeds the existing Finance manager instead of an outbound form link', () => {
    renderGuide(props);
    expect(screen.getByRole('heading', { level: 1, name: 'Accounts Setup' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Income Categories', selected: true })).toBeVisible();
    expect(screen.getByText('Inline manager: income-categories')).toBeVisible();
    expect(screen.queryByRole('link', { name: /Open Income Categories/ })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Expense Categories' })).toHaveAttribute(
      'href',
      '/finance/setup?guideYear=year-a&stage=accounts&setting=expense-categories'
    );
    expect(screen.queryByText('Academic Year Setup')).not.toBeInTheDocument();
  });
  it('does not render a setting action after its View permission has been revoked', () => {
    renderGuide({ ...props, permissions: props.permissions.slice(1) });
    expect(screen.queryByRole('tab', { name: 'Income Categories' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open Income Categories/ })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Expense Categories', selected: true })).toBeVisible();
  });
  it('does not show the previous year configuration while the current year loads', () => {
    mocks.query = { ...mocks.query, currentData: undefined, data: state, isFetching: true };
    renderGuide({ ...props, scope: { ...props.scope, academicYearId: 'year-b' } });
    expect(screen.queryByText('Active configuration available')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open Income Categories/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save progress' })).toBeDisabled();
  });
  it('blocks guide navigation until the native editor closes', () => {
    renderGuide(props);
    fireEvent.click(screen.getByRole('button', { name: 'Open native editor' }));
    expect(screen.getByRole('button', { name: 'Save & continue' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Exit setup' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Expense Categories' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close native editor' }));
    expect(screen.getByRole('button', { name: 'Save & continue' })).toBeEnabled();
  });
  it('keeps the native draft mounted during background configuration checks and errors', () => {
    const view = renderGuide(props);
    const input = screen.getByRole('textbox', { name: 'Native draft' });
    fireEvent.change(input, { target: { value: 'Unsubmitted draft' } });
    mocks.query = { ...mocks.query, isFetching: true };
    view.rerender(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <FinanceSetupWorkspace {...props} />
        </ThemeProvider>
      </Provider>
    );
    expect(screen.getByRole('textbox', { name: 'Native draft' })).toBe(input);
    expect(input).toHaveValue('Unsubmitted draft');
    mocks.query = { ...mocks.query, isFetching: false, isError: true };
    view.rerender(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <FinanceSetupWorkspace {...props} />
        </ThemeProvider>
      </Provider>
    );
    expect(screen.getByRole('textbox', { name: 'Native draft' })).toBe(input);
    expect(input).toHaveValue('Unsubmitted draft');
  });
  it('preserves needs-setup status after deferral and persists the next position', async () => {
    renderGuide(props);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Do this later' }));
    });
    expect(mocks.save).toHaveBeenCalledWith({
      scope: props.scope,
      progress: {
        concurrencyStamp: 'v1',
        currentStageKey: 'accounts',
        currentSettingKey: 'expense-categories',
        deferredSettingKeys: ['income-categories'],
        finishReview: false,
      },
    });
  });
  it('offers retry and exit after a failed status check without showing stale readiness', () => {
    mocks.query = {
      ...mocks.query,
      currentData: {
        ...state,
        settings: state.settings.map((item) => ({ ...item, configurationState: 'configured' })),
      },
      isError: true,
    };
    renderGuide(props);
    expect(screen.queryByText('Active configuration available')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Exit setup' }));
    expect(mocks.push).toHaveBeenCalledWith('/finance/dashboard');
  });
  it('keeps review separate from configuration completion and does not create transactions', async () => {
    mocks.search = 'stage=review';
    renderGuide(props);
    expect(
      screen.getByText(/does not assign fees, collect money or approve requests/)
    ).toBeVisible();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Finish review' }));
    });
    expect(mocks.save.mock.calls[0][0].progress).toMatchObject({
      currentStageKey: 'review',
      currentSettingKey: null,
      finishReview: true,
    });
  });
});
