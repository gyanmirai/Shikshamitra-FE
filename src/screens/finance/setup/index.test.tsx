import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import FinanceSetupScreen from './index';

const mocks = vi.hoisted(() => ({ search: '', state: {} as any, workspace: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) => select(mocks.state),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(mocks.search) }));
vi.mock('src/sections/error', () => ({ View403: () => <div>No permission</div> }));
vi.mock('src/components/loading-screen', () => ({
  SplashScreen: () => <div>Loading identity</div>,
}));
vi.mock('./FinanceSetupWorkspace', () => ({
  default: (props: unknown) => {
    mocks.workspace(props);
    return <div>Finance guide</div>;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = '';
  mocks.state = {
    globalState: { currentYear: { id: 'year-a' } },
    auth: {
      sessionContext: { accountMode: 'tenant', tenantId: 'tenant-a' },
      user: { sub: 'user-a' },
      loading: false,
      permissionsInitialized: true,
      permissions: [
        { name: 'ShikshaMitra.Module.Finance', isGranted: true },
        { name: 'Finance.Fees.StructureAssign.View', isGranted: true },
      ],
    },
  };
});

describe('Finance guide entry', () => {
  it('keeps assignment-only viewers inside their authorized Finance destination on exit', () => {
    render(<FinanceSetupScreen />);
    expect(mocks.workspace.mock.calls[0][0]).toMatchObject({
      returnTo: '/finance/fee-structure-assign',
      scope: { tenantCacheKey: 'tenant-a:user-a', academicYearId: 'year-a' },
    });
  });
  it('preserves an authorized assignment return link and rejects an external destination', () => {
    mocks.search = 'returnTo=%2Ffinance%2Ffee-structure-assign%3Fsearch%3Dpending';
    const view = render(<FinanceSetupScreen />);
    expect(mocks.workspace.mock.calls[0][0].returnTo).toBe(
      '/finance/fee-structure-assign?search=pending'
    );
    mocks.search = 'returnTo=https%3A%2F%2Fexample.com';
    view.rerender(<FinanceSetupScreen />);
    expect(mocks.workspace.mock.calls.at(-1)?.[0]?.returnTo).toBe('/finance/fee-structure-assign');
  });
  it('does not mount the guide or query its state without an exact View grant', () => {
    mocks.state.auth.permissions = [{ name: 'ShikshaMitra.Module.Finance', isGranted: true }];
    render(<FinanceSetupScreen />);
    expect(screen.getByText('No permission')).toBeVisible();
    expect(mocks.workspace).not.toHaveBeenCalled();
  });
  it('waits for permission initialization before mounting protected guide content', () => {
    mocks.state.auth.permissionsInitialized = false;
    render(<FinanceSetupScreen />);
    expect(screen.getByText('Loading identity')).toBeVisible();
    expect(mocks.workspace).not.toHaveBeenCalled();
  });
});
