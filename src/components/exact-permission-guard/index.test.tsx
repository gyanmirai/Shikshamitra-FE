import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import ExactPermissionGuard from '.';

const auth = vi.hoisted(() => ({ loading: false, permissionsInitialized: true,
  permissions: [] as { name: string; isGranted: boolean }[],
}));
vi.mock('react-redux', () => ({ useSelector: (selector: any) => selector({auth}) }));
vi.mock('src/sections/error', () => ({ View403: () => <div>Forbidden</div> }));
vi.mock('src/components/loading-screen', () => ({ SplashScreen: () => <div>Resolving access</div> }));

describe('exact Finance route authorization', () => {
  const permissionKey = 'Finance.Fees.Charges.View';
  it('does not treat parent, Add or Delete grants as View access', () => {
    auth.loading = false;
    auth.permissionsInitialized = true;
    auth.permissions = ['Finance.Fees.Charges', 'Finance.Fees.Charges.Add', 'Finance.Fees.Charges.Delete']
      .map((name) => ({ name, isGranted: true }));
    render(<ExactPermissionGuard permissionKey={permissionKey}><div>Charge data</div></ExactPermissionGuard>);
    expect(screen.getByText('Forbidden')).toBeInTheDocument();
    expect(screen.queryByText('Charge data')).not.toBeInTheDocument();
  });
  it('unmounts protected content immediately when View is revoked', () => {
    auth.permissions = [{name: permissionKey, isGranted: true}];
    const { rerender } = render(<ExactPermissionGuard permissionKey={permissionKey}><div>Charge data</div></ExactPermissionGuard>);
    expect(screen.getByText('Charge data')).toBeInTheDocument();
    auth.permissions = [{name: permissionKey, isGranted: false}];
    rerender(<ExactPermissionGuard permissionKey={permissionKey}><div>Charge data</div></ExactPermissionGuard>);
    expect(screen.getByText('Forbidden')).toBeInTheDocument();
    expect(screen.queryByText('Charge data')).not.toBeInTheDocument();
  });
  it('waits for permission initialization before rendering protected content', () => {
    auth.permissionsInitialized = false;
    auth.permissions = [{name: permissionKey, isGranted: true}];
    render(<ExactPermissionGuard permissionKey={permissionKey}><div>Charge data</div></ExactPermissionGuard>);
    expect(screen.getByText('Resolving access')).toBeInTheDocument();
    expect(screen.queryByText('Charge data')).not.toBeInTheDocument();
    auth.permissionsInitialized = true;
  });
});
