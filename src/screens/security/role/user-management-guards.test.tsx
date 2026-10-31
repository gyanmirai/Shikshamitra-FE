import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import UserRowActions from '../user/user-row-actions';

const auth = vi.hoisted(() => ({ permissions: [] as { name: string; isGranted: boolean }[] }));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const user = { id: 'synthetic-user', userName: 'Test User' };
beforeEach(() => { auth.permissions = []; });

it.each([
  { permissions: [] },
  { permissions: [{ name: 'AbpIdentity.Roles.ManagePermissions', isGranted: true }] },
  { permissions: [{ name: 'AbpIdentity.Users.ManagePermissions', isGranted: false }] },
  { permissions: [{ name: 'ShikshaMitra.UserScope.Manage', isGranted: true }] },
])('withholds user permission and visibility controls without the exact grant: %j', ({ permissions }) => {
  auth.permissions = permissions;
  const onAction = vi.fn();
  render(<UserRowActions user={user} onAction={onAction} />);
  expect(screen.queryByRole('button', { name: 'Set Module Visibility for Test User' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Module Permission for Test User' })).toBeNull();
  expect(onAction).not.toHaveBeenCalled();
});

it('offers separate permission and visibility actions only while the exact user grant is effective', () => {
  auth.permissions = [{ name: 'AbpIdentity.Users.ManagePermissions', isGranted: true }];
  const onAction = vi.fn();
  const mounted = render(<UserRowActions user={user} onAction={onAction} />);
  fireEvent.click(screen.getByRole('button', { name: 'Set Module Visibility for Test User' }));
  fireEvent.click(screen.getByRole('button', { name: 'Module Permission for Test User' }));
  expect(onAction.mock.calls).toEqual([['visibility', user], ['permissions', user]]);
  auth.permissions[0].isGranted = false;
  mounted.rerender(<UserRowActions user={user} onAction={onAction} />);
  expect(screen.queryByRole('button', { name: 'Set Module Visibility for Test User' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Module Permission for Test User' })).toBeNull();
});
