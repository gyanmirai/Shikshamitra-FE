import type { NotificationRecipient } from 'src/redux/library/notification-types';

import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { notificationWrapper } from '../notification-test-fixture';
import { NotificationRecipientPicker } from './NotificationRecipientPicker';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));
function Harness() {
  const [selected, setSelected] = useState<NotificationRecipient[]>([]);
  return (
    <>
      <NotificationRecipientPicker
        value={selected}
        disabled={false}
        onChange={setSelected}
        onBlur={() => undefined}
      />
      <p aria-label="Selected members">{selected.map((item) => item.id).join(',')}</p>
    </>
  );
}
it('uses only the Notification-owned lookup and preserves canonical selections across searches', async () => {
  const requested: string[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/notifications/recipients', ({ request }) => {
      const url = new URL(request.url);
      requested.push(url.search);
      const first = url.searchParams.get('search') === 'As';
      return HttpResponse.json({
        items: [
          {
            id: first ? 'canonical-a' : 'canonical-b',
            memberIdentifier: first ? 'CARD-42' : 'STAFF-7',
            memberName: first ? 'Asha' : 'Bharat',
            role: first ? 0 : 1,
            isActiveMembership: true,
            hasRecoverableObligation: false,
            isEligibleForNotification: true,
          },
        ],
        totalCount: 1,
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
      });
    })
  );
  render(<Harness />, notificationWrapper());
  const user = userEvent.setup();
  const input = screen.getByRole('combobox', { name: /Library members/ });
  expect(requested).toHaveLength(0);
  await user.click(input);
  await user.type(input, 'As');
  await user.click(await screen.findByRole('option', { name: /Asha.*CARD-42.*Student/ }));
  await user.type(input, 'Bh');
  await user.click(await screen.findByRole('option', { name: /Bharat.*STAFF-7.*Staff/ }));
  expect(screen.getByLabelText('Selected members')).toHaveTextContent('canonical-a,canonical-b');
  expect(requested).toEqual(['?search=As&page=1&pageSize=20', '?search=Bh&page=1&pageSize=20']);
});
