import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { notificationWrapper } from 'src/screens/library/Notification/notification-test-fixture';

import { AccountDrawer } from './account-drawer';

const push = vi.hoisted(() => vi.fn());
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push }) }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { profile: { name: 'Guardian', role: 'student' } } }),
}));
vi.mock('./account-dialogs', () => ({ AccountDialogs: () => null }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('opens the personal Library inbox for a tenant student account without staff Library grants', async () => {
  render(<AccountDrawer />, notificationWrapper([]));
  fireEvent.click(screen.getByRole('button', { name: 'Account menu for Guardian' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Library Inbox' }));
  expect(push).toHaveBeenCalledWith('/dashboard/library-inbox');
});
