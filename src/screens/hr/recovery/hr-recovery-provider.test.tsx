import { useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { normalizeHrFailure } from './hr-failure';
import { HrRecoveryProvider } from './hr-recovery-provider';
import { HrSetupLink, HrSetupRefresh } from './hr-setup-controls';
import {
  emitHrRecovery,
  hrRecoveryScope,
  isHrRecoveryVisible,
  setHrRecoveryVisible,
} from './hr-recovery-events';

vi.mock('next/navigation', () => ({
  usePathname: () => window.location.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search),
}));
vi.mock('sonner', () => ({ toast: { custom: vi.fn(), dismiss: vi.fn() } }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: any) =>
    open ? (
      <section role="dialog" aria-label={title}>
        {children}
      </section>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
const auth = {
  user: { sub: 'synthetic-user', tenantid: 'synthetic-school' },
  permissionsInitialized: true,
  loading: false,
  permissions: [
    hrPermissions.root,
    hrPermissions.payroll.root,
    hrPermissions.payroll.settings.root,
    hrPermissions.payroll.settings.salaryTemplateActions.view,
  ].map((name) => ({ name, isGranted: true })),
};
function Fixture() {
  const [value, setValue] = useState('synthetic unsaved note');
  return (
    <>
      <input
        aria-label="Draft note"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <HrSetupLink setup="templates" />
    </>
  );
}
function mount(permissions = auth.permissions) {
  const store = configureStore({ reducer: { auth: () => ({ ...auth, permissions }) } });
  return render(
    <Provider store={store}>
      <HrRecoveryProvider>
        <Fixture />
      </HrRecoveryProvider>
    </Provider>
  );
}
const report = (
  failure = normalizeHrFailure({
    status: 400,
    data: { errors: { Amount: ['Enter a positive amount.'] } },
  })
) => {
  act(() =>
    emitHrRecovery({
      route: '/hr/employee',
      scope: hrRecoveryScope(auth),
      endpoint: 'saveSynthetic',
      requestId: 'synthetic-request',
      failure,
    })
  );
};

describe('HR recovery presentation and source form lifetime', () => {
  beforeEach(() => window.history.replaceState(null, '', '/hr/employee'));
  afterEach(() => setHrRecoveryVisible(false));

  it('preserves mounted values and clears feedback on Keep editing without leaking it to another record', () => {
    mount();
    report();
    expect(screen.getByRole('dialog')).toHaveTextContent('Amount: Enter a positive amount.');
    expect(screen.getByLabelText('Draft note')).toHaveValue('synthetic unsaved note');
    expect(isHrRecoveryVisible()).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(isHrRecoveryVisible()).toBe(false);
    expect(screen.queryByRole('button', { name: 'Review last HR error' })).toBeNull();
  });

  it('clears old feedback after matching success without resetting the form', () => {
    mount();
    report();
    act(() =>
      emitHrRecovery({
        route: '/hr/employee',
        scope: hrRecoveryScope(auth),
        endpoint: 'saveSynthetic',
        requestId: 'success',
      })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(isHrRecoveryVisible()).toBe(false);
    expect(screen.getByLabelText('Draft note')).toHaveValue('synthetic unsaved note');
  });

  it('uses new-tab noopener links and keeps all unsaved values out of navigation', () => {
    mount();
    const link = screen.getByRole('link', { name: /Review salary templates/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('href', '/hr/payroll/setting/salary-templates');
  });

  it('offers administrator guidance when setup access is absent', () => {
    mount([]);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText(/Ask your HR administrator/)).toBeInTheDocument();
  });

  it('shows a failure when the current search uses percent-encoded spaces', () => {
    window.history.replaceState(null, '', '/hr/employee?search=Synthetic%20Staff');
    mount();
    act(() =>
      emitHrRecovery({
        route: window.location.pathname + window.location.search,
        scope: hrRecoveryScope(auth),
        endpoint: 'saveSynthetic',
        requestId: 'encoded',
        failure: normalizeHrFailure({
          status: 400,
          data: { detail: 'Review the selected staff.' },
        }),
      })
    );
    expect(screen.getByRole('dialog')).toHaveTextContent('Review the selected staff.');
  });

  it('does not replace the error with a second legacy toast while the dialog is open', () => {
    mount();
    report();
    expect(shikshaMitraToast.error({ message: 'Legacy generic failure' })).toBe(
      'hr-recovery-dialog'
    );
    expect(screen.getByRole('dialog')).toHaveTextContent('Enter a positive amount.');
  });

  it('does not show feedback for another actor or route', () => {
    mount();
    act(() =>
      emitHrRecovery({
        route: '/hr/employee',
        scope: 'other actor',
        endpoint: 'save',
        requestId: 'old',
        failure: normalizeHrFailure({}),
      })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('setup refresh', () => {
  it('retains sibling edits through refresh failure and retry and prevents overlap', async () => {
    let complete: () => void = () => {};
    const refresh = vi
      .fn()
      .mockRejectedValueOnce(new Error('synthetic'))
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            complete = resolve;
          })
      );
    render(
      <>
        <input aria-label="Draft" defaultValue="synthetic edits" />
        <HrSetupRefresh refresh={refresh} />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Refresh setup' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('could not be refreshed')
    );
    fireEvent.click(screen.getByRole('button', { name: 'Refresh setup' }));
    expect(screen.getByRole('button', { name: /Refresh setup/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Refresh setup/ }));
    expect(refresh).toHaveBeenCalledTimes(2);
    await act(async () => complete());
    expect(screen.getByLabelText('Draft')).toHaveValue('synthetic edits');
    expect(screen.getByRole('status')).toHaveTextContent('Setup refreshed');
  });
});
